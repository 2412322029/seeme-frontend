<template>
    <div class="start-page">
        <h1>Welcome to the Start Page</h1>
        <p>
            TODO : Add some content here
        </p>
    </div>
    <!-- <iframe src="https://xlog.not404.cc" frameborder="0" style="width: 100%; height: 60vh;"></iframe> -->

</template>

<script setup>
import { ref } from 'vue';

const message = ref('Welcome to the Start Page');
</script>

<style scoped>
.start-page {
    text-align: center;
}

h1 {
    font-size: 2em;
    color: #42b983;
}

p {
    font-size: 1.2em;
}
</style>