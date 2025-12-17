'use client';

import Modal from '../ui/modal';

interface EditTeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

export default function EditTeamForm({ 
  isOpen, 
  onClose, 
  teamId, 
  teamName 
}: EditTeamFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Сохранение команды:', { teamId, teamName });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#000150] mb-4">
          Редактирование команды: {teamName}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Название */}
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-[#000150] mb-2">Название</label>
            <input
              type="text"
              defaultValue={teamName}
              className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              placeholder="К примеру, командировка в Москве"
              required
            />
          </div>

          {/* Кураторы */}
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-[#000150] mb-2">Кураторы</label>
            <div className="relative mb-2">
              <input
                type="text"
                className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                placeholder="ФИО куратора 1"
              />
            </div>
            <div className="relative mb-2">
              <input
                type="text"
                className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                placeholder="ФИО куратора 2"
              />
            </div>
          </div>

          {/* Участники команды */}
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-[#000150] mb-2">Участники команды</label>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                  placeholder="ФИО"
                />
              </div>
              <div className="w-1/3">
                <input
                  type="text"
                  className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                  placeholder="Группа"
                />
              </div>
              <div className="w-1/3">
                <input
                  type="text"
                  className="w-full p-3 rounded-[16px] border-2 border-gray-300"
                  placeholder="Роль"
                />
              </div>
            </div>
          </div>

          {/* Беседа */}
          <div className="mb-6">
            <label className="block text-[18px] font-semibold text-[#000150] mb-2">Беседа</label>
            <input
              type="url"
              className="w-full p-3 rounded-[16px] border-2 border-gray-300"
              placeholder="Вставьте ссылку на беседу ВКонтакте"
            />
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
              type="submit"
              className="px-6 py-2 bg-[#000150] text-white rounded-[16px] hover:bg-blue-900"
            >
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}