import MultiLineString from "ol/geom/MultiLineString";
import Point from "ol/geom/Point";

const actions = {

    async drawWaterStreetToMap ({state, dispatch, rootState}, {waterstreet, zoomToExtent}) {
        const map = await mapCollection.getMap(rootState.Maps.mode),
            {
                wsLayer,
                wsSource
            } = state,
            layerExists = await dispatch("Maps/checkLayer", wsLayer, {root: true}),
            geometry = waterstreet.geometry;


        if(geometry.type === "Point") {
            wsSource.getFeatures()[0].setGeometry(new Point(geometry.coordinates));
        }
        else {
            wsSource.getFeatures()[0].setGeometry(new MultiLineString(geometry.coordinates));
        }
        wsLayer.values_.name = i18next.t("additional:modules.tools.bWaStrLocator.title");
        wsLayer.values_.gfiAttributes= {
            bwastrid: i18next.t("additional:modules.tools.bWaStrLocator.gfiAttributes.bwastrid"),
                bwastr_name: i18next.t("additional:modules.tools.bWaStrLocator.gfiAttributes.bwastr_name"),
                strecken_name: i18next.t("additional:modules.tools.bWaStrLocator.gfiAttributes.strecken_name"),
                "@stationierung.km_von": i18next.t("additional:modules.tools.bWaStrLocator.gfiAttributes.fromKM"),
                "@stationierung.km_bis": i18next.t("additional:modules.tools.bWaStrLocator.gfiAttributes.toKM"),
        }
        wsSource.getFeatures()[0].setProperties({
            bwastrid: waterstreet.bwastrid,
            bwastr_name: waterstreet.bwastr_name,
            strecken_name: waterstreet.strecken_name,
            stationierung: waterstreet.stationierung
        });

        if (!layerExists) {
            dispatch("Maps/addLayer", wsLayer, {root: true});
        }
        state.bwastrVisible = true;

        if(zoomToExtent){
            map.getView().fit(wsSource.getExtent());
        }
    },
    reset ({state}) {
        const {
            wsSource
        } = state;

        wsSource.getFeatures()[0]
            .getGeometry()
            .setCoordinates([]);

        state.bwastrVisible = false;
    },
    selectWaterStreet ({state}, waterStreet) {
        state.selectedWaterStreet = waterStreet;
        state.fromKilometer = state.selectedWaterStreet.km_von;
        state.toKilometer = state.selectedWaterStreet.km_bis;
        state.searchText = state.selectedWaterStreet.concat_name;
    }
};

export default actions;
