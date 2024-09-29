import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAlertStore = defineStore('alert', () => {
    let time = null;
    let initTime = null;

    const isOpen = ref(false);
    const alert = ref({
        message: '',
        nb: 0,
        type: 'info',
    });

    const showAlert = ({ duration, message, type }: { duration: number, message: string, type: string }) => {
        clearTimeout(time);
        clearTimeout(initTime);
        isOpen.value = true;
        alert.value.message = message;
        alert.value.type = type;
        alert.value.nb += 1;

        time = setTimeout(() => {
            initAlert();
        }, duration);
    };

    const initAlert = () => {
        isOpen.value = false;
        initTime = setTimeout(() => {
            alert.value.message = '';
            alert.value.type = 'info';
            alert.value.nb = 0;
        }, 1000);
    };

    const isOpened = (): boolean => isOpen.value;
    const getAlert = () => alert.value;

    return {
        getAlert,
        isOpened,
        showAlert,
    };
});
