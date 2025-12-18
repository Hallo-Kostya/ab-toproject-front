import { MeetingCardProps } from "@/types/meetings/meeting";

export default function MeetingCard({ teamName, name, resume, date, time}: MeetingCardProps) {
    return (
        <div className="min-w-[290px] w-[290px] px-[15px] py-[13px] shadow-md inset-shadow-xs rounded-[8px] bg-[#FBFAFF]">
            <div>
                <h2 className="text-[#000150] opacity-80 text-[18px] font-bold mb-[12px]">{`"${teamName}"`}</h2>
            </div>
            <div className="text-left mb-[12px]">
                <p className="text-[rgba(0, 0, 0, 0.8)] text-[14px] mb-[4px] font-semibold"><span>{name}</span></p>
                <p className="text-[rgba(0, 0, 0, 0.8)] text-[12px]">{resume}</p>
            </div>
            <div className="text-right">
                <p className="text-black text-[13px] font-medium">{date} <span className="ml-[12px] font-semibold">{time}</span></p>
            </div>
        </div>
    )
}