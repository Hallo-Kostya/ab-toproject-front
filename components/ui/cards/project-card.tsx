import { ProjectCardProps } from "@/types/projects/project";

export default function ProjectCard({name, teamsCnt, placesCnt}: ProjectCardProps) {
    return (
        <div className="flex flex-col justify-between w-full min-h-[260px] px-[20px] py-[24px] shadow-md inset-shadow-xs rounded-[12px]">
            <h2 className="text-[20px] text-[#000150] font-semibold pb-[21px] border-b-1 border-[#000150] mb-[21px]">
                {name}
            </h2>
            <div className="text-right">
                <p className="text-[16px] text-[#000150] font-md">
                    Команд: {teamsCnt}{"  "}К-во мест: {placesCnt}
                </p>
            </div>
        </div>
    )
}