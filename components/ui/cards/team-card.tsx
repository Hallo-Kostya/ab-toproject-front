import { TeamCardProps } from "@/types/teams/team";
import Image from "next/image";


export default function TeamCard({ name, teamNumber, participants }: TeamCardProps) {
    return (
        <div className="flex flex-col w-full min-h-[260px] px-[20px] py-[24px] shadow-md inset-shadow-xs rounded-[12px]">
            <div className="flex items-center text-[20px] text-[#000150] font-semibold pb-[8px] mb-[8px] border-b-1 border-[#000150]">
                <h2 className="">{name}</h2>
                <div className="flex bg-indigo-200/40 rounded-[4px] px-2 py-[2px] gap-[6px] ml-3">
                    <Image src={"/user-round.svg"} alt={"К-во участников"} width={20} height={20}/>
                    <p className="">{participants.length}</p>
                </div>
                <p className="ml-auto">№{teamNumber}</p>
            </div>
            
            <div>
                <h3 className="text-[14px] font-semibold text-[#000150] mb-1">Список участников:</h3>
                <ul className="flex flex-col gap-1">
                    {participants.map((participant) =>
                        <li key={participant.id}>
                            <span className="text-[14px]">{participant.firstName} {participant.lastName} {participant?.patronymic}</span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}