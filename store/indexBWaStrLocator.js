import getters from "./gettersBWaStrLocator";
import mutations from "./mutationsBWaStrLocator";
import actions from "./actionsBWaStrLocator";
import state from "./stateBWaStrLocator";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
