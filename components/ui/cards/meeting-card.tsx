import { MeetingCardProps } from "@/types/meetings/meeting";

export default function MeetingCard({ teamName, name, resume, date, time}: MeetingCardProps) {
    return (
        <div className="min-w-[290px] w-[290px] px-[15px] py-[13px] shadow-md inset-shadow-xs rounded-[8px]">
            <div>
                <h2 className="text-[#000150] opacity-80 text-[20px] font-bold mb-[12px]">{teamName}</h2>
            </div>
            <div className=" mb-[12px]">
                <p className="text-[rgba(0, 0, 0, 0.8)] text-[18px] mb-[4px]"><span>{name}</span></p>
                <p className="text-[rgba(0, 0, 0, 0.8)] text-[16px]">{resume}</p>
            </div>
            <div className="text-right">
                <p className="text-black text-[16px] font-md">{date} <span className="font-semibold">{time}</span></p>
            </div>
        </div>
    )
}