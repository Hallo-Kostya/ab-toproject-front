'use client';

import { useState, useEffect, useRef } from 'react';
import { searchStudents, StudentSearchResult } from '@/lib/api/search';

interface StudentSearchBarProps {
  placeholder?: string;
  className?: string;
  onStudentSelect?: (student: StudentSearchResult) => void;
}

export default function StudentSearchBar({ 
  placeholder = "Поиск студентов...", 
  className = "",
  onStudentSelect 
}: StudentSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
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
        const data = await searchStudents(query, { limit: 10 });
        setResults(data);
        setIsOpen(true);
      } catch (err: any) {
        console.error('Student search error:', err);
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

  const handleSelect = (student: StudentSearchResult) => {
    onStudentSelect?.(student);
    setIsOpen(false);
    setQuery('');
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="bg-gray-200 border-b px-0.5 rounded">{part}</mark> 
        : part
    );
  };

  return (
    <div className={`relative w-full max-w-xs ${className}`} ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="
            border border-[#000150]/20 
            rounded-xl 
            pl-10 pr-4 py-2.5
            text-[#6B7280] 
            placeholder:text-[#6B7280]
            focus:outline-none 
            focus:ring-2 
            focus:ring-[#000150]/10 
            focus:border-[#000150]
            transition-all
            w-full
          "
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] opacity-70">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#000150]/20 border-t-[#000150] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {results.map((student) => (
            <button
              key={student.id}
              onClick={() => handleSelect(student)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#000150]/5 rounded-xl transition-colors group border-b border-gray-100 last:border-0"
            >
              <div className="shrink-0 w-9 h-9 flex items-center justify-center bg-[#000150]/10 rounded-lg">
                <svg className="w-5 h-5 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#000150] truncate">
                  {highlightMatch(`${student.last_name} ${student.first_name}`, query)}
                </p>
                {student.email && (
                  <p className="text-[12px] text-gray-500 truncate">{student.email}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#000150] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query.trim() && results.length === 0 && !isLoading && (
        <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4 text-center text-gray-500 text-sm">
          Ничего не найдено
        </div>
      )}
    </div>
  );
}