import { BOARD_TILE_HEIGHT, BOARD_TILE_WIDTH } from "../../config";
import { Coordinates } from "../../types/common.types";
import { getPos } from "../../utils/positioning";

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
        this.element.style.top = `${position.y + this.element.offsetHeight/2}px`;
    }

    appendToDOM() {
        const element = document.createElement('div');

        element.classList.add('cloud');
        element.style.width = `${BOARD_TILE_WIDTH}px`;
        element.style.height = `${BOARD_TILE_HEIGHT}px`;
        element.innerHTML = `${this.tileCoordinates.x} ${this.tileCoordinates.y}`

        this.container.appendChild(element);
        return element;
    }
}