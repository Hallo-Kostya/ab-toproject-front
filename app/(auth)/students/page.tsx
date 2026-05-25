'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student, getStudents, deleteStudent } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import StudentCard from '@/components/ui/cards/student-card';
import DeleteStudentModal from '@/components/ui/deleteStudentModal';
import EditStudentForm from '@/components/forms/editStudentForm';
import StudentFormModal from '@/components/ui/studentFormModal';
import StudentSearchBar from '@/components/ui/search/studentSearchBar';
// import { StudentSearchResult } from '@/lib/api/search';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);

        const studentsData: Student[] = await getStudents();
        setStudents(studentsData);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки студентов');
        console.error('Students fetch error:', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isAuthenticated]);

  // Функция для скролла и подсветки:
const scrollToStudent = useCallback((studentId: string) => {
  const element = document.getElementById(`student-card-${studentId}`);
  if (element) {
    // Подсвечиваем
    setHighlightedStudentId(studentId);
    
    // Скроллим
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Убираем подсветку через 3 секунды
    setTimeout(() => {
      setHighlightedStudentId(null);
    }, 3000);
  }
}, []);

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      await deleteStudent(studentToDelete.id);

      setStudents(prevStudents => prevStudents.filter(student => student.id !== studentToDelete.id));
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error('Student deletion error:', err);
      setError(err.message || 'Ошибка при удалении студента');
    }
  };

  const handleStudentDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleStudentEditClick = useCallback((student: Student) => {
    setStudentToEdit(student);
    setIsEditModalOpen(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    const fetchUpdatedStudents = async () => {
      try {
        const studentsData: Student[] = await getStudents();
        setStudents(studentsData);
      } catch (err: any) {
        console.error('Failed to refresh students:', err);
      }
    };
    fetchUpdatedStudents();
    setIsEditModalOpen(false);
    setStudentToEdit(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Загрузка студентов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <h1 className="text-[20px] text-[#000150] font-semibold mb-4">Список всех студентов</h1>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-6 items-center">
            <p>Всего студентов найдено: <span className="font-semibold text-[#000150]">{students.length}</span></p>
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex gap-2 items-center px-4 py-2 bg-[#000150]/90 text-white text-[16px] rounded-2xl hover:bg-[#000150]/80 hover:shadow-md hover:inset-shadow-xs transition-colors whitespace-nowrap"
              >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить студента
            </button>
          </div>
          <div className="w-80">
            <StudentSearchBar 
              onStudentSelect={(student) => scrollToStudent(student.id)}
            />
          </div>
        </div>
        
        {students.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <li key={student.id} id={`student-card-${student.id}`}>
                <StudentCard 
                  student={student} 
                  onDelete={() => handleStudentDeleteClick(student)}
                  onEdit={() => handleStudentEditClick(student)}
                  isHighlighted={highlightedStudentId === student.id}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 text-center py-8">
            <p>Список студентов пуст</p>
          </div>
        )}
        
        <DeleteStudentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          studentId={studentToDelete?.id || ''}
          studentName={`${studentToDelete?.last_name} ${studentToDelete?.first_name} ${studentToDelete?.patronymic || ''}`}
          onConfirm={handleDeleteStudent}
        />

        {studentToEdit && (
          <EditStudentForm 
            isOpen={isEditModalOpen} 
            onClose={() => {
              setIsEditModalOpen(false);
              setStudentToEdit(null);
            }} 
            studentId={studentToEdit.id} 
            initialData={studentToEdit}
            onEditSuccess={handleEditSuccess}
          />
        )}
      </div>

      <StudentFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
}