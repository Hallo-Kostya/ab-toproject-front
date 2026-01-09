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

export default function Header() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <header className="bg-[#F4F3F3] shadow-xl">
        <Container className="py-[23px]">
          <div className="flex items-center justify-between">
            <div className="min-w-[100px] w-[135px]">
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
              <ul className="flex gap-[32px] flex-wrap justify-center md:justify-start">
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
      <header className="bg-[#F4F3F3] shadow-xl">
        <Container className="py-[23px]">
          <div className="flex items-center justify-between">
            <div className="min-w-[100px] w-[135px]">
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
              <ul className="flex gap-[32px] flex-wrap justify-center md:justify-start">
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
      <header className="bg-[#F4F3F3] shadow-xl">
        <Container className="py-[23px]">
          <div className="flex items-center justify-between">
            <div className="min-w-[100px] w-[135px]">
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
            <div className="flex items-center gap-[49px] min-w-0">
              <div className="min-w-[48px] w-[448px] h-[48px] bg-[#DBDFFF]/30 border-1 border-[#DBDFFF] rounded-[12px] flex items-center px-3">
                <span className="flex items-center justify-center mr-[10px]">
                  <Image
                    src="/search.svg"
                    alt={"Поиск"}
                    width={24}
                    height={24}
                  />
                </span>
                <input
                  type="text"
                  placeholder="Поиск"
                  className="bg-transparent border-none focus:outline-none text-[#6B7280] w-full placeholder:text-[#6B7280]"
                />
              </div>
              
              {/* Блок для добавления проектов, команд, студентов */}
              <div className="relative" ref={addMenuRef}>
                <button
                  onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                  className="flex items-center gap-2 bg-[#000150] text-white px-4 py-2 rounded-[16px] hover:bg-blue-900 transition-colors"
                >
                  <span className="text-xl font-bold">+</span>
                  <span>Добавить</span>
                </button>
                
                {isAddMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-[12px] shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsProjectModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-[8px] text-[#000150] font-medium"
                    >
                      Проект
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsStudentModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-[8px] text-[#000150] font-medium"
                    >
                      Студент
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsTeamModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-[8px] text-[#000150] font-medium"
                    >
                      Команда
                    </button>
                  </div>
                )}
              </div>
              
              <nav>
                <ul className="flex gap-[32px] flex-wrap justify-center md:justify-start">
                  <li>
                    <Link href={"/projects"} className="whitespace-nowrap">
                      <span className="text-[#000150] text-[17px]">Проекты</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={"/teams"} className="whitespace-nowrap">
                      <span className="text-[#000150] text-[17px]">Команды</span>
                    </Link>
                  </li>
                  <li>
                    <Link href={"/students"} className="whitespace-nowrap">
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
    </>
  );
}