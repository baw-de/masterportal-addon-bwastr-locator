<script>
import {mapActions, mapGetters} from "vuex";
import getters from "../store/gettersBWaStrLocator";
import FlatButton from "../../../src/shared/modules/buttons/components/FlatButton.vue";
import InputText from "../../../src/shared/modules/inputs/components/InputText.vue";
import 'vue-good-table-next/dist/vue-good-table-next.css'
import { VueGoodTable } from 'vue-good-table-next';
import axios from "axios";

export default {
    name: "BWaStrLocator",
    components: {
        VueGoodTable,
        FlatButton,
        InputText
    },
    props: {},
    data () {
        return {
            searchResults: [],
            debounceTimer: null,
            selectedWaterStreet: null,
            searchText: "",
            toKilometer: 0,
            fromKilometer: 0,
            geocoding: null
        };
    },
    computed: {
        ...mapGetters("Modules/BWaStrLocator", Object.keys(getters)),
        ...mapGetters("Maps", ["mode"]),
        toKM: {
            get () {
                return this.toKilometer;
            },
            set (newValue) {
                this.toKilometer = this.formatDecimal(newValue, this.selectedWaterStreet ? this.selectedWaterStreet.km_bis : 0);
            }
        },
        fromKM: {
            get () {
                return this.fromKilometer;
            },
            set (newValue) {
                this.fromKilometer = this.formatDecimal(newValue, this.selectedWaterStreet ? this.selectedWaterStreet.km_von : 0);
            }
        }
    },
    watch: {
        feature () {
            this.init();
        }
    },
    beforeUnmount () {
        this.reset();
    },
    methods: {
        getSearchResultColumns () {
            return [
                {
                    label: this.translate("additional:modules.tools.bWaStrLocator.columns.concatName"),
                    field: "concat_name",
                    tdClass: "table-link"
                }
            ];
        },
        search (searchText) {
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
            this.toKM = 0;
            this.fromKM = 0;
            this.selectedWaterStreet = null;
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
        selectWaterStreet (row) {
            this.selectedWaterStreet = row.row;
            this.fromKM = this.selectedWaterStreet.km_von;
            this.toKM = this.selectedWaterStreet.km_bis;
            this.searchText = this.selectedWaterStreet.concat_name;
            setTimeout(() => {
                document.getElementById("ws-locator-from").focus();
            });
        },
        showWaterStreet () {
            this.adjustFromAndToValues();
            this.fetchGeocoding(this.selectedWaterStreet.bwastrid, this.fromKM, this.toKM).then(geocoding => {
                if (geocoding.length > 0) {
                    this.geocoding = geocoding[0];
                    const coordinates = this.geocoding.geometry.coordinates;

                    this.drawWaterStreetToMap({coordinates});
                }
            });
        },
        adjustFromAndToValues () {
            this.fromKM = this.fromKM < this.selectedWaterStreet.km_von || this.fromKM > this.selectedWaterStreet.km_bis ? this.selectedWaterStreet.km_von : this.fromKM;
            this.toKM = this.toKM < this.selectedWaterStreet.km_von || this.toKM > this.selectedWaterStreet.km_bis ? this.selectedWaterStreet.km_bis : this.toKM;
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
                Config?.bWaStrLocator?.wsQueryAPI + "?searchterm=" + searchText +
                "&searchfield=" + (Config?.bWaStrLocator?.searchField ? Config?.bWaStrLocator?.searchField : "all")
            );

            return response.status === 200 ? response.data.result : [];
        },
        async fetchGeocoding (wsId, fromKM, toKM) {
            const response = await axios.get(
                Config?.bWaStrLocator?.geocodingQueryAPI + "?bwastrid=" + wsId + "&km_von=" + fromKM + "&km_bis=" + toKM +
                "&wkid=" + (Config?.bWaStrLocator?.wkId ? Config?.bWaStrLocator?.wkId : 25832)
            );

            return response.status === 200 ? response.data.result : [];
        },
        ...mapActions("Modules/BWaStrLocator", ["drawWaterStreetToMap", "reset"])
    }
};
</script>

<template lang="html">
    <div class="ws-search">
        <InputText
            id="ws-locator-search"
            v-model="searchText"
            :placeholder="translate('additional:modules.tools.bWaStrLocator.searchPlaceholder')"
            :aria-label="translate('additional:modules.tools.bWaStrLocator.searchPlaceholder')"
            :label="translate('additional:modules.tools.bWaStrLocator.searchPlaceholder')"
            max-length="50"
            :input="search"
        />
        <vue-good-table
            v-if="searchResults.length > 0 && !selectedWaterStreet"
            :columns="getSearchResultColumns()"
            :rows="searchResults"
            max-height="calc(100vh - 400px)"
            :row-style-class="'table-row alternating-color'"
        >
            <template #table-row="props">
                <span v-if="props.column.field === 'concat_name'">
                    <a
                        href="#"
                        @click="selectWaterStreet(props)"
                    >
                        {{ props.row.concat_name }}
                    </a>
                </span>
                <span v-else>
                    {{ props.formattedRow[props.column.field] }} SOSO
                </span>
            </template>
        </vue-good-table>
        <div v-if="selectedWaterStreet">
            <InputText
                id="ws-locator-from"
                :value="''+fromKM"
                :placeholder="translate('additional:modules.tools.bWaStrLocator.fromKMPlaceholder')"
                :aria-label="translate('additional:modules.tools.bWaStrLocator.fromKMPlaceholder')"
                :label="translate('additional:modules.tools.bWaStrLocator.fromKMPlaceholder')"
                :input="(newValue) => {fromKM = newValue;}"
            />
            <InputText
                id="ws-locator-till"
                :value="''+toKM"
                :placeholder="translate('additional:modules.tools.bWaStrLocator.toKMPlaceholder')"
                :aria-label="translate('additional:modules.tools.bWaStrLocator.toKMPlaceholder')"
                :label="translate('additional:modules.tools.bWaStrLocator.toKMPlaceholder')"
                :input="(newValue) => {toKM = newValue;}"
            />
            <FlatButton
                :id="'show-water-street'"
                :text="translate('additional:modules.tools.bWaStrLocator.showWaterStreet')"
                :aria-label="translate('additional:modules.tools.bWaStrLocator.showWaterStreet')"
                :icon="'bi-search'"
                :interaction="() => showWaterStreet()"
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
</style>
