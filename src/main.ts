import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';
import plaintext from 'highlight.js/lib/languages/plaintext';
import 'highlight.js/styles/github-dark.css';
import highlight from '@highlightjs/vue-plugin';

import 'element-plus/theme-chalk/src/index.scss';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/main.css';
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('txt', plaintext);

const app = createApp(App);
app.use(highlight);
app.use(router);

app.mount('#app');
