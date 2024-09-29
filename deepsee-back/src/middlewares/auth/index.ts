import { NextFunction, Request, Response } from 'express';

import { User } from '../../models/user';
import { fetchUserByEmail } from '../../repositories/user';
import { validateEmail, validateNumber, validateString } from '../../utils/validation';

export interface SignUpRequest extends Request {
    validatedData?: {
        companyId?: number;
        user: Required<Pick<User,
            'email' | 'firstName' | 'lastName' | 'password' | 'role'
        >>;
    };
}

export interface SignInRequest extends Request {
    validatedData?: {
        email: string;
        password: string;
    };
}

export interface LostPasswordRequest extends Request {
    validatedData?: {
        email: string;
    };
}

export interface ResetPasswordRequest extends Request {
    validatedData?: {
        password: string;
        token: string;
    };
}

export const validateSignUp = async (req: SignUpRequest, res: Response, next: NextFunction): Promise<void> => {
    const {
        companyId,
        email,
        firstName,
        lastName,
        password,
        role,
    } = req.body;

    const validatedCompanyId = (companyId)
        ? validateNumber(companyId)
        : undefined;
    if (validatedCompanyId === null) {
        throw new Error(`Invalid company id ${companyId}`);
    }

    const validatedEmail = validateEmail(email);
    if (!(validatedEmail)) {
        throw new Error(`Invalid email ${email}`);
    }

    const validatedFirstName = validateString(firstName);
    if (!(validatedFirstName)) {
        throw new Error(`Invalid first name ${firstName}`);
    }

    const validatedLastName = validateString(lastName);
    if (!(validatedLastName)) {
        throw new Error(`Invalid last name ${lastName}`);
    }

    const validatedPassword = validateString(password);
    if (!(validatedPassword)) {
        throw new Error(`Invalid password ${password}`);
    }

    const validatedRole = validateString(role) as User['role'];
    if (!(validatedRole)) {
        throw new Error(`Invalid role ${role}`);
    }

    const existingUser = await fetchUserByEmail({ email: validatedEmail });
    if (existingUser) {
        throw new Error(`User with email ${validatedEmail} already exists`);
    }

    req.validatedData = {
        companyId: validatedCompanyId,
        user: {
            email: validatedEmail,
            firstName: validatedFirstName,
            lastName: validatedLastName,
            password: validatedPassword,
            role: validatedRole,
        },
    };

    next();
};

export const validateSignIn = (req: SignInRequest, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;

    const validatedEmail = validateEmail(email);
    if (!validatedEmail) {
        throw new Error(`Invalid email ${email}`);
    }

    const validatedPassword = validateString(password);
    if (!validatedPassword) {
        throw new Error(`Invalid password ${password}`);
    }

    req.validatedData = { email: validatedEmail, password: validatedPassword };

    next();
};

export const validateLostPassword = (req: LostPasswordRequest, res: Response, next: NextFunction): void => {
    const { email } = req.body;

    const validatedEmail = validateEmail(email);
    if (!validatedEmail) {
        throw new Error(`Invalid email ${email}`);
    }

    req.validatedData = { email: validatedEmail };

    next();
};

export const validateResetPassword = (req: ResetPasswordRequest, res: Response, next: NextFunction): void => {
    const { password, token } = req.body;

    const validatedPassword = validateString(password);
    if (!validatedPassword) {
        throw new Error(`Invalid password ${password}`);
    }

    const validatedToken = validateString(token);
    if (!validatedToken) {
        throw new Error(`Invalid token ${token}`);
    }

    req.validatedData = { password: validatedPassword, token: validatedToken };

    next();
};
