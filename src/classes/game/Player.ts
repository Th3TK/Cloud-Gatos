import { PLAYER } from "../../config/_config";
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

        if(!this.element || !movement.x) return;

        const movingRight = movement.x > 0;
        this.element.style.transform = `translate(-50%, -50%) scaleX(${movingRight ? -1 : 1})`;
        if(this.pickable) this.pickable.setFacing(movingRight ? 'right' : 'left');  
    }
}