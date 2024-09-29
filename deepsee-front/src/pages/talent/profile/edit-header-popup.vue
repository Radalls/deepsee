<script lang="ts" setup>
import { ref } from 'vue';

import { Talent } from '../../../models/talent-model';
import { updateTalent } from '../../../services/talent-service';

const props = defineProps<{
    talent: Talent,
    talentUser: Talent['user'],
}>();

const emit = defineEmits<{
    (e: 'reload'): void
}>();

const isLoading = ref(false);
const firstName = ref(props.talentUser.firstName ?? '');
const lastName = ref(props.talentUser.lastName ?? '');
const title = ref(props.talent.title ?? '');
const isOpenToWork = ref(props.talent.openToWork ?? false);
const externalLinks = ref([...(props.talent.externalLinks ?? [])]);
const description = ref(props.talent.description ?? '');

const addLink = () => {
    externalLinks.value.push('');
};

const deleteLink = (index: number) => {
    externalLinks.value.splice(index, 1);
};

const isInfoSaved = () => {
    if (externalLinks.value.length > 0
        && externalLinks.value.length !== (props.talent.externalLinks ?? []).length) { return false; }

    return firstName.value === props.talentUser.firstName
        && lastName.value === props.talentUser.lastName
        && title.value === props.talent.title
        && isOpenToWork.value === props.talent.openToWork
        && (
            (externalLinks.value.length > 0
                && externalLinks.value.every((value, index) => value === props.talent.externalLinks[index])
            ) || (externalLinks.value.length === 0 && props.talent.externalLinks[0] === '')
        )
        && description.value === props.talent.description;
};

const save = async () => {
    isLoading.value = true;
    await updateTalent({
        talent: {
            description: description.value,
            externalLinks: externalLinks.value,
            openToWork: isOpenToWork.value,
            title: title.value,
        },
        talentId: props.talentUser.__id,
        talentUser: {
            firstName: firstName.value,
            lastName: lastName.value,
        },
    });
    emit('reload');
    isLoading.value = false;
};

const isEmpty = () => {
    return firstName.value === '' || lastName.value === '';
};
</script>

<template>
    <div class="column gap-12">
        <div class="row gap-8">
            <div class="input width-100">
                <div class="label">
                    Prénom*
                </div>
                <input v-model="firstName">
            </div>

            <div class="input width-100">
                <div class="label">
                    Nom*
                </div>
                <input v-model="lastName">
            </div>
        </div>

        <div class="input">
            <div class="label">
                Titre
            </div>
            <input v-model="title">
        </div>

        <div class="row align-center gap-8">
            <input
                v-model="isOpenToWork"
                type="checkbox"
            >
            <div class="label">
                En recherche
            </div>
        </div>

        <div>
            <div class="label">
                Liens
            </div>

            <div class="column gap-8 mb-8">
                <div
                    v-for="(_, index) of externalLinks"
                    :key="index"
                    class="row gap-8"
                >
                    <input v-model="externalLinks[index]">
                    <button @click="deleteLink(index)">
                        <img src="/icons/cancel-icon.png">
                    </button>
                </div>
            </div>

            <div>
                <button
                    class="primary"
                    :disabled="externalLinks.length >= 5"
                    @click="addLink()"
                >
                    Ajouter
                </button>
            </div>
        </div>

        <div class="input">
            <div class="label">
                Description
            </div>

            <textarea
                v-model="description"
                rows="8"
            />
        </div>

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
                :disabled="isInfoSaved() || isEmpty() || isLoading"
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

<style lang="scss" scoped>
input[type='checkbox'] {
    height: 18px;
    width: 18px;
    cursor: pointer;
}
</style>
