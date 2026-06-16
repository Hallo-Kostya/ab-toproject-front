import { TeamCardProps } from "@/types/teams/team";
import Image from "next/image";
import { truncateText } from "@/utils/truncateText";

export default function TeamCard({ name, teamNumber, participants = [] }: TeamCardProps) {
  const studentCount = participants.length;
  
  return (
    <div className="flex flex-col w-full min-h-70 px-5 py-6 shadow-md inset-shadow-xs rounded-xl bg-[#FBFAFF]">
      <div className="flex items-center text-[22px] text-[#000150] pb-3 mb-3 border-b border-[#000150]/40 gap-4">
        <h2 className="font-bold align-center text-nowrap line-clamp-1">{truncateText(name, 24)}</h2>
        <div className="flex min-w-13.5 bg-[#000150]/10 rounded-sm px-2 py-0.5 gap-1.5">
          <Image src={"/user-round.svg"} alt={"К-во участников"} width={20} height={20}/>
          <p className="text-[18px]">{studentCount}</p>
        </div>
        <p className="ml-auto font-bold">№{teamNumber}</p>
      </div>
      
      <div className="flex-1">
        <h3 className="text-[14px] font-semibold text-[#000150] mb-2">Список участников:</h3>
        {participants.length > 0 ? (
          <ul className="flex flex-col gap-1 pr-2">
            {participants.map((participant, index) => (
              <li key={participant.id} className="flex items-start gap-2.5">
                <span className="w-6 h-6 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-xs mb-0.5 shrink-0">
                  {index + 1}
                </span>
                <span className="text-[14px] flex-1 wrap-break-word mt-0.5">
                  {participant.first_name} {participant.last_name} {participant.patronymic || ''}
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