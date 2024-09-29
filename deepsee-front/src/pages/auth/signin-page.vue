<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { getRecruiter } from '../../services/recruiter-service';
import { useAlertStore } from '../../stores/alert-store';
import { useAuthStore } from '../../stores/auth-store';

const router = useRouter();

const { getUser, isUserTalent, isUserRecruiter, isUserSigned, signIn } = useAuthStore();
const { showAlert } = useAlertStore();

const email = ref<string | undefined>(undefined);
const password = ref<string | undefined>(undefined);

const onSignIn = async () => {
    try {
        await signIn({ email: email.value, password: password.value });
    } catch (err) {
        showAlert({
            duration: 3000,
            message: 'Vos identifiants sont incorrects. Veuillez réessayer.',
            type: 'error',
        });
    }

    if (isUserSigned()) {
        const userId = getUser().__id;

        if (isUserRecruiter()) {
            const recruiter = await getRecruiter({ recruiterId: userId });
            const companyName = recruiter.companyName.toLowerCase();
            router.push(`/recruiter/${companyName}/jobs`);
        }
        else if (isUserTalent()) {
            router.push(`/talent/${userId}/search`);
        }
    }
};

const isEmpty = () => {
    return !(email.value && password.value);
};
</script>

<template>
    <div
        class="column gap-12"
        style="width: 50%;"
    >
        <h1 class="text-center mb-12">
            Bonjour !
        </h1>
        <div class="input">
            <div class="label">
                Email
            </div>
            <input
                v-model="email"
                type="text"
            >
        </div>
        <div class="column">
            <div class="input mb-4">
                <div class="label">
                    Mot de passe
                </div>
                <input
                    v-model="password"
                    type="password"
                >
            </div>
            <router-link
                class="row justify-end mb-8"
                to="/forgot-password"
            >
                <div class="link">
                    Mot de passe oublié ?
                </div>
            </router-link>
        </div>
        <button
            class="primary"
            style="width: 100%;"
            :disabled="isEmpty()"
            @click="onSignIn"
        >
            Se connecter
        </button>
    </div>
</template>
