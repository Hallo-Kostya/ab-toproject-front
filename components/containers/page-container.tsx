import Link from "next/link";
import { ReactNode } from "react";

{/* НАСТРОЙКА ТИПИЗАЦИИ */}

interface PageContainerProps {
    pageTag: string;
    meetingsTitle: string;
    meetingsListComponent: ReactNode;
    listHeader: string;
    list: T[];
    cardComponent: (item: T, index: number) => ReactNode;
    year?: string;
    semester?: string;
}

export default function PageContainer<T extends { id: string }>( { 
    pageTag, 
    meetingsTitle, 
    meetingsListComponent, 
    listHeader, 
    list, 
    cardComponent, 
    year, 
    semester
}: PageContainerProps ) {
    return (
        <div>
            <div>
                <h2 className="text-[20px] text-[#000150] font-semibold mb-4">{meetingsTitle}</h2>
                <>{meetingsListComponent}</>
            </div>
            <div className="mt-[90px]">
                <ListHeaderComponent 
                    pageTag={pageTag} 
                    counterTitle={listHeader} 
                    counter={list.length} 
                    year={year} 
                    semester={semester} 
                />
                <ul className="flex gap-6 mt-4">
                {list.map((item) =>
                    <li key={item.id}>
                    <Link href={`/${pageTag}/${item.id}`}>
                        <>{cardComponent(item, item.id)}</>
                    </Link>
                    </li>
                )}
                </ul>
            </div>
        </div>
    )
}

interface ListHeaderComponentProps {
    pageTag: string;
    counterTitle: string;
    counter: number;
    year?: string;
    semester?: string;
}

function ListHeaderComponent( {pageTag, counterTitle, counter, year, semester}: ListHeaderComponentProps ) {
    return (
        <div className="flex justify-between">
            <p className="text-[18px] text-[#353535]">
                {counterTitle}<span className="text-[18px] text-[#000150] font-semibold">{counter}</span>
            </p>
            {pageTag !== "teams" && (
                <SortingComponent filterYear={year} filterSemester={semester} />
            )
            }
        </div>
    )
}

interface FilterComponentProps {
    filterYear?: string;
    filterSemester?: string;
}

function SortingComponent( {filterYear, filterSemester}: FilterComponentProps ) {
    return (
        <div className="flex gap-[18px]">
            <p className="text-[18px] text-[#353535]">
                Сортировать по году: <span className="text-[18px] text-[#000150] font-semibold">{filterYear}</span>
            </p>
            <p className="text-[18px] text-[#353535]">
                Семестр: <span className="text-[18px] text-[#000150] font-semibold">{filterSemester}</span>
            </p>
        </div>
    )
}