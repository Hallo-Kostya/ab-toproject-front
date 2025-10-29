import { ProjectCardProps } from "@/types/project";

export default function ProjectCard({name, teamsCnt, placesCnt}: ProjectCardProps) {
    return (
        <div>
            <h2>{name}</h2>
            <div>
                <p>Команд: {teamsCnt}</p>
                <p>К-во мест: {placesCnt}</p>
            </div>
        </div>
    )
}