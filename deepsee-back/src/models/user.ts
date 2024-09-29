export type User = {
    __id: number;
    avatar?: string;
    birthDate?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    phoneNumber?: string;
    role?: 'talent' | 'recruiter';
};
