import { Request, Response } from 'express';

import { CandidacyRequest, CandidacyStatusEditRequest, MeetingRequest } from '../../middlewares/candidacy';
import {
    createCandidacy,
    deleteCandidacyById,
    editCandidacyStatus,
    getCandidaciesByJobOfferId,
    getCandidaciesByTalentId,
    getCandidacyById,
    getCandidacyByTalentIdAndJobOfferId,
} from '../../services/candidacy';
import { getJobOfferById } from '../../services/job';
import { createMeet } from '../../services/meet';
import { getTalentById } from '../../services/talent';
import { formatCandidaciesByStatus } from '../../utils/candidacy';

export const getTalentCandidacyForJobOffer = async (req: Request, res: Response): Promise<void> => {
    const jobOfferId = Number.parseInt(req.params.jobOfferId);
    if (!(jobOfferId)) {
        res.status(500).json({ error: `Invalid job offer id ${jobOfferId}` });
        return;
    }

    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const candidacy = await getCandidacyByTalentIdAndJobOfferId({
        jobOfferId,
        talentId,
    });

    res.status(200).json(candidacy);
};

export const getCandidaciesByTalent = async (req: Request, res: Response): Promise<void> => {
    const talentId = Number.parseInt(req.params.talentId);
    if (!(talentId)) {
        res.status(500).json({ error: `Invalid talent id ${talentId}` });
        return;
    }

    const candidacies = await getCandidaciesByTalentId({ talentId });

    res.status(200).json(formatCandidaciesByStatus(candidacies));
};

export const getCandidaciesByJobOffer = async (req: Request, res: Response): Promise<void> => {
    const jobOfferId = Number.parseInt(req.params.jobOfferId);
    if (!(jobOfferId)) {
        res.status(500).json({ error: `Invalid job offer id ${jobOfferId}` });
        return;
    }

    const candidacies = await getCandidaciesByJobOfferId({ jobOfferId });

    res.status(200).json(formatCandidaciesByStatus(candidacies));
};

export const getCandidacy = async (req: Request, res: Response): Promise<void> => {
    const candidacyId = Number.parseInt(req.params.candidacyId);
    if (!(candidacyId)) {
        res.status(500).json({ error: `Invalid candidacy id ${candidacyId}` });
        return;
    }

    const candidacy = await getCandidacyById({ candidacyId });

    if (!(candidacy)) {
        res.status(404).json({ error: `Candidacy ${candidacyId} not found` });
        return;
    }

    res.status(200).json(candidacy);
};

export const postCandidacy = async (req: CandidacyRequest, res: Response): Promise<void> => {
    const candidacy = req.validatedData?.candidacy;
    if (!(candidacy)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    //TODO: only check if job offer exists
    const jobOffer = await getJobOfferById({ jobOfferId: candidacy._jobOfferId });
    if (!(jobOffer)) {
        res.status(404).json({ error: `Job offer ${candidacy._jobOfferId} not found` });
        return;
    }

    //TODO: only check if talent exists
    const talent = await getTalentById({ talentId: candidacy._talentId });
    if (!(talent)) {
        res.status(404).json({ error: `Talent ${candidacy._talentId} not found` });
        return;
    }

    const registeredCandidacy = await createCandidacy({ candidacy });
    res.status(201).json(registeredCandidacy);
};

export const patchCandidacyStatus = async (req: CandidacyStatusEditRequest, res: Response): Promise<void> => {
    const candidacy = req.validatedData?.candidacy;
    if (!(candidacy)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const updatedCandidacy = await editCandidacyStatus({ candidacy });
    if (!(updatedCandidacy)) {
        res.status(404).json({ error: `Candidacy ${candidacy.__id} not found` });
        return;
    }

    res.status(200).json(updatedCandidacy);
};

export const deleteCandidacy = async (req: Request, res: Response): Promise<void> => {
    const candidacyId = Number.parseInt(req.params.candidacyId);
    if (!(candidacyId)) {
        res.status(500).json({ error: `Invalid candidacy id ${candidacyId}` });
        return;
    }

    await deleteCandidacyById({ candidacyId });

    res.status(200).json();
};

export const postMeeting = async (req: MeetingRequest, res: Response): Promise<void> => {
    const meeting = req.validatedData?.meeting;

    if (!(meeting)) {
        res.status(500).json({ error: 'Unexpected parse error' });
        return;
    }

    const meetUrl = await createMeet({ ...meeting });
    res.json({ meetUrl });
};
