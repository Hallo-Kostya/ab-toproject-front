import { MeetingCardProps } from "@/types/meetings/meeting";

export default function MeetingCard({ teamName, name, resume, date, time, status }: MeetingCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Завершена';
      case 'cancelled':
        return 'Отменена';
      default:
        return 'Запланирована';
    }
  };

  return (
    <div className="min-w-[290px] w-[290px] px-[15px] py-[13px] shadow-md inset-shadow-xs rounded-[8px] bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <h2 className="text-[#000150] opacity-80 text-[18px] font-bold mb-[12px]">{`"${teamName}"`}</h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      <div className="text-left mb-[12px]">
        <p className="text-[rgba(0, 0, 0, 0.8)] text-[14px] mb-[4px] font-semibold"><span>{name}</span></p>
        <p className="text-[rgba(0, 0, 0, 0.8)] text-[12px] line-clamp-2">{resume}</p>
      </div>
      <div className="text-right">
        <p className="text-black text-[13px] font-medium">{date} <span className="ml-[12px] font-semibold">{time}</span></p>
      </div>
    </div>
  );
}