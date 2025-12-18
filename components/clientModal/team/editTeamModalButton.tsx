'use client';

import { useState } from 'react';
import EditTeamForm from '@/components/forms/editTeamForm';

interface EditTeamModalButtonProps {
  teamId: string;
  teamName: string;
}

export default function EditTeamModalButton( { teamId, teamName }: EditTeamModalButtonProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
        <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center ml-auto px-4 py-3 rounded-[8px] text-[#000150] text-[19px] font-semibold max-h-[47px] bg-[#000150]/20 text-[#000150]"
        >
            Редактировать
        </button>
      
        <EditTeamForm
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)} 
            teamId={teamId} 
            teamName={teamName}      
        />
    </>
  );
}