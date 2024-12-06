import { Coordinates } from "../types/common.types";

const container = document.querySelector('#obstacleContainer');

export default class Cloud {
    element: HTMLElement;
    container: HTMLElement;
    tileCoordinates: Coordinates;

    constructor(tileCoordinates: Coordinates, container: HTMLElement) {
        this.tileCoordinates = tileCoordinates;
        this.element = this.appendToDOM();
        this.container = container;
        this.appendToDOM = this.appendToDOM.bind(this);
    }

    updatePosition(position: Coordinates) {
        this.element.style.position = 'absolute';
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