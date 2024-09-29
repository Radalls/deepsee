<script lang="ts" setup>
import { ref } from 'vue';

import { useAlertStore } from '../../stores/alert-store';

const props = defineProps<{
    savedDuration?: string,
    savedInstructions?: string,
    savedUnitName?: string,
    savedUnits?: { expected: string, params: string }[],
}>();

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'save', val: {
        duration: string,
        instructions: string,
        unitName: string,
        units: { expected: string, params: string }[]
    }): void
}>();

const { showAlert } = useAlertStore();

const instructions = ref<string | undefined>(props.savedInstructions ?? undefined);
const duration = ref<string | undefined>(props.savedDuration ?? undefined);
const unitName = ref<string | undefined>(props.savedUnitName ?? undefined);
const units = ref<{ expected: string, params: string }[]>(props.savedUnits ?? [
    {
        expected: '',
        params: '',
    },
]);

const addUnitTest = () => {
    units.value.push({
        expected: '',
        params: '',
    });
};

const removeUnitTest = ({ index }: { index: number }) => {
    units.value.splice(index, 1);
};

const close = () => {
    emit('close');
};

const save = () => {
    if (Number.isNaN(Number.parseInt(duration.value))) {
        showAlert({
            duration: 3000,
            message: 'La durée du test doit être un nombre',
            type: 'error',
        });
        return;
    }

    if (Number.parseInt(duration.value) < 1) {
        showAlert({
            duration: 3000,
            message: 'La durée du test doit être supérieur à 0',
            type: 'error',
        });
        return;
    }

    for (const unit of units.value) {
        const params = '[' + unit.params.split(';').join(',') + ']';
        const expected = unit.expected;

        try {
            JSON.parse(params);
        } catch (err) {
            showAlert({
                duration: 3000,
                message: `Le paramètre "${unit.params}" doit pouvoir être interprété comme du JSON`,
                type: 'error',
            });
            return;
        }

        try {
            JSON.parse(expected);
        } catch (err) {
            showAlert({
                duration: 3000,
                message: `Le résultat attendu "${unit.expected}" doit pouvoir être interprété comme du JSON`,
                type: 'error',
            });
            return;
        }
    }

    emit('save', {
        duration: duration.value,
        instructions: instructions.value,
        unitName: unitName.value,
        units: units.value,
    });

    close();
};

const isFormComplete = () => {
    return instructions.value
        && duration.value
        && unitName.value
        && units.value.length > 0
        && units.value.every(unit => unit.expected && unit.params);
};
</script>

<template>
    <div class="column gap-18 mb-18 scroll">
        <div class="input">
            <div class="label">
                Instructions*
            </div>
            <textarea
                v-model="instructions"
                rows="3"
            />
        </div>

        <div class="input">
            <div class="label">
                Durée*
            </div>
            <div class="row gap-8 align-center">
                <input v-model="duration">
                <div>minutes</div>
            </div>
        </div>

        <div class="input">
            <div class="label">
                Nom de la fonction*
            </div>
            <input v-model="unitName">
        </div>

        <div
            v-for="(unit, index) in units"
            :key="index"
            class="row gap-18 align-end"
        >
            <div class="input width-100">
                <div class="label">
                    Paramètres*
                </div>
                <input v-model="unit.params">
            </div>
            <div class="input width-100">
                <div class="label">
                    Résultat attendu*
                </div>
                <input v-model="unit.expected">
            </div>

            <div>
                <button
                    class="primary"
                    :disabled="index === 0"
                    @click="removeUnitTest({ index })"
                >
                    Supprimer
                </button>
            </div>
        </div>

        <div>
            <button
                class="primary"
                :disabled="units.length >= 10"
                @click="addUnitTest()"
            >
                Ajouter
            </button>
        </div>
    </div>
    <div class="row justify-between">
        <button
            class="primary border"
            @click="close()"
        >
            Annuler
        </button>

        <button
            class="primary"
            :disabled="!isFormComplete()"
            @click="save()"
        >
            Enregistrer
        </button>
    </div>
</template>

<style lang="scss" scoped>
.scroll {
    overflow-y: auto;
    height: 60vh;
}
</style>
