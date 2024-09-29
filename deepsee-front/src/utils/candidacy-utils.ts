import { Candidacy, CandidacyStatus } from '../models/candidacy-model';

export const isTestRunSent = (candidacy: Candidacy): boolean => {
    return (
        candidacy.status === CandidacyStatus.TEST
        && new Date(candidacy.testRunStartableUntil) >= new Date()
        && !(candidacy.testRunStartedAt)
    );
};

export const isTestRunExpired = (candidacy: Candidacy): boolean => {
    return (
        candidacy.status === CandidacyStatus.TEST
        && new Date(candidacy.testRunStartableUntil) < new Date()
        && !(candidacy.testRunStartedAt)
    );
};

export const isTestRunSuccess = (candidacy: Candidacy): boolean => {
    return (
        candidacy.status === CandidacyStatus.TEST
        && !!candidacy.testRunValidatedAt
    );
};

export const isTestRunFailure = (candidacy: Candidacy): boolean => {
    return (
        candidacy.status === CandidacyStatus.TEST
        && candidacy.testRunEndedAt && !(candidacy.testRunValidatedAt)
    );
};

export const isInterviewPending = (candidacy: Candidacy): boolean => {
    return (
        (candidacy.status === CandidacyStatus.PHONE_INTERVIEW && !(candidacy.phoneInterviewDate))
        || (candidacy.status === CandidacyStatus.INTERVIEW && !(candidacy.interviewDate))
    );
};

export const isInterviewOngoing = (candidacy: Candidacy): boolean => {
    return (
        (
            candidacy.status === CandidacyStatus.PHONE_INTERVIEW
            && new Date(candidacy.phoneInterviewDate) >= new Date()
        )
        || (
            candidacy.status === CandidacyStatus.INTERVIEW
            && new Date(candidacy.interviewDate) >= new Date()
        )
    );
};

export const isInterviewDone = (candidacy: Candidacy): boolean => {
    return (
        (
            candidacy.status === CandidacyStatus.PHONE_INTERVIEW
            && candidacy.phoneInterviewDate
            && new Date(candidacy.phoneInterviewDate) < new Date()
        )
        || (
            candidacy.status === CandidacyStatus.INTERVIEW
            && candidacy.interviewDate
            && new Date(candidacy.interviewDate) < new Date()
        )
    );
};
