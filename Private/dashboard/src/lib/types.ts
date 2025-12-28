/**
 * Core type definitions for the Agent Skills Dashboard
 * 
 * These types are designed to be extensible as the platform grows.
 * The Skill type maps directly to the SKILL.md frontmatter and structure.
 */

export type SkillCategory = 
  | 'foundational'
  | 'architectural'
  | 'operational'
  | 'methodology';

export interface SkillMetadata {
  created: string;
  updated: string;
  author: string;
  version: string;
}

export interface SkillSection {
  id: string;
  title: string;
  content: string;
  level: number; // Header level (2 = ##, 3 = ###, etc.)
}

export interface SkillReference {
  type: 'internal' | 'external' | 'related';
  title: string;
  path?: string;
  url?: string;
  description?: string;
}

export interface Skill {
  // Core identification
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  
  // Content
  content: string; // Raw markdown content (body only)
  sections: SkillSection[];
  
  // Structured data extracted from markdown
  whenToActivate: string[];
  guidelines: string[];
  relatedSkills: string[];
  references: SkillReference[];
  
  // Metadata
  metadata: SkillMetadata;
  
  // File system info
  hasScripts: boolean;
  hasReferences: boolean;
  scriptFiles?: string[];
  referenceFiles?: string[];
}

export interface SkillSummary {
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  version: string;
  updated: string;
}

// Category configuration for display
export const CATEGORY_CONFIG: Record<SkillCategory, {
  label: string;
  color: string;
  description: string;
}> = {
  foundational: {
    label: 'Foundational',
    color: 'category-foundational',
    description: 'Core concepts required for all context engineering work',
  },
  architectural: {
    label: 'Architectural',
    color: 'category-architectural',
    description: 'Patterns and structures for building agent systems',
  },
  operational: {
    label: 'Operational',
    color: 'category-operational',
    description: 'Ongoing operation and optimization of agent systems',
  },
  methodology: {
    label: 'Methodology',
    color: 'category-methodology',
    description: 'Meta-level practices for building LLM-powered projects',
  },
};

// Skill to category mapping
export const SKILL_CATEGORIES: Record<string, SkillCategory> = {
  'context-fundamentals': 'foundational',
  'context-degradation': 'foundational',
  'context-compression': 'foundational',
  'multi-agent-patterns': 'architectural',
  'memory-systems': 'architectural',
  'tool-design': 'architectural',
  'context-optimization': 'operational',
  'evaluation': 'operational',
  'advanced-evaluation': 'operational',
  'project-development': 'methodology',
};



