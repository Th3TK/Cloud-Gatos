import { BOARD } from "../config/_config.ts";
import { Coordinates, MinMax, Rect, Sizes } from "../types/common.types.js";
import { randomSign, randomNumber } from "./misc.ts";

export const coordsToPair = (coordinates: Coordinates) : [x: number, y: number] => [coordinates.x, coordinates.y];

export const pairToCoords = (pair: [x: number, y: number]) : Coordinates => ({x: pair?.[0] || NaN, y: pair?.[1] || NaN});

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

    if(y < -BOARD.MAX_HEIGHT_CLOUDS) y = -BOARD.MAX_HEIGHT_CLOUDS;
    if(y > -BOARD.MIN_HEIGHT_CLOUDS) y = -BOARD.MIN_HEIGHT_CLOUDS;

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

export const isObjectVisibleOnCanvas = (rect: Rect, canvasCenterCoords: Coordinates) =>
    rect.left > canvasCenterCoords.x - window.innerWidth / 2 && rect.right < canvasCenterCoords.x + window.innerWidth / 2 &&
    rect.top > canvasCenterCoords.y - window.innerHeight / 2 && rect.bottom < canvasCenterCoords.y + window.innerHeight / 2;

export const coordinatesEqual = (coords1: Coordinates, coords2: Coordinates) => 
    coords1.x === coords2.x && coords1.y === coords2.y;

export const coordinatesAlmostEqual = (coords1: Coordinates, coords2: Coordinates, marginX: number, marginY: number = marginX) =>
    Math.abs(coords1.x - coords2.x) < marginX && Math.abs(coords1.y - coords2.y) < marginY;

export const offsetCoords = (coords: Coordinates, offset: Coordinates) => ({
    x: coords.x - offset.x,
    y: coords.y - offset.y,
})

export const reverseOffsetCoords = (coords: Coordinates, offset: Coordinates) => ({
    x: coords.x + offset.x,
    y: coords.y + offset.y,
})

export const addCoords = reverseOffsetCoords;
export const subtractCoords = offsetCoords;

export const straightLineDistance = (coords1: Coordinates, coords2: Coordinates) : number => {
    const difference = subtractCoords(coords1, coords2);
    return Math.sqrt(difference.x ** 2 + difference.y ** 2);
}

export const rectFromCoordsAndSizes = (coords: Coordinates, sizes: Sizes) => ({
    left: coords.x,
    top: coords.y,
    right: coords.x + sizes.width,
    bottom: coords.y + sizes.height,
})