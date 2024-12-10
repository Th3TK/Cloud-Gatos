import { PICK_UP } from "../../config/_config";
import { Coordinates, Sizes } from "../../types/common.types";
import Entity from "./Entity";
import Pickable from "./Pickable";

export default class Carrier extends Entity {
    private canPick: boolean = true;
    protected pickable: Pickable | null;

    constructor(coordinates: Coordinates, sizes: Sizes) {
        super(coordinates, sizes);

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

    private startCooldown = () => setTimeout(() => this.canPick = true, PICK_UP.COOLDOWN);
}