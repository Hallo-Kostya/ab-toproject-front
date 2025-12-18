'use client';

import { useState } from 'react';
import EditMeetingForm from '@/components/forms/editMeetingForm';

export default function EditMeetingModalButton() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsEditModalOpen(true)}
        className="flex items-center ml-auto bg-[#000150]/20 px-4 py-3 rounded-[8px] text-[#000150] text-[19px] font-semibold max-h-[47px]"
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