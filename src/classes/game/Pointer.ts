import { getPointerRadius } from "../../config";
import { Coordinates, Sizes } from "../../types/common.types";
import Entity from "../core/Entity";

export default class Pointer {
    private element: HTMLElement;
    private coordinates: Coordinates;
    private target: Entity | null = null;
    private hidden: boolean = false;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    public isHidden = () => this.hidden;

    public getTarget = () => this.target;

    public hide = () => {
        this.hidden = true;
        if(this.element) this.element.style.opacity = '0';
    };

    public show = () => {
        this.hidden = false;
        if(this.element) this.element.style.opacity = '1';
    }

    public pointAt(target: Entity) {
        this.target = target;
    }

    public updatePointing(playerCoords: Coordinates) {
        if (!this.target) return;
        
        const targetCoords = this.target.getCoords();
        const dx = (targetCoords.x ) - (playerCoords.x );
        const dy = (targetCoords.y) - (playerCoords.y );

        const linearDistance = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
        const x = (dx * getPointerRadius()) / linearDistance + playerCoords.x;
        const y = (dy * getPointerRadius()) / linearDistance + playerCoords.y;

        if(this.element) this.element.style.rotate = `${Math.atan2(dy, dx) + 3 * Math.PI / 2}rad`;
        this.coordinates = { x, y };
    }

}