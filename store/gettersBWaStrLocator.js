import stateBWaStrLocator from "./stateBWaStrLocator";
import {generateSimpleGetters} from "../../../src/shared/js/utils/generators";

const getters = {
    ...generateSimpleGetters(stateBWaStrLocator)
};

export default getters;
