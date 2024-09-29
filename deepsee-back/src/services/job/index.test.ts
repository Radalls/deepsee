import { JobOffer } from '../../models/job';
import { JobOfferStatus } from '../../models/job';
import { Company } from '../../models/recruiter';
import { Skill } from '../../models/talent';
import { countCandidaciesByJobOfferId } from '../../repositories/candidacy';
import {
    fetchJobOfferById,
    fetchJobOffersByCompanyId,
    fetchJobOffersBySearchParams,
    fetchJobOfferSkills,
    saveJobOffer,
    updateJobOffer,
} from '../../repositories/job';
import { fetchCompanyById } from '../../repositories/recruiter';

import {
    createJobOffer,
    editJobOffer,
    getJobOfferById,
    getJobOffersByCompanyId,
    getJobOffersBySearchParams,
} from './index';

jest.mock('../../repositories/candidacy');
jest.mock('../../repositories/job');
jest.mock('../../repositories/recruiter');
jest.mock('../candidacy');
jest.mock('../talent');

describe('Job Offer Service', () => {
    let mockCompany: Company;
    let mockJobOffer: JobOffer;
    let mockSkills: Skill[];

    beforeAll(() => {
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

        mockCompany = {
            __id: 1,
            avatar: 'avatar',
            name: 'companyName',
        } as Company;

        mockJobOffer = {
            __id: 1,
            _companyId: 1,
            requiredSkills: mockSkills,
            status: JobOfferStatus.DRAFT,
            title: 'Job Offer Title',
        } as JobOffer;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getJobOfferById', () => {
        it('should return job offer details by id', async () => {
            (fetchJobOfferById as jest.Mock).mockResolvedValue(mockJobOffer);
            (fetchJobOfferSkills as jest.Mock).mockResolvedValue(mockSkills);
            (fetchCompanyById as jest.Mock).mockResolvedValue(mockCompany);

            const result = await getJobOfferById({ jobOfferId: 1 });

            expect(result).toEqual({
                ...mockJobOffer,
                companyAvatar: mockCompany.avatar,
                companyName: mockCompany.name,
                requiredSkills: mockSkills,
            });

            expect(fetchJobOfferById).toHaveBeenCalledWith({ jobOfferId: 1 });
            expect(fetchJobOfferSkills).toHaveBeenCalledWith({ jobOfferId: 1 });
            expect(fetchCompanyById).toHaveBeenCalledWith({ companyId: mockJobOffer._companyId });
        });

        it('should return undefined if job offer not found', async () => {
            (fetchJobOfferById as jest.Mock).mockResolvedValue(undefined);

            const result = await getJobOfferById({ jobOfferId: 999 });

            expect(result).toBeUndefined();
            expect(fetchJobOfferById).toHaveBeenCalledWith({ jobOfferId: 999 });
        });
    });

    describe('getJobOffersByCompanyId', () => {
        it('should return job offers for a company', async () => {
            const mockJobOffers = [mockJobOffer];

            (fetchJobOffersByCompanyId as jest.Mock).mockResolvedValue(mockJobOffers);
            (countCandidaciesByJobOfferId as jest.Mock).mockResolvedValue(10);
            (fetchJobOfferSkills as jest.Mock).mockResolvedValue(mockSkills);
            (fetchCompanyById as jest.Mock).mockResolvedValue(mockCompany);

            const result = await getJobOffersByCompanyId({ companyId: 1 });

            expect(result).toEqual([{
                ...mockJobOffer,
                companyAvatar: mockCompany.avatar,
                companyName: mockCompany.name,
                nbOfCandidacies: 10,
                requiredSkills: mockSkills,
            }]);

            expect(fetchJobOffersByCompanyId).toHaveBeenCalledWith({ companyId: 1 });
            expect(countCandidaciesByJobOfferId).toHaveBeenCalledWith({ jobOfferId: mockJobOffer.__id });
            expect(fetchJobOfferSkills).toHaveBeenCalledWith({ jobOfferId: mockJobOffer.__id });
            expect(fetchCompanyById).toHaveBeenCalledWith({ companyId: mockJobOffer._companyId });
        });

        it('should return empty array if no job offers found for a company', async () => {
            (fetchJobOffersByCompanyId as jest.Mock).mockResolvedValue([]);

            const result = await getJobOffersByCompanyId({ companyId: 999 });

            expect(result).toEqual([]);
            expect(fetchJobOffersByCompanyId).toHaveBeenCalledWith({ companyId: 999 });
        });
    });

    describe('getJobOffersBySearchParams', () => {
        it('should return job offers based on search parameters', async () => {
            const mockParams = { keyword: 'engineer', location: 'New York' };
            const mockJobOffers = [mockJobOffer];

            (fetchJobOffersBySearchParams as jest.Mock).mockResolvedValue(mockJobOffers);
            (fetchJobOfferSkills as jest.Mock).mockResolvedValue(mockSkills);
            (fetchCompanyById as jest.Mock).mockResolvedValue(mockCompany);

            const result = await getJobOffersBySearchParams({ params: mockParams });

            expect(result).toEqual([{
                ...mockJobOffer,
                companyAvatar: mockCompany.avatar,
                companyName: mockCompany.name,
                requiredSkills: mockSkills,
            }]);

            expect(fetchJobOffersBySearchParams).toHaveBeenCalledWith({ params: mockParams });
            expect(fetchJobOfferSkills).toHaveBeenCalledWith({ jobOfferId: mockJobOffer.__id });
            expect(fetchCompanyById).toHaveBeenCalledWith({ companyId: mockJobOffer._companyId });
        });

        it('should return empty array if no job offers found for search parameters', async () => {
            (fetchJobOffersBySearchParams as jest.Mock).mockResolvedValue([]);

            const result = await getJobOffersBySearchParams({ params: {} });

            expect(result).toEqual([]);
            expect(fetchJobOffersBySearchParams).toHaveBeenCalledWith({ params: {} });
        });
    });

    describe('createJobOffer', () => {
        it('should create a new job offer', async () => {
            (saveJobOffer as jest.Mock).mockResolvedValue(mockJobOffer);

            const result = await createJobOffer({ jobOffer: mockJobOffer });

            expect(result).toEqual({ jobOffer: mockJobOffer });
            expect(saveJobOffer).toHaveBeenCalledWith({
                jobOffer: {
                    ...mockJobOffer,
                    createdAt: expect.any(Date),
                    jobOfferTestId: undefined,
                },
            });
        });
    });

    describe('editJobOffer', () => {
        it('should edit an existing job offer', async () => {
            (updateJobOffer as jest.Mock).mockResolvedValue(mockJobOffer);

            const result = await editJobOffer({ newJobOffer: mockJobOffer });

            expect(result).toEqual({ jobOffer: mockJobOffer, jobOfferTest: undefined });
            expect(updateJobOffer).toHaveBeenCalledWith({ jobOffer: mockJobOffer });
        });
    });
});
