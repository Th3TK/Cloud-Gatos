import { Coordinates } from "../../types/common.types";
import Entity from "../core/Entity";

export default class Box extends Entity {

    constructor(coordinates: Coordinates) {
        super(null, coordinates);
    }

    public createBox(container: HTMLElement) {
        this.element = document.createElement('div');
        this.element.classList.add('box');

        container.appendChild(this.element);
    }
}