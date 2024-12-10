import { GAME, PLAYER } from "../../config/_config";
import { Pressed } from "../../types/common.types";
import { clampEqual } from "../../utils/misc";
import { Game } from "./Game";

const KEYS_MAPPED : {[x: string]: string} = {
    'w': 'up',
    's': 'down',
    'a': 'left',
    'd': 'right',
}

export default class MovementHandler {
    game: Game;
    pressed: Pressed;
    updateInterval: number;
    verticalVelocity: number = 0;
    horizontalVelocity: number = 0;

    constructor(game: Game) {
        this.game = game;
        this.pressed = {
            up: false,
            down: false,
            left: false,
            right: false,
        }

        this.keyPress = this.keyPress.bind(this);
        this.keyRelease = this.keyRelease.bind(this);
        this.updateMovement = this.updateMovement.bind(this);
        this.calculateDistanceToAdd = this.calculateDistanceToAdd.bind(this);
    }

    public keyPress(event: KeyboardEvent) {
        const key: string = event.key.toLowerCase();
        this.pressed[KEYS_MAPPED[key]] = true;
    }

    public keyRelease(event: KeyboardEvent) {
        const key: string = event.key.toLowerCase();
        this.pressed[KEYS_MAPPED[key]] = false;
    }

    private clearMovement = () => Object.keys(this.pressed).forEach(key => this.pressed[key] = false);

    private updateMovement() {
        const pos = this.calculateDistanceToAdd();
        this.game.tick(pos);
    }

    private calculateVelocity() {
        let horizontal = this.horizontalVelocity;
        let vertical = this.verticalVelocity;

        if(this.pressed.right || this.pressed.left ) {
            horizontal += this.pressed.right ? PLAYER.ACCELERATION : -PLAYER.ACCELERATION;
            horizontal += !this.pressed.left ? PLAYER.ACCELERATION : -PLAYER.ACCELERATION;
            horizontal = clampEqual(horizontal, PLAYER.MAX_VELOCITY.horizontal);
        }
        else horizontal = 0;

        if(this.pressed.down || this.pressed.up) {
            vertical += this.pressed.down ? PLAYER.ACCELERATION : -PLAYER.ACCELERATION;
            vertical += !this.pressed.up  ? PLAYER.ACCELERATION : -PLAYER.ACCELERATION;
            vertical = clampEqual(vertical, PLAYER.MAX_VELOCITY.vertical);
        }
        else vertical = 0;
        
        this.horizontalVelocity = horizontal;
        this.verticalVelocity = vertical;
    }

    private calculateDistanceToAdd() {
        this.calculateVelocity();

        return { 
            x: this.horizontalVelocity, 
            y: this.verticalVelocity 
        };
    }

    public start() {
        window.addEventListener('blur', this.clearMovement);

        this.updateInterval = setInterval(this.updateMovement, 1000 / GAME.UPDATES_PER_SECOND);
        this.game.tick({x: 1, y: 1});
    }

    public stop() {
        window.removeEventListener('blur', this.clearMovement);
        clearInterval(this.updateInterval);
    }
}