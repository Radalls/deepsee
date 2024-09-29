<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { resetPassword } from '../../services/auth-service';
import { useAlertStore } from '../../stores/alert-store';

const route = useRoute();
const router = useRouter();

const { showAlert } = useAlertStore();

const password = ref('');
const token = route.query.token as string;

const onResetPassword = async () => {
    if (!token) {
        showAlert({
            duration: 5000,
            message: 'Le lien de réinitialisation du mot de passe est invalide.',
            type: 'error',
        });
        return;
    }

    if (!(password.value.length >= 8)) {
        showAlert({
            duration: 5000,
            message: 'Votre mot de passe doit contenir au moins 8 caractères.',
            type: 'error',
        });
        return;
    }

    try {
        await resetPassword({ password: password.value, token });
    } catch (err) {
        showAlert({
            duration: 5000,
            message: 'Le lien de réinitialisation du mot de passe est invalide. Veuillez en demander un nouveau dans "Mot de passe oublié".',
            type: 'error',
        });
        return;
    }

    showAlert({
        duration: 5000,
        message: 'Votre mot de passe a bien été reinitialisé. Vous pouvez maintenant vous connecter.',
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
        <h1 class="text-center mb-12">
            Réinitialisation du mot de passe
        </h1>

        <div class="input">
            <div class="label">
                Nouveau mot de passe
            </div>
            <input
                v-model="password"
                type="password"
            >
        </div>

        <button
            class="primary"
            style="width: 100%;"
            :disabled="!password"
            @click="onResetPassword"
        >
            Réinitialiser mon mot de passe
        </button>
    </div>
</template>
