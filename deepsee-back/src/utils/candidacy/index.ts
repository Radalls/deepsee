import { Candidacy, CandidacyStatus } from '../../models/candidacy';

export const formatCandidaciesByStatus = (candidacies: Candidacy[]): { [status in CandidacyStatus]: Candidacy[] } => {
    return candidacies.reduce((acc, candidacy) => {
        if (!(candidacy.status)) {
            return acc;
        }
        if (!(acc[candidacy.status])) {
            acc[candidacy.status] = [];
        }

        acc[candidacy.status].push(candidacy);
        return acc;
    }, {} as { [status in CandidacyStatus]: Candidacy[] });
};
