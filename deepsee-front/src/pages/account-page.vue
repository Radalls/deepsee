<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { deleteCompany, getCompany } from '../services/recruiter-service';
import { deleteUser } from '../services/user-service';
import { useAlertStore } from '../stores/alert-store';
import { useAuthStore } from '../stores/auth-store';

const route = useRoute();
const router = useRouter();

const { showAlert } = useAlertStore();

const { getUser, signOut, isUserRecruiter } = useAuthStore();

const companyName = route.params.companyName as string;
const isLoading = ref(true);
const isDeleteAccountPopupOpen = ref(false);
const isDeleteCompanyPopupOpen = ref(false);
const isUserOwner = ref(false);
const company = ref();
const code = ref();

onMounted(async () => {
    if (isUserRecruiter()) {
        company.value = await getCompany({ companyName });
        isUserOwner.value = company.value._ownerId === getUser().__id;
    }
    isLoading.value = false;
});

const deleteAccount = async () => {
    await deleteUser({ userId: getUser().__id });
    isDeleteAccountPopupOpen.value = false;
    await signOut();
    router.push('/signin');
    showAlert({
        duration: 5000,
        message: 'Votre compte a été supprimée avec succès.',
        type: 'success',
    });
};

const deleteCompanyAccount = async () => {
    await deleteCompany({ companyId: company.value.__id });
    isDeleteCompanyPopupOpen.value = false;
    await signOut();
    router.push('/signin');
    showAlert({
        duration: 5000,
        message: 'Votre entreprise ainsi que votre compte ont été supprimés avec succès.',
        type: 'success',
    });
};
</script>

<template>
    <div v-if="isLoading">
        <spinner-component />
    </div>

    <div
        v-else
        class="page column gap-18"
    >
        <div class="title">
            Paramètres
        </div>

        <div
            v-if="isUserOwner"
            class="column gap-8"
        >
            <div class="subtitle">
                Paramètres de l'entreprise
            </div>

            <button
                class="primary"
                @click="isDeleteCompanyPopupOpen = true"
            >
                Supprimer l'entreprise
            </button>
        </div>

        <div
            v-else
            class="column gap-8"
        >
            <div class="subtitle">
                Paramètres du compte
            </div>

            <button
                class="primary"
                :disabled="isUserOwner"
                @click="isDeleteAccountPopupOpen = true"
            >
                Supprimer mon compte
            </button>
        </div>
    </div>

    <popup-component
        content-class="width-60"
        title="Confirmation de la suppression du compte"
        :is-open="isDeleteAccountPopupOpen"
        @close="isDeleteAccountPopupOpen = false"
    >
        <div class="mb-12">
            <div>
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </div>
            <div>
                Si vous décidez de supprimer votre compte. Vous serez redirigé vers la page de connexion.
            </div>
        </div>

        <div class="input mb-12">
            <div class="label">
                Ecrivez "SUPPRIMER" pour confirmer
            </div>
            <input v-model="code">
        </div>

        <div class="row justify-end">
            <button
                class="primary"
                :disabled="code !== 'SUPPRIMER'"
                @click="deleteAccount()"
            >
                Oui, je veux supprimer mon compte
            </button>
        </div>
    </popup-component>

    <popup-component
        content-class="width-60"
        title="Confirmation de la suppression de l'entreprise"
        :is-open="isDeleteCompanyPopupOpen"
        @close="isDeleteCompanyPopupOpen = false"
    >
        <div class="mb-12">
            <div>
                Êtes-vous sûr de vouloir supprimer votre entreprise ? Cette action est irréversible.
            </div>
            <div>
                Si vous décidez de supprimer votre entreprise,
                votre compte ainsi que ceux de vos collaborateurs seront supprimé.
                Vous serez redirigé vers la page de connexion.
            </div>
        </div>

        <div class="input mb-12">
            <div class="label">
                Ecrivez "SUPPRIMER" pour confirmer
            </div>
            <input v-model="code">
        </div>

        <div class="row justify-end">
            <button
                class="primary"
                :disabled="code !== 'SUPPRIMER'"
                @click="deleteCompanyAccount()"
            >
                Oui, je veux supprimer mon entreprise
            </button>
        </div>
    </popup-component>
</template>
