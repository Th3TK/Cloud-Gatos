import { Coordinates } from "../types/common.types";
import { getPos } from "../utils/positioning";

export default class Cloud {
    element: HTMLElement;
    container: HTMLElement;
    tileCoordinates: Coordinates;

    constructor(tileCoordinates: Coordinates, container: HTMLElement) {
        this.tileCoordinates = tileCoordinates;
        this.container = container;
        this.element = this.appendToDOM();
        this.appendToDOM = this.appendToDOM.bind(this);
    }

    updatePosition(coordinates: Coordinates, playerCoordinates: Coordinates) {
        const position = getPos(coordinates, playerCoordinates, this.element.offsetWidth);

        this.element.style.left = `${position.x}px`;
        this.element.style.top = `${position.y}px`;
    }

    appendToDOM() {
        let element = document.createElement('div');
        element.classList.add('cloud');
        element.innerHTML = `${this.tileCoordinates.x} ${this.tileCoordinates.y}`
        this.container.appendChild(element);
        return element;
    }
}