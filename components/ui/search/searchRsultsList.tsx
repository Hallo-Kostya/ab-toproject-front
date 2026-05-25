'use client';

import { useRouter } from 'next/navigation';
import SearchResultCard from './searchResultCard';
import { SearchResult } from '@/lib/api/search';

interface SearchResultsListProps {
  results: SearchResult[];
  query: string;
  onClose?: () => void;
  onResultClick?: (result: SearchResult) => void;
}

export default function SearchResultsList({ results, query, onClose, onResultClick }: SearchResultsListProps) {
  const router = useRouter();

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
      onClose?.();
      return;
    }

    switch (result.type) {
      case 'project': router.push(`/projects/${result.id}`); break;
      case 'team': router.push(`/teams/${result.id}`); break;
      // case 'student':
      //   alert(`Студент "${result.name}"\nПереход на страницу команды пока недоступен`);
      //   break;
    }
    onClose?.();
  };

  if (results.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {`Ничего не найдено по запросу "${query}"`}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {results.map((result) => (
        <SearchResultCard
          key={`${result.type}-${result.id}`}
          result={result}
          onClick={handleResultClick}
          highlight={query}
        />
      ))}
    </div>
  );
}