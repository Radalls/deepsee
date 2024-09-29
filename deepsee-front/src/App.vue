<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import alertComponent from './components/alert-component.vue';
import headerComponent from './components/header-component.vue';
import { identifyUser } from './services/user-service';
import { useAuthStore } from './stores/auth-store';

const router = useRouter();

const { setUser, isUserSigned, resetToken } = useAuthStore();

const isLoading = ref(true);

onMounted(async () => {
    if (!(isUserSigned())) {
        isLoading.value = false;
        return;
    }

    const user = await identifyUser();
    if (!user) {
        resetToken();
        router.push('/signin');
        isLoading.value = false;
        return;
    }

    setUser({ user });

    isLoading.value = false;
});
</script>

<template>
    <alert-component />
    <div
        v-if="isLoading"
        class="no-scroll row justify-center align-center"
    >
        <spinner-component />
    </div>

    <template v-else>
        <header-component />
        <router-view />
    </template>
</template>

