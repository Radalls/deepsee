<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Company } from '../../models/recruiter-model';
import { createCompanyInvite, getCompany } from '../../services/recruiter-service';
import { createSubscriptionSession, createPortalSession } from '../../services/sub-service';
import { useAlertStore } from '../../stores/alert-store';

const emit = defineEmits<{
    (e: 'close'): void
}>();

const route = useRoute();
const companyName = route.params.companyName as string;

const { showAlert } = useAlertStore();

const isLoading = ref(true);

const company = ref<Company | undefined>(undefined);
const emails = ref<string>(undefined);

onMounted(async () => {
    company.value = await getCompany({ companyName });

    isLoading.value = false;
});

const close = () => {
    emit('close');
};

const subscribe = async () => {
    isLoading.value = true;

    const session = await createSubscriptionSession({
        companyId: company.value.__id,
    });

    if (session.url) {
        window.location.href = session.url;
    } else {
        showAlert({
            duration: 3000,
            message: 'La session de paiement a échoué. Veuillez réssayer ultérieurement.',
            type: 'error',
        });
    }

    isLoading.value = false;
};

const portal = async () => {
    isLoading.value = true;

    const portalSession = await createPortalSession({
        companyId: company.value.__id,
        sessionId: company.value.subId,
    });

    if (portalSession.url) {
        window.location.href = portalSession.url;
    } else {
        showAlert({
            duration: 3000,
            message: 'L\'accès au portail a échoué. Veuillez réssayer ultérieurement.',
            type: 'error',
        });
    }
};

const send = async () => {
    isLoading.value = true;

    const guestEmails = emails.value.split(';');
    for (const email of guestEmails) {
        await createCompanyInvite({
            _companyId: company.value.__id,
            guestEmail: email,
        });
    }

    emails.value = '';
    isLoading.value = false;

    showAlert({
        duration: 3000,
        message: 'Invitation(s) envoyée(s) avec succès',
        type: 'success',
    });

    close();
};

const isFormComplete = () => {
    return emails.value;
};
</script>

<template>
    <div
        v-if="isLoading"
        class="row justify-center"
    >
        <spinner-component />
    </div>

    <div
        v-else-if="!(company.sub)"
        class="column align-center gap-18 mb-18"
    >
        <div>Pour inviter d'autres collaborateurs, vous devez au préalable vous abonner à l'offre Premium.</div>

        <button
            class="primary"
            @click="subscribe()"
        >
            Souscrire à l'offre Premium
        </button>
    </div>

    <div
        v-else
        class="column gap-18"
    >
        <div
            v-if="company.subId"
            class="justify-end"
        >
            <button
                class="primary"
                @click="portal()"
            >
                Gérer mon abonnement
            </button>
        </div>

        <div class="input">
            <div class="label">
                Liste de mails*
            </div>
            <textarea
                v-model="emails"
                rows="3"
            />
        </div>

        <div class="row justify-between">
            <button
                class="primary border"
                @click="close()"
            >
                Annuler
            </button>

            <button
                class="primary"
                :disabled="!isFormComplete()"
                @click="send()"
            >
                Envoyer l'invitation
            </button>
        </div>
    </div>
</template>
