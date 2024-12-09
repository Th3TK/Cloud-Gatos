import { Coordinates, Movement } from "../../types/common.types";
import Carrier from "../core/Carrier";

export default class Player extends Carrier {
    constructor(element: HTMLElement, coordinates: Coordinates = {x: 0, y: 0}) {
        super(element, coordinates);
    }

    public move(movement: Movement): void {
        super.move(movement);

        if(!this.element) return;
        
        const movingRight = movement.x > 0;
        this.element.style.transform = `translate(-50%, -50%) scaleX(${movingRight ? -1 : 1})`;
        if(this.pickable?.element) this.pickable.element.style.transform = 
            movingRight ? 'translate(10px, 48px) scaleX(-1)' : 'translate(-10px, 48px) scaleX(1)';
    }
}