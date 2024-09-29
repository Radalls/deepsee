<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Talent } from '../../../models/talent-model';
import { getTalent } from '../../../services/talent-service';
import { useAuthStore } from '../../../stores/auth-store';

import educationsSection from './educations-section.vue';
import headerSection from './header-section.vue';
import recommandationsSection from './recommandations-section.vue';
import skillsSection from './skills-section.vue';
import worksSection from './works-section.vue';

const route = useRoute();

const { getUser } = useAuthStore();

const talentId = ref(Number.parseInt(route.params.talentId as string));
const talent = ref<Talent | undefined>(undefined);
const isUserSignedProfile = ref(getUser().__id === talentId.value);

onMounted(async () => {
    await reload();
});

watch(() => route.params.talentId, () => {
    talent.value = null;
    talentId.value = Number.parseInt(route.params.talentId as string);
    isUserSignedProfile.value = getUser().__id === talentId.value;
    reload();
});

const reload = async () => {
    talent.value = await getTalent({ talentId: talentId.value });
};
</script>

<template>
    <div
        v-if="!(talent)"
        class="no-scroll row justify-center align-center"
    >
        <spinner-component />
    </div>

    <div
        v-else
        class="profile-page page column gap-18"
    >
        <header-section
            :talent="talent"
            :talent-user="talent.user"
            :is-user-signed-profile="isUserSignedProfile"
            @reload="reload()"
        />

        <works-section
            :is-user-signed-profile="isUserSignedProfile"
            :talent-id="talentId"
            :work-experiences="talent.workExperiences"
            @reload="reload()"
        />

        <educations-section
            :is-user-signed-profile="isUserSignedProfile"
            :talent-id="talentId"
            :education-experiences="talent.educationExperiences"
            @reload="reload()"
        />

        <skills-section
            :is-user-signed-profile="isUserSignedProfile"
            :talent-id="talentId"
            :skills="talent.skills"
            @reload="reload()"
        />

        <recommandations-section
            :is-user-signed-profile="isUserSignedProfile"
            :talent-id="talentId"
            :work-experiences="talent.workExperiences"
            :recommandations="talent.recommandations"
            @reload="reload()"
        />
    </div>
</template>
