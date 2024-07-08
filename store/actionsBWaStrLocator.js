const actions = {

    async drawWaterStreetToMap ({state, dispatch, rootState}, {geometry}) {
        const map = await mapCollection.getMap(rootState.Maps.mode),
            {
                wsLayer,
                wsSource
            } = state,
            layerExists = await dispatch("Maps/checkLayer", wsLayer, {root: true});

        wsSource.getFeatures()[0].getGeometry().setCoordinates(geometry.coordinates)

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
    }
};

export default actions;
