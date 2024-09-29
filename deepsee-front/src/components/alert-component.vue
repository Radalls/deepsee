<script lang="ts" setup>
import { useAlertStore } from '../stores/alert-store';

const { isOpened, getAlert } = useAlertStore();
</script>

<template>
    <div
        class="alert-component"
        :class="{
            show: isOpened(),
            error: getAlert().type === 'error',
            success: getAlert().type === 'success',
            warning: getAlert().type === 'warning',
        }"
    >
        <span v-if="getAlert().message">{{ getAlert().message }}</span>
        <span
            v-if="getAlert().nb > 1"
            class="bold"
        >{{ getAlert().nb }}</span>
    </div>
</template>

<style lang="scss" scoped>
.alert-component {
    background-color: #1b3e80;
    border-radius: 8px;
    box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.1);
    color: white;
    display: flex;
    gap: 12px;
    justify-content: center;
    left: 50%;
    min-width: 420px;
    padding: 12px 16px;
    position: fixed;
    transition: top 0.5s ease-in-out;
    transform: translateX(-50%);
    text-align: center;
    top: -100px;
    z-index: 99999999;

    &.show {
        top: 28px;
    }

    &.error {
        background-color: #ef1d1d;
    }

    &.warning {
        background-color: #f29035;
    }

    &.success {
        background-color: #2dc6c6;
    }
}
</style>
