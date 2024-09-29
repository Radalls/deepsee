import { Candidacy, CandidacyStatus } from '../../models/candidacy';
import { JobOffer, JobOfferTest, JobOfferTestRun } from '../../models/job';
import { Company } from '../../models/recruiter';
import { DiplomaTypes, Skill, Talent } from '../../models/talent';
import { User } from '../../models/user';
import {
    dropCandidacyById,
    fetchCandidaciesByJobOfferId,
    fetchCandidaciesByTalentId,
    fetchCandidacyById,
    fetchCandidacyByTalentIdAndJobOfferId,
    saveCandidacy,
} from '../../repositories/candidacy';
import { fetchJobOfferById, fetchJobOfferSkills, fetchJobOfferTestRun } from '../../repositories/job';
import { fetchCompanyById } from '../../repositories/recruiter';
import { fetchUserById } from '../../repositories/user';
import { createJobOfferTestRun, getJobOfferById } from '../job';
import { sendMail } from '../mail';
import { getTalentById } from '../talent';

import {
    createCandidacy,
    deleteCandidacyById,
    getCandidaciesByJobOfferId,
    getCandidaciesByTalentId,
    getCandidacyById,
    getCandidacyByTalentIdAndJobOfferId,
} from './index';

jest.mock('../../repositories/candidacy');
jest.mock('../../repositories/job');
jest.mock('../../repositories/recruiter');
jest.mock('../../repositories/user');
jest.mock('../chat');
jest.mock('../job');
jest.mock('../mail');
jest.mock('../talent');

