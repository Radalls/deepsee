<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import arrowLeftIcon from '../../components/icons/arrow-left-icon.vue';
import { Candidacy, CandidacyStatus } from '../../models/candidacy-model';
import { JobOffer } from '../../models/job-model';
import { levelsTrads, contractTypesTrads, diplomaTypesTrads } from '../../models/talent-model';
import { getTalentCandidacyForJobOffer } from '../../services/candidacy-service';
import { getJobOffer, updateJobOfferTestRun } from '../../services/job-service';
import { getRecruiter } from '../../services/recruiter-service';
import { useAuthStore } from '../../stores/auth-store';
import { formatTimeElapsedSince } from '../../utils/time-utils';
import CandidacyPopup from '../talent/candidacy-popup.vue';

const router = useRouter();
const route = useRoute();
const jobOfferId = Number.parseInt(route.params.jobOfferId as string);

const { getUser, isUserTalent, isUserRecruiter } = useAuthStore();
const userId = ref(getUser().__id);

const isLoading = ref(true);

const companyName = ref<string | undefined>(undefined);
const jobOffer = ref<JobOffer | undefined>(undefined);
const candidacy = ref<Candidacy | undefined>(undefined);

const isCandidacyPopupOpen = ref(false);
const isUserCandidate = ref(false);
const isTestAvailable = ref(false);
const isTestStartable = ref(false);
const isTestDone = ref(false);

onMounted(async () => {
    jobOffer.value = await getJobOffer({ jobOfferId });

    if (isUserTalent()) {
        candidacy.value = await getTalentCandidacyForJobOffer({
            jobOfferId,
            talentId: userId.value,
        });

        isUserCandidate.value = (!!candidacy.value)
            && !(candidacy.value?.status === CandidacyStatus.SUGGESTED && !candidacy.value?.message);

        isTestAvailable.value = !!candidacy.value.testRunStartableUntil;
        isTestStartable.value = isTestAvailable.value && new Date(candidacy.value.testRunStartableUntil) > new Date();
        isTestDone.value = !!candidacy.value.testRunEndedAt;
    }
    else if (isUserRecruiter()) {
        const recruiter = await getRecruiter({ recruiterId: userId.value });
        companyName.value = recruiter.companyName.toLowerCase();
    }

    isLoading.value = false;
});

const createCandidacy = async () => {
    if (isUserTalent()) {
        isCandidacyPopupOpen.value = true;
    }
    else {
        //TODO: error toast
    }
};

const closeCandidacyPopup = () => {
    isCandidacyPopupOpen.value = false;
};

const onCandidacySuccess = () => {
    isUserCandidate.value = true;
};

const startTest = async () => {
    await updateJobOfferTestRun({
        jobOfferTestRun: {
            _jobOfferTestId: jobOffer.value._jobOfferTestId,
            _talentId: userId.value,
            startedAt: new Date(),
        },
    });

    router.push(`/talent/${userId.value}/search/${jobOfferId}/test`);
};
</script>

