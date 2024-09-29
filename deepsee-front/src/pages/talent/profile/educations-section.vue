<script lang="ts" setup>
import { ref, watch } from 'vue';

import { Talent, TalentEducationExperience } from '../../../models/talent-model';
import { deleteEducationExperience } from '../../../services/talent-service';
import { formatDateMonthYear } from '../../../utils/time-utils';

import editEducationPopup from './edit-education-popup.vue';

const props = defineProps<{
    educationExperiences: Talent['educationExperiences'],
    isUserSignedProfile: boolean,
    talentId: number,
}>();

const emit = defineEmits<{
    (e: 'reload'): void
}>();

const isEditPopupOpen = ref(false);
const educationExperienceToEdit = ref();

watch(() => props.educationExperiences, () => {
    if (!(educationExperienceToEdit.value)) { return; }
    educationExperienceToEdit.value =
        props.educationExperiences.find((education) => education.__id === educationExperienceToEdit.value.__id);
});

const close = () => {
    isEditPopupOpen.value = false;
    educationExperienceToEdit.value = undefined;
};

const editEducation = (educationExperience: TalentEducationExperience) => {
    isEditPopupOpen.value = true;
    educationExperienceToEdit.value = educationExperience;
};

const deleteEducation = async (educationExperience: TalentEducationExperience) => {
    await deleteEducationExperience({ educationExperienceId: educationExperience.__id });
    emit('reload');
};

const reload = () => {
    emit('reload');
};
</script>

<template>
    <div class="card">
        <div class="row align-center justify-between mb-18">
            <div class="title">
                Formations
            </div>

            <button
                v-if="isUserSignedProfile"
                class="primary"
                @click="isEditPopupOpen = true"
            >
                Ajouter
            </button>
        </div>

        <div
            v-for="(experience, index) of educationExperiences"
            :key="index"
        >
            <div
                v-if="index > 0"
                class="separator mt-12 mb-12"
            />

            <div class="row justify-between mb-8">
                <div>
                    <div class="subtitle">
                        {{ experience.title }}
                    </div>
                    <div>{{ experience.schoolName }}</div>
                </div>
                <div>{{ formatDateMonthYear(experience.startedAt) }} - {{ experience.endedAt ? formatDateMonthYear(experience.endedAt) : 'Maintenant' }}</div>
            </div>

            <div>{{ experience.description }}</div>

            <div class="row gap-8 justify-between">
                <div class="row gap-12 mt-12">
                    <div
                        v-for="skill of experience.skills"
                        :key="skill.name"
                        class="row gap-6"
                    >
                        <img
                            height="16"
                            width="16"
                            :src="skill.logo"
                        >
                        <div class="bold">
                            {{ skill.name }}
                        </div>
                    </div>
                </div>

                <div
                    v-if="isUserSignedProfile"
                    class="row gap-8"
                >
                    <button
                        class="primary"
                        @click="editEducation(experience)"
                    >
                        Modifier
                    </button>

                    <button
                        class="primary"
                        @click="deleteEducation(experience)"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>

        <div v-if="educationExperiences.length === 0">
            Aucune formations enregistrées
        </div>
    </div>

    <popup-component
        content-class="width-60"
        :is-open="isEditPopupOpen"
        :title="educationExperienceToEdit ? 'Modifier une formation' : 'Ajouter une formation'"
        @close="close()"
    >
        <edit-education-popup
            :education-experience="educationExperienceToEdit"
            :talent-id="talentId"
            @reload="reload()"
            @close="close()"
        />
    </popup-component>
</template>
