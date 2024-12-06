import { Coordinates, Movement } from "../types/common.types";

export default class Player {
    element: HTMLElement;
    coordinates: Coordinates;

    constructor(element: HTMLElement, coordinates: Coordinates) {
        this.element = element;
        this.coordinates = coordinates;
    }

    move(movement: Movement) {
        this.coordinates.x += movement.x;
        this.coordinates.y += movement.y;

        this.element.innerText = `${this.coordinates.x} ${this.coordinates.y}`;
    }
}