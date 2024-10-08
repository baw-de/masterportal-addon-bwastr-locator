import {Stroke, Style} from "ol/style.js";

/**
 * Style for drawn water streets
 *
 * @returns {[*,*]} The first style is for the border of the line and the second style is for the filling
 */
export default function createWSStyle () {

    return [
        new Style({
            stroke: new Stroke({
                color: [255, 255, 255, 1.0],
                width: 9
            })
        }),
        new Style({
            stroke: new Stroke({
                color: [51, 153, 255, 1.0],
                width: 6
            })
        })
    ];
}
