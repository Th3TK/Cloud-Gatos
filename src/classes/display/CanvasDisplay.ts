import BOARD from "../../config/board.config";
import TEXTURES from "../../config/textures.config";
import { Rectangle } from "../../types/canvas.types";
import { Coordinates, CoordinatesPair, Sizes } from "../../types/common.types";
import { Enemy } from "../../types/enemies.types";
import { safeObjectValues } from "../../utils/misc";
import { pairToCoords } from "../../utils/positioning";
import Entity from "../core/Entity";
import EnemiesHolder from "../enemies/EnemiesHolder";
import Raven from "../enemies/Raven";
import Board from "../environment/Board";
import Obstacle from "../environment/Obstacle";
import GatoBoxPair from "../game/GatoBoxPair";
import Player from "../game/Player";
import TextureBank from "./TextureBank";

export default class CanvasDisplay {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private board: Board;
    private textureBank: TextureBank = new TextureBank(TEXTURES);

    constructor(canvas: HTMLCanvasElement, board: Board) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.board = board;

        this.canvas.width = window.innerWidth * devicePixelRatio;
        this.canvas.height = window.innerHeight * devicePixelRatio;
        
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        this.ctx.imageSmoothingEnabled = false;
    }
    
    private getCanvasRect = (coords: Coordinates, sizes: Sizes, offset: Coordinates) : Rectangle => ({
        x: coords.x - offset.x + window.innerWidth / 2,
        y: coords.y - offset.y + window.innerHeight / 2,
        width: sizes.width,
        height: sizes.height,
    });

    private canvasFillRect = (rect: Rectangle, color: string | CanvasGradient | CanvasPattern) => {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    }

    private canvasDrawImage = (rect: Rectangle, key: string, flippedX: boolean = false) => {
        const img = this.textureBank.getImageElement(key);
        if(!img) return;
        this.ctx.save();
        if (flippedX) {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(img, -rect.x - rect.width, rect.y, rect.width, rect.height);
        }
        this.ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
        this.ctx.restore();
    }

    private drawEntity(entity: Entity, offset: Coordinates) {
        const sizes = entity.getSizes();
        const coords = entity.getCoords();
        const textureKey = entity.getCurrentTextureKey();
        if(!sizes || !coords || !textureKey) return;
        this.canvasDrawImage(this.getCanvasRect(coords, sizes, offset), textureKey, entity.isTextureFlipped()); 
    }

    private updateGatoBoxPair(gatoBoxPair: GatoBoxPair, offset: Coordinates) {
        [gatoBoxPair.box, gatoBoxPair.gato].forEach(e => 
            this.drawEntity(e, offset)
        );
    }

    private updateEnemies(enemies: EnemiesHolder, offset: Coordinates) {
        enemies.getEnemies().forEach((enemy: Enemy) => 
            this.drawEntity(enemy, offset)
        );
    }
    
    private updateObstacles(offset: Coordinates) {
        safeObjectValues(this.board.getObstacles()).forEach((obstacle: Obstacle) => {
            const coords = this.board.getCoordsFromTile(obstacle.getTileCoords())
            const sizes = obstacle.getSizes();
            this.canvasDrawImage(this.getCanvasRect(coords, sizes, offset), 'cloud');
        })
    }

    private drawPath(enemy: Raven, offset: Coordinates) {
        if(!enemy.getPath()) return;
        this.ctx.strokeStyle = "red"; // Line color for the path
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
    
        enemy.getPath()?.forEach((step, index) => {
            const coords = enemy.pathElementToCoords(step);
            const canvasCoords = {
                x: coords.x - offset.x + window.innerWidth / 2,
                y: coords.y - offset.y + window.innerHeight / 2,
            };
    
            if (index === 0) {
                // Move to the starting point
                this.ctx.moveTo(canvasCoords.x, canvasCoords.y);
            } else {
                // Draw a line to the next point
                this.ctx.lineTo(canvasCoords.x, canvasCoords.y);
            }
    
            // Draw a small circle at the step
            this.ctx.beginPath();
            this.ctx.arc(canvasCoords.x, canvasCoords.y, 5, 0, 2 * Math.PI);
            this.ctx.fillStyle = "blue"; // Color for the path points
            this.ctx.fill();
            this.ctx.closePath();
        });
    
        this.ctx.stroke();
        this.ctx.closePath();
    }

    update(player: Player, enemies: EnemiesHolder, gatoBoxPair?: GatoBoxPair | null) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const playerCoords = player.getCoords()

        this.updateObstacles(playerCoords);
        enemies.getEnemies().forEach(enemy => this.drawPath(enemy, playerCoords))
        if(gatoBoxPair) this.updateGatoBoxPair(gatoBoxPair, playerCoords);
        if(enemies) this.updateEnemies(enemies, playerCoords);

    }
}