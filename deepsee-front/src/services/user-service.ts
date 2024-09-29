import { User } from '../models/user-model';
import api from '../utils/api-utils';

const API_URL = 'users';

export const identifyUser = async (): Promise<User | null> => {
    try {
        return (await api.get(`${API_URL}/ident`)).data as User;
    }
    catch (error) {
        return null;
    }
};

export const deleteUser = async ({ userId }: { userId: number }): Promise<void> => {
    await api.delete(`${API_URL}/${userId}`);
};
