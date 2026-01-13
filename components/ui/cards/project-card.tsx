import { ProjectCardProps } from "@/types/projects/project";

export default function ProjectCard({ name, teamsCnt = 0, placesCnt = 0 }: ProjectCardProps) {
  return (
    <div className="flex flex-col w-full min-h-[150px] px-[24px] py-[24px] shadow-md inset-shadow-xs rounded-[12px] bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow">
      <h2 className="text-[20px] text-[#000150] font-semibold pb-[16px] border-b border-[#000150]/40 mb-[16px]">
        {name}
      </h2>
      
      <div className="text-right">
        <p className="text-[16px] text-[#000150]">
          Команд: <span className="">{teamsCnt}</span> <span className="px-[2px]"> • </span> Участников: <span className="">{placesCnt}</span>
        </p>
      </div>
    </div>
  );
}