import { KeyActionCallback, KeyActions } from "../../types/keyboard.types";

export default class KeyboardHandler {
    private onKeyDown: KeyActions = {};
    private onKeyUp: KeyActions = {};

    constructor() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    public registerKeyDown(key: string, callback: KeyActionCallback) {
        this.onKeyDown[key.toLowerCase()] = callback;
    }

    public registerKeysDown(keys: string[], callback: KeyActionCallback) {
        keys.forEach(key => this.onKeyDown[key.toLowerCase()] = callback);
    }

    public registerKeyUp(key: string, callback: KeyActionCallback) {
        this.onKeyUp[key.toLowerCase()] = callback;
    }

    public registerKeysUp(keys: string[], callback: KeyActionCallback) {
        keys.forEach(key => this.onKeyUp[key.toLowerCase()] = callback);
    }

    private handleKeyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if(!(key in this.onKeyDown)) return;

        event.preventDefault();
        this.onKeyDown[key](event);
    }

    private handleKeyUp(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if(!(key in this.onKeyUp)) return;

        event.preventDefault();
        this.onKeyUp[key](event);
    }

    start() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    stop() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}