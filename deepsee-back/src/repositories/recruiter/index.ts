import { client } from '../../middlewares/database';
import { Company, CompanyInvite, Recruiter } from '../../models/recruiter';

export const fetchRecruiterById = async ({ recruiterId }: {
    recruiterId: Recruiter['user']['__id'],
}): Promise<Recruiter | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM recruiter WHERE user_id = $1;',
        [recruiterId],
    )).rows[0];

    return (queryResult)
        ? parseRecruiter({ queryResult })
        : undefined;
};

export const saveRecruiter = async ({ recruiter }: {
    recruiter: Recruiter,
}): Promise<Recruiter> => {
    const registeredRecruiter = (await client.query(
        `INSERT INTO "recruiter" (
            user_id,
            company_id
        ) VALUES ($1, $2) RETURNING *;`,
        [
            recruiter.user.__id,
            recruiter._companyId,
        ],
    )).rows[0];

    if (!(registeredRecruiter)) {
        throw new Error(`Could not save recruiter: ${recruiter}`);
    }

    return parseRecruiter({ queryResult: registeredRecruiter });
};

export const updateRecruiter = async ({ recruiter }: {
    recruiter: Recruiter,
}): Promise<Recruiter> => {
    const updatedRecruiter = (await client.query(
        `UPDATE "recruiter"
        SET company_id = $1
        WHERE user_id = $2 RETURNING *;`,
        [
            recruiter._companyId,
            recruiter.user.__id,
        ],
    )).rows[0];

    if (!(updatedRecruiter)) {
        throw new Error(`Could not update recruiter: ${recruiter}`);
    }

    return parseRecruiter({ queryResult: updatedRecruiter });
};

export const fetchRecruiterByCompanyid = async ({ companyId }: {
    companyId: number,
}): Promise<Recruiter[]> => {
    const queryResult = (await client.query(
        'SELECT * FROM recruiter WHERE company_id = $1;',
        [companyId],
    )).rows;

    return queryResult.map((recruiter: any) => parseRecruiter({ queryResult: recruiter }));
};

const parseRecruiter = ({ queryResult }: { queryResult: any }): Recruiter => ({
    _companyId: queryResult.company_id,
    user: { __id: queryResult.user_id },
});

export const fetchCompanyById = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<Company | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM company WHERE id = $1;',
        [companyId],
    )).rows[0];

    return (queryResult)
        ? parseCompany({ queryResult })
        : undefined;
};

export const fetchCompanyByName = async ({ companyName }: {
    companyName: Company['name'],
}): Promise<Company | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM company WHERE LOWER(name) = LOWER($1);',
        [companyName],
    )).rows[0];

    return (queryResult)
        ? parseCompany({ queryResult })
        : undefined;
};

export const saveCompany = async ({ company }: {
    company: Omit<Company, '__id'>
}): Promise<Company> => {
    const registeredCompany = (await client.query(
        `INSERT INTO "company" (
            owner_id,
            avatar,
            business,
            description,
            name
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [
            company._ownerId,
            company.avatar,
            company.business,
            company.description,
            company.name,
        ],
    )).rows[0];

    if (!(registeredCompany)) {
        throw new Error(`Could not save company: ${company}`);
    }

    return parseCompany({ queryResult: registeredCompany });
};

export const updateCompany = async ({ company }: {
    company: Partial<Company>
}): Promise<Company> => {
    const registeredCompany = (await client.query(
        `UPDATE "company"
         SET business = $1,
             description = $2
        WHERE id = $3 RETURNING *;`,
        [
            company.business,
            company.description,
            company.__id,
        ],
    )).rows[0];

    if (!(registeredCompany)) {
        throw new Error(`Could not save company: ${company}`);
    }

    return parseCompany({ queryResult: registeredCompany });
};

export const dropCompanyById = async ({ companyId }: { companyId: number }): Promise<void> => {
    await client.query(
        'DELETE FROM "company" WHERE id = $1;',
        [companyId],
    );
};

export const updateCompanySubscription = async ({ companyId, sub, subId }: {
    companyId: Company['__id'],
    sub: Company['sub'],
    subId: Company['subId'],
}): Promise<Company> => {
    const updatedCompany = (await client.query(
        `UPDATE "company"
        SET sub = $1, sub_id = $2
        WHERE id = $3 RETURNING *;`,
        [sub, subId, companyId],
    )).rows[0];

    if (!(updatedCompany)) {
        throw new Error(`Could not update company sub: ${companyId}`);
    }

    return parseCompany({ queryResult: updatedCompany });
};

export const fetchCompanyInviteByCode = async ({ code }: {
    code: CompanyInvite['code'],
}): Promise<CompanyInvite | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM company_invite WHERE code = $1;',
        [code],
    )).rows[0];

    return (queryResult)
        ? parseCompanyInvite({ queryResult })
        : undefined;
};

export const saveCompanyInvite = async ({ companyInvite }: {
    companyInvite: Omit<CompanyInvite, '__id'>,
}): Promise<CompanyInvite> => {
    const registeredCompanyInvite = (await client.query(
        `INSERT INTO "company_invite" (
            company_id,
            code,
            guest_email
        ) VALUES ($1, $2, $3) RETURNING *;`,
        [
            companyInvite._companyId,
            companyInvite.code,
            companyInvite.guestEmail,
        ],
    )).rows[0];

    if (!(registeredCompanyInvite)) {
        throw new Error(`Could not save company invite: ${companyInvite}`);
    }

    return parseCompanyInvite({ queryResult: registeredCompanyInvite });
};

const parseCompany = ({ queryResult }: { queryResult: any }): Company => ({
    __id: queryResult.id,
    _ownerId: queryResult.owner_id,
    avatar: queryResult.avatar,
    business: queryResult.business,
    createdAt: queryResult.created_at,
    description: queryResult.description,
    name: queryResult.name,
    sub: queryResult.sub,
    subId: queryResult.sub_id,
    updatedAt: queryResult.updated_at,
});

const parseCompanyInvite = ({ queryResult }: { queryResult: any }): CompanyInvite => ({
    __id: queryResult.id,
    _companyId: queryResult.company_id,
    code: queryResult.code,
    guestEmail: queryResult.guest_email,
});
