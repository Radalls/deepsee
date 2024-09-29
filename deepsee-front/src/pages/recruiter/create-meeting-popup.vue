<script lang="ts" setup>
import { ref } from 'vue';

import { Candidacy, CandidacyStatus } from '../../models/candidacy-model';
import { createMeeting } from '../../services/candidacy-service';
import { useAlertStore } from '../../stores/alert-store';
import { useAuthStore } from '../../stores/auth-store';
import { dateBeforeNow, isFormatDateCorrect, isFormatTimeCorrect } from '../../utils/time-utils';

const props = defineProps<{
    candidacy: Candidacy
}>();

const emit = defineEmits<{
    (e: 'success'): void
}>();

const { getUser } = useAuthStore();
const { showAlert } = useAlertStore();

const isSuccess = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const date = ref<string>('');
const time = ref<string>('');
const address = ref<string>('');

const onSave = async () => {
    if (!(isFormatDateCorrect(date.value))) {
        showAlert({
            duration: 5000,
            message: 'Veuillez entrer un format de date valide XX/XX/XXXX',
            type: 'error',
        });
        return;
    }

    if (!(isFormatTimeCorrect(time.value))) {
        showAlert({
            duration: 5000,
            message: 'Veuillez entrer un format d\'heure valide XX:XX',
            type: 'error',
        });
        return;
    }

    const dateSplit = date.value.split('/');
    const timeSplit = time.value.split(':');
    const datetime = new Date(
        Number.parseInt(dateSplit[2]),
        Number.parseInt(dateSplit[1]) - 1,
        Number.parseInt(dateSplit[0]),
        Number.parseInt(timeSplit[0]),
        Number.parseInt(timeSplit[1]),
    );

    if (dateBeforeNow(datetime)) {
        showAlert({
            duration: 5000,
            message: 'La date de rendez-vous doit être d\'aujourd\'hui ou plus tard',
            type: 'error',
        });
        return;
    }

    isLoading.value = true;
    await createMeeting({
        address: address.value,
        candidacyId: props.candidacy.__id,
        date: date.value,
        senderId: getUser().__id,
        time: time.value,
    });
    isLoading.value = false;
    isSuccess.value = true;
    emit('success');
};

const isEmpty = (candidacy: Candidacy) => {
    if (candidacy.status === CandidacyStatus.INTERVIEW) {
        return !date.value || !time.value || !address.value;
    }
    return !date.value || !time.value;
};
</script>

<template>
    <div
        v-if="isLoading"
        class="row justify-center align-center"
        style="height: 320px;"
    >
        <spinner-component text="Création et envoi en cours" />
    </div>

    <div
        v-else-if="isSuccess"
        class="row justify-center subtitle align-center text-primary"
        style="height: 320px;"
    >
        Le rendez vous a bien été créé et envoyé !
    </div>

    <div
        v-else
        class="column gap-8"
    >
        <div v-if="candidacy.status === CandidacyStatus.PHONE_INTERVIEW">
            Après avoir entré la date et l'heure, un lien de visioconférence sera généré et envoyé au candidat.
        </div>
        <div v-if="candidacy.status === CandidacyStatus.INTERVIEW">
            Après avoir entré la date, l'heure et l'adresse,
            un message sera envoyé au candidat pour lui communiquer les informations.
        </div>

        <div class="input">
            <div class="label">
                Date*
            </div>
            <div class="row gap-8 align-center">
                <input
                    v-model="date"
                    placeholder="XX/XX/XXXX"
                >
            </div>
        </div>

        <div class="input">
            <div class="label">
                Heure*
            </div>
            <div class="row gap-8 align-center">
                <input
                    v-model="time"
                    placeholder="XX:XX"
                >
            </div>
        </div>

        <div
            v-if="candidacy.status === CandidacyStatus.INTERVIEW"
            class="input"
        >
            <div class="label">
                Adresse du rendez vous*
            </div>
            <div class="row gap-8 align-center">
                <input v-model="address">
            </div>
        </div>

        <div class="row justify-end">
            <button
                class="primary"
                :disabled="isEmpty(props.candidacy)"
                @click="onSave"
            >
                Créer le rendez vous
            </button>
        </div>
    </div>
</template>
