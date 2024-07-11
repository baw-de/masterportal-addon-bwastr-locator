const actions = {

    async drawWaterStreetToMap ({state, dispatch, rootState}, {geometry}) {
        const map = await mapCollection.getMap(rootState.Maps.mode),
            {
                wsLayer,
                wsSource
            } = state,
            layerExists = await dispatch("Maps/checkLayer", wsLayer, {root: true});

        wsSource.getFeatures()[0].getGeometry().setCoordinates(geometry.coordinates);

        if (!layerExists) {
            dispatch("Maps/addLayer", wsLayer, {root: true});
        }

        map.getView().fit(wsSource.getExtent());
    },
    reset ({state}) {
        const {
            wsSource
        } = state;

        wsSource.getFeatures()[0]
            .getGeometry()
            .setCoordinates([]);
    },
    selectWaterStreet ({state}, row) {
        state.selectedWaterStreet = row.row;
        state.fromKilometer = state.selectedWaterStreet.km_von;
        state.toKilometer = state.selectedWaterStreet.km_bis;
        state.searchText = state.selectedWaterStreet.concat_name;
    }
};

export default actions;
