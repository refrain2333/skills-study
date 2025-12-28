'use client';

import { useState, useMemo } from 'react';
import { SkillCard } from './skill-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from '@/components/ui/icon';
import { CATEGORY_CONFIG } from '@/lib/types';
import type { Skill, SkillCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SkillsGridProps {
  skills: Skill[];
}

export function SkillsGrid({ skills }: SkillsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');
  
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch = 
        searchQuery === '' ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = 
        activeCategory === 'all' || 
        skill.category === activeCategory;
        
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchQuery, activeCategory]);
  
  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)] as const;
  
  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search skills..."
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(category as SkillCategory | 'all')}
              className={cn(
                activeCategory === category && 'glow',
              )}
            >
              {category === 'all' ? 'All' : CATEGORY_CONFIG[category as SkillCategory].label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-subtle">
          {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      {/* Grid */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, index) => (
            <div
              key={skill.slug}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SkillCard skill={skill} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-foreground-muted mb-2">No skills found</p>
          <p className="text-sm text-foreground-subtle">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}



