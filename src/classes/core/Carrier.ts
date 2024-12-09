import { PICK_UP_COOLDOWN } from "../../config";
import { Coordinates, Movement } from "../../types/common.types";
import Entity from "./Entity";
import Pickable from "./Pickable";

export default class Carrier extends Entity {
    private canPick: boolean = true;
    protected pickable: Pickable | null;

    constructor(element: HTMLElement | null, coordinates: Coordinates | undefined) {
        super(element, coordinates);

        this.clearPickable = this.clearPickable.bind(this);
        this.startCooldown = this.startCooldown.bind(this);
    }

    public getPickable = () => this.pickable;

    public clearPickable = () => {
        this.pickable = null;
        this.startCooldown();
    }

    public getCanPick = () => this.canPick;

    public tryPick(pickable: Pickable): boolean {
        if (!this.canPick || !pickable.canBePickedBy(this)) return false;
        console.log('picked!')

        pickable.pickUp(this);

        this.canPick = false;
        this.pickable = pickable;

        return true;
    }

    public release() {
        if(!this.pickable) return;
        this.pickable.release();
        this.clearPickable();
    }

    private startCooldown = () => setTimeout(() => this.canPick = true, PICK_UP_COOLDOWN);

    public move(movement: Movement) {
        super.move(movement);

        if(!this.element) return;
        
        const movingRight = movement.x > 0;
        this.element.style.transform = `scaleX(${movingRight ? -1 : 1})`;
        if(this.pickable?.element) this.pickable.element.style.transform = 
            movingRight ? 'translate(10px, 48px) scaleX(-1)' : 'translate(-10px, 48px) scaleX(1)';
    }
}