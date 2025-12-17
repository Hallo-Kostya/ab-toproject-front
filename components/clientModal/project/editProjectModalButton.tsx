'use client';

import { useState } from 'react';
import EditProjectForm from '@/components/forms/editProjectForm';

export default function EditProjectModalButton() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
        <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center ml-auto border-1 border-[#000150] px-4 py-3 rounded-[8px] text-[#000150] text-[19px] font-semibold max-h-[47px]"
        >
            Редактировать
        </button>
      
        <EditProjectForm
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}     
        />
    </>
  );
}