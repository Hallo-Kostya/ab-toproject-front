import { ProjectCardProps } from "@/types/projects/project";

// утилитарная функция для обрезки текста
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export default function ProjectCard({ name, description, teamsCnt = 0, placesCnt = 0 }: ProjectCardProps) {
  return (
    <div className="flex flex-col w-full min-h-[150px] px-[24px] py-[24px] shadow-md inset-shadow-xs rounded-[12px] bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="pb-[16px] border-b border-[#000150]/20 mb-[16px]">
        <h2 className="text-[20px] text-[#000150] font-semibold mb-[12px]">
          {truncateText(name, 40)}
        </h2>
        <p className="text-[16px] text-[#000150] mb-1">{truncateText(description, 40)}</p>
      </div>
      <div className="text-right">
        <p className="text-[16px] text-[#000150]">
          Команд: <span className="">{teamsCnt}</span> <span className="px-[2px]"> • </span> Участников: <span className="">{placesCnt}</span>
        </p>
      </div>
    </div>
  );
}