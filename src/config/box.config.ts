import { MinMax, Sizes } from "../types/common.types";

const BOX = {
    SPAWN_DISTANCE_HORIZONTAL: {min: 2, max: 2} as MinMax,
    SPAWN_DISTANCE_VERTICAL: {min: 2, max: 2} as MinMax,
    SIZES: {
        width: 75,
        height: 25,
    } as Sizes,
    TEXTURE_KEYS: ['box_opened', 'box_closed']
}

export default BOX;