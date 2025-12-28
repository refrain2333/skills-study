import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SkillsGrid } from '@/components/skills/skills-grid';
import { CategoryNav } from '@/components/skills/category-nav';
import { getAllSkills } from '@/lib/skills';
import type { SkillCategory } from '@/lib/types';

export const metadata = {
  title: 'Skills | Agent Skills Dashboard',
  description: 'Browse all Agent Skills for context engineering, multi-agent architectures, and production agent systems.',
};

export default function SkillsPage() {
  const skills = getAllSkills();
  
  // Calculate counts per category
  const skillCounts = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<SkillCategory, number>);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="heading-1 text-foreground mb-4">All Skills</h1>
            <p className="body-large max-w-2xl">
              A comprehensive collection of {skills.length} production-grade skills 
              for building AI agent systems. Filter by category or search to find 
              what you need.
            </p>
          </div>
          
          {/* Category Overview */}
          <div className="mb-12">
            <CategoryNav skillCounts={skillCounts} />
          </div>
          
          {/* Skills Grid with Search/Filter */}
          <SkillsGrid skills={skills} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}



