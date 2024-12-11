import BOARD from "../../config/board.config";
import GAME from "../../config/game.config";
import TEXTURES, { COLORS } from "../../config/textures.config";
import { Rectangle } from "../../types/canvas.types";
import { Coordinates, CoordinatesPair, Sizes } from "../../types/common.types";
import { Enemy } from "../../types/enemies.types";
import { safeObjectValues } from "../../utils/misc";
import { pairToCoords, straightLineDistance } from "../../utils/positioning";
import Entity from "../core/Entity";
import EnemiesHolder from "../enemies/EnemiesHolder";
import Raven from "../enemies/Raven";
import Board from "../environment/Board";
import Obstacle from "../environment/Obstacle";
import Gato from "../game/Gato";
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

    private shouldRender(rect: Rectangle): boolean {
        const canvasBounds = {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight,
        };

        const isOutside =
            rect.x + rect.width < canvasBounds.x ||
            rect.x > canvasBounds.x + canvasBounds.width || 
            rect.y + rect.height < canvasBounds.y || 
            rect.y > canvasBounds.y + canvasBounds.height; 

        return !isOutside;
    }

    /* .................................. */
    /* core functions for canvas manipulation */
    /* .................................. */

    private clearCanvas = () => this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    private getCanvasRect = (coords: Coordinates, sizes: Sizes, offset: Coordinates) : Rectangle => ({
        x: coords.x - offset.x + window.innerWidth / 2,
        y: coords.y - offset.y + window.innerHeight / 2,
        width: sizes.width,
        height: sizes.height,
    });

    /* .................................. */
    /*               DRAW                 */
    /* .................................. */

    private canvasFillRect = (rect: Rectangle, color: string | CanvasGradient | CanvasPattern) => {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    }

    private canvasDrawImage = (rect: Rectangle, key: string) => {
        const img = this.textureBank.getImageElement(key);
        if(!img) return;

        this.ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    }

    private drawEntity(entity: Entity, offset: Coordinates) {
        const sizes = entity.getSizes();
        const coords = entity.getCoords();
        const textureKey = entity.getCurrentTextureKey();
        if(!sizes || !coords || !textureKey) return;

        const rect = this.getCanvasRect(coords, sizes, offset)
        if(!this.shouldRender(rect)) return;

        this.canvasDrawImage(rect, textureKey); 
    }

    private drawWaterLine(offset: Coordinates) {
        const waterCoordinateY = this.board.getCoordsFromTile({x: 0, y: -BOARD.WATER_LEVEL_TILE}).y;
        const canvasY = waterCoordinateY + BOARD.TILE_SIZES.height - offset.y + window.innerHeight / 2;
        
        this.canvasFillRect({x: 0, y: canvasY, width: window.innerWidth, height: window.innerHeight - canvasY}, COLORS.water2);
    }

    private drawVignette(playerCoords: Coordinates, enemyCoords: Coordinates) {
        const distance = straightLineDistance(playerCoords, enemyCoords);
        const vignetteIntensity = Math.min(1, distance / GAME.DISTANCE_FOR_GAME_LOST);

        const maxRadius = Math.max(window.innerWidth, window.innerHeight) * 0.5; 

        const gradient = this.ctx.createRadialGradient(
            window.innerWidth / 2, window.innerHeight / 2, 0, 
            window.innerWidth / 2, window.innerHeight / 2, maxRadius 
        );

        gradient.addColorStop(0, "rgba(0, 0, 0, 0)"); 
        gradient.addColorStop(1, `rgba(255, 0, 0, ${vignetteIntensity * 0.5})`); 

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    /* .................................. */
    /*              UPDATE                */
    /* .................................. */

    private updateGatoBoxPair(gatoBoxPair: GatoBoxPair, offset: Coordinates) {
        [gatoBoxPair.box, gatoBoxPair.gato].forEach(e => 
            this.drawEntity(e, offset)
        );
    }

    private updateEnemies(enemies: EnemiesHolder, offset: Coordinates) {
        enemies.getEnemies().forEach((enemy: Enemy) => {
            this.drawEntity(enemy, offset)
        });
    }
    
    private updateObstacles(offset: Coordinates) {
        safeObjectValues(this.board.getObstacles()).forEach((obstacle: Obstacle) => {
            const coords = this.board.getCoordsFromTile(obstacle.getTileCoords())
            const sizes = obstacle.getSizes();
            this.canvasDrawImage(this.getCanvasRect(coords, sizes, offset), 'cloud');
        })
    }

    private updateVignette(playerCoords: Coordinates, gato: Gato | undefined) {
        if(!gato) return;
        if(!gato?.isPicked() || !(gato.getCarrier() instanceof Raven)) return;
        
        this.drawVignette(playerCoords, gato.getCarrier()?.getCoords()!);
    }
    
    /* .................................. */
    /*             DEBUGGING              */
    /* .................................. */

    private drawPath(enemy: Raven, offset: Coordinates) {
        if(!enemy.getPath()) return;
        this.ctx.strokeStyle = "red"; // Line color for the path
        this.ctx.lineWidth = 3;
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
        });
    
        this.ctx.stroke();
        this.ctx.closePath();

        enemy.getPath()?.forEach((step, index) => {
            const coords = enemy.pathElementToCoords(step);
            const canvasCoords = {
                x: coords.x - offset.x + window.innerWidth / 2,
                y: coords.y - offset.y + window.innerHeight / 2,
            };
    
            // Draw a small circle at the step
            this.ctx.beginPath();
            this.ctx.arc(canvasCoords.x, canvasCoords.y, 5, 0, 2 * Math.PI);
            this.ctx.fillStyle = "darkred"; // Color for the path points
            this.ctx.fill();
            this.ctx.closePath();
        });
    }    

    update(player: Player, enemies: EnemiesHolder, gatoBoxPair?: GatoBoxPair | null) {
        this.clearCanvas();
        
        const playerCoords = player.getCoords()
        
        enemies.getEnemies().forEach(enemy => this.drawPath(enemy, playerCoords)) // ? debugging
        
        this.updateObstacles(playerCoords);
        if(gatoBoxPair) this.updateGatoBoxPair(gatoBoxPair, playerCoords);
        if(enemies)     this.updateEnemies(enemies, playerCoords);
        
        this.drawWaterLine(playerCoords);
        this.updateVignette(playerCoords, gatoBoxPair?.gato);
    }
}