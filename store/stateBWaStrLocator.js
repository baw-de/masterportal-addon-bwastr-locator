import wsSource from "../js/wsSource";
import wsLayer from "../js/wsLayer";


const state = {
    wsSource: wsSource,
    wsLayer: wsLayer,
    active: false,
    id: "bWaStrLocator",
    name: "additional:modules.tools.bWaStrLocator.title",
    icon: "bi-search",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false
};

export default state;
