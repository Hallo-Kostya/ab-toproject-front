import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";

interface PageContainerProps<T extends { id: string }> {
  pageTag: string;
  meetingsTitle: string;
  meetingsListComponent?: ReactNode;
  listHeader: string;
  list: T[];
  cardComponent: (item: T, index: number) => ReactNode;
  year?: string;
  semester?: string;
  onYearChange?: (year: string | null) => void;
  onSemesterChange?: (semester: string | null) => void;
}

export default function PageContainer<T extends { id: string }>({ 
  pageTag, 
  meetingsTitle, 
  meetingsListComponent, 
  listHeader, 
  list, 
  cardComponent, 
  year, 
  semester,
  onYearChange,
  onSemesterChange,
}: PageContainerProps<T>) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[20px] text-[#000150] font-semibold mb-4">{meetingsTitle}</h2>
        <div>{meetingsListComponent}</div>
      </div>
      
      <div>
        <ListHeaderComponent 
          pageTag={pageTag} 
          counterTitle={listHeader} 
          counter={list.length} 
          year={year} 
          semester={semester}
          onYearChange={onYearChange}
          onSemesterChange={onSemesterChange}
        />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 w-full">
          {list.map((item, index) => (
            <li key={item.id}>
              <Link href={`/${pageTag}/${item.id}`}>
                {cardComponent(item, index)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface ListHeaderComponentProps {
  pageTag: string;
  counterTitle: string;
  counter: number;
  year?: string;
  semester?: string;
  onYearChange?: (year: string | null) => void;
  onSemesterChange?: (semester: string | null) => void;
}

function ListHeaderComponent({
  pageTag, 
  counterTitle, 
  counter, 
  year, 
  semester,
  onYearChange,
  onSemesterChange
}: ListHeaderComponentProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <p className="text-[18px] text-[#353535]">
        {counterTitle}<span className="text-[18px] text-[#000150] font-semibold">{counter}</span>
      </p>
      {pageTag !== "teams" && (
        <SortingComponent 
          filterYear={year} 
          filterSemester={semester}
          onYearChange={onYearChange}
          onSemesterChange={onSemesterChange}
        />
      )}
    </div>
  );
}

interface FilterComponentProps {
  filterYear?: string;
  filterSemester?: string;
  onYearChange?: (year: string | null) => void;
  onSemesterChange?: (semester: string | null) => void;
}

function SortingComponent({
  filterYear, 
  filterSemester,
  onYearChange,
  onSemesterChange
}: FilterComponentProps) {
  const yearOptions = ['все', '2024', '2025', '2026', '2027'];
  const semesterOptions = [
    { value: 'все', label: 'все' },
    { value: 'SPRING', label: 'Весенний' },
    { value: 'AUTUMN', label: 'Осенний' }
  ];

  return (
    <div className="flex gap-3 items-center">
      {/* Фильтр по году */}
      <div className="flex items-center gap-2">
        <span className="text-[18px] text-[#353535]">Год:</span>
        <div className="relative">
          <select
            value={filterYear?.toString() || 'все'}
            onChange={(e) => onYearChange?.(e.target.value)}
            className="
              appearance-none 
              bg-white 
              border border-gray-300 
              rounded-xl 
              px-4 py-1.5 
              pr-10
              text-[16px] 
              text-[#000150] 
              font-medium
              cursor-pointer 
              focus:outline-none 
              focus:ring-2 
              focus:ring-[#000150]/20 
              focus:border-[#000150]
              hover:border-[#000150]/50
              transition-all
              min-w-25
            "
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
            <Image src="/chevron-down.svg" alt="" width={18} height={18} className="opacity-60" />
          </div>
        </div>
      </div>

      {/* Фильтр по семестру */}
      <div className="flex items-center gap-2">
        <span className="text-[18px] text-[#353535]">Семестр:</span>
        <div className="relative">
          <select
            value={filterSemester || 'все'}
            onChange={(e) => onSemesterChange?.(e.target.value)}
            className="
              appearance-none 
              bg-white 
              border border-gray-300 
              rounded-xl 
              px-4 py-1.5 
              pr-10
              text-[16px] 
              text-[#000150] 
              font-medium
              cursor-pointer 
              focus:outline-none 
              focus:ring-2 
              focus:ring-[#000150]/20 
              focus:border-[#000150]
              hover:border-[#000150]/50
              transition-all
              min-w-30
            "
          >
            {semesterOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
            <Image src="/chevron-down.svg" alt="" width={18} height={18} className="opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
}