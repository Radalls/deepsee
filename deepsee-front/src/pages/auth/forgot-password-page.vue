<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { lostPassword } from '../../services/auth-service';
import { useAlertStore } from '../../stores/alert-store';

const router = useRouter();

const { showAlert } = useAlertStore();

const email = ref('');

const onLostPassword = async () => {
    try {
        await lostPassword({ email: email.value });
    } catch (err) {
        showAlert({
            duration: 3000,
            message: 'Une erreur est survenue. Veuillez vérifier votre email.',
            type: 'error',
        });
        return;
    }

    showAlert({
        duration: 3000,
        message: 'Un email vous a été envoyé pour réinitialiser votre mot de passe.',
        type: 'success',
    });

    router.push('/signin');
};
</script>

<template>
    <div
        class="column gap-12"
        style="width: 50%;"
    >
        <div class="mb-12 text-center">
            <h1 class="mb-6">
                Mot de passe oublié
            </h1>
            <div class="text-grey">
                Vous recevrez un mail pour réinitialiser votre mot de passe.
            </div>
        </div>

        <div class="input">
            <div class="label">
                Email
            </div>
            <input
                v-model="email"
                type="text"
            >
        </div>

        <button
            class="primary"
            style="width: 100%;"
            :disabled="!email"
            @click="onLostPassword"
        >
            Réinitialiser mon mot de passe
        </button>
    </div>
</template>
