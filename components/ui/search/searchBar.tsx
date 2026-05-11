'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchEntities, SearchResult } from '@/lib/api/search';
import SearchResultsList from './searchRsultsList';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  dropdownClassName?: string;
  onResultClick?: (result: { type: string; id: string }) => void;
}

export default function SearchBar({ 
  placeholder = "Поиск...", 
  className = "",
  inputClassName = "",
  iconClassName = "",
  dropdownClassName = "",
  onResultClick 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await searchEntities(query, { limit: 10 });
        setResults(data);
        setIsOpen(true);
      } catch (err: any) {
        setError(err.message || 'Ошибка поиска');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0 && !isLoading) {
      // Переход на первый результат
      const first = results[0];
      if (first.type === 'project') router.push(`/projects/${first.id}`);
      else if (first.type === 'team') router.push(`/teams/${first.id}`);
      setIsOpen(false);
    }
    if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Поле ввода */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className={`
            pl-10 pr-4 py-2.5 
            bg-white 
            border border-gray-300 
            rounded-xl 
            text-[15px] 
            text-[#000150] 
            placeholder-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-[#000150]/20 
            focus:border-[#000150]
            transition-all
            ${inputClassName}
          `.replace(/\s+/g, ' ').trim()}
        />
        {/* Иконка поиска */}
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClassName}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {/* Лоадер */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#000150]/20 border-t-[#000150] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Выпадающие результаты */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto ${dropdownClassName}`}>
          {error ? (
            <div className="p-4 text-center text-red-600 text-sm">{error}</div>
          ) : (
            <SearchResultsList 
              results={results} 
              query={query} 
              onClose={() => setIsOpen(false)}
              onResultClick={onResultClick}
            />
          )}
        </div>
      )}
    </div>
  );
}