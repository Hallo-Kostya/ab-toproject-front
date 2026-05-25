import { SearchResult, SearchResultType, } from "@/lib/api/search";

interface SearchResultCardProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
  highlight?: string;
}

const getTypeIcon = (type: SearchResultType) => {
  switch (type) {
    case 'project':
      return (
        <svg className="w-5 h-5 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'team':
      return (
        <svg className="w-5 h-5 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    // case 'student':
    //   return (
    //     <svg className="w-5 h-5 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    //     </svg>
    //   );
  }
};

const getTypeLabel = (type: SearchResultType) => {
  switch (type) {
    case 'project': return 'Проект';
    case 'team': return 'Команда';
    // case 'student': return 'Студент';
  }
};

const highlightMatch = (text: string, query?: string) => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) 
      ? <mark key={i} className="bg-gray-200 px-0.5 rounded border-b">{part}</mark> 
      : part
  );
};

export default function SearchResultCard({ result, onClick, highlight }: SearchResultCardProps) {
  return (
    <button
      onClick={() => onClick(result)}
      className="w-full flex items-start gap-3 p-3 text-left hover:bg-[#000150]/5 rounded-xl transition-colors group"
    >
      {/* Иконка */}
      <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-[#000150]/10 rounded-lg group-hover:bg-[#000150]/20 transition-colors">
        {getTypeIcon(result.type)}
      </div>
      
      {/* Контент */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[15px] font-medium text-[#000150] truncate">
            {highlightMatch(result.name, highlight)}
          </span>
          <span className="text-[11px] px-2 py-0.5 bg-[#000150]/10 text-[#000150] rounded-full font-medium">
            {getTypeLabel(result.type)}
          </span>
        </div>
        {result.description && (
          <p className="text-[13px] text-gray-500 line-clamp-2">
            {highlightMatch(result.description, highlight)}
          </p>
        )}
      </div>
      
      {/* Стрелка */}
      <svg className="w-4 h-4 text-gray-400 group-hover:text-[#000150] transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}