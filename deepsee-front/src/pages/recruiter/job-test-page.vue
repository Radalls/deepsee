<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { JobOffer, JobOfferTest } from '../../models/job-model';
import { getJobOffer, getJobOfferTest, updateJobOfferTestRun, createJobOfferTestRunCode } from '../../services/job-service';
import { useAuthStore } from '../../stores/auth-store';
import { formatTime, startTimer, stopTimer } from '../../utils/time-utils';

import jobTestPopup from './job-test-popup.vue';

const router = useRouter();
const route = useRoute();
const jobOfferId = Number.parseInt(route.params.jobOfferId as string);

const { getUser } = useAuthStore();
const talentId = ref(getUser().__id);

const isInstructionPopupOpen = ref(false);
const jobOffer = ref<JobOffer>(undefined);
const jobOfferTest = ref<JobOfferTest>(undefined);
const testCode = ref<string>(undefined);
const testResult = ref<boolean>(undefined);
const timer = ref<number>(undefined);

onMounted(async () => {
    jobOffer.value = await getJobOffer({ jobOfferId });
    jobOfferTest.value = await getJobOfferTest({ jobOfferTestId: jobOffer.value._jobOfferTestId });
    timer.value = jobOfferTest.value.duration;
    startTimer(timer);
});

onUnmounted(() => {
    stopTimer();
});

const runTestCode = async () => {
    testResult.value = await createJobOfferTestRunCode({
        jobOfferTestId: jobOfferTest.value.__id,
        talentId: talentId.value,
        testCode: testCode.value,
    });

    if (testResult.value) {
        stopTimer();
    }
};

const endTest = async () => {
    await updateJobOfferTestRun({
        jobOfferTestRun: {
            _jobOfferTestId: jobOffer.value._jobOfferTestId,
            _talentId: talentId.value,
            endedAt: new Date(),
        },
    });

    router.push(`/talent/${talentId.value}/search/${jobOfferId}`);
};
</script>

<template>
    <div class="no-scroll-page">
        <div class="row justify-between mb-12">
            <button
                class="primary border"
                @click="isInstructionPopupOpen = true"
            >
                Voir l'énoncé
            </button>
            <div>
                {{ formatTime(timer) }}
            </div>
        </div>
        <div class="column">
            <div class="row justify-end">
                <button
                    class="primary"
                    :disabled="!(testCode) || timer <= 0"
                    @click="runTestCode()"
                >
                    Exécuter
                </button>
            </div>
            <div class="input mb-12">
                <div class="label">
                    Code
                </div>
                <textarea
                    v-model="testCode"
                    rows="20"
                />
            </div>
            <div class="width-100 mb-12">
                <div class="label">
                    Résultat
                </div>
                <div class="result">
                    {{
                        (testResult)
                            ? 'Résultat correct !'
                            : (testResult === false)
                                ? 'Résultat incorrect'
                                : 'Aucun résultat'
                    }}
                </div>
            </div>
            <div class="row gap-12 justify-end">
                <button
                    class="primary border"
                    @click="endTest()"
                >
                    Terminer le test
                </button>
            </div>
        </div>
        <popup-component
            content-class="width-60"
            title="Énoncé"
            :is-open="isInstructionPopupOpen"
            @close="isInstructionPopupOpen = false"
        >
            <job-test-popup
                :instructions="jobOfferTest.instructions"
                @close="isInstructionPopupOpen = false"
            />
        </popup-component>
    </div>
</template>

<style lang="scss" scoped>
.result {
    border: 2px solid #D9D9D9;
    border-radius: 4px;
    padding: 12px;
}
</style>
