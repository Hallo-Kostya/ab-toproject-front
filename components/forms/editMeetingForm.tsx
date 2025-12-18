'use client';

import Modal from '../ui/modal';

interface EditMeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditMeetingForm({ isOpen, onClose }: EditMeetingFormProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="px-8 py-6">
        <h2 className="text-[26px] font-bold text-[#000150] mb-4">Редактирование встречи</h2>
        
        <form>
          {/* Название */}
          <div className="mb-3">
            <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Название</label>
            <input
              type="text"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              placeholder="К примеру, командировка в Москве"
            />
          </div>

          {/* Команда */}
          <div className="mb-3">
            <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Команда</label>
            <select 
                id="team"
                name="team"
                title="team"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300"
            >
              <option>Команда 1</option>
              <option>Команда 2</option>
              <option>Команда 3</option>
            </select>
          </div>

          {/* Семестр */}
          <div className="mb-3 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Год</label>
              <select 
                id="year"
                name="year"
                title="year"
                className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              >
                <option>2023</option>
                <option>2024</option>
                <option>2025</option>
              </select>
            </div>
            <div>
              <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Семестр</label>
              <select 
                id="semester"
                name="semester"
                title="semester"
                className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              >
                <option>Весенний</option>
                <option>Осенний</option>
              </select>
            </div>
          </div>

          {/* Поручения */}
          <div className="mb-3">
            <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Поручения</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                  placeholder="Начните писать, чтобы добавить поручение..."
                />
              </div>
            </div>
          </div>

          {/* Заметки */}
          <div className="mb-3">
            <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Заметки</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                  placeholder="Начните писать чтобы добавить заметку..."
                />
              </div>
            </div>
          </div>

          {/* Кураторы */}
          <div className="mb-3">
            <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Кураторы</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                  placeholder="Куратор встречи"
                />
              </div>
            </div>
          </div>

          {/* Участники команды */}
          <div className="mb-3">
            <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Участники команды</label>
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 p-3 rounded-[16px] border-2 border-gray-300"
                placeholder="ФИО"
              />
              <input
                type="text"
                className="w-1/5 p-3 rounded-[16px] border-2 border-gray-300"
                placeholder="Группа"
              />
              <input
                type="text"
                className="w-1/5 p-3 rounded-[16px] border-2 border-gray-300"
                placeholder="Роль"
              />
            </div>
          </div>

          {/* Артефакты */}
          <div className="">
            <label className="block text-[22px] font-semibold text-[#000150] mb-[14px]">Артефакты</label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                placeholder="Вставьте ссылку на артефакты"
              />
            </div>
          </div>

          {/* Общее сообщение об ошибке */}
          {/* <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center">
            Проверьте, все ли обязательные поля заполнены.
          </div> */}

          <div className="flex justify-end gap-4 mt-10">
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