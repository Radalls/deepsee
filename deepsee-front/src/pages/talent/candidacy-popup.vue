<script lang="ts" setup>
import { ref } from 'vue';

import { createCandidacy } from '../../services/candidacy-service';

const props = defineProps<{
    jobOfferId: number;
    userId: number;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'apply-success'): void;
}>();

const candidacyMessage = ref('');
const isApplySuccess = ref(false);
const isLoadingApply = ref(false);

const closePopup = () => {
    emit('close');
};

const submit = async () => {
    isLoadingApply.value = true;
    await createCandidacy({
        jobOfferId: props.jobOfferId,
        message: candidacyMessage.value,
        talentId: props.userId,
    });
    isLoadingApply.value = false;
    isApplySuccess.value = true;
    emit('apply-success');
};
</script>

<template>
    <div
        v-if="isLoadingApply"
        class="row justify-center align-center"
        style="height: 320px;"
    >
        <spinner-component text="Envoi en cours" />
    </div>

    <div
        v-else-if="isApplySuccess"
        class="row justify-center subtitle align-center text-primary"
        style="height: 320px;"
    >
        Votre candidature a bien été envoyée !
    </div>

    <div v-else>
        <div class="input mb-8">
            <div class="label">
                Message de candidature
            </div>
            <textarea
                v-model="candidacyMessage"
                rows="12"
            />
        </div>

        <div class="row justify-between">
            <button
                class="primary border"
                @click="closePopup()"
            >
                Annuler
            </button>
            <button
                class="primary"
                @click="submit()"
            >
                Envoyer
            </button>
        </div>
    </div>
</template>