describe('Candidacy Service', () => {
    let mockCandidacy: Candidacy;
    let mockCompany: Company;
    let mockTalent: Talent;
    let mockJobOffer: JobOffer;
    let mockJobOfferTest: JobOfferTest;
    let mockSkills: Skill[];
    let mockTestRun: JobOfferTestRun;
    let mockUser: User;

    beforeAll(() => {
        mockUser = {
            __id: 1,
            avatar: 'avatar',
            firstName: 'firstName',
            lastName: 'lastName',
        } as User;

        mockSkills = [
            {
                __id: 1,
                name: 'skill1',
            },
            {
                __id: 2,
                name: 'skill2',
            },
        ];

        mockCandidacy = {
            __id: 1,
            _jobOfferId: 1,
            _talentId: 1,
        } as Candidacy;

        mockTalent = {
            highestDiploma: DiplomaTypes.PHD,
            skills: [mockSkills[0]],
            user: mockUser,
            workExperiences: [],
            yearsOfExperience: 5,
        } as Talent;

        mockCompany = {
            __id: 1,
            avatar: 'avatar',
            name: 'companyName',
        } as Company;

        mockJobOffer = {
            __id: 1,
            _companyId: 1,
            _jobOfferTestId: 1,
            requiredDiploma: DiplomaTypes.PHD,
            requiredYearsOfExperience: 5,
        } as JobOffer;

        mockJobOfferTest = {
            __id: 1,
            _jobOfferId: 1,
            _jobOfferTestId: 1,
            endedAt: new Date(),
            startableUntil: new Date(),
            startedAt: new Date(),
            validatedAt: new Date(),
        } as JobOfferTest;

        mockTestRun = {
            _jobOfferTestId: 1,
            _talentId: 1,
            endedAt: new Date(),
            startableUntil: new Date(),
            startedAt: new Date(),
            validatedAt: new Date(),
        } as JobOfferTestRun;
    });

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('getCandidacyById', () => {
        it('should return a complete candidacy by id', async () => {
            (fetchCandidacyById as jest.Mock).mockResolvedValue(mockCandidacy);
            (getTalentById as jest.Mock).mockResolvedValue(mockTalent);
            (fetchJobOfferById as jest.Mock).mockResolvedValue(mockJobOffer);
            (fetchJobOfferSkills as jest.Mock).mockResolvedValue(mockSkills);

            const result = await getCandidacyById({ candidacyId: 1 });

            expect(result).toEqual({
                ...mockCandidacy,
                jobOfferRequiredDiploma: mockJobOffer.requiredDiploma,
                jobOfferRequiredYearsOfExperience: mockJobOffer.requiredYearsOfExperience,
                jobOfferSkills: mockSkills,
                talentAvatar: mockTalent.user.avatar,
                talentFirstName: mockTalent.user.firstName,
                talentHighestDiploma: mockTalent.highestDiploma,
                talentLastName: mockTalent.user.lastName,
                talentSkills: mockTalent.skills,
                talentWorkExperience: mockTalent.workExperiences,
                talentYearsOfExperience: mockTalent.yearsOfExperience,
            });

            expect(fetchCandidacyById).toHaveBeenCalledWith({ candidacyId: 1 });
            expect(getTalentById).toHaveBeenCalledWith({ talentId: mockCandidacy._talentId });
            expect(fetchJobOfferById).toHaveBeenCalledWith({ jobOfferId: mockCandidacy._jobOfferId });
            expect(fetchJobOfferSkills).toHaveBeenCalledWith({ jobOfferId: mockCandidacy._jobOfferId });
        });

        it('should return undefined if candidacy not found', async () => {
            (fetchCandidacyById as jest.Mock).mockResolvedValue(undefined);

            const result = await getCandidacyById({ candidacyId: 999 });

            expect(result).toBeUndefined();
            expect(fetchCandidacyById).toHaveBeenCalledWith({ candidacyId: 999 });
        });

        it('should return undefined if talent not found', async () => {
            (fetchCandidacyById as jest.Mock).mockResolvedValue(mockCandidacy);
            (getTalentById as jest.Mock).mockResolvedValue(undefined);

            const result = await getCandidacyById({ candidacyId: 1 });

            expect(result).toBeUndefined();
            expect(fetchCandidacyById).toHaveBeenCalledWith({ candidacyId: 1 });
            expect(getTalentById).toHaveBeenCalledWith({ talentId: mockCandidacy._talentId });
        });
    });

    describe('getCandidacyByTalentIdAndJobOfferId', () => {
        it('should return a candidacy by talent and job offer id', async () => {
            (fetchCandidacyByTalentIdAndJobOfferId as jest.Mock).mockResolvedValue(mockCandidacy);
            (fetchJobOfferById as jest.Mock).mockResolvedValue(mockJobOffer);
            (fetchJobOfferTestRun as jest.Mock).mockResolvedValue(mockTestRun);

            const result = await getCandidacyByTalentIdAndJobOfferId({
                jobOfferId: 1,
                talentId: 1,
            });

            expect(result).toEqual({
                ...mockCandidacy,
                _jobOfferTestId: mockJobOffer._jobOfferTestId,
                testRunEndedAt: mockTestRun.endedAt,
                testRunStartableUntil: mockTestRun.startableUntil,
                testRunStartedAt: mockTestRun.startedAt,
                testRunValidatedAt: mockTestRun.validatedAt,
            });

            expect(fetchCandidacyByTalentIdAndJobOfferId).toHaveBeenCalledWith({
                jobOfferId: 1,
                talentId: 1,
            });
            expect(fetchJobOfferById).toHaveBeenCalledWith({ jobOfferId: 1 });
            expect(fetchJobOfferTestRun).toHaveBeenCalledWith({
                jobOfferTestId: mockJobOffer._jobOfferTestId,
                talentId: mockCandidacy._talentId,
            });
        });

        it('should return undefined if no candidacy found', async () => {
            (fetchCandidacyByTalentIdAndJobOfferId as jest.Mock).mockResolvedValue(undefined);

            const result = await getCandidacyByTalentIdAndJobOfferId({
                jobOfferId: 1,
                talentId: 1,
            });

            expect(result).toBeUndefined();
            expect(fetchCandidacyByTalentIdAndJobOfferId).toHaveBeenCalledWith({
                jobOfferId: 1,
                talentId: 1,
            });
        });
    });

    describe('getCandidaciesByTalentId', () => {
        it('should return all candidacies of a talent', async () => {
            (fetchCandidaciesByTalentId as jest.Mock).mockResolvedValue([mockCandidacy]);
            (fetchJobOfferById as jest.Mock).mockResolvedValue(mockJobOffer);
            (fetchCompanyById as jest.Mock).mockResolvedValue(mockCompany);
            (fetchJobOfferTestRun as jest.Mock).mockResolvedValue(mockTestRun);
            // (getConversationByCandidacyId as jest.Mock).mockResolvedValue(mockConversation);

            const result = await getCandidaciesByTalentId({ talentId: 1 });

            expect(result).toEqual([{
                ...mockCandidacy,
                _conversationId: undefined,
                _jobOfferTestId: mockJobOfferTest.__id,
                companyAvatar: mockCompany.avatar,
                companyId: mockCompany.__id,
                companyName: mockCompany.name,
                jobOfferTitle: mockJobOffer.title,
                testRunEndedAt: mockTestRun.endedAt,
                testRunStartableUntil: mockTestRun.startableUntil,
                testRunStartedAt: mockTestRun.startedAt,
                testRunValidatedAt: mockTestRun.validatedAt,
            }]);

            expect(fetchCandidaciesByTalentId).toHaveBeenCalledWith({ talentId: 1 });
            expect(fetchJobOfferById).toHaveBeenCalledWith({ jobOfferId: mockCandidacy._jobOfferId });
            expect(fetchCompanyById).toHaveBeenCalledWith({ companyId: mockJobOffer._companyId });
            expect(fetchJobOfferTestRun).toHaveBeenCalledWith({
                jobOfferTestId: mockJobOffer._jobOfferTestId,
                talentId: mockCandidacy._talentId,
            });
            // expect(getConversationByCandidacyId).toHaveBeenCalledWith({ candidacyId: mockCandidacy.__id });
        });
    });

    describe('getCandidaciesByJobOfferId', () => {
        it('should return all candidacies of a job offer', async () => {
            (fetchCandidaciesByJobOfferId as jest.Mock).mockResolvedValue([mockCandidacy]);
            (fetchUserById as jest.Mock).mockResolvedValue(mockUser);
            (fetchJobOfferById as jest.Mock).mockResolvedValue(mockJobOffer);
            (fetchJobOfferTestRun as jest.Mock).mockResolvedValue(mockTestRun);

            const result = await getCandidaciesByJobOfferId({ jobOfferId: 1 });

            expect(result).toEqual([{
                ...mockCandidacy,
                talentAvatar: mockUser.avatar,
                talentFirstName: mockUser.firstName,
                talentLastName: mockUser.lastName,
                testRunEndedAt: mockTestRun.endedAt,
                testRunStartableUntil: mockTestRun.startableUntil,
                testRunStartedAt: mockTestRun.startedAt,
                testRunValidatedAt: mockTestRun.validatedAt,
            }]);

            expect(fetchCandidaciesByJobOfferId).toHaveBeenCalledWith({ jobOfferId: 1 });
            expect(fetchUserById).toHaveBeenCalledWith({ userId: mockCandidacy._talentId });
            expect(fetchJobOfferById).toHaveBeenCalledWith({ jobOfferId: mockCandidacy._jobOfferId });
            expect(fetchJobOfferTestRun).toHaveBeenCalledWith({
                jobOfferTestId: mockJobOffer._jobOfferTestId,
                talentId: mockCandidacy._talentId,
            });
        });
    });

    describe('createCandidacy', () => {
        it('should create a new candidacy', async () => {
            (getJobOfferById as jest.Mock).mockResolvedValue(mockJobOffer);

            const newCandidacy = {
                _jobOfferId: 1,
                _talentId: 1,
                createdAt: new Date(),
                status: CandidacyStatus.APPLIED,
            } as Candidacy;

            const savedCandidacy = {
                ...newCandidacy,
                __id: 1,
            } as Candidacy;

            (saveCandidacy as jest.Mock).mockResolvedValue(savedCandidacy);
            (createJobOfferTestRun as jest.Mock).mockResolvedValue(mockTestRun);
            (sendMail as jest.Mock).mockResolvedValue(true);

            const result = await createCandidacy({
                candidacy: {
                    _jobOfferId: 1,
                    _talentId: 1,
                },
            });

            expect(result).toEqual(savedCandidacy);
            expect(saveCandidacy).toHaveBeenCalledWith({ candidacy: newCandidacy });
            expect(sendMail).toHaveBeenCalled();
        });

        it('should throw an error if candidacy creation fails', async () => {
            const newCandidacy = {
                _jobOfferId: 1,
                _talentId: 1,
                createdAt: new Date(),
                status: CandidacyStatus.APPLIED,
            } as Candidacy;

            (saveCandidacy as jest.Mock).mockRejectedValue(new Error('Failed to save'));

            await expect(createCandidacy({ candidacy: newCandidacy })).rejects.toThrow('Failed to save');
            expect(saveCandidacy).toHaveBeenCalledWith({ candidacy: newCandidacy });
        });
    });

    describe('deleteCandidacyById', () => {
        it('should delete a candidacy by id', async () => {
            (dropCandidacyById as jest.Mock).mockResolvedValue(true);

            const result = await deleteCandidacyById({ candidacyId: 1 });

            expect(result).toBe(undefined);
            expect(dropCandidacyById).toHaveBeenCalledWith({ candidacyId: 1 });
        });

        it('should throw an error if deletion fails', async () => {
            (dropCandidacyById as jest.Mock).mockRejectedValue(new Error('Failed to delete'));

            await expect(deleteCandidacyById({ candidacyId: 1 })).rejects.toThrow('Failed to delete');
            expect(dropCandidacyById).toHaveBeenCalledWith({ candidacyId: 1 });
        });
    });
});
