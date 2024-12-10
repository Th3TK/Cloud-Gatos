import { BOX } from "../../config";
import { Coordinates } from "../../types/common.types";
import Entity from "../core/Entity";

export default class Box extends Entity {

    constructor(coordinates: Coordinates) {
        super(coordinates, BOX.SIZES);
    }
}