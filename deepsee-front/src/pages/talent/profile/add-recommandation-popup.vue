<script lang="ts" setup>
import { ref } from 'vue';

import { mockSkills } from '../../../mocks/skill-mock';
import { TalentRecommandation, TalentWorkExperience } from '../../../models/talent-model';
import { createRecommandation, updateRecommandation } from '../../../services/talent-service';
import { useAuthStore } from '../../../stores/auth-store';

const props = defineProps<{
    recommandation?: TalentRecommandation
    talentId: number,
    workExperiences?: TalentWorkExperience[],
}>();

const emit = defineEmits<{
  (e: 'reload'): void,
  (e: 'close'): void,
}>();

const { getUser } = useAuthStore();

const skillsOptions = mockSkills.map((skill: any) => ({
    icon: skill.logo,
    label: skill.name,
}));
const experiencesOptions = [{ label: 'Aucune', value: '' }];
experiencesOptions.push(...props.workExperiences.map(
    (experience: any) => ({
        label: `${experience.title} - ${experience.companyName}`,
        value: `${experience.title} - ${experience.companyName}`,
    })),
);

const isLoading = ref(false);
const newRecommandation = ref<string>(props.recommandation?.message || '');
const linkedSkills = ref<string[]>(props.recommandation?.skills.map((s) => s.name) ?? []);
const linkedExperience = ref<string>(props.recommandation?._experienceId ? `${props.recommandation.experienceTitle} - ${props.recommandation.experienceCompanyName}` : '');

const save = async () => {
    isLoading.value = true;

    if (!(props.recommandation?.__id)) {
        await createRecommandation({
            recommandation: {
                _authorId: getUser().__id,
                _experienceId: props.workExperiences.find((e) => linkedExperience.value === `${e.title} - ${e.companyName}`)?.__id,
                _recipientId: props.talentId,
                message: newRecommandation.value,
                skills: linkedSkills.value.map((skill) => mockSkills.find(s => s.name === skill)),
            },
        });
    } else {
        await updateRecommandation({
            recommandation: {
                __id: props.recommandation.__id,
                _experienceId: props.workExperiences.find((e) => linkedExperience.value === `${e.title} - ${e.companyName}`)?.__id ?? null,
                message: newRecommandation.value,
                skills: linkedSkills.value.map((skill) => mockSkills.find(s => s.name === skill)),
            },
        });
    }

    isLoading.value = false;

    emit('reload');
    if (!(props.recommandation?.__id)) {
        emit('close');
        return;
    }
};

const isInfoSaved = () => {
    if (linkedSkills.value.length !== (props.recommandation?.skills ?? []).length) { return false; }

    return newRecommandation.value === props.recommandation?.message
        && linkedExperience.value === (props.recommandation._experienceId ? `${props.recommandation?.experienceTitle} - ${props.recommandation?.experienceCompanyName}` : '')
        && linkedSkills.value.every((value, index) => value === props.recommandation.skills[index].name);
};

const isEmpty = () => {
    return !newRecommandation.value;
};
</script>

<template>
    <div class="column gap-18">
        <div class="text-grey text-justify">
            Aidez-nous à mieux comprendre les compétences et les qualités professionnelles
            de Steven Universe en partageant votre expérience de travail avec ce candidat.
        </div>

        <div class="input">
            <div class="label">
                Recommandation*
            </div>
            <textarea
                v-model="newRecommandation"
                rows="12"
            />
        </div>

        <autocomplete-input
            v-model="linkedSkills"
            label="Compétences liées"
            placeholder="Ecriver les compétences liées à votre recommandation"
            :options="skillsOptions"
        />

        <select-input
            v-model="linkedExperience"
            label="Expérience liée"
            placeholder="Sélectionner l'expérience liée à votre recommandation"
            :options="experiencesOptions"
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
