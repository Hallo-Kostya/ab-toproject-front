'use client';

import { useState } from 'react';
import EditTeamForm from '@/components/forms/editTeamForm';
import { Team } from '@/lib/api/teams';

interface EditTeamModalButtonProps {
  teamId: string;
  teamName: string;
  initialData: Team;
}

export default function EditTeamModalButton({ teamId, teamName, initialData }: EditTeamModalButtonProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsEditModalOpen(true)}
        className="flex items-center ml-auto bg-[#000150]/20 px-4 py-3 rounded-[8px] text-[#000150] text-[19px] font-semibold max-h-[47px]}"
      >
        Редактировать
      </button>
      
      <EditTeamForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        teamId={teamId}
        initialData={initialData}
      />
    </>
  );
}