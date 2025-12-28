import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { 
  Skill, 
  SkillSummary, 
  SkillSection, 
  SkillCategory,
  SkillReference,
  SkillMetadata 
} from './types';
import { SKILL_CATEGORIES } from './types';

const SKILLS_DIR = path.join(process.cwd(), '..', 'skills');

/**
 * Parse sections from markdown content
 */
function parseSections(content: string): SkillSection[] {
  const sections: SkillSection[] = [];
  const lines = content.split('\n');
  let currentSection: SkillSection | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(#{2,4})\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }
      
      const level = headerMatch[1].length;
      const title = headerMatch[2].trim();
      
      currentSection = {
        id: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        title,
        content: '',
        level,
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    sections.push(currentSection);
  }
  
  return sections;
}

/**
 * Extract "When to Activate" items from content
 */
function parseWhenToActivate(content: string): string[] {
  const match = content.match(/## When to Activate[\s\S]*?(?=\n##|\n---)/);
  if (!match) return [];
  
  const items: string[] = [];
  const lines = match[0].split('\n');
  
  for (const line of lines) {
    const itemMatch = line.match(/^-\s+(.+)$/);
    if (itemMatch) {
      items.push(itemMatch[1].trim());
    }
  }
  
  return items;
}

/**
 * Extract guidelines from content
 */
function parseGuidelines(content: string): string[] {
  const match = content.match(/## Guidelines[\s\S]*?(?=\n##|\n---)/);
  if (!match) return [];
  
  const items: string[] = [];
  const lines = match[0].split('\n');
  
  for (const line of lines) {
    const itemMatch = line.match(/^\d+\.\s+(.+)$/);
    if (itemMatch) {
      items.push(itemMatch[1].trim());
    }
  }
  
  return items;
}

/**
 * Extract related skills from Integration section
 */
function parseRelatedSkills(content: string): string[] {
  const match = content.match(/## Integration[\s\S]*?(?=\n##|\n---)/);
  if (!match) return [];
  
  const skills: string[] = [];
  const lines = match[0].split('\n');
  
  for (const line of lines) {
    // Match patterns like "- skill-name - Description" or "- skill-name"
    const skillMatch = line.match(/^-\s+([a-z-]+)\s*[-–]/);
    if (skillMatch) {
      skills.push(skillMatch[1]);
    }
  }
  
  return skills;
}

/**
 * Parse metadata from the end of the content
 */
function parseMetadata(content: string): SkillMetadata {
  const defaults: SkillMetadata = {
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    author: 'Agent Skills Contributors',
    version: '1.0.0',
  };
  
  const createdMatch = content.match(/\*\*Created\*\*:\s*(.+)/);
  const updatedMatch = content.match(/\*\*Last Updated\*\*:\s*(.+)/);
  const authorMatch = content.match(/\*\*Author\*\*:\s*(.+)/);
  const versionMatch = content.match(/\*\*Version\*\*:\s*(.+)/);
  
  return {
    created: createdMatch?.[1]?.trim() || defaults.created,
    updated: updatedMatch?.[1]?.trim() || defaults.updated,
    author: authorMatch?.[1]?.trim() || defaults.author,
    version: versionMatch?.[1]?.trim() || defaults.version,
  };
}

/**
 * Get all skill slugs (directory names)
 */
export function getAllSkillSlugs(): string[] {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.warn(`Skills directory not found: ${SKILLS_DIR}`);
    return [];
  }
  
  return fs.readdirSync(SKILLS_DIR).filter((name) => {
    const skillPath = path.join(SKILLS_DIR, name);
    return (
      fs.statSync(skillPath).isDirectory() &&
      fs.existsSync(path.join(skillPath, 'SKILL.md'))
    );
  });
}

/**
 * Get a single skill by slug
 */
export function getSkillBySlug(slug: string): Skill | null {
  const skillPath = path.join(SKILLS_DIR, slug, 'SKILL.md');
  
  if (!fs.existsSync(skillPath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(skillPath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  // Check for scripts and references directories
  const scriptsDir = path.join(SKILLS_DIR, slug, 'scripts');
  const referencesDir = path.join(SKILLS_DIR, slug, 'references');
  
  const hasScripts = fs.existsSync(scriptsDir);
  const hasReferences = fs.existsSync(referencesDir);
  
  let scriptFiles: string[] = [];
  let referenceFiles: string[] = [];
  
  if (hasScripts) {
    scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.py'));
  }
  
  if (hasReferences) {
    referenceFiles = fs.readdirSync(referencesDir).filter(f => f.endsWith('.md'));
  }
  
  const category = SKILL_CATEGORIES[slug] || 'foundational';
  
  return {
    slug,
    name: data.name || slug,
    description: data.description || '',
    category: category as SkillCategory,
    content,
    sections: parseSections(content),
    whenToActivate: parseWhenToActivate(content),
    guidelines: parseGuidelines(content),
    relatedSkills: parseRelatedSkills(content),
    references: [], // TODO: Parse references section
    metadata: parseMetadata(content),
    hasScripts,
    hasReferences,
    scriptFiles,
    referenceFiles,
  };
}

/**
 * Get all skills with full details
 */
export function getAllSkills(): Skill[] {
  const slugs = getAllSkillSlugs();
  return slugs
    .map(getSkillBySlug)
    .filter((skill): skill is Skill => skill !== null);
}

/**
 * Get skill summaries (lightweight version for listing)
 */
export function getAllSkillSummaries(): SkillSummary[] {
  return getAllSkills().map((skill) => ({
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    version: skill.metadata.version,
    updated: skill.metadata.updated,
  }));
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return getAllSkills().filter((skill) => skill.category === category);
}

/**
 * Render markdown content to HTML
 */
export async function renderMarkdown(content: string): Promise<string> {
  return marked(content, {
    gfm: true,
    breaks: true,
  });
}



