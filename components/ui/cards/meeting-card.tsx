import { MeetingCardProps } from "@/types/meetings/meeting";
import { truncateText } from "@/utils/truncateText";

export default function MeetingCard({ teamName, name, resume, date, time, status }: MeetingCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-red-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Завершена';
      case 'canceled':
        return 'Отменена';
      case 'in_progress':
        return 'В работе';
      case 'scheduled':
        return 'Запланирована';
      default:
        return 'Запланирована';
    }
  };

  return (
    <div className="min-w-72.5 w-72.5 min-h-48 px-3.75 py-3.25 shadow-md inset-shadow-xs rounded-lg bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <h2 className="text-[#000150] opacity-80 text-[18px] font-bold mb-3">{truncateText(teamName, 20)}</h2>
        <span className={`text-xs text-nowrap font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      <div className="text-left mb-3">
        <p className="text-[rgba(0, 0, 0, 0.8)] text-[14px] mb-1 font-semibold"><span>{name}</span></p>
        <p className="text-[rgba(0, 0, 0, 0.8)] text-[12px] line-clamp-2">{resume}</p>
      </div>
      <div className="text-right">
        <p className="text-black text-[13px] font-medium">{date} <span className="ml-3 font-semibold">{time}</span></p>
      </div>
    </div>
  );
}