<script lang="ts" setup>
import { JobOfferTest } from '../../models/job-model';

defineProps<{
    instructions: JobOfferTest['instructions'],
}>();
</script>

<template>
    <div class="column gap-18">
        <div>{{ instructions }}</div>
    </div>
</template>
