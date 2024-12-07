import { Coordinates, Movement } from "../../types/common.types";
import Carrier from "../core/Carrier";

export default class Player extends Carrier {
    constructor(element: HTMLElement, coordinates: Coordinates = {x: 0, y: 0}) {
        super(element, coordinates);
    }

    move(movement: Movement) {
        let handledMovement = movement;
        if(this.element) handledMovement = this.collisionHandler?.handleCollisions(this.element, movement) ?? handledMovement;

        this.coordinates.x += handledMovement.x;
        this.coordinates.y += handledMovement.y;

        if(this.element) this.element.innerText = `${this.coordinates.x} ${this.coordinates.y}`;
    }
}