import { HORIZONTAL_VELOCITY, UPDATES_PER_SECOND, VERTICAL_VELOCITY } from "../config";
import { Pressed } from "../types/common.types";
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

    constructor(game: Game) {
        this.game = game;
        this.pressed = {
            up: false,
            down: false,
            left: false,
            right: false,
        }

        this.handleButtonDown = this.handleButtonDown.bind(this);
        this.handleButtonUp = this.handleButtonUp.bind(this);
        this.updateMovement = this.updateMovement.bind(this);
        this.calculateDistanceToAdd = this.calculateDistanceToAdd.bind(this);
    }

    handleButtonDown(event: KeyboardEvent) {
        const key: string = event.key.toLowerCase();
        event.preventDefault();

        if (!(key in KEYS_MAPPED)) return;
        this.pressed[KEYS_MAPPED[key]] = true;
    }

    handleButtonUp(event: KeyboardEvent) {
        const key = event.key;
        event.preventDefault();

        if (!(key in KEYS_MAPPED)) return;
        this.pressed[KEYS_MAPPED[key]] = false;
    }

    updateMovement() {
        const pos = this.calculateDistanceToAdd();
        this.game.updatePositions(pos);
    }

    calculateDistanceToAdd() {
        const y = this.pressed.up === this.pressed.down ? 0 : this.pressed.down ? VERTICAL_VELOCITY : -VERTICAL_VELOCITY;
        const x = this.pressed.left === this.pressed.right ? 0 : this.pressed.right ? HORIZONTAL_VELOCITY : -HORIZONTAL_VELOCITY;

        return { x, y };
    }

    start() {
        document.addEventListener('keydown', this.handleButtonDown);
        document.addEventListener('keyup', this.handleButtonUp);

        this.updateInterval = setInterval(this.updateMovement, 1000 / UPDATES_PER_SECOND);
        this.game.updatePositions({x: 1, y: 1});
    }

    destroy() {
        document.removeEventListener('keydown', this.handleButtonDown);
        document.removeEventListener('keyup', this.handleButtonUp);
        clearInterval(this.updateInterval);
    }
}