import { GATO } from "../../config";
import { Coordinates } from "../../types/common.types";
import Board from "../environment/Board";
import Pickable from "../core/Pickable";

export default class Gato extends Pickable {

    constructor(coordinates: Coordinates, board: Board){
        super(coordinates, GATO.SIZES, GATO.ACCELERATION, GATO.MAX_SPEED);

        this.addCollisionHandler(board);
    }

    public updateCoords() {
        if(!this.isPicked()) return this.calculateFalling();
        
        const carrier = this.getCarrier()
        if(!carrier) return;

        const carrierCoords = carrier.getCoords();
        const carrierSizes = carrier.getSizes();
        const sizes = this.getSizes();

        this.setCoords({
            x: carrierCoords.x + (carrierSizes.width - sizes.width) / 2,
            y: carrierCoords.y + (carrierSizes.height + sizes.height) / 2, 
        })
    }
}