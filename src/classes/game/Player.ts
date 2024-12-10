import { PLAYER } from "../../config";
import { Coordinates, Movement } from "../../types/common.types";
import Carrier from "../core/Carrier";

export default class Player extends Carrier {
    element: HTMLElement;

    constructor(element: HTMLElement, coordinates: Coordinates = {x: 0, y: 0}) {
        super(coordinates, PLAYER.SIZES);
        this.element = element;
    }

    public move(movement: Movement): void {
        super.move(movement);

        if(!this.element) return;
        
        const movingRight = movement.x > 0;
        this.element.style.transform = `scaleX(${movingRight ? -1 : 1})`;
    }
}