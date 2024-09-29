<script lang="ts" setup>
withDefaults(
    defineProps<{
    color?: string,
    height?: string,
    width?: string
  }>(),
    {
        color: 'black',
        height: '14',
        width: '14',
    },
);
</script>

<template>
    <svg
        :width="width"
        :height="height"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            :d="`M11.7679 16.3104C12.3398 15.7445 12.3403 14.8208 11.769 14.2542L6.12708 8.65885L11.769 3.06348C12.3403
             2.49694 12.3398 1.57323 11.7679 1.00732V1.00732C11.204 0.449293 10.296 0.449293 9.73208 1.00732L3.43656
             7.23726C2.64562 8.01996 2.64562 9.29775 3.43656 10.0805L9.73208 16.3104C10.296 16.8684 11.204 16.8684
             11.7679 16.3104V16.3104Z`"
            :fill="color"
        />
    </svg>
</template>
