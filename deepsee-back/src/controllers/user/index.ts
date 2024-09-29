import { Request, Response } from 'express';

import { deleteUserById, getUserById } from '../../services/user';

export const identifyUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.user;
    if (!(token)) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const user = await getUserById({ userId: token.id });
    if (!(user)) {
        res.status(401).json({ message: 'User not found' });
        return;
    }

    res.status(200).json(user);
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId = Number.parseInt(req.params.userId);
    if (!(userId)) {
        res.status(500).json({ error: `Invalid user id ${userId}` });
        return;
    }

    await deleteUserById({ userId });

    res.status(200).json();
};
