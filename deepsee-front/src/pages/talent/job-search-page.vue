<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { JobOffer } from '../../models/job-model';
import { contractTypesTrads, contractTypesOptions, TalentSearchConfig } from '../../models/talent-model';
import { getJobOfferSuggestions, searchJobOffers } from '../../services/job-service';
import {
    createTalentSearchConfig,
    getTalentSearchConfigs,
    deleteTalentSearchConfig,
    updateTalentSearchConfigAlert,
} from '../../services/talent-service';
import { useAuthStore } from '../../stores/auth-store';
import { formatTimeElapsedSince } from '../../utils/time-utils';

const { getUser } = useAuthStore();
const talentId = ref(getUser().__id);

const isLoading = ref(true);
const isLoadingSearch = ref(false);
const isLoadingFilter = ref(false);

const searchedJobOffers = ref<JobOffer[]>([]);
const suggestionJobOffers = ref<JobOffer[]>([]);
const searchConfigs = ref<TalentSearchConfig[]>([]);

const form = ref({
    business: '',
    company: '',
    contract: '',
    location: '',
    title: '',
});

//TODO: temp contract options
const contractOptions = [{
    label: 'Tous les contrats',
    value: '',
}];
contractOptions.push(...contractTypesOptions);

onMounted(async () => {
    isLoading.value = true;

    searchedJobOffers.value = await searchJobOffers({ params: form.value });
    suggestionJobOffers.value = await getJobOfferSuggestions({ talentId: talentId.value });
    searchConfigs.value = await getTalentSearchConfigs({ talentId: talentId.value });

    isLoading.value = false;
});

const formIsEmpty = () => {
    return (
        form.value.business === ''
        && form.value.company === ''
        && form.value.contract === ''
        && form.value.location  === ''
        && form.value.title === ''
    );
};

const clickSearch = async () => {
    isLoadingSearch.value = true;

    searchedJobOffers.value = await searchJobOffers({ params: form.value });

    isLoadingSearch.value = false;
};

const onClickTalentSearchConfig = (config: TalentSearchConfig) => {
    form.value.business = config.companyBusiness;
    form.value.company = config.companyName;
    form.value.contract = config.contractType ?? '';
    form.value.location = config.location;
    form.value.title = config.text;
};

const onSaveTalentSearchConfig = async () => {
    isLoadingFilter.value = true;

    const newSearchConfig = await createTalentSearchConfig({
        searchConfig: {
            companyBusiness: form.value.business,
            companyName: form.value.company,
            contractType: form.value.contract,
            location: form.value.location,
            text: form.value.title,
        },
        talentId: talentId.value,
    });

    isLoadingFilter.value = false;

    searchConfigs.value.push(newSearchConfig);
};

const onAlertTalentSearchConfig = async (config: TalentSearchConfig) => {
    isLoadingFilter.value = true;

    const updatedConfig = await updateTalentSearchConfigAlert({
        alert: !(config.alert),
        searchId: config.__id,
    });

    isLoadingFilter.value = false;

    config.alert = updatedConfig.alert;
};

const onDeleteTalentSearchConfig = async (config: TalentSearchConfig) => {
    isLoadingFilter.value = true;

    await deleteTalentSearchConfig({ searchId: config.__id });

    isLoadingFilter.value = false;

    searchConfigs.value = searchConfigs.value.filter(c => c.__id !== config.__id);
};

const constructAlertName = (config: TalentSearchConfig): string => {
    return [config.text, config.contractType, config.companyName, config.companyBusiness, config.location].filter(c => !!c).join(' ');
};
</script>

