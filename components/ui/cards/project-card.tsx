import { ProjectCardProps } from "@/types/projects/project";

export default function ProjectCard({name, teamsCnt, placesCnt}: ProjectCardProps) {
    return (
        <div className="max-w-[402px] min-w-[190px] px-[22px] py-[32px] shadow-xl rounded">
            <h2 className="text-[20px] text-[#000150] font-semibold pb-[21px] border-b-1 border-[#000150] mb-[21px]">
                {name} Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, excepturi!
            </h2>
            <div className="text-right">
                <p className="text-[16px] text-[#000150] font-md">
                    Команд: {teamsCnt}{"  "}К-во мест: {placesCnt}
                </p>
            </div>
        </div>
    )
}