import { Coordinates, Sizes } from "../../types/common.types";
import { safeObjectValues } from "../../utils/misc";
import Board from "../environment/Board";
import Obstacle from "../environment/Obstacle";
import GatoBoxPair from "../game/GatoBoxPair";
import Player from "../game/Player";

export default class CanvasDisplay {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private board: Board;

    constructor(canvas: HTMLCanvasElement, board: Board) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.board = board;

        this.canvas.width = window.innerWidth * devicePixelRatio;
        this.canvas.height = window.innerHeight * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    
    private getCanvasRect = (coords: Coordinates, sizes: Sizes, offset: Coordinates) : number[] => [
        coords.x - offset.x + window.innerWidth / 2,
        coords.y - offset.y + window.innerHeight / 2,
        sizes.width, sizes.height
    ]

    private canvasFillRect = (canvasRect: number[], color: string | CanvasGradient | CanvasPattern) => {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(canvasRect[0], canvasRect[1], canvasRect[2], canvasRect[3])
    }

    private updateGatoBoxPair(gatoBoxPair: GatoBoxPair, offset: Coordinates) {
        const boxCoords = gatoBoxPair.box.getCoords();
        const boxSizes = gatoBoxPair.box.getSizes();
        this.canvasFillRect(this.getCanvasRect(boxCoords, boxSizes, offset), 'brown');

        const gatoCoords = gatoBoxPair.gato.getCoords();
        const gatoSizes = gatoBoxPair.gato.getSizes();
        this.canvasFillRect(this.getCanvasRect(gatoCoords, gatoSizes, offset), 'orange');
    }

    private updateObstacles(offset: Coordinates) {
        safeObjectValues(this.board.getObstacles()).forEach((obstacle: Obstacle) => {
            const coords = this.board.getCoordsFromTile(obstacle.getTileCoords())
            const sizes = obstacle.getSizes();
            this.canvasFillRect(this.getCanvasRect(coords, sizes, offset), 'gray');
        })
    }

    update(player: Player, gatoBoxPair?: GatoBoxPair | null) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const playerCoords = player.getCoords()

        this.updateObstacles(playerCoords);
        if(gatoBoxPair) this.updateGatoBoxPair(gatoBoxPair, playerCoords);
    }
}