<script lang="ts" setup>
import { ref } from 'vue';

import { mockSkills } from '../../../mocks/skill-mock';
import { DiplomaTypes, TalentEducationExperience, diplomaTypesOptions } from '../../../models/talent-model';
import { createEducationExperience, updateEducationExperience } from '../../../services/talent-service';
import { useAlertStore } from '../../../stores/alert-store';
import { dateBeforeNow, formatDate, isFormatDateCorrect } from '../../../utils/time-utils';

const props = defineProps<{
    educationExperience?: TalentEducationExperience,
    talentId: number,
}>();

const emit = defineEmits<{
    (e: 'reload'): void,
    (e: 'close'): void,
}>();

const { showAlert } = useAlertStore();

const diplomaOptions = diplomaTypesOptions;

const isLoading = ref(false);
const title = ref(props.educationExperience?.title ?? '');
const diplomaType = ref(props.educationExperience?.diplomaType ?? '');
const schoolName = ref(props.educationExperience?.schoolName ?? '');
const startedAt = ref(formatDate(props.educationExperience?.startedAt) ?? '');
const endedAt = ref(formatDate(props.educationExperience?.endedAt) ?? '');
const description = ref(props.educationExperience?.description ?? '');
const linkedSkills = ref<string[]>(props.educationExperience?.skills.map((s) => s.name) ?? []);

const skills = mockSkills.map((skill: any) => ({
    icon: skill.logo,
    label: skill.name,
}));

const isInfoSaved = () => {
    if (linkedSkills.value.length !== (props.educationExperience?.skills ?? []).length) { return false; }

    return title.value === props.educationExperience?.title
        && diplomaType.value === props.educationExperience?.diplomaType
        && schoolName.value === props.educationExperience?.schoolName
        && startedAt.value === formatDate(props.educationExperience?.startedAt)
        && endedAt.value === formatDate(props.educationExperience?.endedAt)
        && description.value === (props.educationExperience?.description ?? '')
        && linkedSkills.value.every((value, index) => value === props.educationExperience.skills[index].name);
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
    const parseEducationExperience = {
        __id: props.educationExperience?.__id,
        description: description.value,
        diplomaType: diplomaType.value as DiplomaTypes,
        endedAt: endedAtParsed,
        schoolName: schoolName.value,
        skills: linkedSkills.value.map((skill) => mockSkills.find(s => s.name === skill)),
        startedAt: startedAtParsed,
        title: title.value,
    };

    if (!(props.educationExperience?.__id)) {
        await createEducationExperience({ educationExperience: parseEducationExperience, talentId: props.talentId });
    }
    else {
        await updateEducationExperience({ educationExperience: parseEducationExperience });
    }

    emit('reload');
    isLoading.value = false;
    if (!(props.educationExperience?.__id)) {
        emit('close');
    }
};

const isEmpty = (): boolean => {
    return !title.value || !diplomaType.value || !schoolName.value || !startedAt.value;
};
</script>

<template>
    <div class="column gap-12">
        <div class="input width-100">
            <div class="label">
                Titre*
            </div>
            <input v-model="title">
        </div>

        <div class="row gap-8">
            <div class="input width-100">
                <div class="label">
                    Nom de l'établissement*
                </div>
                <input v-model="schoolName">
            </div>

            <select-input
                v-model="diplomaType"
                class="width-100"
                label="Diplôme*"
                :options="diplomaOptions"
            />
        </div>

        <div class="row gap-8">
            <div class="input width-100">
                <div class="label">
                    Date de début*
                </div>
                <input v-model="startedAt">
            </div>

            <div class="input width-100">
                <div class="label">
                    Date de fin
                </div>
                <input v-model="endedAt">
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
            placeholder="Ecriver les compétences liées à votre recommandation"
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
