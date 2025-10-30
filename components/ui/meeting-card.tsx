import { MeetingCardProps } from "@/types/meeting";

export default function MeetingCard({ teamName, name, resume, date}: MeetingCardProps) {
    return (
        <div className="min-w-[190px] w-[402px] px-[15px] py-[13px] shadow-xl rounded">
            <div>
                <h2 className="text-[#000150] opacity-80 text-[20px] font-bold mb-[12px]">{teamName}</h2>
            </div>
            <div className=" mb-[12px]">
                <p className="text-[rgba(0, 0, 0, 0.8)] text-[18px] mb-[4px]"><span>{name}</span></p>
                <p className="text-[rgba(0, 0, 0, 0.8)] text-[16px]">{resume}</p>
            </div>
            <div className="text-right">
                <p className="text-black text-[16px] font-md"><span>{date}</span></p>
            </div>
        </div>
    )
}