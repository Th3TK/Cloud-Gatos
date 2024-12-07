export type KeyActionCallback = (event: KeyboardEvent) => void;

export interface KeyActions {
    [key: string]: KeyActionCallback;
}