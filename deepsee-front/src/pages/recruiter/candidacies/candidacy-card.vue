<script lang="ts" setup>
import { Candidacy, CandidacyStatus } from '../../../models/candidacy-model';
import {
    isTestRunSent,
    isTestRunExpired,
    isTestRunSuccess,
    isTestRunFailure,
    isInterviewPending,
    isInterviewOngoing,
    isInterviewDone,
} from '../../../utils/candidacy-utils';

defineProps<{
    candidacy: Candidacy,
    isCheck?: boolean,
    isCheckInput?: boolean
    selected?: boolean,
}>();

const emit = defineEmits<{
    (e: 'check'): void
}>();

const check = () => {
    emit('check');
};
</script>

<template>
    <div
        class="kanban-card"
        :class="{ selected }"
    >
        <div class="row gap-8 align-center">
            <input
                v-if="isCheckInput"
                type="checkbox"
                :checked="isCheck"
                @change="check"
                @click.stop
            >

            <div class="row align-center gap-8">
                <img
                    v-if="candidacy.talentAvatar"
                    height="38"
                    width="38"
                    :src="candidacy.talentAvatar"
                >
                <div
                    v-else
                    class="no-avatar"
                    style="height: 38px; width: 38px"
                >
                    {{ candidacy.talentFirstName[0] }}{{ candidacy.talentLastName[0] }}
                </div>

                <div class="subtitle">
                    {{ candidacy.talentFirstName }} {{ candidacy.talentLastName }}
                </div>
            </div>
        </div>

        <div
            v-if="candidacy.status === CandidacyStatus.SUGGESTED && !!candidacy.message"
            class="row gap-6 align-center mt-8"
        >
            <img
                height="16"
                width="16"
                src="/icons/check-icon.png"
            >
            <div class="text-primary semi-bold">
                Le talent a candidaté
            </div>
        </div>

        <div
            v-if="isTestRunSent(candidacy)"
            class="row gap-6 align-center mt-8"
        >
            <img
                height="16"
                width="16"
                src="/icons/neutral-icon.png"
            >
            <div class="text-grey semi-bold">
                Test envoyé
            </div>
        </div>

        <div
            v-if="isTestRunExpired(candidacy)"
            class="row gap-6 align-center mt-8"
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
            class="row gap-6 align-center mt-8"
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
            v-if="isTestRunFailure(candidacy)"
            class="row gap-6 align-center mt-8"
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
            v-if="isInterviewPending(candidacy)"
            class="row gap-6 align-center mt-8"
        >
            <img
                height="16"
                width="16"
                src="/icons/neutral-icon.png"
            >
            <div class="text-grey semi-bold">
                Rendez vous à prendre
            </div>
        </div>

        <div
            v-if="isInterviewOngoing(candidacy)"
            class="row gap-6 align-center mt-8"
        >
            <img
                height="16"
                width="16"
                src="/icons/neutral-icon.png"
            >
            <div class="text-grey semi-bold">
                Rendez vous pris
            </div>
        </div>

        <div
            v-if="isInterviewDone(candidacy)"
            class="row gap-6 align-center mt-8"
        >
            <img
                height="16"
                width="16"
                src="/icons/check-icon.png"
            >
            <div class="text-grey semi-bold">
                Entretien terminé
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.kanban-card {
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    width: calc(100% - 8px);
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &.selected {
        border: 3px solid #00b2ca;
    }

    input {
        height: 18px;
        width: 18px;
        cursor: pointer;
    }

    img {
        object-fit: cover;
        border-radius: 4px;
    }
}

.kanban-card:hover {
    background-color: #f7fbff;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.1);
}
</style>
