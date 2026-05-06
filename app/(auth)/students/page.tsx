'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student, getStudents, deleteStudent } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import StudentCard from '@/components/ui/cards/student-card';
import DeleteStudentModal from '@/components/ui/deleteStudentModal';
import EditStudentForm from '@/components/forms/editStudentForm';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

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
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] text-[#000150] font-semibold mb-4">Список всех студентов</h1>
        <p>Всего студентов найдено: <span className="font-semibold text-[#000150]">{students.length}</span></p>
      </div>
      
      {students.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <li key={student.id}>
              <StudentCard 
                student={student} 
                onDelete={() => handleStudentDeleteClick(student)}
                onEdit={() => handleStudentEditClick(student)} 
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
  );
}