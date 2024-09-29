import { Ref } from 'vue';

export const isFormatDateCorrect = (date: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(date);
};

export const isFormatTimeCorrect = (date: string): boolean => {
    const regex = /^\d{2}:\d{2}$/;
    return regex.test(date);
};

export const dateBeforeNow = (date: Date): boolean => {
    return date < new Date();
};

export const formatTimeElapsedSince = (dateSince: Date): string => {
    const now = new Date();
    const past = new Date(dateSince);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return `il y a ${interval} ${interval === 1 ? 'année' : 'années'}`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return `il y a ${interval} ${interval === 1 ? 'mois' : 'mois'}`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return `il y a ${interval} ${interval === 1 ? 'jour' : 'jours'}`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return `il y a ${interval} ${interval === 1 ? 'heure' : 'heures'}`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return `il y a ${interval} ${interval === 1 ? 'minute' : 'minutes'}`;
    }

    if (seconds < 5) return 'à l\'instant';

    return `il y a ${Math.floor(seconds)} ${seconds === 1 ? 'seconde' : 'secondes'}`;
};

export const formatDateMonthYear = (date: Date): string => {
    const currentDate = new Date(date);
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
};

export const formatDate = (date: Date): string => {
    if (!date) { return ''; }

    const currentDate = new Date(date);
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};

export const formatDateAndTime = (date: Date): string => {
    if (!date) { return ''; }

    const currentDate = new Date(date);
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

let timerIntervalId: ReturnType<typeof setInterval>;

export const startTimer = (timer: Ref<number>) => {
    timerIntervalId = setInterval(() => {
        if (timer.value > 0) {
            timer.value--;
        } else {
            clearInterval(timerIntervalId);
        }
    }, 1000);
};

export const stopTimer = () => {
    clearInterval(timerIntervalId);
};
