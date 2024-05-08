import stateBWaStrLocator from "./stateBWaStrLocator";
import {generateSimpleGetters} from "../../../../src_3_0_0/shared/js/utils/generators";

const getters = {
    ...generateSimpleGetters(stateBWaStrLocator)
};

export default getters;
