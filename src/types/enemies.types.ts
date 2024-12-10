import Raven from "../classes/enemies/Raven";
import Gato from "../classes/game/Gato";
import Player from "../classes/game/Player";

export type Enemy = Raven;

export type EnemyModes = 'disengage' | 'attack' | 'escape';

export type EnemyTargets = Player | Gato | null;
