import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import autocompleteInput from './components/autocomplete-input.vue';
import dropdownComponent from './components/dropdown-component.vue';
import popupComponent from './components/popup-component.vue';
import selectInput from './components/select-input.vue';
import spinnerComponent from './components/spinner-component.vue';
import router from './router';

import './css/global.scss';

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.component('AutocompleteInput', autocompleteInput);
app.component('DropdownComponent', dropdownComponent);
app.component('PopupComponent', popupComponent);
app.component('SelectInput', selectInput);
app.component('SpinnerComponent', spinnerComponent);

app.mount('#app');
