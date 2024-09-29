import { client } from '../../middlewares/database';
import { JobOffer, JobOfferTest, JobOfferTestRun } from '../../models/job';
import { Company } from '../../models/recruiter';
import { Skill, Talent } from '../../models/talent';

export const fetchJobOfferById = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<JobOffer | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM job_offer WHERE id = $1;',
        [jobOfferId],
    )).rows[0];

    return (queryResult)
        ? parseJobOffer({ queryResult })
        : undefined;
};

export const fetchJobOffersByCompanyId = async ({ companyId }: {
    companyId: Company['__id'],
}): Promise<JobOffer[]> => {
    return await Promise.all((await client.query(
        'SELECT * FROM job_offer WHERE company_id = $1;',
        [companyId],
    )).rows.map((queryResult) => parseJobOffer({ queryResult })));
};

export const fetchallJobOffers = async (): Promise<JobOffer[]> => {
    return await Promise.all((await client.query(
        `SELECT * FROM job_offer
        WHERE status = 'PUBLISHED';`,
    )).rows.map((queryResult) => parseJobOffer({ queryResult })));
};

//TODO: check if fetchJobOffersBySearchParams awaits correctly
export const fetchJobOffersBySearchParams = async ({ params }: {
    params: any,
}): Promise<JobOffer[]> => {
    let query = 'SELECT * FROM job_offer';
    const whereClauses = [] as string[];
    const values = [] as any[];
    const joinClauses = { company: false };

    if (params.title) {
        values.push(`%${params.title}%`);
        whereClauses.push(`title ILIKE $${values.length}`);
    }
    if (params.contract) {
        values.push(params.contract);
        whereClauses.push(`contract_type = $${values.length}`);
    }
    if (params.location) {
        values.push(`%${params.location}%`);
        whereClauses.push(`location ILIKE $${values.length}`);
    }
    if (params.company) {
        joinClauses.company = true;
        values.push(`%${params.company}%`);
        whereClauses.push(`c.name ILIKE $${values.length}`);
    }
    if (params.business) {
        joinClauses.company = true;
        values.push(`%${params.business}%`);
        whereClauses.push(`c.business ILIKE $${values.length}`);
    }

    query += (joinClauses.company)
        ? ' JOIN company c ON job_offer.company_id = c.id'
        : '';

    query += ' WHERE job_offer.status = \'PUBLISHED\'';
    query += (whereClauses.length)
        ? ` AND ${whereClauses.join(' AND ')}`
        : '';

    const queryResults = (await client.query(query, values)).rows;

    return queryResults.map((queryResult) => parseJobOffer({ queryResult }));
};

export const saveJobOffer = async ({ jobOffer, jobOfferTestId }: {
    jobOffer: Omit<JobOffer, '__id'>,
    jobOfferTestId?: JobOfferTest['__id'],
}): Promise<JobOffer> => {
    const registeredJobOffer = (await client.query(
        `INSERT INTO job_offer(
            company_id,
            contract_type,
            status,
            title,
            required_years_of_experience,
            required_diploma,
            requirement_description,
            main_description,
            work_description,
            location,
            job_offer_test_id
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`,
        [
            jobOffer._companyId,
            jobOffer.contractType,
            jobOffer.status,
            jobOffer.title,
            jobOffer.requiredYearsOfExperience,
            jobOffer.requiredDiploma,
            jobOffer.requirementDescription,
            jobOffer.mainDescription,
            jobOffer.workDescription,
            jobOffer.location,
            jobOfferTestId,
        ],
    )).rows[0];

    if (!(registeredJobOffer)) {
        throw new Error(`Could not save job offer: ${jobOffer}`);
    }

    return parseJobOffer({ queryResult: registeredJobOffer });
};

export const updateJobOffer = async ({ jobOffer }: {
    jobOffer: Omit<JobOffer, '_companyId'>
}): Promise<JobOffer> => {
    const updatedJobOffer = (await client.query(
        `UPDATE job_offer
        SET contract_type = $1,
        title = $2,
        required_years_of_experience = $3,
        required_diploma = $4,
        requirement_description = $5,
        main_description = $6,
        work_description = $7,
        location = $8,
        published_at = $9
        WHERE id = $10 RETURNING *;`,
        [
            jobOffer.contractType,
            jobOffer.title,
            jobOffer.requiredYearsOfExperience,
            jobOffer.requiredDiploma,
            jobOffer.requirementDescription,
            jobOffer.mainDescription,
            jobOffer.workDescription,
            jobOffer.location,
            jobOffer.publishedAt,
            jobOffer.__id,
        ],
    )).rows[0];

    if (!(updatedJobOffer)) {
        throw new Error(`Could not update job offer: ${jobOffer}`);
    }

    return parseJobOffer({ queryResult: updatedJobOffer });
};

