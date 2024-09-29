<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import arrowLeftIcon from '../../../components/icons/arrow-left-icon.vue';
import { Candidacy, CandidacyStatus, candidaciesStatus, candidaciesStatusColumns } from '../../../models/candidacy-model';
import { getCandidaciesByJobOffer, updateCandidacyStatus  } from '../../../services/candidacy-service';
import { getRecruiter } from '../../../services/recruiter-service';
import { useAuthStore } from '../../../stores/auth-store';

import candidacyCard from './candidacy-card.vue';

const route = useRoute();
const jobOfferId = Number.parseInt(route.params.jobOfferId as string);

const { getUser } = useAuthStore();

const recruiterId = ref(getUser().__id);
const companyName = ref<string | undefined>(undefined);
const candidaciesCheck = ref({});
const candidacies = ref<{ [status in CandidacyStatus]: Candidacy[] } | undefined>(undefined);
const columns = candidaciesStatusColumns;

onMounted(async () => {
    const recruiter = await getRecruiter({ recruiterId: recruiterId.value });
    companyName.value = recruiter.companyName?.toLowerCase();

    candidacies.value = await getCandidaciesByJobOffer({ jobOfferId });
    for (const column of columns) {
        candidacies.value[column.status]?.forEach(candidacy => {
            candidaciesCheck.value = {
                ...candidaciesCheck.value,
                [candidacy.__id]: false,
            };
        });
    }
});

const checkCandidacy = (candidacy: Candidacy) => {
    candidaciesCheck.value[candidacy.__id] = !candidaciesCheck.value[candidacy.__id];
};

const goToNextStep = async () => {
    const status = candidaciesStatus;
    for (const candidacyId of Object.keys(candidaciesCheck.value)) {
        const candidacy = findCandidacyById(Number.parseInt(candidacyId));
        if (candidacy && candidaciesCheck.value[candidacyId]) {

            let nextStatusIndex = status.indexOf(candidacy.status) + 1;
            if (candidacy.status === CandidacyStatus.SUGGESTED) {
                nextStatusIndex++;
            }

            await updateCandidacyStatus({
                candidacyId: candidacy.__id,
                status: status[nextStatusIndex] as CandidacyStatus,
            });
            candidaciesCheck.value[candidacyId] = false;
        }
    }

    candidacies.value = await getCandidaciesByJobOffer({ jobOfferId });
};

const findCandidacyById = (candidacyId: number): Candidacy | undefined => {
    for (const status in candidacies.value) {
        const candidacy = candidacies.value[status].find(c => c.__id === candidacyId);
        if (candidacy) {
            return candidacy;
        }
    }

    return undefined;
};

const canGoToNextStep = () => {
    let currentStatus = null;
    let noCheck = true;

    for (const candidacyId in candidaciesCheck.value) {
        const candidacy = findCandidacyById(Number.parseInt(candidacyId));

        if (candidaciesCheck.value[candidacyId]) {
            noCheck = false;

            if (currentStatus === null) {
                currentStatus = candidacy?.status;
            }

            if (candidacy?.status !== currentStatus) {
                return true;
            }
        }
    }

    return noCheck;
};

const isAllCheckedForStatus = (status: string): boolean => {
    if (!(candidacies.value[status]) || candidacies.value[status].length === 0) { return false; }

    for (const candidacy of candidacies.value[status]) {
        if (!candidaciesCheck.value[candidacy.__id]) {
            return false;
        }
    }

    return true;
};

const checkAllForStatus = (status: string, event: any) => {
    if (!candidacies.value[status]) { return; }

    for (const candidacy of candidacies.value[status]) {
        candidaciesCheck.value[candidacy.__id] = event.target.checked;
    }
};

const isCheckInput = (status: string) => {
    return ![
        CandidacyStatus.INTERVIEW,
        CandidacyStatus.ACCEPTED,
        CandidacyStatus.REJECTED,
    ].includes(status as CandidacyStatus);
};
</script>

<template>
    <div class="no-scroll-page column gap-12">
        <div class="title">
            Suivi des candidatures
        </div>

        <div class="row gap-8 justify-between">
            <router-link
                :to="`/recruiter/${companyName}/jobs`"
            >
                <button class="primary row gap-8 justify-center align-center">
                    <arrow-left-icon color="#fff" />
                    <div>Retour à la liste</div>
                </button>
            </router-link>

            <div>
                <button
                    class="primary"
                    :disabled="canGoToNextStep()"
                    @click="goToNextStep()"
                >
                    Passer à l'étape suivante
                </button>
            </div>
        </div>

        <div
            v-if="!(candidacies)"
            class="row justify-center"
        >
            <spinner-component />
        </div>

        <div
            v-else
            class="kanban row height-100"
        >
            <div
                v-for="column of columns"
                :key="column.status"
                class="row"
            >
                <div
                    class="line"
                    :style="{ 'background-color': column.color }"
                />
                <div class="kanban-column column gap-8">
                    <div
                        class="chip row gap-6 align-center"
                        :class="{ 'input-chip': isCheckInput(column.status) }"
                        :style="{ 'background-color': column.color }"
                    >
                        <input
                            v-if="isCheckInput(column.status)"
                            type="checkbox"
                            :checked="isAllCheckedForStatus(column.status)"
                            @change="checkAllForStatus(column.status, $event)"
                        >
                        <div>{{ column.name }}</div>
                    </div>

                    <router-link
                        v-for="candidacy of candidacies[column.status]"
                        :key="candidacy._jobOfferId"
                        :to="`/recruiter/${companyName}/jobs/${jobOfferId}/candidacies/${candidacy.__id}`"
                    >
                        <candidacy-card
                            :candidacy="candidacy"
                            :is-check-input="isCheckInput(column.status)"
                            :is-check="candidaciesCheck[candidacy.__id]"
                            @check="checkCandidacy(candidacy)"
                        />
                    </router-link>
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

.kanban-column {
    padding: 0 8px;
    width: 260px;
}

.input-chip {
    padding: 4px 10px 4px 6px !important;
}

.chip {
    border-radius: 4px;
    font-weight: 500;
    padding: 6px 8px;
    width: fit-content;

    input {
        height: 18px;
        width: 18px;
        cursor: pointer;
    }
}
</style>
