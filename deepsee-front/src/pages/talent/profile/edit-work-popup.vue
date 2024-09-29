<script lang="ts" setup>
import { ref } from 'vue';

import { mockSkills } from '../../../mocks/skill-mock';
import { TalentWorkExperience, ContractTypes, contractTypesOptions } from '../../../models/talent-model';
import { createWorkExperience, updateWorkExperience } from '../../../services/talent-service';
import { useAlertStore } from '../../../stores/alert-store';
import { dateBeforeNow, formatDate, isFormatDateCorrect } from '../../../utils/time-utils';

const props = defineProps<{
    talentId: number,
    workExperience?: TalentWorkExperience,
}>();

const emit = defineEmits<{
    (e: 'reload'): void,
    (e: 'close'): void,
}>();

const { showAlert } = useAlertStore();

const contractTypes = contractTypesOptions;

const isLoading = ref(false);
const title = ref(props.workExperience?.title ?? '');
const contractType = ref(props.workExperience?.contractType ?? '');
const companyName = ref(props.workExperience?.companyName ?? '');
const startedAt = ref(formatDate(props.workExperience?.startedAt) ?? '');
const endedAt = ref(formatDate(props.workExperience?.endedAt) ?? '');
const description = ref(props.workExperience?.description ?? '');
const linkedSkills = ref<string[]>(props.workExperience?.skills.map((s) => s.name) ?? []);

const skills = mockSkills.map((skill: any) => ({
    icon: skill.logo,
    label: skill.name,
}));

const isInfoSaved = () => {
    if (linkedSkills.value.length !== (props.workExperience?.skills ?? []).length) { return false; }

    return title.value === props.workExperience?.title
        && contractType.value === props.workExperience?.contractType
        && companyName.value === props.workExperience?.companyName
        && startedAt.value === formatDate(props.workExperience?.startedAt)
        && endedAt.value === formatDate(props.workExperience?.endedAt)
        && description.value === (props.workExperience?.description ?? '')
        && linkedSkills.value.every((value, index) => value === props.workExperience.skills[index].name);
};

const save = async () => {
    if (!(isFormatDateCorrect(startedAt.value))) {
        showAlert({
            duration: 5000,
            message: 'Veuillez entrer un format de date valide XX/XX/XXXX pour la date de début',
            type: 'error',
        });
        return;
    }

    if (!!endedAt.value && !(isFormatDateCorrect(endedAt.value))) {
        showAlert({
            duration: 5000,
            message: 'Veuillez entrer un format de date valide XX/XX/XXXX pour la date de fin',
            type: 'error',
        });
        return;
    }

    const startedAtSplit = startedAt.value.split('/');
    const startedAtParsed = new Date(
        Number.parseInt(startedAtSplit[2]),
        Number.parseInt(startedAtSplit[1]) - 1,
        Number.parseInt(startedAtSplit[0]),
    );

    const endedAtSplit = endedAt.value.split('/');
    const endedAtParsed = new Date(
        Number.parseInt(endedAtSplit[2]),
        Number.parseInt(endedAtSplit[1]) - 1,
        Number.parseInt(endedAtSplit[0]),
    );

    if (!(dateBeforeNow(startedAtParsed))) {
        showAlert({
            duration: 5000,
            message: 'La date de début doit être antérieure à la date actuelle',
            type: 'error',
        });
        return;
    }

    if (!!(endedAt.value) && !(dateBeforeNow(endedAtParsed))) {
        showAlert({
            duration: 5000,
            message: 'La date de fin doit être antérieure à la date actuelle',
            type: 'error',
        });
        return;
    }

    if (!!(endedAt.value) && startedAtParsed > endedAtParsed) {
        showAlert({
            duration: 5000,
            message: 'La date de début doit être antérieure à la date de fin',
            type: 'error',
        });
        return;
    }

    isLoading.value = true;
    const parseWorkExperience = {
        __id: props.workExperience?.__id,
        companyName: companyName.value,
        contractType: contractType.value as ContractTypes,
        description: description.value,
        endedAt: endedAtParsed,
        skills: linkedSkills.value.map((skill) => mockSkills.find(s => s.name === skill)),
        startedAt: startedAtParsed,
        title: title.value,
    };

    if (!(props.workExperience?.__id)) {
        await createWorkExperience({ talentId: props.talentId, workExperience: parseWorkExperience });
    }
    else {
        await updateWorkExperience({ workExperience: parseWorkExperience });
    }

    emit('reload');
    isLoading.value = false;
    if (!(props.workExperience?.__id)) {
        emit('close');
    }
};

const isEmpty = (): boolean => {
    return !title.value || !companyName.value || !contractType.value || !startedAt.value;
};
</script>

<template>
    <div class="column gap-12">
        <div class="input width-100">
            <div class="label">
                Titre du poste*
            </div>
            <input
                v-model="title"
                placeholder="Veuillez renseigner le titre du poste"
            >
        </div>

        <div class="row gap-8">
            <div class="input width-100">
                <div class="label">
                    Nom de l'entreprise*
                </div>
                <input
                    v-model="companyName"
                    placeholder="Veuillez renseigner le nom de l'entreprise"
                >
            </div>

            <select-input
                v-model="contractType"
                class="width-100"
                label="Contrat*"
                :options="contractTypes"
            />
        </div>

        <div class="row gap-8">
            <div class="input width-100">
                <div class="label">
                    Date de début*
                </div>
                <input
                    v-model="startedAt"
                    placeholder="XX/XX/XXXX"
                >
            </div>

            <div class="input width-100">
                <div class="label">
                    Date de fin
                </div>
                <input
                    v-model="endedAt"
                    placeholder="XX/XX/XXXX"
                >
            </div>
        </div>

        <div class="input">
            <div class="label">
                Description
            </div>

            <textarea
                v-model="description"
                rows="8"
            />
        </div>

        <autocomplete-input
            v-model="linkedSkills"
            label="Compétences liées"
            placeholder="Veuillez renseigner les compétences liées à l'expérience"
            :options="skills"
        />

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

<style lang="scss" scoped>
input[type='checkbox'] {
    height: 18px;
    width: 18px;
    cursor: pointer;
}
</style>
