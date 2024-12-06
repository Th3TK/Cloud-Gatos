import { Coordinates } from "../types/common.types";

export default class Gato {
    element: HTMLElement;
    picked: boolean = false;
    coordinates: Coordinates;

    constructor(element: HTMLElement, coordinates: Coordinates){
        this.element = element;
        this.coordinates = coordinates;
    }
}