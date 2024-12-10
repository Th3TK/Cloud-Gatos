import { doRectanglesOverlap } from "../../utils/misc";
import Carrier from "./Carrier";
import Fallable from "./Fallable";

export default class Pickable extends Fallable {
    private picked: boolean = false;
    private carrier: Carrier | null = null;

    public getCarrier = () => this.carrier;

    public isPicked = () => this.picked;

    public pickUp(carrier: Carrier) {
        if(this.carrier) this.carrier.clearPickable();
        this.picked = true;
        this.carrier = carrier;
    }

    public release() {
        this.picked = false;
        this.carrier = null;
    }

    public canBePickedBy = (carrier: Carrier) => 
        doRectanglesOverlap(this.coordinates, this.getSizes(), carrier.getCoords(), carrier.getSizes());
}

