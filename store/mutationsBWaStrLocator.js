import stateBWaStrLocator from "./stateBWaStrLocator";
import {generateSimpleMutations} from "../../../../src_3_0_0/shared/js/utils/generators";

const mutations = {
    ...generateSimpleMutations(stateBWaStrLocator)
};

export default mutations;
