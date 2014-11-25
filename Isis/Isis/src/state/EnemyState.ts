module Isis {
    export class EnemyState extends InGameSubState {
        update() {
            this.switchToAnimatingState();
        }

        private switchToAnimatingState() {
            this.game.state.start(State.AnimatingState, false, false, [this.view, this.map, this.player, State.PlayerState]);
        }
    }
} 