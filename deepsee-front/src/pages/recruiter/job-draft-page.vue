<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import GaugeComponent from '../../components/gauge-component.vue';
import arrowLeftIcon from '../../components/icons/arrow-left-icon.vue';
import { mockSkills } from '../../mocks/skill-mock';
import { JobOffer, JobOfferTest } from '../../models/job-model';
import { Recruiter } from '../../models/recruiter-model';
import { Skill, SkillLevels, diplomaTypesOptions, contractTypesOptions, levelsOptions } from '../../models/talent-model';
import { createJobOffer, updateJobOffer, getJobOffer, getJobOfferTest } from '../../services/job-service';
import { getRecruiter } from '../../services/recruiter-service';
import { useAlertStore } from '../../stores/alert-store';
import { useAuthStore } from '../../stores/auth-store';
import { parseValue } from '../../utils/parse-utils';

import JobDraftTestPopup from './job-draft-test-popup.vue';

const router = useRouter();

const route = useRoute();
const jobOfferId = Number.parseInt(route.params.jobOfferId as string);

const { getUser } = useAuthStore();
const recruiterId = ref(getUser().__id);

const { showAlert } = useAlertStore();

const isEditTestPopupOpen = ref(false);
const isSaveSuccess = ref(false);
const isLoading = ref(true);
const isLoadingSave = ref(false);

const jobOffer = ref<JobOffer>(undefined);
const jobOfferTest = ref<JobOfferTest>(undefined);
const recruiter = ref<Recruiter>(undefined);
const companyId = ref<number | undefined>(undefined);
const companyName = ref<string | undefined>(undefined);

const title = ref<JobOffer['title']>(undefined);
const contract = ref<string>('');
const location = ref<JobOffer['location']>(undefined);
const stringSkills = ref<string[]>([]);
const requiredDiploma = ref<string>('');
const requiredSkills = ref<Skill[]>([]);
const requiredYearsOfExperience = ref<string>('');
const mainDescription = ref<JobOffer['mainDescription']>(undefined);
const workDescription = ref<JobOffer['workDescription']>(undefined);
const requirementDescription = ref<JobOffer['requirementDescription']>(undefined);

const testSavedInstructions = ref<string | undefined>(undefined);
const testSavedDuration = ref<string | undefined>(undefined);
const testSavedUnitName = ref<string | undefined>(undefined);
const testSavedUnits = ref<{ expected: string, params: string }[]>(undefined);

const skills = mockSkills.map((skill: any) => ({
    icon: skill.logo,
    id: skill.id,
    label: skill.name,
    open: ref(false),
}));

const contractTypes = contractTypesOptions;
const levels = levelsOptions;
const diplomaTypes = diplomaTypesOptions;

onMounted(async () => {

    recruiter.value = await getRecruiter({ recruiterId: recruiterId.value });
    companyId.value = recruiter.value._companyId;
    companyName.value = recruiter.value.companyName.toLowerCase();

    if (jobOfferId) {
        jobOffer.value = await getJobOffer({ jobOfferId });

        title.value = jobOffer.value.title;
        contract.value = jobOffer.value.contractType;
        location.value = jobOffer.value.location;
        stringSkills.value = jobOffer.value.requiredSkills.map((s) => s.name);
        requiredDiploma.value = jobOffer.value.requiredDiploma;
        requiredSkills.value = jobOffer.value.requiredSkills;
        requiredYearsOfExperience.value = jobOffer.value.requiredYearsOfExperience.toString();
        mainDescription.value = jobOffer.value.mainDescription;
        workDescription.value = jobOffer.value.workDescription;
        requirementDescription.value = jobOffer.value.requirementDescription;

        if (jobOffer.value._jobOfferTestId) {
            jobOfferTest.value = await getJobOfferTest({ jobOfferTestId: jobOffer.value._jobOfferTestId });

            testSavedInstructions.value = jobOfferTest.value.instructions;
            testSavedDuration.value = (jobOfferTest.value.duration / 60).toString();
            testSavedUnitName.value = jobOfferTest.value.unitName;
            testSavedUnits.value = jobOfferTest.value.units.map((u) => ({
                expected: parseValue(u.expected),
                params: u.params.map(p => parseValue(p)).join(';'),
            }));
        }
    }

    isLoading.value = false;
});

