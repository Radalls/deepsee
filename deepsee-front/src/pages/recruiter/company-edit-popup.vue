<script lang="ts" setup>
import { ref } from 'vue';

import { Company } from '../../models/recruiter-model';
import { updateCompany } from '../../services/recruiter-service';

const props = defineProps<{
    company: Company;
}>();

const emit = defineEmits<{
    (e: 'reload'): void,
}>();

const isLoading = ref(false);
const business = ref(props.company.business ?? '');
const description = ref(props.company.description ?? '');

const isInfoSaved = () => {
    return business.value === props.company.business
        && description.value === props.company.description;
};

const save = async () => {
    await updateCompany({
        company: {
            __id: props.company.__id,
            business: business.value,
            description: description.value,
        },
    });
    emit('reload');
};

const isEmpty = () => {
    return !business.value || !description.value;
};
</script>

<template>
    <div class="column gap-12">
        <div class="input width-100">
            <div class="label">
                Nom de l'entreprise*
            </div>
            <input
                :value="company.name"
                :disabled="true"
            >
        </div>

        <div class="input width-100">
            <div class="label">
                Secteur d'activité*
            </div>
            <input v-model="business">
        </div>

        <div class="input">
            <div class="label">
                Description*
            </div>

            <textarea
                v-model="description"
                rows="8"
            />
        </div>

        <div class="row gap-8 justify-between">
            <div
                v-if="isInfoSaved()"
                class="row gap-8 align-center"
            >
                <img src="/icons/check-icon.png">
                <div class="bold text-primary">
                    Sauvegardé
                </div>
            </div>

            <div
                v-else
                class="row gap-8 align-center"
            >
                <img src="/icons/neutral-icon.png">
                <div class="bold text-grey">
                    Non sauvegardées
                </div>
            </div>

            <button
                class="primary"
                :disabled="isInfoSaved() || isEmpty()"
                @click="save()"
            >
                <spinner-component
                    v-if="isLoading"
                    white
                    small
                />
                <div v-else>
                    Enregistrer
                </div>
            </button>
        </div>
    </div>
</template>
