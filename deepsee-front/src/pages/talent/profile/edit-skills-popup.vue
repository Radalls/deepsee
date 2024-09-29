<script lang="ts" setup>
import { ref, watch } from 'vue';

import { mockSkills } from '../../../mocks/skill-mock';
import { SkillLevels, Talent } from '../../../models/talent-model';
import { updatePersonnalSkills } from '../../../services/talent-service';

const props = defineProps<{
    skills: Talent['skills'],
    talentId: number,
}>();

const emit = defineEmits<{
    (e: 'reload'): void
}>();

const nonPersonnalSkills = props.skills?.filter((s) => s.level !== SkillLevels.SELF_TAUGHT);
const optionSkills = mockSkills.filter((skill) => !(nonPersonnalSkills.find((s) => s.__id === skill.__id)))
    .map((skill: any) => ({
        icon: skill.logo,
        label: skill.name,
    }));

let talentSkills = props.skills?.filter((s) => s.level === SkillLevels.SELF_TAUGHT).map((s) => s.name);

const isLoading = ref(false);
const personnalSkills = ref<string[]>(talentSkills ?? []);

watch(() => props.skills, () => {
    talentSkills = props.skills?.filter((s) => s.level === SkillLevels.SELF_TAUGHT).map((s) => s.name);
});

const isInfoSaved = () => {
    if (personnalSkills.value.length !== (talentSkills ?? []).length) { return false; }

    personnalSkills.value.sort();
    talentSkills.sort();

    return personnalSkills.value.every((value, index) => value === talentSkills[index]);
};

const save = async () => {
    isLoading.value = true;

    await updatePersonnalSkills({
        skills: personnalSkills.value.map((s) => ({
            __id: mockSkills.find((skill) => skill.name === s)?.__id,
            level: SkillLevels.SELF_TAUGHT,
            name: s,
        })),
        talentId: props.talentId,
    });

    emit('reload');
    isLoading.value = false;
};
</script>

<template>
    <div class="column gap-18">
        <div>
            Vous ne pouvez saisir que des compétences d'un niveau "Personnel",
            les autres compétences sont déduites de vos expériences professionnelles et de formations.
        </div>

        <div>
            <div class="label mb-8">
                Compétences professionnelles ou de formations déjà aquises
            </div>

            <div class="row gap-18">
                <div
                    v-for="skill of nonPersonnalSkills"
                    :key="skill.__id"
                    class="row gap-8 align-center"
                >
                    <img
                        height="18"
                        width="18"
                        :src="skill.logo"
                    >
                    <div class="bold">
                        {{ skill.name }}
                    </div>
                </div>
            </div>
        </div>

        <autocomplete-input
            v-model="personnalSkills"
            label="Compétences"
            placeholder="Ecriver vos compétences"
            :options="optionSkills"
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
                :disabled="isInfoSaved()"
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

