import { Coordinates, MinMax } from "../types/common.types.js"
import { randomNumber } from "./misc.ts"

export const getPos = (
    coords: Coordinates, 
    playerPos: Coordinates, 
    elementWidth: number, 
    elementHeight: number | undefined = undefined
) : Coordinates => ({
    x: coords.x - playerPos.x + window.innerWidth / 2 - elementWidth / 2,
    y: coords.y - playerPos.y + window.innerHeight / 2 - (elementHeight ?? elementWidth) / 2,
})

export const randomCoords = (center: Coordinates, horizontal: MinMax, vertical: MinMax) => {
    return {
        x: center.x + randomNumber(horizontal.min,horizontal.max),
        y: center.y + randomNumber(vertical.min, vertical.max),
    }
}