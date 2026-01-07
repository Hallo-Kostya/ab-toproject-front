'use client';

import { useState } from 'react';
import Modal from "@/components/ui/modal";
import { createProject } from "@/lib/api/projects";
import { useAuth } from "@/context/AuthContext";

export default function ProjectFormModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [requirements, setRequirements] = useState('');
  const [evalCriteria, setEvalCriteria] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('AUTUMN');
  const [status, setStatus] = useState('PLANNED');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshTokens } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const projectData = {
        name,
        description,
        goal,
        requirements,
        eval_criteria: evalCriteria,
        year: Number(year),
        semester,
        status
      };

      await createProject(projectData);
      
      // Закрываем модальное окно
      onClose();
      
      // Обновляем токены для следующих запросов
      // await refreshTokens();
      setTimeout(() => {
        window.location.reload();
      }, 300);
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании проекта');
      console.error('Project creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-white rounded-[24px]">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl text-[#000150] font-bold mb-2 text-center">Создать проект</h2>
        <p className="mb-6 text-center text-gray-600">Заполните все обязательные поля</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-[16px] font-medium text-[#000150]">Название проекта *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите название проекта"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block mb-1 text-[16px] font-medium text-[#000150]">Описание *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Опишите проект"
            />
          </div>
          
          <div>
            <label htmlFor="goal" className="block mb-1 text-[16px] font-medium text-[#000150]">Цель *</label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
              rows={2}
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Укажите цель проекта"
            />
          </div>
          
          <div>
            <label htmlFor="requirements" className="block mb-1 text-[16px] font-medium text-[#000150]">Требования *</label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              required
              rows={2}
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите требования к проекту"
            />
          </div>
          
          <div>
            <label htmlFor="evalCriteria" className="block mb-1 text-[16px] font-medium text-[#000150]">Критерии оценки *</label>
            <textarea
              id="evalCriteria"
              value={evalCriteria}
              onChange={(e) => setEvalCriteria(e.target.value)}
              required
              rows={2}
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите критерии оценки"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block mb-1 text-[16px] font-medium text-[#000150]">Год *</label>
              <input
                type="number"
                id="year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
                min="2000"
                max={new Date().getFullYear() + 5}
                className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              />
            </div>
            
            <div>
              <label htmlFor="semester" className="block mb-1 text-[16px] font-medium text-[#000150]">Семестр *</label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              >
                <option value="AUTUMN">Осенний</option>
                <option value="SPRING">Весенний</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block mb-1 text-[16px] font-medium text-[#000150]">Статус *</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
            >
              <option value="PLANNED">Планируется</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="COMPLETED">Завершен</option>
            </select>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-[16px] font-medium hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-[16px] font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}