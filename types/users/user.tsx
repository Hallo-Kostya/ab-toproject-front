export type User = {
    id: string;
    firstName: string;
    lastName: string;
    patronymic?: string;
    tgLink: string;
    email: string;
    group?: string;
    role?: string;
    attendance?: 'present' | 'absent' | 'not_confirmed';
    avatar?: string;
}