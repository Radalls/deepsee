<script lang="ts" setup>
import { ref, watch } from 'vue';

import closeIcon from './icons/close-icon.vue';

type Option = {
    icon: string;
    label: string;
}

const props = defineProps<{
    label: string;
    modelValue: string[];
    options: Option[];
    placeholder?: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', val: string[]): void;
}>();

const nbCharBeforeSearch = 0;
const value = ref('');
const autocompleteOptions = ref<Option[]>([]);

watch(() => value.value, (val) => {
    if (val.length < nbCharBeforeSearch) {
        autocompleteOptions.value = [];
        return;
    }

    autocompleteOptions.value = props.options.filter(
        (option) => option.label.toLowerCase().includes(val.toLowerCase()),
    );
    autocompleteOptions.value = autocompleteOptions.value.filter(
        (option) => !(props.modelValue.includes(option.label)),
    );
});

const removeValue = (val: string) => {
    const newModel = props.modelValue.filter((v) => v !== val);
    emit('update:modelValue', newModel);
};

const addValue = (val: string) => {
    const newModel = [...props.modelValue, val];
    emit('update:modelValue', newModel);
    value.value = '';
};

const getIcon = (val: string): string | undefined => {
    return props.options.find((v) => v.label === val)?.icon;
};
</script>

<template>
    <div class="autocomplete input">
        <div class="label">
            {{ label }}
        </div>

        <div
            v-if="modelValue.length > 0"
            class="row wrap gap-8 mb-6"
        >
            <div
                v-for="val in modelValue"
                :key="val"
                class="chip row align-center gap-8"
            >
                <div class="row gap-6">
                    <img
                        v-if="getIcon(val)"
                        :src="getIcon(val)"
                        width="16"
                        height="16"
                    >
                    <div>{{ val }}</div>
                </div>

                <slot
                    name="selection"
                    :val="val"
                />

                <close-icon
                    class="cursor-pointer"
                    color="#00b2ca"
                    width="12"
                    height="12"
                    @click="removeValue(val)"
                />
            </div>
        </div>

        <input
            v-model="value"
            :placeholder="placeholder"
        >

        <div
            v-if="value.length > nbCharBeforeSearch"
            class="suggestions"
        >
            <div
                v-for="option in autocompleteOptions"
                :key="option.label"
                class="item"
                @click="addValue(option.label)"
            >
                <div class="row align-center gap-8">
                    <img
                        v-if="option.icon"
                        :src="option.icon"
                        width="16"
                        height="16"
                    >
                    <div>{{ option.label }}</div>
                </div>
            </div>

            <div
                v-if="value.length > nbCharBeforeSearch && autocompleteOptions.length === 0"
                class="no-result"
            >
                Pas de résultat
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.chip {
    border: solid 2px #00b2ca;
    border-radius: 4px;
    color: #00b2ca;
    font-weight: 600;
    padding: 4px 8px;
}

.autocomplete {
    position: relative;
}

.item {
    cursor: pointer;
    padding: 8px 12px;
}

.item:hover {
    background-color: #eff4f9;
}

.no-result {
    color: #afb9c1;
    font-weight: 500;
    padding: 8px 12px;
}

.suggestions {
    background-color: white;
    border: solid 1px #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    left: 0;
    margin-top: 2px;
    max-height: 120px;
    overflow: auto;
    position: absolute;
    top: 100%;
    width: 100%;
    z-index: 1000;
}
</style>
