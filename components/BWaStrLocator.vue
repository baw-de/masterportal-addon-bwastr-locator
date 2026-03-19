<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersBWaStrLocator";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import InputText from "@shared/modules/inputs/components/InputText.vue";
import axios from "axios";
import mutations from "../store/mutationsBWaStrLocator";

export default {
    name: "BWaStrLocator",
    components: {
        FlatButton,
        InputText
    },
    props: {},
    data () {
        return {
            searchResults: [],
            debounceTimer: null,
            geocoding: null
        };
    },
    computed: {
        ...mapGetters("Modules/BWaStrLocator", Object.keys(getters)),
        ...mapGetters("Maps", ["mode"])
    },
    watch: {
        feature () {
            this.init();
        }
    },
    mounted () {
        this.setFocusToFirstControl();
        if (this.bwastrid) {
            this.fetchFromBackendById(this.bwastrid).then(bwastr => {
                if (bwastr) {
                    this.setSearchText(bwastr.concat_name);
                    this.setSelectedWaterStreet(bwastr);
                    this.showWaterStreet(this.initZoom);
                }
            });
            this.setBwastrid(undefined);
        }
    },
    methods: {
        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["ws-locator-search"]) {
                    this.$refs["ws-locator-search"].$el.firstChild.focus();
                }
            });
        },
        search (searchText) {
            this.setSearchText(searchText);
            this.clearSelectedData();
            if (searchText.length > 1) {
                this.debounce(() => {
                    this.fetchFromBackend(searchText).then(searchResults => {
                        this.searchResults = searchResults;
                    });
                });
            }
            else {
                this.clearActiveDebounceTimer();
                this.searchResults = [];
            }
        },
        clearSelectedData () {
            this.setToKilometer(0);
            this.setFromKilometer(0);
            this.setSelectedWaterStreet(null);
        },
        debounce (callback) {
            this.clearActiveDebounceTimer();
            this.debounceTimer = setTimeout(callback, 500);
        },
        clearActiveDebounceTimer () {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
        },
        translate (key, options = null) {
            return this.$t(key, options);
        },
        showWaterStreet (zoomToExtent = true) {
            this.adjustFromAndToValues();
            this.fetchGeocoding(this.selectedWaterStreet.bwastrid, this.fromKilometer, this.toKilometer).then(geocoding => {
                if (geocoding.length > 0) {
                    this.geocoding = geocoding[0];;

                    this.drawWaterStreetToMap({waterstreet: this.geocoding, zoomToExtent});
                }
            });
        },
        adjustFromAndToValues () {
            const hasFromKilometer = this.fromKilometer.length > 0,
                hasToKilometer = this.toKilometer.length > 0;
            this.setFromKilometer(this.fromKilometer < this.selectedWaterStreet.km_von || this.fromKilometer > this.selectedWaterStreet.km_bis ? this.selectedWaterStreet.km_von : this.fromKilometer);
            if (!hasFromKilometer || hasToKilometer){
                this.setToKilometer(this.toKilometer < this.selectedWaterStreet.km_von || this.toKilometer > this.selectedWaterStreet.km_bis ? this.selectedWaterStreet.km_bis : this.toKilometer);
            }
        },
        formatDecimal (value, defaultValue) {
            let formattedValue = ("" + String(value)).replace(",", ".");

            if (isNaN(formattedValue)) {
                formattedValue = defaultValue;
            }
            return formattedValue;
        },
        async fetchFromBackend (searchText) {
            const response = await axios.get(
                this.wsQueryAPI + "?searchterm=" + searchText +
                "&searchfield=" + (Config?.bWaStrLocator?.searchField ? Config?.bWaStrLocator?.searchField : "all")
            );

            return response.status === 200 ? response.data.result : [];
        },
        async fetchFromBackendById (id) {
            const response = await axios.get(this.wsQueryAPI + "?searchterm=" + id + "&searchfield=bwastrid");

            return response.status === 200 ? response.data.result.find(result => result.bwastrid === id) : undefined;
        },
        async fetchGeocoding (wsId, fromKM, toKM) {
            const kilometer_param = toKM.length !== 0 && fromKM !== toKM ? "&km_von=" + fromKM + "&km_bis=" + toKM : "&km_wert=" + fromKM,
                response = await axios.get(
                this.geocodingQueryAPI + "?bwastrid=" + wsId + kilometer_param +
                "&wkid=" + this.wkId
            );

            return response.status === 200 ? response.data.result : [];
        },
        setFocusToFromKM () {
            setTimeout(() => {
                document.getElementById("ws-locator-from").focus();
            });
        },
        ...mapActions("Modules/BWaStrLocator", ["drawWaterStreetToMap", "reset", "selectWaterStreet"]),
        ...mapMutations("Modules/BWaStrLocator", Object.keys(mutations))
    }
};
</script>

