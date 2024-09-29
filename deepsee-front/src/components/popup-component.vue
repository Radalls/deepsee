<script lang="ts" setup>
import { ref, watch } from 'vue';

import closeIcon from './icons/close-icon.vue';

const props = defineProps<{
    contentClass?: string;
    isOpen: boolean;
    title?: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void
}>();

// Permet d'avoir une animation plus complète
const isPopupOpen = ref(false);
const showContent = ref(false);

// Permet d'empêcher le scroll quand la popup est visible
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        isPopupOpen.value = true;
        setTimeout(() => { showContent.value = true; }, 60);
        document.body.style.overflow = 'hidden';
    } else {
        showContent.value = false;
        document.body.style.overflow = '';
    }
});

watch(() => showContent.value, (showContent) => {
    if (!showContent) {
        setTimeout(() => {
            isPopupOpen.value = false;
            emit('close');
        }, 60);
    }
});

</script>

<template>
    <transition name="fade">
        <div
            v-if="isPopupOpen"
            class="popup-container"
            @click="showContent = false"
        >
            <transition
                name="slide"
                @after-leave="emit('close')"
            >
                <div
                    v-if="showContent"
                    class="popup-content"
                    :class="contentClass"
                    @click.stop
                >
                    <div class="row justify-between align-center gap-28 mb-12">
                        <div class="title">
                            {{ title }}
                        </div>

                        <button
                            class="icon"
                            @click="showContent = false"
                        >
                            <close-icon />
                        </button>
                    </div>

                    <div>
                        <slot />
                    </div>
                </div>
            </transition>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
.popup-container {
    background-color: rgba(0, 0, 0, 0.5);
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;

    .popup-content {
        background-color: white;
        border-radius: 8px;
        left: 50%;
        padding: 18px;
        position: fixed;
        top: 50%;
        transform: translate(-50%, -50%);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.4s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translate(-50%, -45%) !important;
}
</style>
