import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature";
import MultiLineString from "ol/geom/MultiLineString";

export default new VectorSource({
    features: [
        new Feature({
            geometry: new MultiLineString([])
        })
    ]
});