<template lang="html">
    <div class="ws-search">
        <InputText
            id="ws-locator-search"
            ref="ws-locator-search"
            :value="searchText"
            :modelValue="searchText"
            :placeholder="translate('additional:modules.tools.bWaStrLocator.searchPlaceholder')"
            :aria-label="translate('additional:modules.tools.bWaStrLocator.searchPlaceholder')"
            :label="translate('additional:modules.tools.bWaStrLocator.searchPlaceholder')"
            max-length="50"
            :onInput="search"
        />
        <ul
            v-if="searchResults.length > 0 && !selectedWaterStreet"
            class="list-group dropdown-menu-search dropdown-menu-left"
        >
            <li
                v-for="(searchResult, index) of searchResults"
                :key="index"
                class="list-group-item"
            >
                <a
                    class="btn-icon search-result-button"
                    @click="selectWaterStreet(searchResult);setFocusToFromKM();"
                >
                    {{ searchResult.concat_name }}
                </a>
            </li>
        </ul>
        <div v-if="selectedWaterStreet">
            <InputText
                id="ws-locator-from"
                :value="fromKilometer.toString()"
                :modelValue="fromKilometer.toString()"
                :placeholder="translate('additional:modules.tools.bWaStrLocator.fromKMPlaceholder')"
                :aria-label="translate('additional:modules.tools.bWaStrLocator.fromKMPlaceholder')"
                :label="translate('additional:modules.tools.bWaStrLocator.fromKMPlaceholder')"
                :onInput="(newValue) => {setFromKilometer(newValue.replace(',', '.'));}"
            />
            <InputText
                id="ws-locator-till"
                :value="toKilometer.toString()"
                :modelValue="toKilometer.toString()"
                :placeholder="translate('additional:modules.tools.bWaStrLocator.toKMPlaceholder')"
                :aria-label="translate('additional:modules.tools.bWaStrLocator.toKMPlaceholder')"
                :label="translate('additional:modules.tools.bWaStrLocator.toKMPlaceholder')"
                :onInput="(newValue) => {setToKilometer(newValue.replace(',', '.'));}"
            />
            <FlatButton
                :id="'show-water-street'"
                :text="translate('additional:modules.tools.bWaStrLocator.showWaterStreet')"
                :aria-label="translate('additional:modules.tools.bWaStrLocator.showWaterStreet')"
                :icon="'bi-search'"
                :interaction="() => showWaterStreet()"
            />
            <FlatButton
                v-if="bwastrVisible"
                :id="'reset-ws'"
                :text="translate('additional:modules.tools.bWaStrLocator.resetWaterStreet')"
                :aria-label="translate('additional:modules.tools.bWaStrLocator.resetWaterStreet')"
                :icon="'bi-trash'"
                :interaction="() => reset()"
            />
        </div>
    </div>
</template>

<style>
.ws-search .table-link {
    color: var(--bs-link-color);
}

.ws-search .btn i[role="img"] {
    color: #fff !important;
}

.ws-search #show-water-street {
    width: 100%;
    max-width: 100% !important;
}

.ws-search .table-link:hover {
    color: #00447a;
    text-decoration: underline;
    cursor: pointer;
}

.ws-search #reset-ws {
    width: 100%;
    max-width: 100% !important;
}

.list-group {
    position: absolute;
    z-index: 999;
}

.list-group-item:hover {
    color: #00447a;
    text-decoration: underline;
    cursor: pointer;
}

.dropdown-menu-search {
    max-height: 80%;
    overflow: auto;
    max-width: 100% !important;
    top: unset;
    left: 20px;
    right: 20px;
}
</style>
