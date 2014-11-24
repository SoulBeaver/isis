module Isis {
    export class AnimatingState extends Phaser.State {
        private view: GameView;
        private map: Tilemap;
        private player: Player;
        private nextState: string;

        create() {
            // No initialization logic yet.
        }

        init(args: any) {
            this.view = args[0];
            this.map = args[1];
            this.player = args[2];
            this.nextState = args[3];

            this.view.onTweensFinished.addOnce(() => this.switchToNextState(), this);
            this.view.play();
        }

        update() {
            // TODO:
            // We should still be able to intercept user input
            // such as opening a window, accessing the options, etc.
        }

        private switchToNextState() {
            console.log("Tweens have finished playing.");
            this.game.state.start(this.nextState, false, false, [this.view, this.map, this.player]);
        }
    }
} 