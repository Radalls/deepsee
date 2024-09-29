<script lang="ts" setup>
import { ref } from 'vue';

import { Talent } from '../../../models/talent-model';

import EditHeaderPopup from './edit-header-popup.vue';

defineProps<{
    isUserSignedProfile: boolean,
    talent: Talent,
    talentUser: Talent['user'],
}>();

defineEmits<{
    (e: 'reload'): void
}>();

const isEditPopupOpen = ref(false);
</script>

<template>
    <div class="card">
        <div class="row justify-between align-start mb-8">
            <div class="row gap-8">
                <img
                    v-if="talentUser.avatar"
                    class="profile-picture"
                    width="120"
                    height="80"
                    :src="talentUser.avatar"
                >

                <div
                    v-else
                    class="no-avatar"
                    style="height: 80px; width: 120px;"
                >
                    {{ talentUser.firstName[0] }}{{ talentUser.lastName[0] }}
                </div>

                <div class="column justify-between">
                    <div>
                        <div class="title mb-2">
                            {{ talentUser.firstName }} {{ talentUser.lastName }}
                        </div>
                        <div>{{ talent.title ?? '' }}</div>
                    </div>

                    <div class="row gap-12">
                        <a
                            v-for="link of talent.externalLinks"
                            :key="link"
                            :href="link"
                            target="_blank"
                            class="link"
                        >
                            {{ link }}
                        </a>
                    </div>
                </div>
            </div>

            <div class="column align-end gap-8">
                <button
                    v-if="isUserSignedProfile"
                    class="primary"
                    @click="isEditPopupOpen = true"
                >
                    Modifier
                </button>

                <div class="bold">
                    {{ (talent.openToWork) ? 'En recherche' : 'En poste' }}
                </div>
            </div>
        </div>

        <div class="text-justify">
            {{ talent.description }}
        </div>
    </div>

    <popup-component
        content-class="width-60"
        :is-open="isEditPopupOpen"
        title="Modifier l'entête"
        @close="isEditPopupOpen = false"
    >
        <edit-header-popup
            :talent="talent"
            :talent-user="talentUser"
            @reload="$emit('reload')"
        />
    </popup-component>
</template>