const saveTest = ({ duration, instructions, unitName, units }: {
    duration: string,
    instructions: string,
    unitName: string,
    units: { expected: string, params: string }[],
}) => {
    testSavedInstructions.value = instructions;
    testSavedDuration.value = duration;
    testSavedUnitName.value = unitName;
    testSavedUnits.value = units;
};

const save = async (): Promise<void> => {
    if (Number.isNaN(Number.parseInt(requiredYearsOfExperience.value))) {
        showAlert({
            duration: 3000,
            message: 'L\'expérience requise doit être un nombre',
            type: 'error',
        });
        return;
    }

    isLoadingSave.value = true;

    if (!(jobOfferId)) {
        const res = await createJobOffer({
            jobOffer: {
                companyId: companyId.value,
                contractType: contract.value,
                location: location.value,
                mainDescription: mainDescription.value,
                requiredDiploma: requiredDiploma.value,
                requiredSkills: requiredSkills.value.map((skill) => ({
                    ...mockSkills.find(s => s.name === skill.name),
                    level: skill.level,
                })),
                requiredYearsOfExperience: Number.parseInt(requiredYearsOfExperience.value),
                requirementDescription: requirementDescription.value,
                title: title.value,
                workDescription: workDescription.value,
            },
            jobOfferTest: (isTechnicalTestComplete())
                ? {
                    duration: testSavedDuration.value,
                    instructions: testSavedInstructions.value,
                    unitName: testSavedUnitName.value,
                    units: testSavedUnits.value,
                }
                : undefined,
        });

        router.replace(`/recruiter/${companyName.value}/jobs/draft/${res.jobOffer.__id}`);
        isSaveSuccess.value = true;
    }
    else {
        const {
            jobOffer: updatedJobOffer,
            jobOfferTest: updatedJobOfferTest,
        } = await updateJobOffer({
            jobOffer: {
                __id: jobOffer.value.__id,
                contractType: contract.value,
                location: location.value,
                mainDescription: mainDescription.value,
                requiredDiploma: requiredDiploma.value,
                requiredSkills: requiredSkills.value.map((skill) => ({
                    ...mockSkills.find(s => s.name === skill.name),
                    level: skill.level,
                })),
                requiredYearsOfExperience: Number.parseInt(requiredYearsOfExperience.value),
                requirementDescription: requirementDescription.value,
                title: title.value,
                workDescription: workDescription.value,
            },
            jobOfferTest: (isTechnicalTestComplete())
                ? {
                    __id: jobOfferTest.value.__id,
                    duration: testSavedDuration.value,
                    instructions: testSavedInstructions.value,
                    unitName: testSavedUnitName.value,
                    units: testSavedUnits.value,
                }
                : undefined,
        });

        jobOffer.value = updatedJobOffer;
        jobOfferTest.value = updatedJobOfferTest;
        isSaveSuccess.value = true;
    }

    isLoadingSave.value = false;
};

const deleteTechnicalTest = () => {
    testSavedDuration.value = undefined;
    testSavedInstructions.value = undefined;
    testSavedUnitName.value = undefined;
    testSavedUnits.value = undefined;
};

const isTechnicalTestComplete = () => {
    return !!(
        testSavedDuration.value
        && testSavedInstructions.value
        && testSavedUnitName.value
        && testSavedUnits.value
    );
};

const isTechnicalTestIncomplete = () => {
    return !!(
        testSavedDuration.value
        || testSavedInstructions.value
        || testSavedUnitName.value
        || testSavedUnits.value
    );
};

const isSkillLevelOnFocus = ({ label }: { label: string }): boolean => {
    const skill = skills.find((s) => s.label === label);
    if (!(skill)) return false;
    return skill.open.value;
};

