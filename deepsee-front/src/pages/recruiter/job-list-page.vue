<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { JobOffer, JobOfferStatus, JobOfferStatusTrad } from '../../models/job-model';
import { Recruiter } from '../../models/recruiter-model';
import { getJobOffersByCompany, updateJobOfferStatus } from '../../services/job-service';
import { getRecruiter } from '../../services/recruiter-service';
import { useAuthStore } from '../../stores/auth-store';

const { getUser } = useAuthStore();
const recruiterId = ref(getUser().__id);

const isLoading = ref(true);

const recruiter = ref<Recruiter>(undefined);
const companyName = ref<string | undefined>(undefined);
const jobOffers = ref<JobOffer[]>([]);

onMounted(async () => {

    recruiter.value = await getRecruiter({ recruiterId: recruiterId.value });
    companyName.value = recruiter.value.companyName.toLowerCase();
    jobOffers.value = await getJobOffersByCompany({ companyId: recruiter.value._companyId });

    isLoading.value = false;
});

const updateStatus = async (jobOfferId: JobOffer['__id'], newStatus: JobOfferStatus) => {
    isLoading.value = true;

    await updateJobOfferStatus({
        jobOfferId,
        status: newStatus,
    });

    jobOffers.value = await getJobOffersByCompany({ companyId: recruiter.value._companyId });

    isLoading.value = false;
};
</script>

<template>
    <div class="page">
        <div class="mb-12">
            <router-link :to="`/recruiter/${companyName}/jobs/draft`">
                <button class="primary">
                    <div>Créer une offre</div>
                </button>
            </router-link>
        </div>

        <div
            v-if="isLoading"
            class="row justify-center"
        >
            <spinner-component />
        </div>

        <div
            v-else-if="jobOffers.length === 0"
            class="row justify-center align-center"
        >
            Vous n'avez pas encore créé d'offres
        </div>

        <div
            v-else
            class="column gap-12"
        >
            <div
                v-for="(jobOffer, index) of jobOffers"
                :key="jobOffer.__id"
            >
                <div
                    v-if="index > 0"
                    class="separator"
                />
                <div class="row justify-between">
                    <div>
                        <div class="mb-2 subtitle">
                            {{ jobOffer.title }}
                        </div>
                        <div
                            v-if="jobOffer.status"
                            class="mb-8"
                        >
                            {{ JobOfferStatusTrad[jobOffer.status] }}
                        </div>
                        <div v-if="jobOffer.status === JobOfferStatus.PUBLISHED">
                            {{ jobOffer.nbOfCandidacies }} candidatures
                        </div>
                    </div>

                    <div class="row gap-8 align-center">
                        <router-link
                            v-if="jobOffer.status === JobOfferStatus.DRAFT"
                            :to="`/recruiter/${companyName}/jobs/draft/${jobOffer.__id}`"
                        >
                            <button class="primary">
                                <div>Modifier</div>
                            </button>
                        </router-link>

                        <div v-if="jobOffer.status === JobOfferStatus.DRAFT">
                            <button
                                class="primary"
                                @click="updateStatus(jobOffer.__id, JobOfferStatus.PUBLISHED)"
                            >
                                <div>Publier</div>
                            </button>
                        </div>

                        <div v-if="jobOffer.status === JobOfferStatus.PUBLISHED">
                            <button
                                class="primary"
                                @click="updateStatus(jobOffer.__id, JobOfferStatus.CLOSED)"
                            >
                                <div>Clore</div>
                            </button>
                        </div>

                        <div v-if="[JobOfferStatus.DRAFT, JobOfferStatus.CLOSED].includes(jobOffer.status)">
                            <button
                                class="primary"
                                @click="updateStatus(jobOffer.__id, JobOfferStatus.ARCHIVED)"
                            >
                                <div>Archiver</div>
                            </button>
                        </div>

                        <router-link
                            v-if="jobOffer.status === JobOfferStatus.PUBLISHED"
                            :to="`/recruiter/${companyName}/jobs/${jobOffer.__id}/candidacies`"
                        >
                            <button class="primary">
                                <div>Voir les candidatures</div>
                            </button>
                        </router-link>

                        <router-link :to="`/recruiter/${companyName}/jobs/${jobOffer.__id}`">
                            <button class="primary border">
                                <div>Voir l'offre</div>
                            </button>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.separator {
    background-color: #e3e4e5;
    border-radius: 20px;
    margin-bottom: 12px;
    height: 2px;
    width: 100%;
}
</style>
