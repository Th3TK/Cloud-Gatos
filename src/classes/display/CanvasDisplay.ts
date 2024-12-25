import BOARD from "../../config/board.config";
import GAME from "../../config/game.config";
import TEXTURES, { TEXTURE_SIZES } from "../../config/textures.config";
import { Rectangle } from "../../types/display.types";
import { Coordinates, Sizes } from "../../types/common.types";
import { Enemy } from "../../types/enemies.types";
import { randomChoice, safeObjectValues } from "../../utils/misc";
import { straightLineDistance } from "../../utils/positioning";
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
        
        let x = -((offset.x - Date.now()/32) % TEXTURE_SIZES.WATER_WIDTH_SCALED) - TEXTURE_SIZES.WATER_WIDTH_SCALED;
        while(x < window.innerWidth){
            this.canvasDrawImage({x: x, y: canvasY, width: TEXTURE_SIZES.WATER_WIDTH_SCALED + 1, height: TEXTURE_SIZES.WATER_HEIGHT_SCALED}, 'water');
            x += TEXTURE_SIZES.WATER_WIDTH_SCALED;
        }
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

    private drawBackground(playerCoords: Coordinates) {
        const MAX_COORDS = -GAME.ENTITY_MAX_Y;
        const MIN_COORDS = -GAME.ENTITY_MIN_Y;

        const backgroundAspectRatio =  TEXTURE_SIZES.BACKGROUND_WIDTH_PX / TEXTURE_SIZES.BACKGROUND_HEIGHT_PX 
        const width = window.innerWidth;
        const height = window.innerWidth / backgroundAspectRatio;

        const MAX_OFFSET = height - TEXTURE_SIZES.BACKGROUND_HEIGHT_PX - 100;

        const backgroundOffset = MAX_OFFSET * (MAX_COORDS - playerCoords.y) / (MIN_COORDS - MAX_COORDS);

        this.canvasDrawImage({x: 0, y: backgroundOffset, width, height}, 'background')
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
            if(!enemy.isHidden()) this.drawEntity(enemy, offset)
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

    update(player: Player, enemies: EnemiesHolder, gatoBoxPair?: GatoBoxPair | null) {
        const playerCoords = player.getCenter()

        this.clearCanvas();
        this.drawBackground(playerCoords);
        
        this.updateObstacles(playerCoords);
        if(gatoBoxPair) this.updateGatoBoxPair(gatoBoxPair, playerCoords);
        if(enemies)     this.updateEnemies(enemies, playerCoords);
        
        this.drawWaterLine(playerCoords);
        this.updateVignette(playerCoords, gatoBoxPair?.gato);
    }
}