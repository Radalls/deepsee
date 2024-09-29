<script lang="ts" setup>
import { ref, watch } from 'vue';

import { Talent, TalentWorkExperience, contractTypesTrads } from '../../../models/talent-model';
import { deleteWorkExperience } from '../../../services/talent-service';
import { formatDateMonthYear } from '../../../utils/time-utils';

import editWorkPopup from './edit-work-popup.vue';

const props = defineProps<{
    isUserSignedProfile: boolean,
    talentId: number,
    workExperiences: Talent['workExperiences'],
}>();

const emit = defineEmits<{
    (e: 'reload'): void
}>();

const isEditPopupOpen = ref(false);
const workExperienceToEdit = ref();

watch(() => props.workExperiences, () => {
    if (!(workExperienceToEdit.value)) { return; }
    workExperienceToEdit.value = props.workExperiences.find((work) => work.__id === workExperienceToEdit.value.__id);
});

const close = () => {
    isEditPopupOpen.value = false;
    workExperienceToEdit.value = undefined;
};

const editWork = (workExperience: TalentWorkExperience) => {
    isEditPopupOpen.value = true;
    workExperienceToEdit.value = workExperience;
};

const deleteWork = async (workExperience: TalentWorkExperience) => {
    await deleteWorkExperience({ workExperienceId: workExperience.__id });
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
                Expériences professionnelles
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
            v-for="(experience, index) of workExperiences"
            :key="index"
        >
            <div
                v-if="index > 0"
                class="separator mt-12 mb-12"
            />

            <div class="row justify-between mb-8">
                <div>
                    <div class="subtitle">
                        {{ contractTypesTrads[experience.contractType] }} - {{ experience.title }}
                    </div>
                    <div>{{ experience.companyName }}</div>
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
                        @click="editWork(experience)"
                    >
                        Modifier
                    </button>

                    <button
                        class="primary"
                        @click="deleteWork(experience)"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>

        <div v-if="workExperiences.length === 0">
            Aucune expériences professionnelles enregistrées
        </div>
    </div>

    <popup-component
        content-class="width-60"
        :is-open="isEditPopupOpen"
        :title="(workExperienceToEdit)
            ? 'Modifier une expérience professionnelle'
            : 'Ajouter une expérience professionnelle'"
        @close="close()"
    >
        <edit-work-popup
            :work-experience="workExperienceToEdit"
            :talent-id="talentId"
            @reload="reload()"
            @close="close()"
        />
    </popup-component>
</template>
