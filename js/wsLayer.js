import wsSource from "./wsSource";
import wsStyle from "./wsStyle";
import VectorLayer from "ol/layer/Vector.js";

export default new VectorLayer({
    source: wsSource,
    style: wsStyle,
    name: "ws_layer",
    alwaysOnTop: true
});
