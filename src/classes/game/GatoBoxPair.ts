import { GATO } from "../../config/_config";
import { Coordinates } from "../../types/common.types";
import { randomChoice } from "../../utils/misc";
import { coordinatesAlmostEqual } from "../../utils/positioning";
import Raven from "../enemies/Raven";
import Board from "../environment/Board";
import Box from "./Box";
import Gato from "./Gato";

export default class GatoBoxPair {
    box: Box;
    gato: Gato;
    successCallback: () => void;
    
    constructor(boxCoordinates: Coordinates, gatoCoordinates: Coordinates, board: Board, successCallback: () => void){
        this.box = new Box(boxCoordinates);
        this.gato = new Gato(gatoCoordinates, board, randomChoice(GATO.COLORS));
        this.successCallback = successCallback;
    }

    public checkForGatoInABox() {
        if(this.gato.isPicked() && this.gato.getCarrier() instanceof Raven) return;

        const boxCoords = this.box.getCoords();
        const boxSizes = this.box.getSizes();
        const gatoCoords = this.gato.getCoords();
        const gatoSizes = this.gato.getSizes();

        if(!this.gato.isPicked() && Math.abs(gatoCoords.x - boxCoords.x) < boxSizes.width){
            this.gato.move({x: boxCoords.x - gatoCoords.x, y: 0});
        }
        
        if(coordinatesAlmostEqual(gatoCoords, boxCoords, gatoSizes.width/2, gatoSizes.height)){
            this.successCallback();
        } 
    }
}