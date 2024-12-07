import { MAX_HEIGHT_CLOUDS, MIN_HEIGHT_CLOUDS } from "../config";
import { Coordinates, MinMax } from "../types/common.types.js"
import { randomSign, randomNumber } from "./misc.ts"

export const getPos = (
    coords: Coordinates, 
    playerCoordinates: Coordinates, 
    elementWidth: number, 
    elementHeight: number | undefined = undefined
) : Coordinates => ({
    x: coords.x - playerCoordinates.x + window.innerWidth / 2 - elementWidth / 2,
    y: coords.y - playerCoordinates.y + window.innerHeight / 2 - (elementHeight ?? elementWidth) / 2,
})

export const randomCoords = (center: Coordinates, horizontal: MinMax, vertical: MinMax) => {
    let x = center.x + randomSign(randomNumber(horizontal.min, horizontal.max));
    let y = center.y + randomSign(randomNumber(vertical.min, vertical.max));

    console.log(x, y)

    if(y < -MAX_HEIGHT_CLOUDS) y = -MAX_HEIGHT_CLOUDS;
    if(y > -MIN_HEIGHT_CLOUDS) y = -MIN_HEIGHT_CLOUDS;

    return {
        x: x,
        y: y,
    }
}

export function isElementVisible(element: HTMLElement | null | undefined): boolean {
    if(!element) return false;
    const rect = element.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export const coordinatesEqual = (coords1: Coordinates, coords2: Coordinates) => 
    coords1.x === coords2.x && coords1.y === coords2.y;

export const coordinatesAlmostEqual = (coords1: Coordinates, coords2: Coordinates, marginX: number, marginY: number) =>
    Math.abs(coords1.x - coords2.x) < marginX && Math.abs(coords1.y - coords2.y) < marginY;