import BWaStrLocator from "./components/BWaStrLocator.vue";
import BWaStrLocatorStore from "./store/indexBWaStrLocator";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";
import VueGoodTablePlugin from "vue-good-table-next";
import "vue-good-table-next/dist/vue-good-table-next.css";
import Vue from "vue";

export default {
    component: BWaStrLocator,
    store: BWaStrLocatorStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};

Vue.use(VueGoodTablePlugin);