const onSkillLevelFocus = ({ label, close }: {
    close?: boolean,
    label: string,
}): void => {
    const skill = skills.find((s) => s.label === label);
    if (!(skill)) {
        return;
    }

    if (close) {
        skill.open.value = false;
        return;
    }

    skill.open.value = !(skill.open.value);
};

const selectSkillLevel = ({ level, val }: { level: any, val: string }) => {
    const selectedSkill = requiredSkills.value.find((s) => s.name === val);
    if (!(selectedSkill)) {
        return;
    }

    selectedSkill.level = level;
};

const getSkillLevel = ({ val }: { val: string }) => {
    const selectedSkill = requiredSkills.value.find((s) => s.name === val);
    if (!(selectedSkill)) {
        return;
    }

    const level = levels.find((l) => l.value === selectedSkill.level);

    return level?.label;
};

const addSkill = () => {
    requiredSkills.value = stringSkills.value.map((skill) => {
        const existentSkill = requiredSkills.value.find((s) => s.name === skill);
        if (existentSkill) return existentSkill;

        const currentSkill = skills.find((s) => s.label === skill);

        return {
            __id: currentSkill.id,
            level: SkillLevels.PROFESSIONAL,
            logo: undefined,
            name: skill,
        };
    });
};

const getDraftCompletionValue = () => {
    let percentage = 0;
    if (title.value) percentage += 10;
    if (contract.value) percentage += 10;
    if (location.value) percentage += 10;
    if (requiredSkills.value.length) percentage += 10;
    if (requiredDiploma.value) percentage += 10;
    if (requiredYearsOfExperience.value) percentage += 10;
    if (mainDescription.value) percentage += 10;
    if (workDescription.value) percentage += 10;
    if (requirementDescription.value) percentage += 10;
    if (isTechnicalTestComplete()) percentage += 10;

    return percentage;
};
</script>

