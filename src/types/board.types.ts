import Cloud from "../classes/environment/Cloud";

export interface DirectionValues {
    horizontal: number,
    vertical: number,
}

export interface Obstacles {
    [key: string]: Cloud;
};

