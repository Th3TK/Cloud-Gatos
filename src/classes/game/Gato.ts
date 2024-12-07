import { GATO_ACCELERATION, GATO_MAX_SPEED } from "../../config";
import { Coordinates } from "../../types/common.types";
import Board from "../environment/Board";
import Pickable from "../core/Pickable";

export default class Gato extends Pickable {
    constructor(coordinates: Coordinates, board: Board){
        super(null, coordinates, GATO_ACCELERATION, GATO_MAX_SPEED);

        this.addCollisionHandler(board);
    }

    public createGato(container: HTMLElement) {
        this.element = document.createElement('div');
        this.element.classList.add('gato');

        container.appendChild(this.element);
    }
}