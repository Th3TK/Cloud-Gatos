import BOARD from "../../config/board.config";
import GAME from "../../config/game.config";
import { Coordinates } from "../../types/common.types";
import { clamp } from "../../utils/misc";
import Board from "../environment/Board";

console.log(GAME.BACKGROUND_HEIGHT_PX)
const MAX_OFFSET = window.innerHeight * 2 - 100;
const MIN_OFFSET = 0;

export default class BackgroundPositioner {
    board: Board;

    constructor(board: Board) {
        this.board = board;
    }
    
    private calculatePositionY(playerY: number) {
        const MAX_COORDS = this.board.getCoordsFromTile({x: 0, y: -BOARD.MAX_HEIGHT_CLOUDS}).y;
        const MIN_COORDS = this.board.getCoordsFromTile({x: 0, y: -BOARD.WATER_LEVEL_TILE}).y;
        
        const positionY = MAX_OFFSET * (playerY - MAX_COORDS) / (MIN_COORDS - MAX_COORDS);
        return -clamp(positionY, MAX_OFFSET, MIN_OFFSET);
    }
    
    public updatePosition(playerCoords: Coordinates) {
        const positionY = this.calculatePositionY(playerCoords.y);
        // console.log(percentage);
        document.body.style.backgroundPositionY = `${positionY}px`;
    }
}