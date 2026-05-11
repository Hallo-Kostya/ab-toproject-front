'use client';

import Image from "next/image";
import Link from "next/link";
import Container from "../container/container";
import UserMenu from "@/components/ui/user-menu";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import ProjectFormModal from "@/components/ui/projectFormModal";
import StudentFormModal from "@/components/ui/studentFormModal";
import TeamFormModal from "@/components/ui/teamFormModal";
import MeetingFormModal from "@/components/ui/meetingFormModal";
import { usePathname, useRouter } from "next/navigation";
import SearchBar from "@/components/ui/search/searchBar";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  const [, setIsAddMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  
  const addMenuRef = useRef<HTMLDivElement>(null);

  // TODO: Fix
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveLink = (path: string) => {
    if (!pathname) return false;
    const currentPathParts = pathname.split('/').filter(Boolean);
    const linkPathParts = path.split('/').filter(Boolean);
    return currentPathParts[0] === linkPathParts[0];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (result: { type: string; id: string }) => {
    switch (result.type) {
      case 'project':
        router.push(`/projects/${result.id}`);
        break;
      case 'team':
        router.push(`/teams/${result.id}`);
        break;
      case 'student':
        // Пока бекенд не вернёт team_id
        alert(`Студент найден: ${result.id}\nПереход на страницу команды будет доступен после обновления API`);
        break;
    }
  };

  if (!mounted) {
    return (
      <header className="bg-[#F4F3F3] shadow-md">
        <Container className="py-5.75">
          <div className="flex items-center justify-between">
            <div className="min-w-25 w-33.75">
              <Link href={"/projects"}>
                <Image src="/logo.svg" alt="ToPlan" width={135} height={43} className="w-full h-auto" priority />
              </Link>
            </div>
            <nav>
              <ul className="flex gap-8 justify-start">
                <li><span className="text-[#000150] text-[17px] whitespace-nowrap opacity-0">Войти</span></li>
                <li><span className="text-[#000150] text-[17px] whitespace-nowrap opacity-0">Регистрация</span></li>
              </ul>
            </nav>
          </div>
        </Container>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="bg-[#F4F3F3] shadow-md">
        <Container className="py-5.75">
          <div className="flex items-center justify-between">
            <div className="min-w-25 w-33.75">
              <Link href={"/projects"}>
                <Image src="/logo.svg" alt="ToPlan" width={135} height={43} className="w-full h-auto" />
              </Link>
            </div>
            <nav>
              <ul className="flex gap-8 justify-start">
                <li><Link href={"/login"} className="whitespace-nowrap"><span className="text-[#000150] text-[17px]">Войти</span></Link></li>
                <li><Link href={"/register"} className="whitespace-nowrap"><span className="text-[#000150] text-[17px]">Регистрация</span></Link></li>
              </ul>
            </nav>
          </div>
        </Container>
      </header>
    );
  }

  return (
    <>
      <header className="bg-[#F4F3F3] shadow-md">
        <Container className="py-5.75">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <div className="min-w-25 w-33.75">
              <Link href={"/projects"}>
                <Image src="/logo.svg" alt="ToPlan" width={135} height={43} className="w-full h-auto" />
              </Link>
            </div>

            <div className="flex items-center gap-8 flex-1 ml-12">
              <div className="min-w-12 w-full max-w-md mt-2">
                <SearchBar
                  placeholder="Поиск проектов, команд, студентов..."
                  className="h-12"
                  onResultClick={handleSearchResultClick}
                  inputClassName="
                    bg-[#DBDFFF]/30 
                    border border-[#DBDFFF] 
                    rounded-xl 
                    pl-10 pr-4 
                    text-[#6B7280] 
                    placeholder:text-[#6B7280]
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-[#000150]/20 
                    focus:border-[#000150]
                    transition-all
                    w-full h-full
                  "
                  iconClassName="text-[#6B7280] opacity-70"
                  dropdownClassName="
                    mt-2 
                    bg-white 
                    rounded-xl 
                    shadow-lg 
                    border border-gray-200 
                    z-[60]
                    max-h-96 
                    overflow-y-auto
                  "
                />
              </div>
              
              {/* Навигация */}
              <nav className="mx-auto">
                <ul className="flex flex-wrap gap-6">
                  <li><Link href={"/projects"} className={isActiveLink('/projects') ? "font-bold text-blue-900" : ""}><span className="text-[#000150] text-[17px]">Проекты</span></Link></li>
                  <li><Link href={"/teams"} className={isActiveLink('/teams') ? "font-bold text-blue-900" : ""}><span className="text-[#000150] text-[17px]">Команды</span></Link></li>
                  <li><Link href={"/students"} className={isActiveLink('/students') ? "font-bold text-blue-900" : ""}><span className="text-[#000150] text-[17px]">Студенты</span></Link></li>
                  <li><Link href={"/calendar"} className={isActiveLink('/calendar') ? "font-bold text-blue-900" : ""}><span className="text-[#000150] text-[17px]">Календарь</span></Link></li>
                  <li><Link href={"/interviews"} className={isActiveLink('/interviews') ? "font-bold text-blue-900" : ""}><span className="text-[#000150] text-[17px]">Собеседования</span></Link></li>
                </ul>
              </nav>
              
              <div className="">
                <UserMenu 
                  user={{
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    patronymic: user.patronymic || null,
                    tgLink: user.tg_link || null,
                    email: user.email,
                    avatar: user.avatar_s3_path || null
                  }} 
                  onLogout={logout}
                />
              </div>
            </div>
          </div>
        </Container>
      </header>
      
      {/* Модальные окна */}
      <ProjectFormModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      <StudentFormModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} />
      <TeamFormModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} />
      <MeetingFormModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} />
    </>
  );
}