import { Company, Recruiter } from '../models/recruiter-model';
import { Talent } from '../models/talent-model';
import { User } from '../models/user-model';
import api from '../utils/api-utils';

const API_URL = 'auth';

export const signUp = async ({ companyId, userCredentials }: {
    companyId?: Company['__id'],
    userCredentials: {
        email: string,
        firstName: string,
        lastName: string,
        password: string,
        role: string,
    }
}): Promise<Recruiter | Talent> => {
    return (await api.post(`${API_URL}/signup`, {
        companyId,
        ...userCredentials,
    })).data as Recruiter | Talent;
};

export const signIn = async ({ email, password }: {
    email: string,
    password: string,
}): Promise<User> => {
    const response = await api.post(`${API_URL}/signin`, { email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token as string);

    return user as User;
};

export const lostPassword = async ({ email }: {
    email: string,
}): Promise<void> => {
    await api.post(`${API_URL}/lost-password`, { email });
};

export const resetPassword = async ({ token, password }: {
    password: string,
    token: string,
}): Promise<void> => {
    await api.post(`${API_URL}/reset-password`, { password, token });
};

export const signOut = async (): Promise<void> => {
    await api.post(`${API_URL}/signout`);
    localStorage.removeItem('token');
};
