<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Candidacy, CandidacyStatus, candidaciesStatus, candidaciesStatusColumns } from '../../models/candidacy-model';
import { getCandidaciesByTalent } from '../../services/candidacy-service';
import { updateJobOfferTestRun } from '../../services/job-service';
import { useAuthStore } from '../../stores/auth-store';
import {
    isTestRunSent,
    isTestRunExpired,
    isTestRunSuccess,
    isTestRunFailure,
    isInterviewOngoing,
} from '../../utils/candidacy-utils';
import { formatDateAndTime } from '../../utils/time-utils';

const router = useRouter();

const { getUser } = useAuthStore();

const talentId = ref(getUser().__id);

const columns = candidaciesStatus;
const kanbanColumns =
    candidaciesStatusColumns.filter(
        column => [
            CandidacyStatus.APPLIED,
            CandidacyStatus.SELECTED,
            CandidacyStatus.ACCEPTED,
            CandidacyStatus.REJECTED,
        ].includes(column.status),
    ).map(column => ({
        ...column,
        name: column.status === CandidacyStatus.SELECTED ? 'Traitement en cours' : column.name,
    }));

const candidacies = ref<{
    [status in CandidacyStatus]?: Candidacy[]
}>({
    ACCEPTED: [],
    APPLIED: [],
    REJECTED: [],
    SELECTED: [],
});

onMounted(async () => {
    const response = await getCandidaciesByTalent({ talentId: talentId.value });
    for (const column of columns) {
        if (candidacies.value[column]) {
            candidacies.value[column] = response[column] ?? [];
        }
        else {
            candidacies.value.SELECTED = [
                ...candidacies.value.SELECTED,
                ...response[column] ?? [],
            ];
        }
    }
});

const startTest = async (candidacy: Candidacy) => {
    await updateJobOfferTestRun({
        jobOfferTestRun: {
            _jobOfferTestId: candidacy._jobOfferTestId,
            _talentId: talentId.value,
            startedAt: new Date(),
        },
    });

    router.push(`/talent/${talentId.value}/search/${candidacy._jobOfferId}/test`);
};
</script>

<template>
    <div class="no-scroll-page column gap-12">
        <div class="title">
            Suivi de vos candidatures
        </div>

        <div
            v-if="candidacies"
            class="kanban row height-100"
        >
            <div
                v-for="column of kanbanColumns"
                :key="column.status"
                class="row width-100"
            >
                <div
                    class="line"
                    :style="{ 'background-color': column.color }"
                />
                <div class="kanban-column column gap-8">
                    <div
                        class="chip"
                        :style="{ 'background-color': column.color }"
                    >
                        {{ column.name }}
                    </div>

                    <div
                        v-for="candidacy of candidacies[column.status]"
                        :key="candidacy._jobOfferId"
                        class="kanban-card column gap-8"
                    >
                        <router-link :to="`/talent/${talentId}/search/${candidacy._jobOfferId}`">
                            <div class="row gap-8">
                                <img
                                    v-if="candidacy.companyAvatar"
                                    height="38"
                                    width="38"
                                    :src="candidacy.companyAvatar"
                                >
                                <div
                                    v-else
                                    class="no-avatar"
                                    style="height: 38px; width: 38px"
                                >
                                    {{ candidacy.companyName[0].toUpperCase() }}
                                </div>

                                <div>
                                    <div class="subtitle">
                                        {{ candidacy.jobOfferTitle }}
                                    </div>
                                    <div>{{ candidacy.companyName }}</div>
                                </div>
                            </div>
                        </router-link>

                        <div
                            v-if="isTestRunSent(candidacy)"
                            class="column gap-8"
                        >
                            <div>
                                Date d'expiration du test : {{ formatDateAndTime(candidacy.testRunStartableUntil) }}
                            </div>

                            <button
                                class="primary"
                                style="width: 100%"
                                @click="startTest(candidacy)"
                                @click.stop
                            >
                                Passer le test
                            </button>
                        </div>

                        <div
                            v-if="isTestRunExpired(candidacy)"
                            class="row gap-6 align-center"
                        >
                            <img
                                height="16"
                                width="16"
                                src="/icons/cancel-icon.png"
                            >
                            <div class="text-red semi-bold">
                                Test expiré
                            </div>
                        </div>

                        <div
                            v-if="isTestRunSuccess(candidacy)"
                            class="row gap-6 align-center"
                        >
                            <img
                                height="16"
                                width="16"
                                src="/icons/check-icon.png"
                            >
                            <div class="text-primary semi-bold">
                                Test réussi
                            </div>
                        </div>

                        <div
                            v-else-if="isTestRunFailure(candidacy)"
                            class="row gap-6 align-center"
                        >
                            <img
                                height="16"
                                width="16"
                                src="/icons/cancel-icon.png"
                            >
                            <div class="text-red semi-bold">
                                Test échoué
                            </div>
                        </div>

                        <div
                            v-if="isInterviewOngoing(candidacy)"
                            class="column gap-8"
                        >
                            <div v-if="candidacy.status === CandidacyStatus.PHONE_INTERVIEW && candidacy.phoneInterviewDate">
                                Date de rendez vous en ligne : {{ formatDateAndTime(candidacy.phoneInterviewDate) }}
                            </div>

                            <a
                                v-if="
                                    candidacy.status === CandidacyStatus.PHONE_INTERVIEW
                                        && candidacy.phoneInterviewDate
                                "
                                target="_blank"
                                style="width: 100%"
                                :href="candidacy.meetLink"
                                @click.stop
                            >
                                <button
                                    class="primary"
                                    style="width: 100%"
                                >
                                    Entrer dans la réunion
                                </button>
                            </a>

                            <div v-if="candidacy.interviewDate">
                                Date de rendez vous : {{ formatDateAndTime(candidacy.interviewDate) }}
                            </div>

                            <router-link
                                v-if="candidacy.interviewDate"
                                :to="`/talent/${talentId}/chat`"
                            >
                                <button
                                    class="primary"
                                    style="width: 100%"
                                >
                                    Voir le lieu de rendez vous
                                </button>
                            </router-link>
                        </div>

                        <router-link
                            v-if="candidacy._conversationId"
                            :to="`/talent/${talentId}/chat`"
                        >
                            <button
                                class="primary"
                                style="width: 100%"
                            >
                                Envoyer un message
                            </button>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.line {
    border-radius: 8px;
    height: 100%;
    margin-bottom: 8px;
    width: 2px;
}

.kanban {
    overflow-x: auto;
}

.kanban-card {
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    width: calc(100% - 8px);
    padding: 4px;
    cursor: pointer;
    transition: all 0.2s;

    img {
        border-radius: 4px;
    }
}

.kanban-card:hover {
    background-color: #f7fbff;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.1);
}

.kanban-column {
    padding: 0 8px;
    width: 100%;
}

.chip {
    border-radius: 4px;
    font-weight: 500;
    padding: 6px 8px;
    width: fit-content;
}
</style>
