<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import headerComponent from '../components/header-component.vue';
import { getRecruiter } from '../services/recruiter-service';
import { useAuthStore } from '../stores/auth-store';

const router = useRouter();

const { isUserRecruiter, isUserTalent, isUserSigned, getUser } = useAuthStore();

onMounted(async () => {
    if (!(isUserSigned())) { return; }

    const user = getUser();

    if (isUserRecruiter()) {
        const recruiter = await getRecruiter({ recruiterId: user.__id });
        const companyName = recruiter.companyName.toLowerCase();
        router.replace(`/recruiter/${companyName}/jobs`);
    }

    if (isUserTalent()) {
        router.replace(`/talent/${user.__id}/search`);
    }
});
</script>

<template>
    <div>
        <header-component />
    </div>

    <div class="row no-scroll">
        <img
            style="object-fit: cover;"
            height="100%"
            width="33%"
            src="/background-2.png"
        >

        <div class="row width-100 align-center justify-center">
            <router-view />
        </div>
    </div>
</template>
