export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  email: string;
  tg_link: string;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  patronymic: string;
  email: string;
  tg_link: string;
}

export interface AddStudentToTeamData {
  student_id: string;
  role: string;
  study_group: string;
}

export interface StudentInTeam {
  student_id: string;
  role: string;
  study_group: string;
}

export interface TeamStudent {
  id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  email?: string;
  tg_link?: string;
  role: string;
  study_group: string;
}