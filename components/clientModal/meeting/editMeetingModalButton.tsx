// import { useState } from 'react';
// import EditMeetingForm from '@/components/forms/editMeetingForm';
// import { Meeting } from '@/lib/api/meetings';

// interface EditMeetingModalButtonProps {
//   meetingId: string;
//   initialData?: Meeting;
// }

// export default function EditMeetingModalButton({ meetingId, initialData }: EditMeetingModalButtonProps) {
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//   return (
//     <>
//       <button onClick={() => setIsEditModalOpen(true)}>
//         Редактировать встречу
//       </button>
      
//       <EditMeetingForm
//         isOpen={isEditModalOpen}
//         onClose={() => setIsEditModalOpen(false)}
//         meetingId={meetingId}
//         initialData={initialData || {}}
//       />
//     </>
//   );
// }