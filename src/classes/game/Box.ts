import { BOX } from "../../config/_config.ts";
import { Coordinates } from "../../types/common.types";
import Entity from "../core/Entity";

export default class Box extends Entity {
    opened: boolean = true;

    constructor(coordinates: Coordinates) {
        super(coordinates, BOX.SIZES);

        this.addTextureHandler(() => this.opened ? 'box_opened' : 'box_closed');
    }
}