<template>
    <div class="page">
        <div class="mb-8">
            <router-link
                :to="`/recruiter/${companyName}/jobs`"
            >
                <button class="primary row gap-8 justify-center align-center">
                    <arrow-left-icon color="#fff" />
                    <div>Retour à la liste</div>
                </button>
            </router-link>
        </div>

        <div
            v-if="isLoading"
            class="row justify-center"
        >
            <spinner-component />
        </div>

        <div
            v-else
            class="row gap-28 align-start"
        >
            <div class="column gap-8 width-100">
                <div class="card column gap-8">
                    <div class="input">
                        <div class="label">
                            Titre de l'offre*
                        </div>
                        <input v-model="title">
                    </div>

                    <div class="row gap-18">
                        <select-input
                            v-model="contract"
                            class="width-100"
                            label="Contrat*"
                            :options="contractTypes"
                        />
                        <div class="input width-100">
                            <div class="label">
                                Adresse*
                            </div>
                            <input v-model="location">
                        </div>
                    </div>

                    <autocomplete-input
                        v-model="stringSkills"
                        label="Compétences liées*"
                        placeholder="Ecriver les compétences liées à votre offre"
                        :options="skills"
                        @update:model-value="addSkill"
                    >
                        <template #selection="{ val }">
                            <div class="row align-center gap-6">
                                <span>-</span>
                                <button
                                    class="primary small dropdown"
                                    @click="onSkillLevelFocus({ label: val })"
                                    @focusout="onSkillLevelFocus({ label: val, close: true })"
                                >
                                    <span>{{ getSkillLevel({ val }) }}</span>
                                    <dropdown-component
                                        :is-open="isSkillLevelOnFocus({ label: val })"
                                        :options="levels"
                                        @select="selectSkillLevel({ level: $event, val })"
                                    />
                                </button>
                            </div>
                        </template>
                    </autocomplete-input>
                </div>

                <div class="card">
                    <div class="row gap-18">
                        <select-input
                            v-model="requiredDiploma"
                            class="width-100"
                            label="Diplôme requis*"
                            :options="diplomaTypes"
                        />
                        <div class="input width-100">
                            <div class="label">
                                Expérience requise*
                            </div>
                            <input v-model="requiredYearsOfExperience">
                        </div>
                    </div>
                </div>

                <div class="card column gap-8">
                    <div class="card">
                        <div
                            v-if="isTechnicalTestComplete()"
                            class="row align-center gap-8"
                        >
                            <img src="/icons/check-icon.png">
                            <div class="bold text-primary">
                                Test technique complet
                            </div>
                        </div>
                        <div
                            v-else-if="isTechnicalTestIncomplete()"
                            class="row align-center gap-8"
                        >
                            <img src="/icons/cancel-icon.png">
                            <div class="bold text-red">
                                Test technique incomplet
                            </div>
                        </div>
                        <div
                            v-else
                            class="row align-center gap-8"
                        >
                            <img src="/icons/neutral-icon.png">
                            <div class="bold text-grey">
                                Aucun test technique
                            </div>
                        </div>
                    </div>

                    <button
                        class="primary"
                        style="width: 100%;"
                        @click="isEditTestPopupOpen = true"
                    >
                        <div v-if="isTechnicalTestIncomplete()">
                            Modifier le test technique
                        </div>
                        <div v-else>
                            Ajouter un test technique
                        </div>
                    </button>

                    <button
                        v-if="isTechnicalTestIncomplete()"
                        class="primary border"
                        style="width: 100%;"
                        @click="deleteTechnicalTest()"
                    >
                        Supprimer le test technique
                    </button>
                </div>

                <div class="card">
                    <div class="input">
                        <div class="label">
                            Description de l'offre*
                        </div>
                        <textarea
                            v-model="mainDescription"
                            rows="12"
                        />
                    </div>
                </div>

                <div class="card">
                    <div class="input">
                        <div class="label">
                            Description du poste / de l'équipe*
                        </div>
                        <textarea
                            v-model="workDescription"
                            rows="8"
                        />
                    </div>
                </div>

                <div class="card">
                    <div class="input">
                        <div class="label">
                            Description des attentes*
                        </div>
                        <textarea
                            v-model="requirementDescription"
                            rows="8"
                        />
                    </div>
                </div>
            </div>

            <div
                class="card column align-center gap-8"
                style="width: 280px"
            >
                <gauge-component :percentage="getDraftCompletionValue()" />

                <button
                    class="primary"
                    style="width: 100%;"
                    :disabled="getDraftCompletionValue() < 100 || isLoadingSave"
                    @click="save()"
                >
                    <spinner-component
                        v-if="isLoadingSave"
                        white
                        small
                    />
                    <div v-else>
                        Enregistrer les modifications
                    </div>
                </button>

                <div
                    v-if="isSaveSuccess"
                    class="row gap-6 align-center bold text-primary text-center"
                >
                    <img
                        height="20"
                        width="20"
                        src="/icons/check-icon.png"
                    >
                    <div>Offre sauvegardée avec succès</div>
                </div>

                <div
                    v-else
                    class="row gap-6 align-center bold text-grey text-center"
                >
                    <img
                        height="20"
                        width="20"
                        src="/icons/neutral-icon.png"
                    >
                    <div>Offre non sauvegardée</div>
                </div>

                <div class="text-center">
                    Un test technique complet est requis.
                </div>
                <div class="text-center">
                    Tout les champs doivent être rempli pour enregistrer l'offre.
                </div>
            </div>
        </div>

        <popup-component
            content-class="width-60"
            title="Test technique"
            :is-open="isEditTestPopupOpen"
            @close="isEditTestPopupOpen = false"
        >
            <job-draft-test-popup
                :saved-duration="testSavedDuration"
                :saved-instructions="testSavedInstructions"
                :saved-unit-name="testSavedUnitName"
                :saved-units="testSavedUnits"
                @close="isEditTestPopupOpen = false"
                @save="saveTest"
            />
        </popup-component>
    </div>
</template>

<style lang="scss" scoped>
</style>
