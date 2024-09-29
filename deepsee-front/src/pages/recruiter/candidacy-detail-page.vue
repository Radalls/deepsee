<script lang="ts" setup>
import { Ref, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import arrowLeftIcon from '../../components/icons/arrow-left-icon.vue';
import { Candidacy, CandidacyStatus, candidaciesStatusColumns, candidaciesStatus } from '../../models/candidacy-model';
import { Skill, diplomaTypesTrads, levelsTrads, contractTypesTrads } from '../../models/talent-model';
import { getCandidaciesByJobOffer, getCandidacy, updateCandidacyStatus, deleteCandidacy } from '../../services/candidacy-service';
import { getConversationByCandidacy, postConversation } from '../../services/chat-service';
import { getDiplomaYear, getSkillLevelValue } from '../../utils/model-utils';
import { formatTimeElapsedSince, formatDateMonthYear } from '../../utils/time-utils';

import CandidacyCard from './candidacies/candidacy-card.vue';
import CreateMeetingPopup from './create-meeting-popup.vue';

const route = useRoute();
const router = useRouter();

const companyName = route.params.companyName as string;
const jobOfferId = Number.parseInt(route.params.jobOfferId as string);
const candidacyId = ref(Number.parseInt(route.params.candidacyId as string));

const isOpenMeetingPopup = ref(false);
const isSuccessOnMeetingCreation = ref(false);
const column = ref();
const currentCandidacy: Ref<Candidacy> = ref();
const sameStatusCandidacies: Ref<Candidacy[]> = ref([]);

onMounted(async () => {
    currentCandidacy.value = await getCandidacy({ candidacyId: candidacyId.value });
    column.value = candidaciesStatusColumns.find((column) => column.status === currentCandidacy.value.status);
    sameStatusCandidacies.value = (await getCandidaciesByJobOffer({ jobOfferId }))[currentCandidacy.value.status] ?? [];
});

watch(route, async () => {
    currentCandidacy.value = null;
    candidacyId.value = Number.parseInt(route.params.candidacyId as string);
    currentCandidacy.value = await getCandidacy({ candidacyId: candidacyId.value });
}, { deep: true });

const reloadAfterChangeStatus = async () => {
    sameStatusCandidacies.value = (await getCandidaciesByJobOffer({ jobOfferId }))[currentCandidacy.value.status] ?? [];
    if (sameStatusCandidacies.value.length === 0) {
        router.push(`/recruiter/${companyName}/jobs/${jobOfferId}/candidacies`);
        return;
    }

    currentCandidacy.value = await getCandidacy({ candidacyId: sameStatusCandidacies.value[0].__id });
    router.replace(`/recruiter/${companyName}/jobs/${jobOfferId}/candidacies/${currentCandidacy.value.__id}`);
};

const createAndGoToConversation = async () => {
    const candidacyId = currentCandidacy.value.__id;
    let conversation = await getConversationByCandidacy(candidacyId);
    if (!conversation) {
        conversation = await postConversation(candidacyId);
    }
    router.push(`/recruiter/${companyName}/chat/${conversation.__id}`);
};

const acceptCandidacy = async () => {
    await updateCandidacyStatus({
        candidacyId: currentCandidacy.value.__id,
        status: CandidacyStatus.ACCEPTED,
    });

    await reloadAfterChangeStatus();
};

const rejectCandidacy = async () => {
    await updateCandidacyStatus({
        candidacyId: currentCandidacy.value.__id,
        status: CandidacyStatus.REJECTED,
    });

    await reloadAfterChangeStatus();
};

const selectCandidacy = async () => {
    await updateCandidacyStatus({
        candidacyId: currentCandidacy.value.__id,
        status: CandidacyStatus.SELECTED,
    });

    await reloadAfterChangeStatus();
};

const goToNextStep = async () => {
    await updateCandidacyStatus({
        candidacyId: currentCandidacy.value.__id,
        status: candidaciesStatus[candidaciesStatus.indexOf(currentCandidacy.value.status) + 1],
    });

    await reloadAfterChangeStatus();
};

const deleteSuggestion = async () => {
    await deleteCandidacy({ candidacyId: currentCandidacy.value.__id });
    await reloadAfterChangeStatus();
};

const openMeetingPopup = () => {
    isSuccessOnMeetingCreation.value = false;
    isOpenMeetingPopup.value = true;
};

const closeMeetingPopup = async () => {
    isOpenMeetingPopup.value = false;
    if (isSuccessOnMeetingCreation.value) {
        reloadAfterChangeStatus();
    }
};

const successMeetingPopup = () => {
    isSuccessOnMeetingCreation.value = true;
};

const isTalentSkillLevelMatching = ({ skill }: { skill: Skill }) => {
    const talentSkill = currentCandidacy.value.talentSkills.find((talentSkill) => talentSkill.__id === skill.__id);
    if (!(talentSkill)) {
        return false;
    }

    return getSkillLevelValue(talentSkill.level) >= getSkillLevelValue(skill.level);
};

const isTalentWorkExperienceMatching = () => {
    return currentCandidacy.value.talentYearsOfExperience >= currentCandidacy.value.jobOfferRequiredYearsOfExperience;
};

const isTalentDiplomaMatching = () => {
    return (
        getDiplomaYear(currentCandidacy.value.talentHighestDiploma) >=
        getDiplomaYear(currentCandidacy.value.jobOfferRequiredDiploma)
    );
};
</script>

<template>
    <div
        v-if="sameStatusCandidacies.length > 0"
        class="no-scroll row"
    >
        <div class="kanban row">
            <div
                class="line"
                style="background-color: #D3DAFF"
            />
            <div class="kanban-column column gap-8">
                <div
                    class="chip"
                    style="background-color: #D3DAFF"
                >
                    {{ column.name }}
                </div>

                <router-link
                    v-for="candidacy of sameStatusCandidacies"
                    :key="candidacy._jobOfferId"
                    :to="`/recruiter/${companyName}/jobs/${jobOfferId}/candidacies/${candidacy.__id}`"
                >
                    <candidacy-card
                        :selected="candidacy.__id === candidacyId"
                        :candidacy="candidacy"
                    />
                </router-link>
            </div>
        </div>

        <div
            v-if="currentCandidacy"
            class="width-100 detail"
        >
            <div class="row justify-between gap-8 mb-18">
                <router-link :to="`/recruiter/${companyName}/jobs/${jobOfferId}/candidacies`">
                    <button class="primary border row align-center gap-8">
                        <arrow-left-icon color="#00b2ca" />
                        <div>Retour</div>
                    </button>
                </router-link>

                <div class="row gap-8">
                    <button
                        v-if="[
                            CandidacyStatus.INTERVIEW,
                            CandidacyStatus.PHONE_INTERVIEW,
                        ].includes(currentCandidacy.status)"
                        class="primary row align-center gap-8 medium"
                        @click="openMeetingPopup()"
                    >
                        <img src="/icons/add-icon.png">
                        <div>Créer un rendez-vous</div>
                    </button>

                    <button
                        v-if="![
                            CandidacyStatus.ACCEPTED,
                            CandidacyStatus.REJECTED,
                            CandidacyStatus.INTERVIEW,
                            CandidacyStatus.SUGGESTED
                        ].includes(currentCandidacy.status)"
                        class="primary row align-center gap-8 medium"
                        @click="goToNextStep()"
                    >
                        <img src="/icons/continue-icon.png">
                        <div>Passer à l'étape suivante</div>
                    </button>

                    <button
                        v-if="currentCandidacy.status === CandidacyStatus.INTERVIEW"
                        class="primary row align-center gap-8 medium"
                        @click="acceptCandidacy()"
                    >
                        <img src="/icons/continue-icon.png">
                        <div>Accepter</div>
                    </button>

                    <button
                        v-if="![
                            CandidacyStatus.ACCEPTED,
                            CandidacyStatus.REJECTED,
                            CandidacyStatus.SUGGESTED
                        ].includes(currentCandidacy.status)"
                        class="primary row align-center gap-8 medium"
                        @click="rejectCandidacy()"
                    >
                        <img src="/icons/continue-icon.png">
                        <div>Refuser</div>
                    </button>

                    <button
                        v-if="currentCandidacy.status === CandidacyStatus.SUGGESTED"
                        class="primary row align-center gap-8 medium"
                        @click="selectCandidacy()"
                    >
                        <img src="/icons/refused-icon.png">
                        <div>Sélectionner</div>
                    </button>

                    <button
                        v-if="currentCandidacy.status === CandidacyStatus.SUGGESTED"
                        class="primary row align-center gap-8 medium"
                        @click="deleteSuggestion()"
                    >
                        <img src="/icons/refused-icon.png">
                        <div>Supprimer</div>
                    </button>

                    <button
                        class="primary border small"
                        @click="createAndGoToConversation()"
                    >
                        <img src="/icons/chat-icon.png">
                    </button>

                    <router-link :to="`/recruiter/${companyName}/talent/${currentCandidacy._talentId}`">
                        <button class="primary border small">
                            <img src="/icons/resume-icon.png">
                        </button>
                    </router-link>

                    <router-link :to="`/recruiter/lorem/jobs/${jobOfferId}`">
                        <button class="primary border small">
                            <img src="/icons/file-icon.png">
                        </button>
                    </router-link>
                </div>
            </div>

            <div class="row justify-between align-start">
                <div class="row align-center gap-8 mb-12">
                    <img
                        v-if="currentCandidacy.talentAvatar"
                        width="48"
                        height="38"
                        :src="currentCandidacy.talentAvatar"
                    >
                    <div
                        v-else
                        class="no-avatar"
                        style="height: 38px; width: 48px;"
                    >
                        {{ currentCandidacy.talentFirstName[0] }}{{ currentCandidacy.talentLastName[0] }}
                    </div>

                    <div class="title">
                        {{ currentCandidacy.talentFirstName }} {{ currentCandidacy.talentLastName }}
                    </div>
                </div>

                <div
                    v-if="
                        currentCandidacy.status === CandidacyStatus.PHONE_INTERVIEW
                            && currentCandidacy.phoneInterviewDate
                    "
                >
                    <a
                        target="_blank"
                        style="width: 100%"
                        :href="currentCandidacy.meetLink"
                    >
                        <button
                            class="primary"
                            style="width: 100%"
                        >
                            Entrer dans la réunion
                        </button>
                    </a>
                </div>
            </div>

            <div v-if="currentCandidacy.message">
                <div class="row justify-between mb-8">
                    <div class="subtitle">
                        Message de candidature du talent
                    </div>
                    <div>{{ formatTimeElapsedSince(currentCandidacy.createdAt) }}</div>
                </div>

                <div class="text-justify mb-12">
                    {{ currentCandidacy.message }}
                </div>

                <div class="separator mb-12" />
            </div>

            <div class="subtitle mb-12">
                Expériences professionnelles du talent
            </div>

            <div class="column gap-18">
                <div
                    v-for="workExperience of currentCandidacy.talentWorkExperience"
                    :key="workExperience.__id"
                >
                    <div class="bold">
                        {{ contractTypesTrads[workExperience.contractType] }} - {{ workExperience.title }}
                    </div>
                    <div class="mb-8">
                        {{ workExperience.companyName }}
                    </div>
                    <div>{{ formatDateMonthYear(workExperience.startedAt) }} - {{ formatDateMonthYear(workExperience.endedAt) }}</div>
                </div>

                <div v-if="currentCandidacy.talentWorkExperience?.length === 0">
                    Aucune expérience
                </div>
            </div>

            <div class="separator mt-12 mb-12" />

            <div class="subtitle mb-12">
                Expériences attendues
            </div>

            <div class="column gap-8">
                <div class="row justify-between gap-8 bold">
                    <div class="row align-center gap-8">
                        <img src="/icons/work-icon.png">
                        <div>Expérience professionnelle de {{ currentCandidacy.jobOfferRequiredYearsOfExperience }} ans</div>
                    </div>

                    <div
                        v-if="isTalentWorkExperienceMatching()"
                        class="row align-center gap-8"
                    >
                        <div>Niveau attendu</div>
                        <img src="/icons/check-icon.png">
                    </div>

                    <div
                        v-else
                        class="row align-center gap-8"
                    >
                        <div>Niveau insuffisant</div>
                        <img src="/icons/cancel-icon.png">
                    </div>
                </div>

                <div class="row justify-between gap-8 bold">
                    <div class="row align-center gap-8">
                        <img src="/icons/school-icon.png">
                        <div>{{ diplomaTypesTrads[currentCandidacy.jobOfferRequiredDiploma] }}</div>
                    </div>

                    <div
                        v-if="isTalentDiplomaMatching()"
                        class="row align-center gap-8"
                    >
                        <div>Niveau attendu</div>
                        <img src="/icons/check-icon.png">
                    </div>

                    <div
                        v-else
                        class="row align-center gap-8"
                    >
                        <div>Niveau insuffisant</div>
                        <img src="/icons/cancel-icon.png">
                    </div>
                </div>
            </div>

            <div class="separator mt-12 mb-12" />

            <div class="subtitle mb-12">
                Compétences attendues
            </div>

            <div class="column gap-12">
                <div
                    v-for="jobOfferSkill of currentCandidacy.jobOfferSkills"
                    :key="jobOfferSkill.__id"
                    class="row justify-between gap-8 bold"
                >
                    <div class="row align-center gap-8">
                        <img
                            width="28"
                            :src="jobOfferSkill.logo"
                        >
                        <div>{{ jobOfferSkill.name }} - {{ levelsTrads[jobOfferSkill.level] }}</div>
                    </div>

                    <div
                        v-if="isTalentSkillLevelMatching({ skill: jobOfferSkill })"
                        class="row align-center gap-8"
                    >
                        <div>Niveau attendu</div>
                        <img src="/icons/check-icon.png">
                    </div>

                    <div
                        v-else
                        class="row align-center gap-8"
                    >
                        <div>Niveau insuffisant</div>
                        <img src="/icons/cancel-icon.png">
                    </div>
                </div>
            </div>
        </div>

        <div
            v-else
            class="detail row justify-center align-center"
        >
            <spinner-component />
        </div>
    </div>

    <div
        v-else
        class="no-scroll row justify-center align-center"
    >
        <spinner-component />
    </div>

    <popup-component
        content-class="width-60"
        title="Créer un rendez vous"
        :is-open="isOpenMeetingPopup"
        @close="closeMeetingPopup()"
    >
        <create-meeting-popup
            :candidacy="currentCandidacy"
            @success="successMeetingPopup"
        />
    </popup-component>
</template>

<style lang="scss" scoped>
.kanban-column {
    padding: 0 8px;
    width: 260px;
}

img {
    border-radius: 4px;
    object-fit: cover;
}

.kanban {
    padding: 28px 8px 28px 28px;
}

.line {
    border-radius: 8px;
    height: 100%;
    margin-bottom: 8px;
    width: 2px;
}

.chip {
    border-radius: 4px;
    font-weight: 500;
    padding: 6px 8px;
    width: fit-content;
}

.detail {
    padding: 28px;
    width: 100%;
    border-left: 1.5px solid #EAEAEA;
}
</style>
