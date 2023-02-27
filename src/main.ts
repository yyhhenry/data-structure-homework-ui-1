import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'highlight.js/styles/github-dark.css';
import 'highlight.js/lib/common';
import highlight from '@highlightjs/vue-plugin';

import 'element-plus/theme-chalk/src/index.scss';
import './assets/main.css';

const app = createApp(App);
app.use(highlight);
app.use(router);

app.mount('#app');
