import stateBWaStrLocator from "./stateBWaStrLocator";
import {generateSimpleMutations} from "@shared/js/utils/generators";

const mutations = {
    ...generateSimpleMutations(stateBWaStrLocator)
};

export default mutations;
