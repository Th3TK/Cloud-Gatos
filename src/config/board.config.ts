import { Sizes } from "../types/common.types";

const BOARD = {
    TILE_SIZES: {
        width: 250,
        height: 120,
    } as Sizes,
    HEIGHT_LIMIT_TILE: 55,  // limits upwards movement 
    MAX_HEIGHT_CLOUDS: 50,   
    MIN_HEIGHT_CLOUDS: 0,    
    WATER_LEVEL_TILE: -5,    // water level
}

export default BOARD;