import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { SkillCard } from '@/components/skills/skill-card';
import { CategoryIconWrapper } from '@/components/skills/category-icon';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Tag, 
  FileText, 
  Code, 
  ExternalLink,
  ChevronRight 
} from '@/components/ui/icon';
import { getAllSkillSlugs, getSkillBySlug, getAllSkills, renderMarkdown } from '@/lib/skills';
import { formatDate, estimateReadingTime } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/types';

// Generate static params for all skills
export async function generateStaticParams() {
  const slugs = getAllSkillSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  
  if (!skill) {
    return {
      title: 'Skill Not Found',
    };
  }
  
  return {
    title: `${skill.name} | Agent Skills`,
    description: skill.description,
  };
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  
  if (!skill) {
    notFound();
  }
  
  const categoryConfig = CATEGORY_CONFIG[skill.category];
  const readingTime = estimateReadingTime(skill.content);
  
  // Get related skills
  const allSkills = getAllSkills();
  const relatedSkills = allSkills
    .filter((s) => 
      skill.relatedSkills.includes(s.slug) || 
      (s.category === skill.category && s.slug !== skill.slug)
    )
    .slice(0, 3);
  
  // Render content
  const htmlContent = await renderMarkdown(skill.content);
  
  // Main sections for navigation
  const mainSections = skill.sections.filter((s) => s.level === 2);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-background-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link 
                href="/skills" 
                className="text-foreground-subtle hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Skills
              </Link>
              <ChevronRight className="w-4 h-4 text-foreground-subtle" />
              <span className="text-foreground-muted">{skill.name}</span>
            </nav>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
            {/* Main Content */}
            <div className="min-w-0">
              {/* Header */}
              <header className="mb-10 pb-10 border-b border-border">
                <div className="flex items-start gap-4 mb-6">
                  <div className="shrink-0">
                    <CategoryIconWrapper category={skill.category} size="lg" />
                  </div>
                  <div>
                    <Badge variant={skill.category} className="mb-2">
                      {categoryConfig.label}
                    </Badge>
                    <h1 className="heading-1 text-foreground">{skill.name}</h1>
                  </div>
                </div>
                
                <p className="body-large mb-6">{skill.description}</p>
                
                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-foreground-subtle">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {readingTime} min read
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {skill.metadata.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    v{skill.metadata.version}
                  </span>
                  {skill.hasReferences && (
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {skill.referenceFiles?.length} references
                    </span>
                  )}
                  {skill.hasScripts && (
                    <span className="flex items-center gap-1.5">
                      <Code className="w-4 h-4" />
                      {skill.scriptFiles?.length} scripts
                    </span>
                  )}
                </div>
              </header>
              
              {/* When to Activate */}
              {skill.whenToActivate.length > 0 && (
                <section className="mb-10 p-6 rounded-xl bg-background-secondary border border-border">
                  <h2 className="heading-3 text-foreground mb-4">When to Activate</h2>
                  <ul className="space-y-2">
                    {skill.whenToActivate.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              
              {/* Main Content */}
              <article 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
              
              {/* Guidelines */}
              {skill.guidelines.length > 0 && (
                <section className="mt-12 p-6 rounded-xl bg-accent/5 border border-accent/20">
                  <h2 className="heading-3 text-foreground mb-4">Key Guidelines</h2>
                  <ol className="space-y-2">
                    {skill.guidelines.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground-muted">
                        <span className="font-mono text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              
              {/* Files */}
              {(skill.hasScripts || skill.hasReferences) && (
                <section className="mt-12">
                  <h2 className="heading-3 text-foreground mb-4">Skill Resources</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {skill.hasReferences && skill.referenceFiles?.map((file) => (
                      <a
                        key={file}
                        href={`https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/blob/main/skills/${skill.slug}/references/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary border border-border hover:border-border-hover transition-colors group"
                      >
                        <FileText className="w-5 h-5 text-foreground-subtle" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-foreground group-hover:text-accent transition-colors truncate">
                            {file}
                          </div>
                          <div className="text-xs text-foreground-subtle">Reference</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-foreground-subtle" />
                      </a>
                    ))}
                    {skill.hasScripts && skill.scriptFiles?.map((file) => (
                      <a
                        key={file}
                        href={`https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/blob/main/skills/${skill.slug}/scripts/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary border border-border hover:border-border-hover transition-colors group"
                      >
                        <Code className="w-5 h-5 text-foreground-subtle" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-foreground group-hover:text-accent transition-colors truncate">
                            {file}
                          </div>
                          <div className="text-xs text-foreground-subtle">Script</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-foreground-subtle" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Related Skills */}
              {relatedSkills.length > 0 && (
                <section className="mt-16 pt-12 border-t border-border">
                  <h2 className="heading-2 text-foreground mb-6">Related Skills</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedSkills.map((relatedSkill) => (
                      <SkillCard key={relatedSkill.slug} skill={relatedSkill} variant="compact" />
                    ))}
                  </div>
                </section>
              )}
            </div>
            
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Table of Contents */}
                <div className="p-5 rounded-xl bg-background-secondary border border-border">
                  <h3 className="font-medium text-foreground mb-4 text-sm">On this page</h3>
                  <nav className="space-y-1">
                    {mainSections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="block py-1.5 text-sm text-foreground-subtle hover:text-foreground transition-colors"
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>
                
                {/* Quick Actions */}
                <div className="p-5 rounded-xl bg-background-secondary border border-border">
                  <h3 className="font-medium text-foreground mb-4 text-sm">Quick Actions</h3>
                  <div className="space-y-2">
                    <a
                      href={`https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/blob/main/skills/${skill.slug}/SKILL.md`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full p-2.5 text-sm text-foreground-muted hover:text-foreground bg-background-tertiary rounded-lg hover:bg-background-elevated transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on GitHub
                    </a>
                    <a
                      href={`https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/edit/main/skills/${skill.slug}/SKILL.md`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full p-2.5 text-sm text-foreground-muted hover:text-foreground bg-background-tertiary rounded-lg hover:bg-background-elevated transition-colors"
                    >
                      <Code className="w-4 h-4" />
                      Edit this skill
                    </a>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="p-5 rounded-xl bg-background-secondary border border-border">
                  <h3 className="font-medium text-foreground mb-4 text-sm">Metadata</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-foreground-subtle">Created</dt>
                      <dd className="text-foreground-muted">{formatDate(skill.metadata.created)}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-subtle">Updated</dt>
                      <dd className="text-foreground-muted">{formatDate(skill.metadata.updated)}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-subtle">Version</dt>
                      <dd className="font-mono text-foreground-muted">{skill.metadata.version}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

