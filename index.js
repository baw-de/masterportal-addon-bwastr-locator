import BWaStrLocator from "./components/BWaStrLocator.vue";
import BWaStrLocatorStore from "./store/indexBWaStrLocator";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: BWaStrLocator,
    store: BWaStrLocatorStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
