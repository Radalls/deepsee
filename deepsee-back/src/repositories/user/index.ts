import { client } from '../../middlewares/database';
import { User } from '../../models/user';

export const fetchUserById = async ({ userId }: {
    userId: User['__id'],
}): Promise<User | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM "user" WHERE id = $1;',
        [userId],
    )).rows[0];

    return (queryResult)
        ? parseUser({ queryResult })
        : undefined;
};

export const fetchUserByEmail = async ({ email }: {
    email: User['email'],
}): Promise<User | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM "user" WHERE email = $1;',
        [email],
    )).rows[0];

    return (queryResult)
        ? parseUser({ queryResult, withPassword: true })
        : undefined;
};

export const saveUser = async ({ user }: {
    user: Omit<User, '__id'>,
}): Promise<User> => {
    const registeredUser = (await client.query(
        `INSERT INTO "user" (
            email,
            first_name,
            last_name,
            password,
            role
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [
            user.email,
            user.firstName,
            user.lastName,
            user.password,
            user.role,
        ],
    )).rows[0];

    if (!(registeredUser)) {
        throw new Error(`Could not save user: ${user}`);
    }

    return parseUser({ queryResult: registeredUser });
};

export const updateUser = async ({ user }: {
    user: User,
}): Promise<User> => {
    let registeredUser;

    if (user.firstName) {
        registeredUser = (await client.query(
            'UPDATE "user" SET first_name = $1 WHERE id = $2 RETURNING *;',
            [user.firstName, user.__id],
        )).rows[0];
    }

    if (user.lastName) {
        registeredUser = (await client.query(
            'UPDATE "user" SET last_name = $1 WHERE id = $2 RETURNING *;',
            [user.lastName, user.__id],
        )).rows[0];
    }

    if (user.password) {
        registeredUser = (await client.query(
            'UPDATE "user" SET password = $1 WHERE id = $2 RETURNING *;',
            [user.password, user.__id],
        )).rows[0];
    }

    if (!(registeredUser)) {
        throw new Error(`Could not update user: ${user}`);
    }

    return parseUser({ queryResult: registeredUser });
};

export const dropUserById = async ({ userId }: { userId: User['__id'] }): Promise<void> => {
    await client.query(
        'DELETE FROM "user" WHERE id = $1;',
        [userId],
    );
};

const parseUser = ({ queryResult, withPassword = false }: {
    queryResult: any,
    withPassword?: boolean,
}): User => ({
    __id: queryResult.id,
    avatar: queryResult.avatar,
    birthDate: queryResult.birth_date,
    email: queryResult.email,
    firstName: queryResult.first_name,
    lastName: queryResult.last_name,
    password: (withPassword) ? queryResult.password : undefined,
    phoneNumber: queryResult.phone_number,
    role: queryResult.role,
});
