import { TeamCardProps, TeamStudent } from "@/types/teams/team";
import Image from "next/image";

export default function TeamCard({ id, name, teamNumber, participants = [] }: TeamCardProps) {
  const studentCount = participants.length;
  
  return (
    <div className="flex flex-col w-full max-h-[296px] px-[20px] py-[24px] shadow-md inset-shadow-xs rounded-[12px] bg-[#FBFAFF]">
      <div className="flex items-center text-[24px] text-[#000150] pb-[12px] mb-[12px] border-b-1 border-[#000150]">
        <h2 className="font-bold align-center">{`"${name}"`}</h2>
        <div className="flex bg-[#000150]/10 rounded-[4px] px-2 py-[2px] gap-[6px] ml-3">
          <Image src={"/user-round.svg"} alt={"К-во участников"} width={20} height={20}/>
          <p className="text-[18px]">{studentCount}</p>
        </div>
        <p className="ml-auto font-bold">№{teamNumber}</p>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <h3 className="text-[14px] font-semibold text-[#000150] mb-2">Список участников:</h3>
        {participants.length > 0 ? (
          <ul className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-2">
            {participants.map((participant, index) => (
              <li key={participant.id} className="flex items-start gap-[10px]">
                <span className="w-6 h-6 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-xs mb-[2px] flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-[14px] flex-1 break-words">
                  {participant.last_name} {participant.first_name} {participant.patronymic || ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-[14px]">В команде пока нет участников</p>
        )}
      </div>
    </div>
  );
}