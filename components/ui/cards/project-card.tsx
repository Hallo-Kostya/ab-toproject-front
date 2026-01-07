import { ProjectCardProps } from "@/types/projects/project";

export default function ProjectCard({ name }: ProjectCardProps) {
  return (
    <div className="flex flex-col w-full min-h-[180px] px-[24px] py-[24px] shadow-md inset-shadow-xs rounded-[12px] bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow">
      <h2 className="text-[20px] text-[#000150] font-semibold pb-[16px] border-b border-gray-300 mb-[16px]">
        {name}
      </h2>
      <div className="flex-1"></div>
      {/* Закомментировано, так как пока не реализовано в API */}
      {/* <div className="text-right">
        <p className="text-[16px] text-[#000150] font-medium">
          Команд: {teamsCnt || 0}{"  "}Кол-во мест: {placesCnt || 0}
        </p>
      </div> */}
    </div>
  );
}