<template>
    <div class="page row gap-28 justify-center">
        <div class="width-100 column gap-12">
            <div class="subtitle">
                Suggestions
            </div>

            <div
                v-if="isLoading"
                class="mt-12 row justify-center"
            >
                <spinner-component />
            </div>

            <div
                v-else-if="suggestionJobOffers.length === 0"
                class="mt-12 row justify-center"
            >
                Aucune suggestion
            </div>

            <div
                v-else
                class="column gap-12"
            >
                <router-link
                    v-for="offer in suggestionJobOffers"
                    :key="offer.__id"
                    :to="`/talent/${talentId}/search/${offer.__id}`"
                    class="card-offer suggestion column gap-8"
                >
                    <div class="row align-center gap-8">
                        <img
                            v-if="offer.companyAvatar"
                            height="48"
                            width="64"
                            :src="offer.companyAvatar"
                        >
                        <div
                            v-else
                            class="no-avatar"
                            style="height: 48px; width: 64px"
                        >
                            {{ offer?.companyName[0].toUpperCase() }}
                        </div>

                        <div>
                            <div class="bold">
                                {{ offer.title }}
                            </div>
                            <div>{{ offer.companyName }}</div>
                        </div>
                    </div>

                    <div class="column gap-6 width-100">
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

                        <div v-if="offer.publishedAt">
                            {{ formatTimeElapsedSince(offer.publishedAt) }}
                        </div>
                    </div>
                </router-link>
            </div>
        </div>

        <div class="width-60 column gap-12">
            <div class="row gap-8">
                <div class="width-100 column gap-8">
                    <div>
                        <input
                            v-model="form.title"
                            placeholder="Recherche une offre d'emploi"
                        >
                    </div>

                    <div class="row gap-8">
                        <select-input
                            v-model="form.contract"
                            :options="contractOptions"
                        />
                        <input
                            v-model="form.location"
                            placeholder="Ville"
                        >
                        <input
                            v-model="form.company"
                            placeholder="Entreprise"
                        >
                        <input
                            v-model="form.business"
                            placeholder="Secteur"
                        >
                    </div>
                </div>

                <button
                    class="primary"
                    @click="clickSearch()"
                >
                    Rechercher
                </button>
            </div>

            <div
                v-if="isLoading || isLoadingSearch"
                class="mt-12 row justify-center"
            >
                <spinner-component />
            </div>

            <div
                v-else-if="searchedJobOffers.length === 0"
                class="mt-12 row justify-center"
            >
                Aucun résultat pour cette recherche
            </div>

            <div
                v-else
                class="column gap-12"
            >
                <router-link
                    v-for="offer in searchedJobOffers"
                    :key="offer.__id"
                    :to="`/talent/${talentId}/search/${offer.__id}`"
                    class="card-offer row gap-2"
                >
                    <img
                        v-if="offer.companyAvatar"
                        height="80"
                        width="96"
                        :src="offer.companyAvatar"
                    >
                    <div
                        v-else
                        class="no-avatar"
                        style="height: 80px; width: 96px; border-radius: 4px 0 0 4px;"
                    >
                        {{ offer?.companyName[0].toUpperCase() }}
                    </div>

                    <div class="card-content column justify-between width-100">
                        <div class="row justify-between">
                            <div>
                                <div class="subtitle">
                                    {{ offer.title }}
                                </div>
                                <div>{{ offer.companyName }}</div>
                            </div>

                            <div v-if="offer.publishedAt">
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
            </div>
        </div>

        <div class="width-100 column gap-12">
            <div class="subtitle">
                Filtres enregistrés
            </div>

            <div>
                <button
                    class="primary outlined"
                    :disabled="formIsEmpty()"
                    style="width: 100%;"
                    @click="onSaveTalentSearchConfig()"
                >
                    Enregistrer le filtre
                </button>
            </div>

            <div
                v-if="isLoading || isLoadingFilter"
                class="mt-12 row justify-center"
            >
                <spinner-component />
            </div>

            <div
                v-else-if="searchConfigs.length === 0"
                class="mt-12 row justify-center"
            >
                Aucune recherche enregistrée
            </div>

            <div
                v-else
                class="column width-100 gap-12"
            >
                <div
                    v-for="(config, index) in searchConfigs"
                    :key="index"
                    class="card-offer row gap-2"
                    @click="onClickTalentSearchConfig(config)"
                >
                    <div
                        v-if="index > 0"
                        class="separator mt-12 mb-12"
                    />

                    <div class="card-content row align-center justify-between gap-12">
                        <div class="bold text-ellipsis">
                            {{ constructAlertName(config) }}
                        </div>

                        <div class="row align-center">
                            <button
                                class="icon"
                                @click="onAlertTalentSearchConfig(config)"
                                @click.stop
                            >
                                <img
                                    v-if="config.alert"
                                    height="24"
                                    width="24"
                                    src="/icons/alert-active-icon.png"
                                >
                                <img
                                    v-else
                                    height="24"
                                    width="24"
                                    src="/icons/alert-off-icon.png"
                                >
                            </button>

                            <button
                                class="icon"
                                @click="onDeleteTalentSearchConfig(config)"
                                @click.stop
                            >
                                <img src="/icons/cancel-icon.png">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.suggestion {
    padding: 8px;

    img {
        border-radius: 4px !important;
        object-fit: cover;
    }

    .no-avatar {
        border-radius: 4px !important;
    }
}

.card-offer {
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s;

    .card-content {
        width: 100%;
        padding: 8px;
    }

    img {
        border-radius: 4px 0 0 4px;
        object-fit: cover;
    }

    .no-avatar {
        border-radius: 4px 0 0 4px;
    }

    &:hover {
        background-color: #f7fbff;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.1);
    }
}
</style>
