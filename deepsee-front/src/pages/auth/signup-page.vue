<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { User } from '../../models/user-model';
import { signUp } from '../../services/auth-service';
import { createCompany } from '../../services/recruiter-service';
import { useAlertStore } from '../../stores/alert-store';
import { useAuthStore } from '../../stores/auth-store';

const route = useRoute();
const userRole = route.query.role as User['role'];

const router = useRouter();

const { getCompany, getCompanyInvite, setCompany, setCompanyInvite } = useAuthStore();
const company = getCompany();
const companyInvite = getCompanyInvite();

const { showAlert } = useAlertStore();

const isLoading = ref(false);

const email = ref<string | undefined>(
    (userRole === 'recruiter' && companyInvite)
        ? companyInvite.guestEmail
        : undefined,
);
const firstName = ref<string | undefined>(undefined);
const lastName = ref<string | undefined>(undefined);
const password = ref<string | undefined>(undefined);

const onSignUp = async () => {
    if (!(email.value.includes('@') && email.value.includes('.'))) {
        showAlert({
            duration: 5000,
            message: 'Veuillez entrer une adresse email valide.',
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

    isLoading.value = true;

    try {
        const { user } = await signUp({
            companyId: (userRole === 'recruiter' && companyInvite)
                ? companyInvite._companyId
                : undefined,
            userCredentials: {
                email: email.value,
                firstName: firstName.value,
                lastName: lastName.value,
                password: password.value,
                role: userRole,
            },
        });

        if (userRole === 'recruiter' && company) {
            await createCompany({
                _ownerId: user.__id,
                business: company.business,
                description: company.description,
                name: company.name,
            });
        }
    } catch (err) {
        showAlert({
            duration: 5000,
            message: 'Une erreur est survenue lors de la création de votre compte. Veuillez vérifier vos informations.',
            type: 'error',
        });

        isLoading.value = false;

        return;
    }

    showAlert({
        duration: 5000,
        message: 'Votre compte a bien été créé. Vous pouvez maintenant vous connecter.',
        type: 'success',
    });

    if (company) {
        setCompany({ company: null });
    }
    if (companyInvite) {
        setCompanyInvite({ companyInvite: null });
    }

    router.push('/signin');

    isLoading.value = false;
};

const isFormInvalid = () => {
    return !email.value || !firstName.value || !lastName.value || !password.value;
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
        <h1 class="text-center mb-12">
            Création de compte
        </h1>

        <div class="row gap-12">
            <div
                class="input"
                style="width: 50%;"
            >
                <div class="label">
                    Prénom
                </div>
                <input
                    v-model="firstName"
                    type="text"
                >
            </div>

            <div
                class="input"
                style="width: 50%;"
            >
                <div class="label">
                    Nom
                </div>
                <input
                    v-model="lastName"
                    type="text"
                >
            </div>
        </div>

        <div class="input">
            <div class="label">
                Email
            </div>
            <input
                v-model="email"
                type="text"
                :disabled="!!companyInvite"
            >
        </div>
        <div class="input">
            <div class="label">
                Mot de passe
            </div>
            <input
                v-model="password"
                type="password"
            >
        </div>

        <button
            class="primary"
            style="width: 100%;"
            :disabled="isFormInvalid()"
            @click="onSignUp"
        >
            Créer mon compte
        </button>
    </div>
</template>
