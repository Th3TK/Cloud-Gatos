import { POINTER } from "../../config/_config";
import { Coordinates } from "../../types/common.types";
import { getPos } from "../../utils/misc";
import { isObjectVisibleOnCanvas } from "../../utils/positioning";
import Entity from "../core/Entity";
import Raven from "../enemies/Raven";
import Box from "./Box";
import Gato from "./Gato";

export default class Pointer {
    private element: HTMLElement;
    private target: Entity | null = null;
    private hidden: boolean = false;
    private coordinates: Coordinates = {x: NaN, y: NaN};

    constructor(element: HTMLElement) {
        this.element = element;
        this.pointAt = this.pointAt.bind(this);
    }

    public getCoords = () => this.coordinates;

    public isHidden = () => this.hidden;
    
    public hide = () => {
        this.hidden = true;
        if(this.element) this.element.style.opacity = '0';
    };
    
    public show = () => {
        this.hidden = false;
        if(this.element) this.element.style.opacity = '1';
    }

    public getTarget = () => this.target;
    
    public pointAt(target: Entity) {
        this.target = target;

        if(target instanceof Gato) this.element.setAttribute('target', 'gato');
        if(target instanceof Box) this.element.setAttribute('target', 'box');
        if(target instanceof Raven) {
            this.element.setAttribute('target', 'enemy');
            this.element.style.display = 'none';
            setTimeout(() => this.element.style.display = '', 250); // skip the css fade out
        }
        
    }

    public updatePointing(playerCenter: Coordinates) {
        if (!this.target) return;

        if(!isObjectVisibleOnCanvas(this.target.getRect(), playerCenter)) this.show();
        else this.hide();
        
        const targetCoords = this.target.getCenter();
        const dx = (targetCoords.x ) - (playerCenter.x );
        const dy = (targetCoords.y) - (playerCenter.y );

        const linearDistance = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
        const x = (dx * POINTER.getPointerRadius()) / linearDistance + playerCenter.x;
        const y = (dy * POINTER.getPointerRadius()) / linearDistance + playerCenter.y;

        if(this.element) this.element.style.rotate = `${Math.atan2(dy, dx) + 3 * Math.PI / 2}rad`;
        this.coordinates = { x, y };
    }

    public updatePosition(playerCoords: Coordinates) {
        const position = getPos(this.coordinates, playerCoords, this.element.offsetWidth, this.element.offsetHeight);

        if(!position) return;

        this.element.style.left = `${position.x}px`;
        this.element.style.top = `${position.y}px`;
    }

}