import { Coordinates } from "../../types/common.types";
import { coordinatesAlmostEqual } from "../../utils/positioning";
import Board from "../environment/Board";
import Box from "./Box";
import Gato from "./Gato";

export default class GatoBoxPair {
    box: Box;
    gato: Gato;
    successCallback: () => void;
    
    constructor(boxCoordinates: Coordinates, gatoCoordinates: Coordinates, board: Board, successCallback: () => void){
        this.box = new Box(boxCoordinates);
        this.gato = new Gato(gatoCoordinates, board);
        this.successCallback = successCallback;
    }

    public create(container: HTMLElement) {
        this.box.move({x: 0, y: -this.box.getSizes().height / 2});
        this.gato.move({x: 0, y: -this.gato.getSizes().height / 2});
    }

    public checkForGatoInABox() {
        const boxCoords = this.box.getCoords();
        const boxSizes = this.box.getSizes();
        const gatoCoords = this.gato.getCoords();

        if(!this.gato.isPicked() && Math.abs(gatoCoords.x - boxCoords.x) < boxSizes.width){
            this.gato.move({x: boxCoords.x - gatoCoords.x, y: 0});
        }
        
        if(coordinatesAlmostEqual(gatoCoords, boxCoords, boxSizes.width/2, boxSizes.height/2)){
            this.successCallback();
        } 
    }
}