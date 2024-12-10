import BOARD from "../../config/board.config";
import { Movement, Rect } from "../../types/common.types";
import { signDependantFloor } from "../../utils/misc";
import { rectFromCoordsAndSizes } from "../../utils/positioning";
import Board from "../environment/Board";
import Entity from "./Entity";

export default class CollisionHandler {
    parent: Entity;
    board: Board;

    constructor(parent: Entity, board: Board) {
        this.parent = parent;
        this.board = board;
    }

    willOverlap(objectRect: Rect, colliderRect: Rect, movement: Movement) {
        const horizontalBounds = objectRect.left < colliderRect.right && objectRect.right > colliderRect.left;
        const verticalBounds = objectRect.top < colliderRect.bottom && objectRect.bottom > colliderRect.top;

        const horizontalBoundsAfterMove = objectRect.left + movement.x < colliderRect.right && objectRect.right + movement.x > colliderRect.left;
        const verticalBoundsAfterMove = objectRect.top + movement.y < colliderRect.bottom && objectRect.bottom + movement.y > colliderRect.top;

        return {
            horizontal: horizontalBoundsAfterMove && verticalBounds,
            vertical: horizontalBounds && verticalBoundsAfterMove,
        };
    }

    handleCollisions(movement: Movement): Movement {
        const output = {...movement};
        const parentCoords = this.parent.getCoords();
        const parentSizes = this.parent.getSizes();
        const parentRect = rectFromCoordsAndSizes(parentCoords, parentSizes);
        const currentParentTile = this.board.getTileCoords(parentCoords);


        // check only the tiles around the tile the Entity is in
        for (let dx = currentParentTile.x - 2; dx <= currentParentTile.x + 2; dx++) {
            for (let dy = currentParentTile.y - 2; dy <= currentParentTile.y + 2; dy++) {
                const tile = {x: dx, y: dy};
                if (!this.board.isObstacle(tile)) continue;
                
                const colliderCoords = this.board.getCoordsFromTile(tile);
                const colliderRect = rectFromCoordsAndSizes(colliderCoords, BOARD.TILE_SIZES);
                
                const overlaps = this.willOverlap(parentRect, colliderRect, movement);

                // calculate ideal velocity for perfect collision (without any gap in between)
                if (overlaps.horizontal) output.x = signDependantFloor(output.x > 0 ? 
                    Math.max(colliderRect.left - parentRect.right, 0) : 
                    Math.min(parentRect.right - colliderRect.left, 0)
                );
                if (overlaps.vertical) output.y = signDependantFloor(output.y > 0 ? 
                    Math.max(colliderRect.top - parentRect.bottom, 0) : 
                    Math.min(parentRect.bottom - colliderRect.top, 0)
                );
                if (!output.x && !output.y) return { x: 0, y: 0 };
            }
        }
        
        return output;
    }
}