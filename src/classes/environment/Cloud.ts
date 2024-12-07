import { CloudSizes, Coordinates } from "../../types/common.types";
import { getPos } from "../../utils/positioning";

const cloudSizes = {
    1: 'small',
    2: 'medium',
    3: 'large',
}

export default class Cloud {
    element: HTMLElement;
    container: HTMLElement;
    tileCoordinates: Coordinates;
    size: CloudSizes;

    constructor(tileCoordinates: Coordinates, container: HTMLElement, size: CloudSizes) {
        this.tileCoordinates = tileCoordinates;
        this.container = container;
        this.element = this.appendToDOM(size);
        this.appendToDOM = this.appendToDOM.bind(this);
    }

    updatePosition(coordinates: Coordinates, playerCoordinates: Coordinates) {
        const position = getPos(coordinates, playerCoordinates, this.element.offsetWidth);

        this.element.style.left = `${position.x}px`;
        this.element.style.top = `${position.y}px`;
    }

    appendToDOM(size: CloudSizes) {
        const element = document.createElement('div');

        element.classList.add('cloud');
        element.classList.add(`${cloudSizes[size]}`);
        element.innerHTML = `${this.tileCoordinates.x} ${this.tileCoordinates.y}`

        this.container.appendChild(element);
        return element;
    }
}