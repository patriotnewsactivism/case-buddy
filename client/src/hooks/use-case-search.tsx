import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { CASE_DOCUMENTS, CASE_TIMELINE, Doc, TimelineEvent } from "@/lib/case-data";

type SearchableItem = {
  id: string;
  title: string;
  summary?: string | null;
  tags?: string[] | null;
  date?: string | null;
  type: 'document' | 'timeline';
  docType?: string;
};

export function useCaseSearch() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const searchableItems: SearchableItem[] = useMemo(() => [
    ...CASE_DOCUMENTS.map(doc => ({
      id: doc.id,
      title: doc.title,
      summary: doc.summary,
      tags: doc.tags,
      date: doc.date,
      type: 'document' as const,
      docType: doc.type
    })),
    ...CASE_TIMELINE.map(event => ({
      id: event.id,
      title: event.title,
      summary: event.summary,
      tags: event.tags,
      date: event.date,
      type: 'timeline' as const
    })),
  ], []);

  const fuse = useMemo(() => 
    new Fuse(searchableItems, {
      keys: ['title', 'summary', 'tags'],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
    }), [searchableItems]
  );

  const results = useMemo(() => {
    let items = searchableItems;

    // Apply search query
    if (query.trim()) {
      items = fuse.search(query).map(result => result.item);
    }

    // Apply filters
    if (activeFilters.length > 0) {
      items = items.filter(item => {
        if (item.type === 'document') {
          return activeFilters.includes(item.docType || '');
        }
        return activeFilters.includes('timeline');
      });
    }

    return items;
  }, [query, activeFilters, fuse, searchableItems]);

  const addFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev : [...prev, filter]
    );
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  return {
    query,
    setQuery,
    results,
    activeFilters,
    addFilter,
    removeFilter,
    clearFilters,
  };
}
