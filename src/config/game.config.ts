const GAME = {
    UPDATES_PER_SECOND: 60,
    BOARD_MAX_RENDER_DISTANCE: 10,
    PATHFINDING_GRID_RANGE: 50,
    DISTANCE_FOR_GAME_LOST: Math.min(window.innerWidth, 2000), // straight line distance
    BACKGROUND_HEIGHT_PX: 768,
    ENTITY_MAX_Y: 6144,
    ENTITY_MIN_Y: -512,
}

export default GAME;