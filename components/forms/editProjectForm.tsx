'use client';

import Modal from '../ui/modal';

interface EditProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProjectForm({ isOpen, onClose }: EditProjectFormProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#000150] mb-4">Редактирование проекта</h2>
        
        <form>
          {/* Описание */}
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-[#000150] mb-2">Описание</label>
            <input
              type="text"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              placeholder="Расскажите о ваших впечатлениях"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              !
            </div>
          </div>

          {/* Цель */}
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-[#000150] mb-2">Цель</label>
            <input
              type="text"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              placeholder="Расскажите о ваших впечатлениях"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              !
            </div>
          </div>

          {/* Семестр */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[18px] font-semibold text-[#000150] mb-2">Год</label>
              <select 
              title="year"
              id="year"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300">
                <option>2023</option>
                <option>2024</option>
                <option>2025</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                !
              </div>
            </div>
            <div>
              <label className="block text-[18px] font-semibold text-[#000150] mb-2">Семестр</label>
              <select 
              title="semester"
              id="semester"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300">
                <option>Весенний</option>
                <option>Осенний</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                !
              </div>
            </div>
          </div>

          {/* Критерии оценки */}
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-[#000150] mb-2">Критерии оценки</label>
            <input
              type="text"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              placeholder="Расскажите о ваших впечатлениях"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              !
            </div>
          </div>

          {/* Требования */}
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-[#000150] mb-2">Требования</label>
            <input
              type="text"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              placeholder="Расскажите о ваших впечатлениях"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              !
            </div>
          </div>

          {/* Общее сообщение об ошибке */}
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center">
            Проверьте, все ли обязательные поля заполнены.
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-[#000150] rounded-[16px] hover:bg-gray-300"
            >
              Отменить
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-[#000150] text-white rounded-[16px] hover:bg-blue-900"
            >
              Опубликовать
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}