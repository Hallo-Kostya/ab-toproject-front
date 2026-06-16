'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from "@/components/ui/modal";
import { createProject, CreateProjectData, autoFillProjectWithAI } from "@/lib/api/projects";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProjectFormModal({ isOpen, onClose, onSuccess }: ProjectFormModalProps) {
  // Состояния формы
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [requirements, setRequirements] = useState('');
  const [evalCriteria, setEvalCriteria] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [semester, setSemester] = useState<'AUTUMN' | 'SPRING' | null>(null);
  const [status, setStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | null>(null);
  
  // Состояния UI
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAIFilling, setIsAIFilling] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);
  
  // Tooltip для лампочки
  const [showAITooltip, setShowAITooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Сброс при закрытии модалки
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setGoal('');
    setRequirements('');
    setEvalCriteria('');
    setYear(null);
    setSemester(null);
    setStatus(null);
    setError('');
    setIsAIFilling(false);
    setAIError(null);
    setIsAIModalOpen(false);
  };

  // Сбор данных формы для отправки в ИИ
  const getFormData = (): Partial<CreateProjectData> => {
    const data: Partial<CreateProjectData> = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (goal) data.goal = goal;
    if (requirements) data.requirements = requirements;
    if (evalCriteria) data.eval_criteria = evalCriteria;
    if (year) data.year = year;
    if (semester) data.semester = semester;
    if (status) data.status = status;
    return data;
  };

  // Заполнение полей ответом от ИИ
  const fillFormWithAIResponse = (aiData: CreateProjectData) => {
    if (aiData.name) {
      if (aiData.name.length > 64) {
        setName(aiData.name.slice(0, 64));
        setAIError('Название проекта было автоматически сокращено до 64 символов из-за ограничений длины.');
      } else {
        setName(aiData.name);
      }
    }
    if (aiData.description) setDescription(aiData.description);
    if (aiData.goal) setGoal(aiData.goal);
    if (aiData.requirements) setRequirements(aiData.requirements);
    if (aiData.eval_criteria) setEvalCriteria(aiData.eval_criteria);
    if (aiData.year) setYear(aiData.year);
    if (aiData.semester) setSemester(aiData.semester as 'AUTUMN' | 'SPRING');
    if (aiData.status) setStatus(aiData.status as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED');
  };

  // Обработка запроса к ИИ
  const handleAIFill = async () => {
    setIsAIModalOpen(false);
    setIsAIFilling(true);
    setAIError(null);
    setError('');

    try {
      const formData = getFormData();
      
      if (Object.keys(formData).length === 0) {
        throw new Error('Введите хотя бы название проекта для работы ИИ');
      }

      const aiResponse = await autoFillProjectWithAI(formData);
      fillFormWithAIResponse(aiResponse);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      let userMessage = err.message || 'Ошибка при получении данных от ИИ';
      
      if (userMessage.includes('API key')) {
        userMessage = 'Ключ ИИ не настроен. Обратитесь к администратору.';
      } else if (userMessage.includes('invalid JSON')) {
        userMessage = 'ИИ вернул некорректный ответ. Попробуйте ещё раз.';
      } else if (userMessage.includes('429')) {
        userMessage = 'Превышен лимит запросов к ИИ. Подождите немного.';
      }
      
      setAIError(userMessage);
      console.error('AI auto-fill error:', err);
    } finally {
      setIsAIFilling(false);
    }
  };

  // Отправка формы создания проекта
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.length > 64) {
      setError('Название проекта не должно превышать 64 символа');
      return;
    }

    try {
      const projectData: CreateProjectData = {
        name,
        description,
        goal,
        requirements,
        eval_criteria: evalCriteria,
        ...(year !== null && { year }),
        ...(semester !== null && { semester }),
        ...(status !== null && { status })
      };

      await createProject(projectData);
      onSuccess?.();
      onClose();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании проекта');
      console.error('Project creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tooltip handlers
  const handleMouseEnterTooltip = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setShowAITooltip(true);
  };

  const handleMouseLeaveTooltip = () => {
    tooltipTimeoutRef.current = setTimeout(() => setShowAITooltip(false), 200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-20">
      <div className="p-6 bg-white rounded-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-20"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Заголовок с лампочкой ИИ */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl text-[#000150] font-bold">Создать проект</h2>
          
          {/* Кнопка ИИ-помощника */}
          <div 
            className="relative inline-block"
            onMouseEnter={handleMouseEnterTooltip}
            onMouseLeave={handleMouseLeaveTooltip}
          >
            <button
              type="button"
              onClick={() => setIsAIModalOpen(true)}
              className="p-1.5 rounded-full hover:bg-[#000150]/10 transition-colors group"
              title="ИИ-помощник"
              aria-label="Заполнить форму с помощью ИИ"
            >
              <svg className="w-5 h-5 text-[#E79E00] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            
            {/* Всплывающая подсказка */}
            {showAITooltip && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#000150] text-white text-[13px] rounded-lg whitespace-nowrap shadow-lg z-50 animate-fade-in">
                ИИ агент может помочь заполнить форму
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-[#000150] rotate-45" />
              </div>
            )}
          </div>
        </div>
        
        <p className="mb-6 text-gray-600">Заполните все обязательные поля</p>
        
        {/* Ошибка формы */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Ошибка ИИ */}
        {aiError && !isAIFilling && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{aiError}</span>
          </div>
        )}
        
        {/* Блюр-оверлей при работе ИИ */}
        {isAIFilling && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-30">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#000150]/20 border-t-[#E79E00] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#E79E00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <p className="text-[16px] text-[#000150] font-medium">Ожидание ответа ИИ...</p>
              <p className="text-[13px] text-gray-500">Это может занять до 30 секунд</p>
            </div>
          </div>
        )}
        
        {/* Основная форма (блокируется при isAIFilling) */}
        <form onSubmit={handleSubmit} className={`space-y-4 transition-opacity ${isAIFilling ? 'opacity-30 pointer-events-none' : ''}`}>
          <div>
            <label htmlFor="name" className="block mb-1 text-[16px] font-medium text-[#000150]">Название проекта *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={64}
              required
              disabled={isAIFilling}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Введите название проекта"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${name.length >= 60 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {name.length}/64
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block mb-1 text-[16px] font-medium text-[#000150]">Описание</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isAIFilling}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y"
              placeholder="Опишите проект"
            />
          </div>
          
          <div>
            <label htmlFor="goal" className="block mb-1 text-[16px] font-medium text-[#000150]">Цель</label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={2}
              disabled={isAIFilling}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y"
              placeholder="Укажите цель проекта"
            />
          </div>
          
          <div>
            <label htmlFor="requirements" className="block mb-1 text-[16px] font-medium text-[#000150]">Требования</label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              disabled={isAIFilling}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y"
              placeholder="Введите требования к проекту"
            />
          </div>
          
          <div>
            <label htmlFor="evalCriteria" className="block mb-1 text-[16px] font-medium text-[#000150]">Критерии оценки</label>
            <textarea
              id="evalCriteria"
              value={evalCriteria}
              onChange={(e) => setEvalCriteria(e.target.value)}
              rows={3}
              disabled={isAIFilling}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y"
              placeholder="Введите критерии оценки"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block mb-1 text-[16px] font-medium text-[#000150]">Год</label>
              <input
                type="number"
                id="year"
                value={year ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setYear(val === '' ? null : Number(val));
                }}
                min="2026"
                max={new Date().getFullYear() + 3}
                placeholder="Не указано"
                disabled={isAIFilling}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="semester" className="block mb-1 text-[16px] font-medium text-[#000150]">Семестр</label>
              <select
                id="semester"
                value={semester ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSemester(val === '' ? null : val as 'AUTUMN' | 'SPRING');
                }}
                disabled={isAIFilling}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Не указано</option>
                <option value="AUTUMN">Осенний</option>
                <option value="SPRING">Весенний</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block mb-1 text-[16px] font-medium text-[#000150]">Статус</label>
            <select
              id="status"
              value={status ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setStatus(val === '' ? null : val as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED');
              }}
              disabled={isAIFilling}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Не указано</option>
              <option value="PLANNED">Планируется</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="COMPLETED">Завершен</option>
            </select>
          </div>
          
          <div className="flex gap-4 mt-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isAIFilling}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-2xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !name || isAIFilling}
              className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-2xl font-medium hover:bg-[#000150]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>

      {/* Модальное окно подтверждения ИИ */}
      {isAIModalOpen && (
        <Modal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} className="px-20">
          <div className="p-6 bg-white rounded-3xl max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#E79E00]/20 rounded-full">
                <svg className="w-6 h-6 text-[#E79E00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#000150]">Заполнить с помощью ИИ?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ИИ проанализирует введённые данные и предложит детализированные значения для всех полей формы. 
              Вы сможете отредактировать результат перед отправкой.
            </p>
            
            {Object.keys(getFormData()).length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                💡 Подсказка: введите хотя бы название проекта для более точного результата
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsAIModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-gray-200 text-gray-800 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
              >
                Отменить
              </button>
              <button
                type="button"
                onClick={handleAIFill}
                className="flex-1 py-2.5 px-4 bg-[#E79E00] text-white rounded-2xl font-medium hover:bg-[#E79E00]/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Отправить ИИ
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
