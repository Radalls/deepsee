import { User } from '../../models/user';
import { dropUserById, fetchUserByEmail, fetchUserById, saveUser } from '../../repositories/user';
import { hashPassword } from '../../utils/auth';
import { sendMail } from '../mail';

export const getUserById = async ({ userId }: {
    userId: User['__id'],
}): Promise<User | undefined> => {
    return await fetchUserById({ userId });
};

export const getUserByEmail = async ({ email }: {
    email: User['email'],
}): Promise<User | undefined> => {
    return await fetchUserByEmail({ email });
};

export const createUser = async ({ userCredentials }: {
    userCredentials: Required<Pick<User, 'email' | 'firstName' | 'lastName' | 'password' | 'role'>>,
}): Promise<User> => {
    const user: Omit<User, '__id'> = {
        ...userCredentials,
        password: await hashPassword({ password: userCredentials.password }),
    };

    return await saveUser({ user });
};

export const deleteUserById = async ({ userId }: { userId: number }): Promise<void> => {
    const user = await fetchUserById({ userId });
    if (!(user)) {
        throw new Error(`User with id ${userId} not found`);
    }

    await dropUserById({ userId });

    await sendMail({
        data: {
            receiverName: `${user.firstName} ${user.lastName}`,
            subject: 'Suppression de compte',
        },
        email: user.email,
        templateName: 'delete-account',
    });
};
