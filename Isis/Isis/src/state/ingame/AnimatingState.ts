/// <reference path="InGameSubState.ts"/>

module Isis {
    export class AnimatingState extends InGameSubState {
        nextState: string;

        constructor(game: Phaser.Game, view: GameView, map: Tilemap, player: Player) {
            super(game, view, map, player);
        }

		initialize(map?: Tilemap, player?: Player) {
			super.initialize(map, player);

            this.view.onTweensFinished.add(this.switchToNextState, this);
            this.view.play();
        }

        update() {

        }

        private switchToNextState() {
            this.onSwitchState.dispatch([this.nextState]);
        }
    }
}