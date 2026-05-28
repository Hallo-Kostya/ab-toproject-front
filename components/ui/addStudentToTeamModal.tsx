'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Modal from "@/components/ui/modal";
import { Student, getStudents } from "@/lib/api/students";
import { addStudentToTeam, AddStudentToTeamData } from '@/lib/api/teams';

interface AddStudentToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onStudentAdded: () => void;
}

export default function AddStudentToTeamModal({ isOpen, onClose, teamId, onStudentAdded }: AddStudentToTeamModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [role, setRole] = useState('Участник');
  const [studyGroup, setStudyGroup] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  // Только для фильтрации списка
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);
  
  const studentRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Загрузка студентов при открытии модалки
  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  // Сброс при закрытии
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setHighlightedStudentId(null);
      setSelectedStudentId(null);
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки студентов');
      console.error('Students fetch error:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Локальная фильтрация списка
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(s => 
      s.first_name?.toLowerCase().includes(query) ||
      s.last_name?.toLowerCase().includes(query) ||
      s.patronymic?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  // Скролл + подсветка при выборе
  const scrollToStudent = useCallback((studentId: string) => {
    const element = studentRefs.current[studentId];
    if (element) {
      setHighlightedStudentId(studentId);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        setHighlightedStudentId(null);
      }, 2000);
    }
  }, []);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudentId(student.id);
    scrollToStudent(student.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setIsLoading(true);
    setError('');

    try {
      const studentData: AddStudentToTeamData = {
        student_id: selectedStudentId,
        role,
        study_group: studyGroup
      };

      await addStudentToTeam(teamId, studentData);
      
      onStudentAdded();
      onClose();
      
      setSelectedStudentId(null);
      setRole('Участник');
      setStudyGroup('');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении студента в команду');
      console.error('Add student to team error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Подсветка совпадений в тексте
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="bg-gray-200 border-b px-0.5 rounded">{part}</mark> 
        : part
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-20">
      <div className="p-6 bg-white rounded-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Добавить участника в команду</h2>
        <p className="mb-6 text-gray-600">Выберите студента из списка</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {loadingStudents ? (
          <div className="text-center py-8">
            <div className="text-xl text-[#000150]">Загрузка студентов...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Поле поиска - только для фильтрации списка */}
            <div>
              <label className="block mb-1 text-[16px] font-medium text-[#000150]">
                Поиск студента
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите имя, фамилию или email..."
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 text-[15px] placeholder-gray-400"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-1">
                  Найдено: <span className="font-medium">{filteredStudents.length}</span>
                </p>
              )}
            </div>

            {/* Отфильтрованный список студентов */}
            <div>
              <label className="block mb-1 text-[16px] font-medium text-[#000150]">
                Список студентов
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-xl p-2 bg-gray-50/50">
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    {searchQuery ? 'Ничего не найдено по запросу' : 'Нет доступных студентов'}
                  </p>
                ) : (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      ref={(el) => { studentRefs.current[student.id] = el; }}
                      onClick={() => handleStudentSelect(student)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg mb-1 transition-all flex items-center justify-between group ${
                        selectedStudentId === student.id
                          ? 'bg-[#000150] text-white'
                          : 'hover:bg-gray-100 text-gray-800'
                      } ${
                        highlightedStudentId === student.id 
                          ? 'ring-2 ring-[#000150] bg-[#000150]/80 scale-[1.01] shadow-sm' 
                          : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="font-medium truncate block">
                          {searchQuery 
                            ? highlightMatch(`${student.last_name} ${student.first_name} ${student.patronymic || ''}`.trim(), searchQuery)
                            : `${student.last_name} ${student.first_name} ${student.patronymic || ''}`.trim()
                          }
                        </span>
                        <span className={`text-sm truncate block ${selectedStudentId === student.id ? 'text-white/80' : 'text-gray-400'}`}>
                          {student.email || 'Email не указан'}
                        </span>
                      </div>
                      {selectedStudentId === student.id && (
                        <svg className="w-5 h-5 text-white shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
            
            {/* Роль */}
            <div>
              <label htmlFor="role" className="block mb-1 text-[16px] font-medium text-[#000150]">Роль в команде</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              >
                <option value="">Не указано</option>
                <option value="Дизайнер">Дизайнер</option>
                <option value="Тимлид">Тимлид</option>
                <option value="Фронтенд">Фронтенд</option>
                <option value="Бекенд">Бекенд</option>
                <option value="Аналитик">Аналитик</option>
              </select>
            </div>
            
            {/* Группа */}
            <div>
              <label htmlFor="studyGroup" className="block mb-1 text-[16px] font-medium text-[#000150]">Учебная группа</label>
              <input
                type="text"
                id="studyGroup"
                value={studyGroup}
                onChange={(e) => setStudyGroup(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                placeholder="Введите номер группы"
              />
            </div>
            
            {/* Кнопки */}
            <div className="flex ml-auto gap-4 mt-10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedStudentId}
                className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-2xl font-medium hover:bg-[#000150]/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Добавление...' : 'Добавить участника'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}