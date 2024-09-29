<script lang="ts" setup>
import { ref } from 'vue';

import { Talent, levelsTrads } from '../../../models/talent-model';

import editSkillsPopup from './edit-skills-popup.vue';

defineProps<{
    isUserSignedProfile: boolean,
    skills: Talent['skills'],
    talentId: number,
}>();

defineEmits<{
    (e: 'reload'): void
}>();

const isEditPopupOpen = ref(false);
</script>

<template>
    <div class="card">
        <div class="row align-center justify-between mb-18">
            <div class="title">
                Compétences
            </div>

            <button
                v-if="isUserSignedProfile"
                class="primary"
                @click="isEditPopupOpen = true"
            >
                Modifier
            </button>
        </div>

        <div class="row wrap gap-12 mb-8">
            <div
                v-for="skill of skills"
                :key="skill.name"
                class="row gap-6"
            >
                <img
                    height="16"
                    width="16"
                    :src="skill.logo"
                >
                <div class="bold">
                    {{ skill.name }} - {{ levelsTrads[skill.level] }}
                </div>
            </div>

            <div v-if="skills.length === 0">
                Aucune compétences enregistrées
            </div>
        </div>
    </div>

    <popup-component
        content-class="width-60"
        :is-open="isEditPopupOpen"
        title="Modifier les compétences"
        @close="isEditPopupOpen = false"
    >
        <edit-skills-popup
            :talent-id="talentId"
            :skills="skills"
            @reload="$emit('reload')"
        />
    </popup-component>
</template>
