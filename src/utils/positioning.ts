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

    if(y < -MAX_HEIGHT_CLOUDS) y = -MAX_HEIGHT_CLOUDS;
    if(y > -MIN_HEIGHT_CLOUDS) y = -MIN_HEIGHT_CLOUDS;

    return {
        x: x,
        y: y,
    }
}