<script lang="ts" setup>
type Option = {
    icon?: string;
    label: string;
    value: string;
}

defineProps<{
    isOpen: boolean;
    options: Option[];
}>();

const emit = defineEmits<{
    (e: 'select', val: string): void;
}>();

const selectOption = (option: string) => {
    emit('select', option);
};
</script>

<template>
    <div
        v-if="isOpen"
        class="options"
    >
        <div
            v-for="option in options"
            :key="option.label"
            class="item"
            @click="selectOption(option.value)"
            @mousedown.prevent
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
            v-if="options.length === 0"
            class="no-result"
        >
            Pas de résultat
        </div>
    </div>
</template>

<style lang="scss" scoped>
.item {
    cursor: pointer;
    padding: 8px 12px;
}

.disabled {
    cursor: pointer;
}

.item:hover {
    background-color: #eff4f9;
}

.no-result {
    color: #afb9c1;
    font-weight: 500;
    padding: 8px 12px;
}

.options {
    background-color: white;
    border: solid 1px #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: #000;
    font-weight: 400;
    left: 0;
    margin-top: 2px;
    max-height: 120px;
    overflow: auto;
    position: absolute;
    top: 100%;
    z-index: 1000;
}
</style>
