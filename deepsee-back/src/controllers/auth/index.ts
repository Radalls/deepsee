import { Request, Response } from 'express';

import {
    LostPasswordRequest,
    ResetPasswordRequest,
    SignInRequest,
    SignUpRequest,
} from '../../middlewares/auth';
import { createRecruiter } from '../../services/recruiter';
import { createTalent } from '../../services/talent';
import { getUserByEmail } from '../../services/user';
import { generateToken, lostPassword, resetPassword, verifyPassword } from '../../utils/auth';

export const signUp = async (req: SignUpRequest, res: Response): Promise<void> => {
    const user = req.validatedData?.user;
    if (!(user)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const companyId = req.validatedData?.companyId;

    const registeredUser = (user.role === 'talent')
        ? await createTalent({
            userCredentials: {
                ...user,
            },
        })
        : await createRecruiter({
            companyId,
            userCredentials: {
                ...user,
            },
        });

    if (!(registeredUser)) {
        res.status(500).json({ error: 'Unexpected error' });
        return;
    }

    res.status(201).json(registeredUser);
};

export const signIn = async (req: SignInRequest, res: Response): Promise<void> => {
    const email = req.validatedData?.email;
    if (!(email)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const password = req.validatedData?.password;
    if (!(password)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const user = await getUserByEmail({ email });
    if (!(user)) {
        res.status(401).json({ message: 'User not found' });
        return;
    }

    if (!(user.password)) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    const isPasswordValid = await verifyPassword({
        password,
        userPassword: user.password,
    });
    if (isPasswordValid) {
        const token = generateToken({ user });
        delete user.password;
        res.json({ token, user });
    }
    else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

export const postLostPassword = async (req: LostPasswordRequest, res: Response): Promise<void> => {
    const email = req.validatedData?.email;
    if (!(email)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    await lostPassword({ email });

    res.status(200).json();
};

export const postResetPassword = async (req: ResetPasswordRequest, res: Response): Promise<void> => {
    const password = req.validatedData?.password;
    const token = req.validatedData?.token;

    if (!(password) || !(token)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    await resetPassword({ password, token });

    res.status(200).json();
};

export const signOut = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'User signed out' });
};
