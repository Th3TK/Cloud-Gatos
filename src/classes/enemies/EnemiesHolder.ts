import BOARD from "../../config/board.config";
import GAME from "../../config/game.config";
import { Coordinates, Direction } from "../../types/common.types";
import { Enemy, EnemyModes, EnemyTargets, RavenColors } from "../../types/enemies.types";
import { clamp, randomChoice, randomNumber, squareMatrixFrom } from "../../utils/misc";
import { reverseOffsetCoords, straightLineDistance } from "../../utils/positioning";
import PathfindingMatrix from "../core/PathfindingMatrix";
import Board from "../environment/Board";
import Gato from "../game/Gato";
import Player from "../game/Player";
import Raven from "./Raven";

export default class EnemiesHolder {
    private enemies: Enemy[] = [];
    private mode: EnemyModes;
    private board: Board;
    private player: Player;
    private gato?: Gato;
    private pathfindingMatrix: PathfindingMatrix;
    private freeColors: RavenColors[] = ['red', 'pink', 'orange', 'cyan'];

    constructor(board: Board, player: Player, gato?: Gato) {
        this.player = player;
        this.gato = gato;
        this.board = board;
        this.pathfindingMatrix = new PathfindingMatrix(board, GAME.PATHFINDING_GRID_RANGE * 2 + 1);

        this.shiftMatrix = this.shiftMatrix.bind(this);
    }

    /* .................................. */
    /*         setters, getters           */
    /* .................................. */

    public getMode = (): EnemyModes => this.mode;
    public setMode = (value: EnemyModes) => {this.mode = value;}
    public getEnemies = (): Enemy[] => this.enemies;
    public addEnemy = () => {
        if(!this.freeColors.length) return;
        const color = randomChoice(this.freeColors);
        const index = this.freeColors.indexOf(color);
        this.freeColors.splice(index, 1);
        
        this.enemies.push(new Raven(this.board, color));
    };
    public setTarget = (target: EnemyTargets) => this.enemies.forEach(enemy => enemy.setTarget(target));
    public clearTarget = () => this.enemies.forEach(enemy => enemy.clearTarget());
    public assignGato = (gato: Gato) => this.gato = gato;

    /* .................................. */
    /*               matrix               */
    /* .................................. */
    
    public shiftMatrix = (direction: Direction) => this.pathfindingMatrix.shift(direction);

    /* .................................. */
    /*               modes                */
    /* .................................. */

    public enterAttackMode() {
        if(!this.gato) return false;
        this.setTarget(this.player.getPickable() ? this.player : this.gato);
        this.setMode('attack');
        return true;
    }

    public enterDisengageMode() {
        this.setTarget(null);
        this.setMode('disengage');
    }

    public enterEscapeMode() {
        this.setTarget(null);
        this.setMode('escape');
    }

    /* .................................. */
    /*              updates               */
    /* .................................. */

    private getTargetTileCoords(enemy: Enemy) : Coordinates {
        const currentPlayerTile = this.board.getCurrentTileCoords();
        const playerToTheRight = (enemy: Enemy) => currentPlayerTile.x - this.board.getTileCoords(enemy.getCoords()).x > 0;
        
        // furthest point away from the player in the x direction:
        const escapeCoords = (enemy: Enemy) => {
            const x = playerToTheRight(enemy) ? 0 : this.pathfindingMatrix.getSize() - 1;
            const y = clamp(currentPlayerTile.y + randomNumber(-10, 10), BOARD.HEIGHT_LIMIT_TILE, BOARD.WATER_LEVEL_TILE);
            const offset = enemy.getOffset(currentPlayerTile);
            const tile = reverseOffsetCoords({x, y}, offset);

            while(this.board.isObstacle(tile)) tile.x += x > 0 ? -1 : 1;
            return tile;
        }

        const targetGetters = {
            'disengage': (enemy: Enemy) => escapeCoords(enemy),
            'escape': (enemy: Enemy) => escapeCoords(enemy),
            'attack': (enemy: Enemy) => this.board.getTileCoords(enemy.getTarget()!.getCoords()),
        }

        return targetGetters[this.mode](enemy);
    }
    

    // true if successful gato steal 
    private tryStealingGato = (enemy: Enemy) => {
        if(!this.gato || this.mode !== 'attack') return false;
        
        const pickedGato = enemy.tryPick(this.gato);
        if(pickedGato) this.enterEscapeMode();
        return pickedGato;
    }

    private spawn(enemy: Enemy) {        
        enemy.setPath([]);

        const playerCoords = this.player.getCoords();
        const randomYOffset = (randomNumber(0, 20) - 10) * BOARD.TILE_SIZES.height;

        const spawnCoords = {
            x: randomChoice([playerCoords.x - 2000, playerCoords.x + 2000]),
            y: clamp(playerCoords.y + randomYOffset, BOARD.HEIGHT_LIMIT_TILE, BOARD.WATER_LEVEL_TILE),
        }

        console.log(spawnCoords);

        while(this.board.isObstacle(this.board.getTileCoords(spawnCoords))) 
            spawnCoords.x += (spawnCoords.x > playerCoords.x ? BOARD.TILE_SIZES.width : -BOARD.TILE_SIZES.width);

        enemy.setCoords(spawnCoords)
        enemy.show();
    }

    private isEnemyOutOfView = (enemy: Enemy) => straightLineDistance(this.player.getCoords(), enemy.getCoords()) > GAME.BOARD_MAX_RENDER_DISTANCE * this.board.getTileSize().width;

    // returns the enemy that stole the gato
    public updateEnemies = () => this.enemies.find(enemy => {
        if(this.mode === 'disengage' && enemy.isHidden()) return;
        if(this.mode === 'disengage' && this.isEnemyOutOfView(enemy)) enemy.hide();
        if(this.mode !== 'disengage' && enemy.isHidden()) this.spawn(enemy);

        enemy.pathfind(this.pathfindingMatrix.getMatrix(), this.getTargetTileCoords(enemy));
        enemy.followPath();

        if(this.mode === 'attack') return this.tryStealingGato(enemy);
    });
}