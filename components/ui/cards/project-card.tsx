import { ProjectCardProps } from "@/types/projects/project";
import { truncateText } from "@/utils/truncateText";

export default function ProjectCard({ name, description, teamsCnt, placesCnt }: ProjectCardProps) {
  const hasStats = teamsCnt !== undefined && teamsCnt !== null && placesCnt !== undefined && placesCnt !== null;

  return (
    <div className="flex flex-col w-full min-h-37.5 px-6 py-6 shadow-md inset-shadow-xs rounded-xl bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="pb-4 border-b border-[#000150]/20 mb-4">
        <h2 className="text-[20px] text-[#000150] font-semibold mb-3">
          {truncateText(name, 64)}
        </h2>
        <p className="text-[16px] text-[#000150] mb-1">{truncateText(description, 128)}</p>
      </div>

      {hasStats && (
        <div className="text-right">
          <p className="text-[16px] text-[#000150]">
            Команд: <span className="">{teamsCnt}</span> <span className="px-0.5"> • </span> Участников: <span className="">{placesCnt}</span>
          </p>
        </div>
      )}
    </div>
  );
}