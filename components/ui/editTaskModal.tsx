'use client';

import { useState, useEffect } from 'react';
import Modal from "@/components/ui/modal";
import { Task, updateTask, UpdateTaskData } from "@/lib/api/tasks";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
}

export default function EditTaskModal({ isOpen, onClose, task, onTaskUpdated }: EditTaskModalProps) {
  const [description, setDescription] = useState(task.description);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDescription(task.description);
      setError('');
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const updateData: UpdateTaskData = {};
      if (description !== task.description) {
        updateData.description = description.trim() === '' ? null : description.trim();
      }

      const updated = await updateTask(task.id, updateData);
      onTaskUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении задачи');
      console.error('Task update error:', err);
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
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Редактировать задачу</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block mb-1 text-[16px] font-medium text-[#000150]">
              Описание задачи
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите описание задачи"
            />
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