export const updateJobOfferStatus = async ({ jobOffer }: {
    jobOffer: Pick<JobOffer, '__id' | 'status'>,
}): Promise<JobOffer> => {
    const updatedJobOffer = (await client.query(
        'UPDATE job_offer SET status = $1 WHERE id = $2 RETURNING *;',
        [jobOffer.status, jobOffer.__id],
    )).rows[0];

    if (!(updatedJobOffer)) {
        throw new Error(`Could not update job offer: ${jobOffer}`);
    }

    return parseJobOffer({ queryResult: updatedJobOffer });
};

export const fetchJobOfferSkills = async ({ jobOfferId }: {
    jobOfferId: JobOffer['__id'],
}): Promise<Skill[]> => {
    return await Promise.all((await client.query(
        `SELECT skill.*, j.level FROM skill
        JOIN job_offer_skill j ON skill.id = j.skill_id
        WHERE j.job_offer_id = $1;`,
        [jobOfferId],
    )).rows.map((queryResult) => parseJobOfferSkill({ queryResult })));
};

export const saveJobOfferSkill = async ({ jobOfferId, jobOfferSkill }: {
    jobOfferId: number,
    jobOfferSkill: Skill
}): Promise<Skill> => {
    const registeredJobOfferSkills = (await client.query(
        `INSERT INTO job_offer_skill(
            job_offer_id,
            skill_id,
            level
        ) VALUES($1, $2, $3) RETURNING *;`,
        [
            jobOfferId,
            jobOfferSkill.__id,
            jobOfferSkill.level,
        ],
    )).rows[0];

    if (!(registeredJobOfferSkills)) {
        throw new Error(`Could not save job offer skill: ${jobOfferSkill}`);
    }

    return parseJobOfferSkill({ queryResult: registeredJobOfferSkills });
};

export const updateJobOfferSkill = async ({ jobOfferId, jobOfferSkill }: {
    jobOfferId: number,
    jobOfferSkill: Skill
}): Promise<Skill> => {
    const updatedJobOfferSkill = (await client.query(
        `UPDATE job_offer_skill
        SET level = $1
        WHERE job_offer_id = $2 AND skill_id = $3 RETURNING *;`,
        [
            jobOfferSkill.level,
            jobOfferId,
            jobOfferSkill.__id,
        ],
    )).rows[0];

    if (!(updatedJobOfferSkill)) {
        throw new Error(`Could not update job offer skill: ${jobOfferSkill}`);
    }

    return parseJobOfferSkill({ queryResult: updatedJobOfferSkill });
};

export const deleteJobOfferSkill = async ({ jobOfferId, jobOfferSkillId }: {
    jobOfferId: number,
    jobOfferSkillId: number
}): Promise<void> => {
    await client.query(
        'DELETE FROM job_offer_skill WHERE job_offer_id = $1 AND skill_id = $2;',
        [jobOfferId, jobOfferSkillId],
    );
};

export const fetchJobOfferTestById = async ({ jobOfferTestId }: {
    jobOfferTestId: JobOfferTest['__id'],
}): Promise<JobOfferTest | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM job_offer_test WHERE id = $1;',
        [jobOfferTestId],
    )).rows[0];

    return (queryResult)
        ? parseJobOfferTest({ queryResult })
        : undefined;
};

export const saveJobOfferTest = async ({ jobOfferTest }: {
    jobOfferTest: Omit<JobOfferTest, '__id'>,
}): Promise<JobOfferTest> => {
    const registeredJobOfferTest = (await client.query(
        `INSERT INTO job_offer_test(
            instructions,
            duration,
            unit_name,
            units
        ) VALUES($1, $2, $3, $4) RETURNING *;`,
        [
            jobOfferTest.instructions,
            jobOfferTest.duration,
            jobOfferTest.unitName,
            JSON.stringify(jobOfferTest.units),
        ],
    )).rows[0];

    if (!(registeredJobOfferTest)) {
        throw new Error(`Could not save job offer test: ${jobOfferTest}`);
    }

    return parseJobOfferTest({ queryResult: registeredJobOfferTest });
};

export const updateJobOfferTest = async ({ jobOfferTest }: {
    jobOfferTest: JobOfferTest,
}): Promise<JobOfferTest> => {
    const updatedJobOfferTest = (await client.query(
        `UPDATE job_offer_test
        SET instructions = $1,
        duration = $2,
        unit_name = $3,
        units = $4
        WHERE id = $5 RETURNING *;`,
        [
            jobOfferTest.instructions,
            jobOfferTest.duration,
            jobOfferTest.unitName,
            JSON.stringify(jobOfferTest.units),
            jobOfferTest.__id,
        ],
    )).rows[0];

    if (!(updatedJobOfferTest)) {
        throw new Error(`Could not update job offer test: ${jobOfferTest}`);
    }

    return parseJobOfferTest({ queryResult: updatedJobOfferTest });
};

