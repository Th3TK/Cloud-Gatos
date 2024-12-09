import { Coordinates } from "../../types/common.types";
import { doRectanglesOverlap } from "../../utils/misc";
import Carrier from "./Carrier";
import Fallable from "./Fallable";

export default class Pickable extends Fallable {
    private picked: boolean = false;
    private carrier: Carrier | null = null;

    public isPicked = () => this.picked;

    public pickUp(carrier: Carrier) {
        if(this.carrier) this.carrier.clearPickable();
        this.picked = true;
        this.carrier = carrier;
        this.element?.setAttribute('picked', '');
    }

    public release() {
        this.picked = false;
        this.carrier = null;
        this.element?.removeAttribute('picked');
    }
    
    public updatePosition(playerCoords: Coordinates) {
        if (!this.element) return;

        if (this.picked && this.carrier) {
            this.coordinates = structuredClone(this.carrier.getCoords());
        }

        if(!this.picked) this.calculateFalling();

        super.updatePosition(playerCoords);
    }

    public canBePickedBy = (carrier: Carrier) => 
        doRectanglesOverlap(this.coordinates, this.getSizes(), carrier.getCoords(), carrier.getSizes());
}

