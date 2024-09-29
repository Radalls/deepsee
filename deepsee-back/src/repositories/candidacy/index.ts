import { client } from '../../middlewares/database';
import { Candidacy } from '../../models/candidacy';
import { JobOffer } from '../../models/job';
import { Talent } from '../../models/talent';

export const fetchCandidacyById = async ({ candidacyId }: {
    candidacyId: Candidacy['__id'],
}): Promise<Candidacy | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM candidacy WHERE id = $1;',
        [candidacyId],
    )).rows[0];

    return (queryResult)
        ? parseCandidacy({ queryResult: queryResult })
        : undefined;
};

export const fetchCandidacyByTalentIdAndJobOfferId = async ({ talentId, jobOfferId }: {
    jobOfferId: JobOffer['__id'],
    talentId: Talent['user']['__id'],
}): Promise<Candidacy | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM candidacy WHERE talent_id = $1 AND job_offer_id = $2;',
        [talentId, jobOfferId],
    )).rows[0];

    return (queryResult)
        ? parseCandidacy({ queryResult: queryResult })
        : undefined;
};

export const fetchCandidaciesByTalentId = async ({ talentId }: {
    talentId: Talent['user']['__id'],
}): Promise<Candidacy[]> => {
    return await Promise.all((await client.query(
        'SELECT * FROM candidacy WHERE talent_id = $1;',
        [talentId],
    )).rows.map((queryResult) => parseCandidacy({ queryResult })));
};

export const fetchCandidaciesByJobOfferId = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<Candidacy[]> => {
    return await Promise.all((await client.query(
        'SELECT * FROM candidacy WHERE job_offer_id = $1;',
        [jobOfferId],
    )).rows.map((queryResult) => parseCandidacy({ queryResult })));
};

export const countCandidaciesByJobOfferId = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<number> => {
    return (await client.query(
        'SELECT COUNT(*) FROM candidacy WHERE job_offer_id = $1;',
        [jobOfferId],
    )).rows[0].count;
};

export const saveCandidacy = async ({ candidacy }: {
    candidacy: Omit<Candidacy, '__id'>,
}): Promise<Candidacy> => {
    const registeredCandidacy = (await client.query(
        `INSERT INTO candidacy(
            job_offer_id,
            talent_id,
            status,
            message
        ) VALUES($1, $2, $3, $4) RETURNING *;`,
        [
            candidacy._jobOfferId,
            candidacy._talentId,
            candidacy.status,
            candidacy.message,
        ],
    )).rows[0];

    if (!(registeredCandidacy)) {
        throw new Error(`Could not save candidacy: ${candidacy}`);
    }

    return parseCandidacy({ queryResult: registeredCandidacy });
};

export const updateCandidacy = async ({ candidacy }: {
    candidacy: Omit<Candidacy, '_talentId' | '_jobOfferId'>,
}): Promise<Candidacy> => {
    let updatedCandidacy = undefined;

    if (candidacy.status) {
        updatedCandidacy = (await client.query(
            'UPDATE candidacy SET status = $1 WHERE id = $2 RETURNING *;',
            [candidacy.status, candidacy.__id],
        )).rows[0];
    }

    if (candidacy.message) {
        updatedCandidacy = (await client.query(
            'UPDATE candidacy SET message = $1 WHERE id = $2 RETURNING *;',
            [candidacy.message, candidacy.__id],
        )).rows[0];
    }

    if (candidacy.meetLink) {
        updatedCandidacy = (await client.query(
            'UPDATE candidacy SET meet_link = $1 WHERE id = $2 RETURNING *;',
            [candidacy.meetLink, candidacy.__id],
        )).rows[0];
    }

    if (candidacy.phoneInterviewDate) {
        updatedCandidacy = (await client.query(
            'UPDATE candidacy SET phone_interview_date = $1 WHERE id = $2 RETURNING *;',
            [candidacy.phoneInterviewDate, candidacy.__id],
        )).rows[0];
    }

    if (candidacy.interviewDate) {
        updatedCandidacy = (await client.query(
            'UPDATE candidacy SET interview_date = $1 WHERE id = $2 RETURNING *;',
            [candidacy.interviewDate, candidacy.__id],
        )).rows[0];
    }

    if (!(updatedCandidacy)) {
        throw new Error(`Could not update candidacy: ${candidacy}`);
    }

    return parseCandidacy({ queryResult: updatedCandidacy });
};

export const dropCandidacyById = async ({ candidacyId }: { candidacyId: Candidacy['__id'] }): Promise<void> => {
    await client.query(
        'DELETE FROM candidacy WHERE id = $1;',
        [candidacyId],
    );
};

const parseCandidacy = ({ queryResult }: { queryResult: any }): Candidacy => ({
    __id: queryResult.id,
    _jobOfferId: queryResult.job_offer_id,
    _talentId: queryResult.talent_id,
    createdAt: queryResult.created_at,
    interviewDate: queryResult.interview_date,
    meetLink: queryResult.meet_link,
    message: queryResult.message,
    phoneInterviewDate: queryResult.phone_interview_date,
    status: queryResult.status,
    updatedAt: queryResult.updated_at,
});
