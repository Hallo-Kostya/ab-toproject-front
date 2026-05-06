'use client';

import { Student } from "@/lib/api/students";
import { useState } from 'react';

interface StudentCardProps {
  student: Student;
  onDelete: () => void;
  onEdit?: () => void;
}

export default function StudentCard({ student, onDelete, onEdit }: StudentCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="flex flex-col w-full min-h-42 px-6 py-6 shadow-md inset-shadow-xs rounded-xl bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showActions && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10 
          bg-[#FBFAFF] px-2 py-1.5 rounded-lg border border-gray-200/50 shadow-sm">

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 text-gray-500 hover:text-[#000150] transition-colors rounded-md hover:bg-[#000150]/10"
              title="Редактировать студента"
              aria-label="Редактировать студента"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
            title="Удалить студента"
            aria-label="Удалить студента"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <h2 className="text-[20px] text-[#000150] font-semibold pb-4 border-b border-gray-300 mb-4">
        {student.last_name} {student.first_name} {student.patronymic || ''}
      </h2>
      
      <div className="space-y-2">
        {student.email && (
          <p className="text-[16px]">
            <span className="font-medium">Email:</span>{' '}
            <a href={`mailto:${student.email}`} className="text-[#000150] hover:underline">
              {student.email}
            </a>
          </p>
        )}
        {student.tg_link && (
          <p className="text-[16px]">
            <span className="font-medium">Telegram:</span>{' '}
            <a href={student.tg_link} target="_blank" rel="noopener noreferrer" className="text-[#000150] hover:underline">
              {student.tg_link}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}