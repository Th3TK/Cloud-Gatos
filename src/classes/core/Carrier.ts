import { PICK_UP_COOLDOWN } from "../../config";
import { Coordinates } from "../../types/common.types";
import Entity from "./Entity";
import Pickable from "./Pickable";

export default class Carrier extends Entity {
    private canPick: boolean = true;
    private pickable: Pickable | null;

    constructor(element: HTMLElement | null, coordinates: Coordinates | undefined) {
        super(element, coordinates);

        this.startCooldown = this.startCooldown.bind(this);
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
        this.pickable = null;
        this.startCooldown();
    }

    private startCooldown = () => setTimeout(() => this.canPick = true, PICK_UP_COOLDOWN);
}