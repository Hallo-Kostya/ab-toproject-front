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
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!mounted) {
    return (
      <header className="bg-[#F4F3F3] shadow-md">
        <Container className="py-5.75">
          <div className="flex items-center justify-between">
            <div className="min-w-25 w-33.75">
              <Link href={"/projects"}>
                <Image
                  src="/logo.svg"
                  alt="ToPlan"
                  width={135}
                  height={43}
                  className="w-full h-auto"
                  priority
                />
              </Link>
            </div>
            <nav>
              <ul className="flex gap-8 justify-start">
                <li>
                  <span className="text-[#000150] text-[17px] whitespace-nowrap opacity-0">Войти</span>
                </li>
                <li>
                  <span className="text-[#000150] text-[17px] whitespace-nowrap opacity-0">Регистрация</span>
                </li>
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
                <Image
                  src="/logo.svg"
                  alt="ToPlan"
                  width={135}
                  height={43}
                  className="w-full h-auto"
                />
              </Link>
            </div>
            <nav>
              <ul className="flex gap-8 justify-start">
                <li>
                  <Link href={"/login"} className="whitespace-nowrap">
                    <span className="text-[#000150] text-[17px]">Войти</span>
                  </Link>
                </li>
                <li>
                  <Link href={"/register"} className="whitespace-nowrap">
                    <span className="text-[#000150] text-[17px]">Регистрация</span>
                  </Link>
                </li>
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
            <div className="min-w-25 w-33.75">
              <Link href={"/projects"}>
                <Image
                  src="/logo.svg"
                  alt="ToPlan"
                  width={135}
                  height={43}
                  className="w-full h-auto"
                />
              </Link>
            </div>
            
            {/* Адаптивная поисковая строка */}
            <div className="flex items-center gap-8 min-w-0 flex-1 ml-12">
              <div className="min-w-12 w-full max-w-md h-12 bg-[#DBDFFF]/30 border border-[#DBDFFF] rounded-xl flex items-center px-3">
                <span className="flex items-center justify-center mr-2.5 w-6 h-6 shrink-0">
                  <Image
                    src="/search.svg"
                    alt={"Поиск"}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </span>
                <input
                  type="text"
                  placeholder="Поиск"
                  className="bg-transparent border-none focus:outline-none text-[#6B7280] w-full placeholder:text-[#6B7280] hidden sm:block"
                />
                <div className="sm:hidden w-full h-full" />
              </div>
              
              {/* Блок для добавления проектов, команд, студентов, встреч */}
              <div className="relative mx-auto " ref={addMenuRef}>
                <button
                  onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                  className="flex items-center gap-2 bg-[#000150] text-white px-4 py-2 rounded-3xl hover:bg-blue-900 transition-colors"
                >
                  <span className="text-xl font-bold pb-0.75">+</span>
                  <span className="hidden sm:inline">Добавить</span>
                </button>
                
                {isAddMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsProjectModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-[#000150] font-medium"
                    >
                      Проект
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsStudentModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-[#000150] font-medium"
                    >
                      Студент
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsTeamModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-[#000150] font-medium"
                    >
                      Команда
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsMeetingModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-[#000150] font-medium"
                    >
                      Встреча
                    </button>
                  </div>
                )}
              </div>
              
              {/* Навигация в одну строку */}
              <nav className="mx-auto">
                <ul className="flex flex-wrap gap-6">
                  <li>
                    <Link href={"/projects"} className={isActiveLink('/projects') ? "font-bold text-blue-900" : ""}>
                      <span className="text-[#000150] text-[17px]">Проекты</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={"/teams"} className={isActiveLink('/teams') ? "font-bold text-blue-900" : ""}>
                      <span className="text-[#000150] text-[17px]">Команды</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={"/students"} className={isActiveLink('/students') ? "font-bold text-blue-900" : ""}>
                      <span className="text-[#000150] text-[17px]">Студенты</span>
                    </Link>
                  </li>
                </ul>
              </nav>
              
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
        </Container>
      </header>
      
      <ProjectFormModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />
      
      <StudentFormModal 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
      />
      
      <TeamFormModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
      />
      
      <MeetingFormModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
      />
    </>
  );
}