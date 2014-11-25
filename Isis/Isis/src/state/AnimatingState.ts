﻿module Isis {
    export class AnimatingState extends InGameSubState {
        nextState: string;

        constructor(game: Phaser.Game, view: GameView, map: Tilemap, player: Player) {
            super(game, view, map, player);

            this.view.onTweensFinished.addOnce(this.switchToNextState, this);
            this.view.play();
        }

        update() {
            // TODO:
            // We should still be able to intercept user input
            // such as opening a window, accessing the options, etc.
        }

        private switchToNextState() {
            this.onSwitchState.dispatch([this.nextState]);
        }
    }
} 