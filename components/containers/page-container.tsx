import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";

interface BaseListItem {
  id: string;
}

type CardComponent<T extends BaseListItem> = (item: T, index: number) => ReactNode;

interface PageContainerProps<T extends BaseListItem> {
  pageTag: string;
  meetingsTitle: string;
  meetingsListComponent: ReactNode;
  listHeader: string;
  list: T[];
  cardComponent: CardComponent<T>;
  year?: string;
  semester?: string;
}

export default function PageContainer<T extends { id: string }>({ 
  pageTag, 
  meetingsTitle, 
  meetingsListComponent, 
  listHeader, 
  list, 
  cardComponent, 
  year, 
  semester
}: PageContainerProps<T>) {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-[16px] shadow-sm">
        <h2 className="text-[20px] text-[#000150] font-semibold mb-4">{meetingsTitle}</h2>
        {meetingsListComponent}
      </div>
      
      <div>
        <ListHeaderComponent 
          pageTag={pageTag} 
          counterTitle={listHeader} 
          counter={list.length} 
          year={year} 
          semester={semester} 
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
}

function ListHeaderComponent({pageTag, counterTitle, counter, year, semester}: ListHeaderComponentProps) {
  return (
    <div className="flex justify-between mb-4">
      <p className="text-[18px] text-[#353535]">
        {counterTitle}<span className="text-[18px] text-[#000150] font-semibold">{counter}</span>
      </p>
      {pageTag !== "teams" && (
        <SortingComponent filterYear={year} filterSemester={semester} />
      )}
    </div>
  );
}

interface FilterComponentProps {
  filterYear?: string;
  filterSemester?: string;
}

function SortingComponent({filterYear, filterSemester}: FilterComponentProps) {
  return (
    <div className="flex gap-[18px]">
      <p className="flex gap-1 text-[18px] text-[#353535]">
        Сортировать по году: <span className="text-[18px] text-[#000150] font-semibold">{filterYear || 'все'}</span>
        <Image src={"/chevron-down.svg"} alt={"Сортировка"} width={24} height={24} className="ml-1"/>
      </p>
      <p className="flex gap-1 text-[18px] text-[#353535]">
        Семестр: <span className="text-[18px] text-[#000150] font-semibold">{filterSemester || 'все'}</span>
        <Image src={"/chevron-down.svg"} alt={"Сортировка"} width={24} height={24} className="ml-1"/>
      </p>
    </div>
  );
}