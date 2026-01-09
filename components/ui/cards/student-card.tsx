'use client';

import { Student } from "@/lib/api/students";
import { useState } from 'react';

interface StudentCardProps {
  student: Student;
  onDelete: () => void;
}

export default function StudentCard({ student, onDelete }: StudentCardProps) {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  return (
    <div 
      className="flex flex-col w-full px-[24px] py-[24px] shadow-md inset-shadow-xs rounded-[12px] bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow relative"
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      {showDeleteButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
          title="Удалить студента"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <h2 className="text-[20px] text-[#000150] font-semibold pb-[16px] border-b border-gray-300 mb-[16px]">
        {student.last_name} {student.first_name} {student.patronymic}
      </h2>
      
      <div className="space-y-2">
        <p className="text-[16px]"><span className="font-medium">Email:</span> {student.email}</p>
        {student.tg_link && (
          <p className="text-[16px]"><span className="font-medium">Telegram:</span> {student.tg_link}</p>
        )}
      </div>
    </div>
  );
}