import { MinMax, Sizes } from "../types/common.types";

export const GATO = {
    ACCELERATION: 1,
    MAX_SPEED: 20,
    SPAWN_DISTANCE_HORIZONTAL: {min: 5, max: 10} as MinMax,
    SPAWN_DISTANCE_VERTICAL: {min: 5, max: 10} as MinMax,
    SIZES: {
        width: 70,
        height: 65,
    } as Sizes,
    COLORS: ['orange', 'black'],
    TEXTURE_KEYS: [
        'gato_orange_sitting_right',
        'gato_orange_picked_right',
        'gato_black_sitting_right',
        'gato_black_picked_right',
        'gato_orange_sitting_left',
        'gato_orange_picked_left',
        'gato_black_sitting_left',
        'gato_black_picked_left',
    ]
}

export default GATO;