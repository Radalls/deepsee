<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { User } from '../../models/user-model';
import { checkCompanyInviteCode } from '../../services/recruiter-service';
import { useAlertStore } from '../../stores/alert-store';
import { useAuthStore } from '../../stores/auth-store';

const route = useRoute();
const userRole = route.query.role as User['role'];

const router = useRouter();

const { setCompanyInvite } = useAuthStore();

const { showAlert } = useAlertStore();

const isLoading = ref(false);
const code = ref<string[]>(['', '', '', '']);
const inputs = ref<HTMLInputElement[]>([]);

const onInput = (index: number, event: any): void => {
    const key = event.code;
    const input = event.target as HTMLInputElement;
    code.value[index] = input.value.charAt(0);

    if (key === 'Backspace' && code.value[index] === '' && index > 0) {
        inputs.value[index - 1].focus();
        return;
    }

    if (key === 'Backspace') {
        return;
    }

    if (key === 'Enter' && code.value.length === 4 && code.value.every((value) => value)) {
        onSubmit();
        return;
    }

    if (input.value && index < code.value.length - 1) {
        inputs.value[index + 1].focus();
    }
};

const onSubmit = async () => {
    isLoading.value = true;
    try {
        const companyInvite = await checkCompanyInviteCode({ code: code.value.join('') });
        setCompanyInvite({ companyInvite });

        showAlert({
            duration: 5000,
            message: 'Bienvenue dans votre espace entreprise !\nVeuillez maintenant créer votre compte personnel.',
            type: 'success',
        });

        router.push(`/signup?role=${userRole}`);

        isLoading.value = false;
    }
    catch (err) {
        showAlert({
            duration: 5000,
            message: 'Le code fourni est incorrect. Veuillez réssayer.',
            type: 'error',
        });

        isLoading.value = false;
        return;
    }
};

const toRecruiterStart = () => {
    router.push(`/recruiter/start?role=${userRole}`);
};
</script>

<template>
    <div v-if="isLoading">
        <spinner-component />
    </div>

    <div
        v-else
        class="column gap-12"
        style="width: 50%;"
    >
        <div class="mb-12 text-center">
            <h1 class="mb-6">
                Rejoindre un espace entreprise
            </h1>
            <div class="text-grey">
                Veuillez saisir le code d’activation de votre compte.
                Contacter votre entreprise pour recevoir ce code par mail
            </div>
        </div>

        <div class="input">
            <div class="label">
                Code d'invitation
            </div>
            <div class="row gap-8">
                <div
                    v-for="(_, index) in code"
                    :key="index"
                >
                    <input
                        ref="inputs"
                        v-model="code[index]"
                        class="code-input"
                        maxlength="1"
                        type="text"
                        @keydown="onInput(index, $event)"
                    >
                </div>
            </div>
        </div>

        <div class="column gap-8">
            <button
                class="primary bold"
                style="width: 100%;"
                :disabled="code.length !== 4"
                @click="onSubmit"
            >
                Rejoindre
            </button>

            <button
                class="primary"
                style="width: 100%"
                :disabled="!(userRole)"
                @click="toRecruiterStart"
            >
                <div class="mb-2 bold">
                    Créer mon entreprise
                </div>
                <div class="caption medium">
                    Votre entreprise n'existe pas sur la plateforme ?
                </div>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.code-input {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    height: 40px;
}
</style>
