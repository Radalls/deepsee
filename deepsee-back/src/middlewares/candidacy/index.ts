import { NextFunction, Request, Response } from 'express';

import { Candidacy, CandidacyStatus } from '../../models/candidacy';
import { validateEnum, validateNumber, validateString } from '../../utils/validation';

export interface CandidacyRequest extends Request {
    validatedData?: {
        candidacy: Required<Pick<Candidacy,
            '_jobOfferId' | '_talentId' | 'message'
        >>;
    };
}

export interface CandidacyStatusEditRequest extends Request {
    validatedData?: {
        candidacy: Required<Pick<Candidacy,
            '__id' | 'status'
        >>;
    };
}

export interface MeetingRequest extends Request {
    validatedData?: {
        meeting: {
            address?: string,
            candidacyId: number,
            date: string,
            senderId: number,
            time: string
        };
    };
}

export const validateCandidacy = (req: CandidacyRequest, res: Response, next: NextFunction): void => {
    const {
        jobOfferId,
        talentId,
        message,
    } = req.body;

    const validatedJobOfferId = validateNumber(jobOfferId);
    if (!(validatedJobOfferId)) {
        throw new Error(`Invalid job offer id ${jobOfferId}`);
    }

    const validatedTalentId = validateNumber(talentId);
    if (!(validatedTalentId)) {
        throw new Error(`Invalid talent id ${talentId}`);
    }

    const validateMessage = validateString(message);
    if (!(validateMessage)) {
        throw new Error(`Invalid message ${message}`);
    }

    req.validatedData = {
        candidacy: {
            _jobOfferId: validatedJobOfferId,
            _talentId: validatedTalentId,
            message: validateMessage,
        },
    };

    next();
};

export const validateCandidacyStatus = (req: CandidacyStatusEditRequest, res: Response, next: NextFunction): void => {
    const {
        candidacyId,
        status,
    } = req.body;

    const validatedCandidacyId = validateNumber(candidacyId);
    if (!(validatedCandidacyId)) {
        throw new Error(`Invalid candidacy id ${candidacyId}`);
    }

    const validateStatus = validateEnum(status, CandidacyStatus);
    if (!(validateStatus)) {
        throw new Error(`Invalid status ${status}`);
    }

    req.validatedData = {
        candidacy: {
            __id: validatedCandidacyId,
            status: validateStatus,
        },
    };

    next();
};

export const validateMeeting = (req: MeetingRequest, res: Response, next: NextFunction): void => {
    const {
        candidacyId,
        address,
        date,
        time,
        senderId,
    } = req.body;

    const validatedCandidacyId = validateNumber(candidacyId);
    if (!(validatedCandidacyId)) {
        throw new Error(`Invalid candidacy id ${candidacyId}`);
    }

    const validatedSenderId = validateNumber(senderId);
    if (!(validatedSenderId)) {
        throw new Error(`Invalid sender id ${senderId}`);
    }

    const validateDate = validateString(date);
    if (!(validateDate)) {
        throw new Error(`Invalid date ${date}`);
    }

    const validateTime = validateString(time);
    if (!(validateTime)) {
        throw new Error(`Invalid date ${time}`);
    }

    req.validatedData = {
        meeting: {
            address,
            candidacyId: validatedCandidacyId,
            date: validateDate,
            senderId: validatedSenderId,
            time: validateTime,
        },
    };

    next();
};
