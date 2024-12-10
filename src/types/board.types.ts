import Cloud from "../classes/environment/Obstacle";

export interface DirectionValues {
    horizontal: number,
    vertical: number,
}

export interface Obstacles {
    [key: string]: Cloud;
};

