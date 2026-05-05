'use client';

import { useState } from 'react';
import Modal from "@/components/ui/modal";
import { deleteProject } from "@/lib/api/projects";
import { useRouter } from 'next/navigation';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export default function DeleteProjectModal({ isOpen, onClose, projectId, projectName }: DeleteProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      await deleteProject(projectId);

      router.push('/projects');
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении проекта');
      console.error('Project deletion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-30">
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
        
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl text-[#000150] font-bold mb-2 text-center">Удалить проект</h2>
        <p className="mb-6 text-center text-gray-600">
          Вы точно хотите удалить проект <span className="font-semibold text-[#000150]">{projectName}</span>?
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </Modal>
  );
}