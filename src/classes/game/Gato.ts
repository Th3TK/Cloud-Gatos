import { Coordinates } from "../../types/common.types";
import Board from "../environment/Board";
import Pickable from "../core/Pickable";
import { GatoColor } from "../../types/gato.types";
import TextureHandler from "../display/TextureHandler";
import GATO from "../../config/gato.config";

export default class Gato extends Pickable {
    private color: GatoColor;

    constructor(coordinates: Coordinates, board: Board, color: GatoColor){
        super(coordinates, GATO.SIZES, GATO.ACCELERATION, GATO.MAX_SPEED);
        this.color = color;
                
        this.addTextureHandler(this.chooseTexture);
        this.addCollisionHandler(board);
    }

    private chooseTexture = () => {
        this.textureHandler?.setFlippedHorizontally(this.getFacing() === 'right');
        return `gato_${this.color}_${this.isPicked() ? 'picked' : 'sitting'}`
    };

    public getColor = () => this.color;

    public updateCoords() {
        if(!this.isPicked()) return this.calculateFalling();
        
        const carrier = this.getCarrier()
        if(!carrier) return;

        const carrierCoords = carrier.getCoords();
        const carrierSizes = carrier.getSizes();
        const sizes = this.getSizes();

        this.setCoords({
            x: carrierCoords.x + (carrierSizes.width - sizes.width) / 2,
            y: carrierCoords.y + (carrierSizes.height + sizes.height) / 2 - 8, 
        })
    }
}