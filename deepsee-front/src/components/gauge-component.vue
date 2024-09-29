<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  percentage: number;
}>();

const circumference = 2 * Math.PI * 48;

const dashOffset = computed(() => {
    return (100 - props.percentage) / 100 * circumference;
});
</script>

<template>
    <div class="gauge-container">
        <svg class="gauge">
            <circle
                class="gauge-background"
                cx="50%"
                cy="50%"
                r="40%"
            />

            <circle
                cx="50%"
                cy="50%"
                r="40%"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset"
                class="gauge-progress"
            />

            <text
                class="gauge-text"
                x="50%"
                y="50%"
                dominant-baseline="central"
                text-anchor="middle"
            >
                {{ percentage }}%
            </text>
        </svg>
    </div>
</template>

<style scoped>
.gauge-container {
  width: 120px;
  height: 120px;
  position: relative;
}

.gauge {
  width: 100%;
  height: 100%;
}

.gauge-text {
  font-size: 20px;
  font-weight: 800;
  fill: #00b2ca;
}

.gauge-background {
  fill: none;
  stroke: #EAEAEA;
  stroke-width: 12;
}

.gauge-progress {
  fill: none;
  stroke: #00b2ca;
  stroke-width: 12;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.3s ease;
}
</style>
