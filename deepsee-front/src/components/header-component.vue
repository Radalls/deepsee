<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { User } from '../models/user-model';
import { getRecruiter } from '../services/recruiter-service';
import { useAuthStore } from '../stores/auth-store';

const router = useRouter();
const user = ref<User | null>(null);

const { isUserRecruiter, isUserTalent, isUserSigned, signOut, getUser } = useAuthStore();

const companyAvatar = ref<string | undefined>(undefined);
const companyName = ref<string | undefined>(undefined);

const isDropdownOpen = ref(false);

onMounted(async () => {
    if (isUserSigned()) {
        user.value = getUser();

        if (isUserRecruiter()) {
            const recruiter = await getRecruiter({ recruiterId: user.value.__id });
            companyAvatar.value = recruiter.companyAvatar;
            companyName.value = recruiter.companyName.toLowerCase();
        }
    }
});

const openDropdown = () => {
    isDropdownOpen.value = !(isDropdownOpen.value);
    document.addEventListener('click', closeDropdownOutside);
};

const closeDropdownOutside = (event: any) => {
    if (!(event.target.closest('.profile-button-dropdown'))) {
        isDropdownOpen.value = false;
        document.removeEventListener('click', closeDropdownOutside);
    }
};

const onHome = (): string => {
    if (!(isUserSigned())) {
        return '/signin';
    }
    else if (isUserRecruiter() && companyName.value) {
        return `/recruiter/${companyName.value}/jobs`;
    }
    else if (isUserTalent() && user.value) {
        return `/talent/${user.value.__id}/search`;
    }
    else {
        return '/signin';
    }
};

const onSignOut = async () => {
    await signOut();

    router.push('/signin');
};
</script>

<template>
    <div class="header-component row justify-between align-center">
        <router-link :to="onHome()">
            <button class="logo row justify-center">
                <img
                    src="/logo.png"
                    height="58"
                >
            </button>
        </router-link>

        <div
            v-if="!(isUserSigned())"
            class="row gap-12"
        >
            <router-link to="/welcome">
                <button class="primary border">
                    Créer mon compte
                </button>
            </router-link>

            <router-link to="/signin">
                <button class="primary">
                    Se connecter
                </button>
            </router-link>
        </div>

        <template v-else-if="user">
            <div class="row gap-12">
                <router-link
                    v-if="isUserTalent()"
                    :to="`/talent/${user.__id}/candidacies`"
                >
                    <button class="primary border">
                        Mes candidatures
                    </button>
                </router-link>

                <router-link
                    v-if="isUserRecruiter()"
                    :to="`/recruiter/${companyName}`"
                >
                    <div class="profile-button-dropdown">
                        <button class="profile-button">
                            <img
                                v-if="companyAvatar"
                                height="38"
                                width="62"
                                :src="companyAvatar"
                            >
                            <div
                                v-else
                                class="no-avatar"
                                style="height: 38px; width: 62px; border-radius: 4px 0 0 4px;"
                            >
                                {{ companyName?.charAt(0)?.toUpperCase() }}
                            </div>

                            <div
                                v-if="companyName"
                                class="name"
                            >
                                {{ companyName.charAt(0).toUpperCase() + companyName.slice(1) }}
                            </div>
                        </button>
                    </div>
                </router-link>

                <div
                    class="profile-button-dropdown"
                    @click="openDropdown()"
                >
                    <button class="profile-button">
                        <img
                            v-if="user?.avatar"
                            height="38"
                            width="62"
                            :src="user.avatar"
                        >
                        <div
                            v-else
                            class="no-avatar"
                            style="height: 38px; width: 62px; border-radius: 4px 0 0 4px;"
                        >
                            {{ user.firstName[0] }}{{ user.lastName[0] }}
                        </div>

                        <div class="name">
                            {{ user.firstName }}
                        </div>
                    </button>

                    <div
                        v-if="isDropdownOpen"
                        class="dropdown-profile-button"
                    >
                        <router-link
                            v-if="isUserTalent()"
                            :to="`/talent/${user.__id}`"
                        >
                            <div class="dropdown-item">
                                Mon profil
                            </div>
                        </router-link>

                        <router-link
                            :to="(isUserTalent())
                                ? `/talent/${user.__id}/chat`
                                : `/recruiter/${companyName}/chat`"
                        >
                            <div class="dropdown-item">
                                Messagerie
                            </div>
                        </router-link>

                        <router-link
                            :to="(isUserTalent())
                                ? `/talent/${user.__id}/account`
                                : `/recruiter/${companyName}/account`"
                        >
                            <div class="dropdown-item">
                                Paramètres
                            </div>
                        </router-link>

                        <div
                            class="dropdown-item"
                            @click="onSignOut()"
                        >
                            Se deconnecter
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.header-component {
    top: 0;
    z-index: 10;
    border-bottom: solid 2px #e8e8e8;
    height: 70px;
    padding: 0 28px;
    position: fixed;
    width: calc(100% - 56px);
    background-color: white;

    & .profile-button-dropdown {
        position: relative;
    }

    & .profile-button {
        align-items: center;
        border: solid 3px #00b2ca;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        padding: 0px;
        transition: background-color 0.2s;

        & img {
        object-fit: cover;
        }

        & .name {
        color: #00b2ca;
        font-weight: 700;
        padding: 0 12px;
        }

        &:hover {
        background-color: #eff4f9;
        }
    }

    & .dropdown-profile-button {
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        margin-top: 4px;
        position: absolute;
        width: 100%;
    }

    & .dropdown-item {
        cursor: pointer;
        padding: 8px;
    }

    & .dropdown-item:hover {
        background-color: #eff4f9;
    }
}
</style>
