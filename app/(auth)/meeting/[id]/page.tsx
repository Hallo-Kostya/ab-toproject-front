import { meetings } from "@/mocks/meetings/meetings";
import { Meeting } from "@/types/meetings/meeting";
// import { Project } from "@/types/projects/project";
import { Team } from "@/types/teams/team";
import { teams } from "@/mocks/teams/teams";
// import { projects } from "@/mocks/projects/projects";
import { users } from "@/mocks/users/users";
import { notFound } from "next/navigation";
import { buildTeamWithParticipants } from "@/utils/team";
import Image from "next/image";
import Link from "next/link";
import EditMeetingModalButton from "@/components/clientModal/meeting/editMeetingModalButton";

const usersMap = new Map(users.map((user) => [user.id, user]));

export default async function MeetingPage( { params }: { params: Promise<{ id: string }> } ) {
    const { id } = await params;

    const meeting: Meeting | undefined = meetings.find((m) => m.id === id);

    if (!meeting) {
        notFound();
    }

    // const project: Project | undefined = projects.find((p) => p.id === meeting.project_id);
    const team: Team | undefined = teams.find((t) => t.id === meeting.team_id);

    if (!team) {
        notFound();
    }

    const enrichedTeam = buildTeamWithParticipants(team, usersMap);

    return (
        <div className="">
            <div className="flex justify-between items-start mb-3 ">
                <div>
                    <h1 className="mb-3 font-semibold text-[#000150] text-[24px]">
                        {`${meeting.name}`}. {meeting.resume}
                    </h1>
                    <p className="mb-[12px] text-black text-[18px]">
                        Команда: <span className="font-bold text-[20px]">{team.name}</span>
                    </p>

                    {/* НЕКОТОРЫЙ БЛОК РЕНДЕРИНГА ДОПОЛНИТЕЛЬНЫХ ПЕРЕМЕННЫХ ВСТРЕЧИ */}

                    {/* <div className="flex gap-6 text-[18px]">
                        <div>
                            <p className="text-gray-500">Дата</p>
                            <p className="font-medium">{meeting.date}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Время</p>
                            <p className="font-medium">{meeting.time}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Длительность</p>
                            <p className="font-medium">{meeting.duration || '1 час'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Место</p>
                            <p className="font-medium">{meeting.location || 'Онлайн'}</p>
                        </div>
                    </div> */}
                </div>
                    
                <div className="flex gap-3">

                    <EditMeetingModalButton />

                    <div className="flex items-center ml-auto px-4 py-3 rounded-[8px] text-[#000150] text-[19px] font-semibold max-h-[47px]">
                        <span className="font-medium">Оценка:</span>

                        {/* РЕАЛИЗАЦИЯ ОЦЕНИВАНИЯ */}
                        {/* <span className="text-center ml-3 text-gray text-[14px] font-semibold bg-gray-400/20 rounded-[8px] px-2 py-[2px]">
                            {meeting.meeting_status === 'completed' ? '95' : 'не указана'}
                        </span> */}

                        {/* ЗАГЛУШКА ОЦЕНКИ */}
                        <span className="text-center ml-3 text-gray text-[14px] font-semibold bg-gray-400/20 rounded-[8px] px-2 py-[2px]">не указана</span>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-9 mb-9">
                <button className="px-4 py-2 bg-yellow-600/20 text-yellow-600 rounded-[8px] font-medium">
                    Перенести встречу
                </button>
                <button className="px-4 py-2 bg-red-600/20 text-red-600 rounded-[8px] font-medium">
                    Отменить встречу
                </button>

                {/* БЛОК ССЫЛКИ НА ВСТРЕЧУ */}
                {meeting.meeting_link && (
                    <Link
                        href={meeting.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600/20 text-blue-600 rounded-[8px] font-medium ml-auto"
                    >
                        Перейти на встречу
                    </Link>
                )}
            </div>
            
            {/* ПОРУЧЕНИЯ */}

            {/* ЗАГЛУШКА */}
            {/* <div className="mb-9">
                <h2 className="text-[24px] font-medium mb-3">Поручения</h2>
                <div className="w-full h-25 bg-black/20">

                </div>
            </div> */}

            {/* ВАРИАНТ РЕАЛИЗАЦИИ */}
            <div className="mb-9">
                <h2 className="text-[24px] font-medium mb-3">Поручения</h2>
                {meeting.tasks.length > 0 ? (
                    <ul className="space-y-3">
                        {meeting.tasks.map((task) => (
                            <li 
                                key={task.id} 
                                className="flex items-start gap-4 p-4 bg-white rounded-[12px] border border-gray-200"
                            >
                                <div className="mt-1">
                                    {task.status === 'completed' ? (
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                    ) : task.status === 'in_progress' ? (
                                        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[18px] font-medium">{task.description}</p>
                                        {task.due_date && (
                                            <span className={`text-[14px] px-2 py-1 rounded-[6px] ${
                                                task.status === 'completed' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : task.status === 'in_progress'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                до {task.due_date}
                                            </span>
                                        )}
                                    </div>
                                    {task.assignee_id && (
                                        <p className="text-[14px] text-gray-500 mt-1">
                                            Исполнитель: {usersMap.get(task.assignee_id)?.lastName} {usersMap.get(task.assignee_id)?.firstName}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-6 bg-gray-50 rounded-[12px] border border-gray-200">
                        <p className="text-[18px] text-gray-500 italic">Нет поручений для этой встречи</p>
                    </div>
                )}
            </div>
            

            {/* ЗАМЕТКИ */}

            {/* ЗАГЛУШКА */}
            {/* <div className="mb-9">
                <h2 className="text-[24px] font-medium mb-3">Заметки</h2>
                <div className="w-full h-25 bg-black/20">

                </div>
            </div> */}

            {/* ВАРИАНТ РЕАЛИЗАЦИИ */}
            <div className="mb-9">
                <h2 className="text-[24px] font-medium mb-3">Заметки</h2>
                {meeting.notes ? (
                    <div className="p-5 bg-gray-50 rounded-[12px] border border-gray-200">
                        <p className="text-[18px] whitespace-pre-line">{meeting.notes}</p>
                    </div>
                ) : (
                    <div className="p-6 bg-gray-50 rounded-[12px] border border-gray-200">
                        <p className="text-[18px] text-gray-500 italic">Нет заметок для этой встречи</p>
                    </div>
                )}
            </div>
            
            {/* АРТЕФАКТЫ */}

            {/* ЗАГЛУШКА */}
            {/* <div className="mb-9">
                <h2 className="text-[24px] font-medium mb-3">Артефакты</h2>
                <div className="w-full h-25 bg-black/20">

                </div>
            </div> */}

            {/* ВАРИАНТ РЕАЛИЗАЦИИ */}
            <div className="mb-9">
                <h2 className="text-[24px] font-medium mb-3">Артефакты</h2>
                {meeting.meeting_artifacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {meeting.meeting_artifacts.map((artifact, index) => (
                            <div 
                                key={index} 
                                className="bg-white p-4 rounded-[12px] border border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2m-2 4h.01M19 11H5"></path>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[16px] font-medium truncate">
                                            {artifact.split('/').pop() || `Артефакт_${index + 1}`}
                                        </p>
                                        <p className="text-[14px] text-gray-500 truncate">
                                            {artifact}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 bg-gray-50 rounded-[12px] border border-gray-200">
                        <p className="text-[18px] text-gray-500 italic">Нет артефактов для этой встречи</p>
                    </div>
                )}
            </div>
            
            <div className="">
                <h2 className="text-[24px] font-medium mb-6">Участники встречи</h2>
                
                <div className="mb-12">
                    <h3 className="text-[22px] font-medium mb-8">Куратор</h3>
                    <div className="flex items-center gap-3">
                        <span className="w-9 h-9 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-[20px] mb-[2px]">
                            1
                        </span>
                        <span className="text-[20px]">{team.curator}</span>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-[22px] font-medium mb-8">Участники команды</h3>
                    <ul className="space-y-2">
                        {enrichedTeam.participants.map((participant, index) => (
                            <li key={participant.id} className="flex items-center gap-4">
                                <span className="w-9 h-9 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-[20px] mb-[2px]">
                                    {index + 1}
                                </span>
                                <span className="text-[20px]">{participant.lastName} {participant.firstName} {participant.patronymic}</span>
                                <div className="flex gap-[43px] ml-auto items-center">
                                    <span className="font-semibold text-center w-[124px] px-3 py-1 bg-[#000150]/30 rounded-[8px] text-[#000150]">{participant.group}</span>
                                    <span className="font-semibold text-center w-[135px] px-3 py-1 bg-[#000150]/30 rounded-[8px] text-[#000150]">{participant.role}</span>
                                    <button className="bg-green-600/20 text-green-600 rounded-[8px] px-3 py-1">
                                        Отметить посещение
                                    </button>
                                    <span className="ml-[69px]">
                                        <Image src={"/circle-x.svg"} width={24} height={24} alt="Отметить посещение" />
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}