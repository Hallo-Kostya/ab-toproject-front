'use client';

import { useState, useEffect } from 'react';
import Modal from "@/components/ui/modal";
import { updateMeeting, Meeting, UpdateMeetingData } from "@/lib/api/meetings";

interface EditMeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  initialData: Meeting;
}

type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export default function EditMeetingForm({ isOpen, onClose, meetingId, initialData }: EditMeetingFormProps) {
  const [name, setName] = useState(initialData.name);
  const [resume, setResume] = useState(initialData.resume);
  const [date, setDate] = useState(formatDateForInput(initialData.date));
  const [status, setStatus] = useState<MeetingStatus>(initialData.status as MeetingStatus);
  const [previousMeetingId, setPreviousMeetingId] = useState<string | null>(initialData.previous_meeting_id);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function formatDateForInput(isoDate: string): string {
    if (!isoDate) return '';
    return new Date(isoDate).toISOString().slice(0, 16);
  }

  useEffect(() => {
    setName(initialData.name);
    setResume(initialData.resume);
    setDate(formatDateForInput(initialData.date));
    setStatus(initialData.status as MeetingStatus);
    setPreviousMeetingId(initialData.previous_meeting_id);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const meetingData: UpdateMeetingData = {
        name,
        resume,
        date: new Date(date).toISOString(),
        status,
        previous_meeting_id: previousMeetingId || undefined
      };

      await updateMeeting(meetingId, meetingData);
      
      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 300);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка при редактировании встречи';
      setError(errorMsg);
      console.error('Meeting update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-20">
      <div className="p-6 bg-white rounded-3xl">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Редактировать встречу</h2>
        <p className="mb-6 text-gray-600">Измените необходимые поля</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Название */}
          <div>
            <label htmlFor="name" className="block mb-1 text-[16px] font-medium text-[#000150]">
              Название встречи
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите название встречи"
            />
          </div>
          
          {/* Резюме */}
          <div>
            <label htmlFor="resume" className="block mb-1 text-[16px] font-medium text-[#000150]">
              Резюме
            </label>
            <textarea
              id="resume"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Краткое описание встречи"
            />
          </div>
          
          {/* Дата и время */}
          <div>
            <label htmlFor="date" className="block mb-1 text-[16px] font-medium text-[#000150]">
              Дата и время *
            </label>
            <input
              type="datetime-local"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
            />
          </div>
          
          {/* Статус */}
          <div>
            <label htmlFor="status" className="block mb-1 text-[16px] font-medium text-[#000150]">
              Статус
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MeetingStatus)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
            >
              <option value="SCHEDULED">Запланирована</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="COMPLETED">Завершена</option>
              <option value="CANCELED">Отменена</option>
            </select>
          </div>

          {/* Кнопки */}
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