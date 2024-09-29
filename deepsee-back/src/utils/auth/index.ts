import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

import { User } from '../../models/user';
import { fetchUserByEmail, updateUser } from '../../repositories/user';
import { sendMail } from '../../services/mail';

export interface AuthToken extends JwtPayload {
    email: string;
    id: number;
}

export const generateToken = ({ user }: { user: User }): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error('Missing SECRET_KEY in environment variables');
    }
    return jwt.sign({ email: user.email, id: user.__id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = ({ token }: { token: string }): AuthToken | null => {
    if (!process.env.JWT_SECRET) {
        throw new Error('Missing SECRET_KEY in environment variables');
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET) as AuthToken;
    } catch (err) {
        return null;
    }
};

export const hashPassword = async ({ password }: { password: string }): Promise<string> => {
    return await argon2.hash(password);
};

export const verifyPassword = async ({ userPassword, password }: {
    password: string,
    userPassword: string,
}): Promise<boolean> => {
    return await argon2.verify(userPassword, password);
};

export const lostPassword = async ({ email }: { email: string }): Promise<void> => {
    const user = await fetchUserByEmail({ email });
    if (!(user)) {
        throw new Error('User not found');
    }

    const token = generateToken({ user });

    await sendMail({
        data: {
            receiverName: user.firstName,
            subject: 'Mot de passe oublié',
            token,
        },
        email,
        templateName: 'lost-password',
    });
};

export const resetPassword = async ({ password, token }: { password: string, token: string }): Promise<void> => {
    const decodedToken = verifyToken({ token });
    if (!decodedToken) {
        throw new Error('Invalid token');
    }

    const statedUser = {
        __id: decodedToken.id,
        password: await hashPassword({ password }),
    };

    await updateUser({ user: statedUser });
};