export const fetchJobOfferTestRun = async ({ jobOfferTestId, talentId }: {
    jobOfferTestId: JobOfferTest['__id'],
    talentId: Talent['user']['__id'],
}): Promise<JobOfferTestRun | undefined> => {
    const queryResult = (await client.query(
        'SELECT * FROM job_offer_test_run WHERE job_offer_test_id = $1 AND talent_id = $2;',
        [jobOfferTestId, talentId],
    )).rows[0];

    return (queryResult)
        ? parseJobOfferTestRun({ queryResult })
        : undefined;
};

export const saveJobOfferTestRun = async ({ jobOfferTestRun }: {
    jobOfferTestRun: Omit<JobOfferTestRun, '__id'>,
}): Promise<JobOfferTestRun> => {
    const registeredJobOfferTestRun = (await client.query(
        `INSERT INTO job_offer_test_run(
            job_offer_test_id,
            startable_until,
            talent_id
        ) VALUES($1, $2, $3) RETURNING *;`,
        [
            jobOfferTestRun._jobOfferTestId,
            jobOfferTestRun.startableUntil,
            jobOfferTestRun._talentId,
        ],
    )).rows[0];

    if (!(registeredJobOfferTestRun)) {
        throw new Error(`Could not save job offer test run: ${jobOfferTestRun}`);
    }

    return parseJobOfferTestRun({ queryResult: registeredJobOfferTestRun });
};

export const updateJobOfferTestRun = async ({ jobOfferTestRun }: {
    jobOfferTestRun: Omit<JobOfferTestRun, 'startableUntil'>,
}): Promise<JobOfferTestRun> => {
    let updatedJobOfferTestRun = undefined;

    if (jobOfferTestRun.validatedAt) {
        updatedJobOfferTestRun = (await client.query(
            `UPDATE job_offer_test_run
            SET validated_at = $1
            WHERE job_offer_test_id = $2 AND talent_id = $3 RETURNING *;`,
            [
                jobOfferTestRun.validatedAt,
                jobOfferTestRun._jobOfferTestId,
                jobOfferTestRun._talentId,
            ],
        )).rows[0];
    }
    else if (jobOfferTestRun.endedAt) {
        updatedJobOfferTestRun = (await client.query(
            `UPDATE job_offer_test_run
            SET ended_at = $1
            WHERE job_offer_test_id = $2 AND talent_id = $3 RETURNING *;`,
            [
                jobOfferTestRun.endedAt,
                jobOfferTestRun._jobOfferTestId,
                jobOfferTestRun._talentId,
            ],
        )).rows[0];
    }
    else if (jobOfferTestRun.startedAt) {
        updatedJobOfferTestRun = (await client.query(
            `UPDATE job_offer_test_run
            SET started_at = $1
            WHERE job_offer_test_id = $2 AND talent_id = $3 RETURNING *;`,
            [
                jobOfferTestRun.startedAt,
                jobOfferTestRun._jobOfferTestId,
                jobOfferTestRun._talentId,
            ],
        )).rows[0];
    }

    if (!(updatedJobOfferTestRun)) {
        throw new Error(`Could not update jobOfferTestRun: ${jobOfferTestRun}`);
    }

    return parseJobOfferTestRun({ queryResult: updatedJobOfferTestRun });
};

const parseJobOffer = ({ queryResult }: { queryResult: any }): JobOffer => ({
    __id: queryResult.id,
    _companyId: queryResult.company_id,
    _jobOfferTestId: queryResult.job_offer_test_id,
    archivedAt: queryResult.archived_at,
    closedAt: queryResult.closed_at,
    contractType: queryResult.contract_type,
    createdAt: queryResult.created_at,
    location: queryResult.location,
    mainDescription: queryResult.main_description,
    publishedAt: queryResult.published_at,
    requiredDiploma: queryResult.required_diploma,
    requiredYearsOfExperience: queryResult.required_years_of_experience,
    requirementDescription: queryResult.requirement_description,
    status: queryResult.status,
    title: queryResult.title,
    updatedAt: queryResult.updated_at,
    workDescription: queryResult.work_description,
});

const parseJobOfferSkill = ({ queryResult }: { queryResult: any }): Skill => ({
    __id: queryResult.id,
    level: queryResult.level,
    logo: queryResult.logo,
    name: queryResult.name,
});

const parseJobOfferTest = ({ queryResult }: { queryResult: any }): JobOfferTest => ({
    __id: queryResult.id,
    createdAt: queryResult.created_at,
    duration: queryResult.duration,
    instructions: queryResult.instructions,
    unitName: queryResult.unit_name,
    units: JSON.parse(queryResult.units),
    updatedAt: queryResult.updated_at,
});

const parseJobOfferTestRun = ({ queryResult }: { queryResult: any }): JobOfferTestRun => ({
    _jobOfferTestId: queryResult.job_offer_test_id,
    _talentId: queryResult.talent_id,
    endedAt: queryResult.ended_at,
    startableUntil: queryResult.startable_until,
    startedAt: queryResult.started_at,
    validatedAt: queryResult.validated_at,
});
