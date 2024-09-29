<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { User } from '../../models/user-model';
import { useAlertStore } from '../../stores/alert-store';
import { useAuthStore } from '../../stores/auth-store';

const route = useRoute();
const userRole = route.query.role as User['role'];

const router = useRouter();

const { setCompany } = useAuthStore();

const { showAlert } = useAlertStore();

const companyBusiness = ref<string | undefined>(undefined);
const companyDescription = ref<string | undefined>(undefined);
const companyName = ref<string | undefined>(undefined);

const onSubmit = async () => {
    setCompany({
        company: {
            business: companyBusiness.value,
            description: companyDescription.value,
            name: companyName.value,
        },
    });

    showAlert({
        duration: 5000,
        message: 'Votre espace entreprise a bien été créé.\nVeuillez maintenant créer votre compte personnel.',
        type: 'success',
    });

    router.push(`/signup?role=${userRole}`);
};

const isEmpty = () => {
    return !companyName.value || !companyBusiness.value || !companyDescription.value;
};
</script>

<template>
    <div
        class="column gap-12"
        style="width: 50%;"
    >
        <h1 class="text-center mb-12">
            Création de l'espace entreprise
        </h1>

        <div class="input">
            <div class="label">
                Nom de l'entreprise*
            </div>
            <input
                v-model="companyName"
                type="text"
            >
        </div>

        <div class="input">
            <div class="label">
                Secteur de l'entreprise*
            </div>
            <input
                v-model="companyBusiness"
                type="text"
            >
        </div>

        <div class="input">
            <div class="label">
                Description de l'entreprise*
            </div>
            <textarea
                v-model="companyDescription"
                rows="6"
            />
        </div>

        <button
            class="primary"
            style="width: 100%;"
            :disabled="isEmpty()"
            @click="onSubmit"
        >
            Créer mon espace entreprise
        </button>
    </div>
</template>
