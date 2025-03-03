<template>
    <div class="bar-chart">
        <div v-for="(value, key) in rating.count" :key="key" class="bar-container">
            <div class="bar" :style="{ height: getBarHeight(value) }" :title="`${key}: ${value}`">
                <span class="value">{{ value }}</span>
                <span class="label">{{ key }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { toRefs } from 'vue';

const props = defineProps({
    rating: {
        type: Object,
        required: true
    }
});

const { rating } = toRefs(props);

const maxCount = computed(() => {
    return Math.max(...Object.values(rating.value.count));
});

const getBarHeight = (value) => {
    return `${(value / maxCount.value) * 100}%`;
};
</script>

<style scoped>
.bar-chart {
    display: flex;
    align-items: flex-end;
    height: 100px; 
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    position: relative;
}

.bar-container {
    flex: 1;
    margin: 0 5px;
    position: relative;
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: flex-end;
}

.bar {
    background-color: rgba(75, 192, 192, 0.8); 
    position: relative;
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
}

.bar .value {
    position: absolute;
    top: -20px;
    font-size: 10px;
    white-space: nowrap;
}

.bar .label {
    position: absolute;
    bottom: -20px;
    text-align: center;
    width: 100%;
    font-size: 12px;
    white-space: nowrap;
}
</style>