<template>
    <div
        v-if="isLoading"
        class="row justify-center"
    >
        <spinner-component />
    </div>

    <div
        v-else
        class="page"
    >
        <div class="mb-8 row justify-between">
            <router-link
                :to="(isUserRecruiter())
                    ? `/recruiter/${companyName}/jobs`
                    : `/talent/${userId}/search`"
            >
                <button class="primary row gap-8 justify-center align-center">
                    <arrow-left-icon color="#fff" />
                    <div v-if="isUserRecruiter()">
                        Retour à la liste
                    </div>
                    <div v-else>
                        Retour à la recherche
                    </div>
                </button>
            </router-link>

            <div
                v-if="isUserTalent()"
                class="row gap-12"
            >
                <button
                    class="primary"
                    :disabled="isUserCandidate"
                    @click="createCandidacy()"
                >
                    {{ isUserCandidate ? 'Candidature envoyée' : 'Candidater' }}
                </button>

                <button
                    v-if="isTestAvailable"
                    class="primary"
                    :disabled="!(isTestStartable) || isTestDone"
                    @click="startTest()"
                >
                    Tester
                </button>
            </div>
        </div>

        <div class="column gap-18">
            <div class="card">
                <div class="row gap-8 mb-12">
                    <img
                        v-if="jobOffer.companyAvatar"
                        height="68"
                        width="120"
                        :src="jobOffer.companyAvatar"
                    >
                    <div
                        v-else
                        class="no-avatar"
                        style="height: 68px; width: 120px;"
                    >
                        {{ jobOffer.companyName[0].toUpperCase() }}
                    </div>

                    <div class="column justify-between width-100">
                        <div class="row justify-between">
                            <div>
                                <div class="subtitle">
                                    {{ jobOffer.title }}
                                </div>
                                <router-link
                                    :to="(isUserRecruiter())
                                        ? `/recruiter/${companyName}`
                                        : `/talent/${userId}/company/${jobOffer.companyName.toLowerCase()}`"
                                    class="link"
                                >
                                    {{ jobOffer.companyName }}
                                </router-link>
                            </div>

                            <div v-if="jobOffer.publishedAt">
                                {{ formatTimeElapsedSince(jobOffer.publishedAt) }}
                            </div>
                        </div>
                        <div>
                            <div class="row gap-12">
                                <div class="row align-center gap-6">
                                    <img
                                        height="16"
                                        src="/icons/location-icon.png"
                                    >
                                    <div>{{ jobOffer.location }}</div>
                                </div>
                                <div class="row gap-6">
                                    <img
                                        height="16"
                                        src="/icons/contract-icon.png"
                                    >
                                    <div>{{ contractTypesTrads[jobOffer.contractType] }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row gap-8 mb-12">
                    <div class="row align-center gap-8">
                        <img src="/icons/work-icon.png">
                        <div class="bold">
                            {{ jobOffer.requiredYearsOfExperience }} ans
                        </div>
                    </div>

                    <div class="row align-center gap-8">
                        <img src="/icons/school-icon.png">
                        <div class="bold">
                            {{ diplomaTypesTrads[jobOffer.requiredDiploma] }}
                        </div>
                    </div>
                </div>

                <div class="row gap-12">
                    <div
                        v-for="skill of jobOffer.requiredSkills"
                        :key="skill.name"
                        class="row gap-6"
                    >
                        <img
                            height="16"
                            width="16"
                            :src="skill.logo"
                        >
                        <div class="bold">
                            {{ skill.name }} - {{ levelsTrads[skill.level] }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="subtitle mb-8">
                    Description de l'entreprise
                </div>
                <div class="text-justify">
                    {{ jobOffer.companyDescription }}
                </div>
            </div>

            <div class="card">
                <div class="subtitle mb-8">
                    Description de l'offre
                </div>
                <div class="text-justify">
                    {{ jobOffer.mainDescription }}
                </div>
            </div>

            <div class="card">
                <div class="subtitle mb-8">
                    Description du poste / de l'équipe
                </div>
                <div class="text-justify">
                    {{ jobOffer.workDescription }}
                </div>
            </div>

            <div class="card">
                <div class="subtitle mb-8">
                    Description des attentes
                </div>
                <div class="text-justify">
                    {{ jobOffer.requirementDescription }}
                </div>
            </div>
        </div>
    </div>

    <popup-component
        content-class="width-60"
        :is-open="isCandidacyPopupOpen"
        :title="`Candidatez à l'offre - ${jobOffer?.title}`"
        @close="closeCandidacyPopup()"
    >
        <candidacy-popup
            :job-offer-id="jobOfferId"
            :user-id="userId"
            @apply-success="onCandidacySuccess()"
            @close="closeCandidacyPopup()"
        />
    </popup-component>
</template>

<style lang="scss" scoped>
img {
    border-radius: 4px;
    object-fit: cover;
}
</style>
