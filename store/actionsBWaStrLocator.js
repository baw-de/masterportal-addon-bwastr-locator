const actions = {

    async drawWaterStreetToMap ({state, dispatch, rootState}, {coordinates}) {
        const map = await mapCollection.getMap(rootState.Maps.mode),
            {
                wsLayer,
                wsSource
            } = state,
            layerExists = await dispatch("Maps/checkLayer", wsLayer, {root: true});

        let flatCoordinates = [];

        coordinates.forEach(c => {
            flatCoordinates = flatCoordinates.concat(c);
        });

        wsSource.getFeatures()[0]
            .getGeometry()
            .setCoordinates(flatCoordinates);

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
