'use client';

import { useState, useEffect } from 'react';
import Modal from "@/components/ui/modal";
import { updateProject, Project, UpdateProjectData } from "@/lib/api/projects";

interface EditProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialData: Project;
}

export default function EditProjectForm({ isOpen, onClose, projectId, initialData }: EditProjectFormProps) {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description ?? '');
  const [goal, setGoal] = useState(initialData.goal ?? '');
  const [requirements, setRequirements] = useState(initialData.requirements ?? '');
  const [evalCriteria, setEvalCriteria] = useState(initialData.eval_criteria ?? '');
  const [year, setYear] = useState<number | undefined>(initialData.year);
  const [semester, setSemester] = useState<string | undefined>(initialData.semester);
  const [status, setStatus] = useState<string | undefined>(initialData.status);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(initialData.name);
    setDescription(initialData.description ?? '');
    setGoal(initialData.goal ?? '');
    setRequirements(initialData.requirements ?? '');
    setEvalCriteria(initialData.eval_criteria ?? '');
    setYear(initialData.year);
    setSemester(initialData.semester);
    setStatus(initialData.status);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const projectData: UpdateProjectData = {
        ...(description.trim() !== '' && { description: description.trim() }),
        ...(goal.trim() !== '' && { goal: goal.trim() }),
        ...(requirements.trim() !== '' && { requirements: requirements.trim() }),
        ...(evalCriteria.trim() !== '' && { eval_criteria: evalCriteria.trim() }),
        ...(year !== undefined && { year }),
        ...(semester !== undefined && { semester }),
        ...(status !== undefined && { status })
      };

      await updateProject(projectId, projectData);

      onClose();
      
      setTimeout(() => {
        window.location.reload();
      }, 300);
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при редактировании проекта');
      console.error('Project update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-20">
      <div className="p-6 bg-white rounded-3xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Редактировать проект</h2>
        <p className="mb-6 text-gray-600">Измените необходимые поля</p>
        
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
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите название проекта"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block mb-1 text-[16px] font-medium text-[#000150]">Описание</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
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
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Укажите цель проекта"
            />
          </div>
          
          <div>
            <label htmlFor="requirements" className="block mb-1 text-[16px] font-medium text-[#000150]">Требования</label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите требования к проекту"
            />
          </div>
          
          <div>
            <label htmlFor="evalCriteria" className="block mb-1 text-[16px] font-medium text-[#000150]">Критерии оценки</label>
            <textarea
              id="evalCriteria"
              value={evalCriteria}
              onChange={(e) => setEvalCriteria(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
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
                  setYear(val === '' ? undefined : Number(val));
                }}
                min="2000"
                max={new Date().getFullYear() + 5}
                placeholder="Не указано"
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20 placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <label htmlFor="semester" className="block mb-1 text-[16px] font-medium text-[#000150]">Семестр</label>
              <select
                id="semester"
                value={semester ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSemester(val === '' ? undefined : val);
                }}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
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
                setStatus(val === '' ? undefined : val);
              }}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
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
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-2xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}