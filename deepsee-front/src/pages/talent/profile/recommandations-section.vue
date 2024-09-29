<script lang="ts" setup>
import { ref, watch } from 'vue';

import { Talent, TalentRecommandation } from '../../../models/talent-model';
import { deleteRecommandation } from '../../../services/talent-service';
import { useAuthStore } from '../../../stores/auth-store';
import { formatTimeElapsedSince } from '../../../utils/time-utils';

import AddRecommandationPopup from './add-recommandation-popup.vue';

const props = defineProps<{
    isUserSignedProfile: boolean,
    recommandations: Talent['recommandations'],
    talentId: number,
    workExperiences: Talent['workExperiences'],
}>();

const emit = defineEmits<{
    (e: 'reload'): void
}>();

const { getUser } = useAuthStore();

const isEditPopupOpen = ref(false);
const recommandationToEdit = ref();

watch(() => props.recommandations, () => {
    if (!(recommandationToEdit.value)) { return; }
    recommandationToEdit.value =
        props.recommandations.find((education) => education.__id === recommandationToEdit.value.__id);
});

const close = () => {
    isEditPopupOpen.value = false;
    recommandationToEdit.value = undefined;
};

const reload = () => {
    emit('reload');
};

const editRecommandation = (recommandation: TalentRecommandation) => {
    isEditPopupOpen.value = true;
    recommandationToEdit.value = recommandation;
};

const dropRecommandation = async (recommandation: TalentRecommandation) => {
    await deleteRecommandation({ recommandationId: recommandation.__id });
    emit('reload');
};
</script>

<template>
    <div class="card">
        <div class="row justify-between align-center mb-8">
            <div class="title">
                Recommandations
            </div>

            <button
                v-if="!(isUserSignedProfile)"
                class="primary row align-center gap-8"
                @click="isEditPopupOpen = true"
            >
                <img src="/icons/add-icon.png">
                <div>Ajouter une recommandation</div>
            </button>
        </div>

        <div
            v-for="(recommandation, index) of recommandations"
            :key="index"
        >
            <div
                v-if="index > 0"
                class="separator mt-12 mb-12"
            />

            <div class="row gap-8">
                <img
                    v-if="recommandation.authorAvatar"
                    class="profile-picture"
                    height="64"
                    width="80"
                    :src="recommandation.authorAvatar"
                >

                <div
                    v-else
                    class="no-avatar"
                    style="height: 64px; width: 80px;"
                >
                    {{ recommandation.authorFirstName[0] }}{{ recommandation.authorLastName[0] }}
                </div>

                <div class="width-100">
                    <div class="row justify-between mb-4">
                        <router-link
                            :to="`/talent/${recommandation._authorId}`"
                            class="link"
                        >
                            {{ recommandation.authorFirstName }} {{ recommandation.authorLastName }}
                        </router-link>
                        <div class="caption">
                            {{ formatTimeElapsedSince(recommandation.createdAt) }}
                        </div>
                    </div>

                    <div class="mb-4 text-justify">
                        {{ recommandation.message }}
                    </div>

                    <div
                        v-if="recommandation._experienceId"
                        class="caption"
                    >
                        Expérience de Steven liée :
                        {{ recommandation.experienceTitle }} - {{ recommandation.experienceCompanyName }}
                    </div>

                    <div class="row gap-8 justify-between">
                        <div
                            v-if="recommandation.skills"
                            class="row wrap gap-12 mt-12"
                        >
                            <div
                                v-for="skill of recommandation.skills"
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
                            v-if="recommandation._authorId === getUser().__id"
                            class="row gap-8"
                        >
                            <button
                                class="primary"
                                @click="editRecommandation(recommandation)"
                            >
                                Modifier
                            </button>

                            <button
                                class="primary"
                                @click="dropRecommandation(recommandation)"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="recommandations.length === 0">
            Aucun utilisateur n'a écrit de recommandation pour le moment.
        </div>
    </div>

    <popup-component
        content-class="width-60"
        title="Ajouter une recommandation"
        :is-open="isEditPopupOpen"
        @close="close()"
    >
        <add-recommandation-popup
            :talent-id="talentId"
            :recommandation="recommandationToEdit"
            :work-experiences="workExperiences"
            @close="close()"
            @reload="reload()"
        />
    </popup-component>
</template>
