<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { User } from '../../models/user-model';

const router = useRouter();

const userRole = ref<User['role'] | undefined>(undefined);

const setRecruiter = () => {
    userRole.value = 'recruiter';
};

const setTalent = () => {
    userRole.value = 'talent';
};

const onSubmit = () => {
    if (userRole.value === 'talent') {
        router.push(`/signup?role=${userRole.value}`);
    }
    else if (userRole.value === 'recruiter') {
        router.push(`recruiter/join?role=${userRole.value}`);
    }
};
</script>

<template>
    <div
        class="column gap-12"
        style="width: 50%;"
    >
        <div class="mb-12 text-center">
            <h1 class="mb-6">
                Bienvenue !
            </h1>
            <div class="text-grey">
                Choisissez votre rôle ci-dessous
            </div>
        </div>

        <div class="row justify-center gap-8">
            <button
                class="primary"
                :class="{ border: userRole !== 'recruiter' }"
                style="height: 80px; width: 50%"
                @click="setRecruiter"
            >
                Je suis recruteur
            </button>

            <button
                class="primary"
                :class="{ border: userRole !== 'talent' }"
                style="height: 80px; width: 50%"
                @click="setTalent"
            >
                Je suis chercheur d'emploi
            </button>
        </div>

        <button
            class="primary"
            style="width: 100%"
            :disabled="!(userRole)"
            @click="onSubmit"
        >
            Continuer vers la création de compte
        </button>
    </div>
</template>
