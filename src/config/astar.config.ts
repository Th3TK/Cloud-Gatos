import { Heuristic } from "astar-typescript/dist/types/astar.types";

const ASTAR = {
    diagonalAllowed: false,
    includeStartNode: true,
    includeEndNode: true,
    allowPathAsCloseAsPossible: true,
    heuristic: 'Euclidean' as Heuristic
}

export default ASTAR;
