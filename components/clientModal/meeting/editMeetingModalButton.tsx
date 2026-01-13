'use client';

import { useState } from 'react';
import EditMeetingForm from '@/components/forms/editMeetingForm';

export default function EditMeetingModalButton() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsEditModalOpen(true)}
        className="flex items-center ml-auto bg-[#000150]/20 px-4 py-2 rounded-[20px] text-[#000150] text-[19px] font-semibold max-h-[47px] hover:bg-[#000150]/30 transition-colors"
      >
        Редактировать
      </button>
      
      <EditMeetingForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}