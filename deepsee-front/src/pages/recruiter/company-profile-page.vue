<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { JobOffer, JobOfferStatus, JobOfferStatusTrad } from '../../models/job-model';
import { Company } from '../../models/recruiter-model';
import { contractTypesTrads } from '../../models/talent-model';
import { getCompany } from '../../services/recruiter-service';
import { useAuthStore } from '../../stores/auth-store';
import { formatTimeElapsedSince } from '../../utils/time-utils';

import CompanyEditPopup from './company-edit-popup.vue';
import CompanyInvitePopup from './company-invite-popup.vue';

const route = useRoute();

const { getUser, isUserRecruiter, isUserTalent } = useAuthStore();

const companyName = route.params.companyName as string;
const userId = ref(getUser().__id);

const isLoading = ref(true);

const company = ref<Company | undefined>(undefined);
const jobOffers = ref<JobOffer[]>([]);
const isInvitePopupOpen = ref(false);
const isEditPopupOpen = ref(false);

onMounted(async () => {
    await reload();

    isLoading.value = false;
});

const reload = async () => {
    company.value = await getCompany({ companyName });

    if (isUserRecruiter()) {
        jobOffers.value = company.value.jobOffers;
    }
    else if (isUserTalent()) {
        jobOffers.value = company.value.jobOffers.filter((jobOffer) => jobOffer.status === JobOfferStatus.PUBLISHED);
    }
};
</script>

<template>
    <div
        v-if="isLoading"
        class="row justify-center"
    >
        <spinner-component />
    </div>

    <div
        v-else
        class="page column gap-28"
    >
        <div class="card column gap-8">
            <div class="row justify-between">
                <div class="row gap-8">
                    <img
                        v-if="company.avatar"
                        height="68"
                        width="96"
                        :src="company.avatar"
                    >
                    <div
                        v-else
                        class="no-avatar"
                        style="height: 68px; width: 96px;"
                    >
                        {{ company.name[0] }}
                    </div>

                    <div class="card-content column justify-between width-100">
                        <div>
                            <div class="subtitle">
                                {{ company.name }}
                            </div>
                            <div class="semi-bold">
                                {{ company.business }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row align-start gap-8">
                    <div>
                        <button
                            v-if="userId === company._ownerId"
                            class="primary"
                            @click="isInvitePopupOpen = true"
                        >
                            Inviter des collaborateurs
                        </button>
                    </div>

                    <div v-if="userId === company._ownerId">
                        <button
                            class="primary"
                            @click="isEditPopupOpen = true"
                        >
                            Modifier
                        </button>
                    </div>
                </div>
            </div>
            <div class="text-justify">
                {{ company.description }}
            </div>
        </div>

        <div class="card">
            <div class="title mb-8">
                Offres d'emploi
            </div>
            <div class="column gap-12">
                <router-link
                    v-for="offer of jobOffers"
                    :key="offer.__id"
                    :to="(isUserRecruiter())
                        ? `/recruiter/${companyName}/jobs/${offer.__id}`
                        : `/talent/${userId}/search/${offer.__id}`"
                    class="card-offer row gap-2"
                >
                    <img
                        v-if="company.avatar"
                        height="80"
                        width="96"
                        :src="company.avatar"
                    >
                    <div
                        v-else
                        class="no-avatar"
                        style="height: 68px; width: 96px; border-radius: 4px 0 0 4px;"
                    >
                        {{ company.name[0] }}
                    </div>

                    <div class="card-content column justify-between width-100">
                        <div class="row justify-between">
                            <div>
                                <div class="subtitle">
                                    {{ offer.title }}
                                </div>
                                <div>{{ company.name }}</div>
                            </div>
                            <div v-if="offer.status && isUserRecruiter()">
                                {{ JobOfferStatusTrad[offer.status] }}
                            </div>
                            <div v-if="offer.publishedAt && isUserTalent()">
                                {{ formatTimeElapsedSince(offer.publishedAt) }}
                            </div>
                        </div>
                        <div class="row gap-12">
                            <div class="row align-center gap-6">
                                <img
                                    height="16"
                                    src="/icons/location-icon.png"
                                >
                                <div>{{ offer.location }}</div>
                            </div>
                            <div class="row gap-6">
                                <img
                                    height="16"
                                    src="/icons/contract-icon.png"
                                >
                                <div>{{ contractTypesTrads[offer.contractType] }}</div>
                            </div>
                        </div>
                    </div>
                </router-link>
                <div v-if="!(company.jobOffers?.length)">
                    {{ company.name }} n'a pas d'offre d'emploi à pourvoir
                </div>
            </div>
        </div>

        <popup-component
            content-class="width-60"
            title="Inviter des collaborateurs"
            :is-open="isInvitePopupOpen"
            @close="isInvitePopupOpen = false"
        >
            <company-invite-popup
                @close="isInvitePopupOpen = false"
            />
        </popup-component>

        <popup-component
            content-class="width-60"
            title="Modifier les informations de l'entreprise"
            :is-open="isEditPopupOpen"
            @close="isEditPopupOpen = false"
        >
            <company-edit-popup
                :company="company"
                @reload="reload()"
            />
        </popup-component>
    </div>
</template>

<style lang="scss" scoped>
img {
    border-radius: 4px;
    object-fit: cover;
}

.card-offer {
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s;

    .card-content {
        padding: 8px;
    }

    img {
        border-radius: 4px 0 0 4px;
        object-fit: cover;
    }

    &:hover {
        background-color: #f7fbff;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.1);
    }
}
</style>
