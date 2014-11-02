module Isis {
    export class Boot extends Phaser.State {
        preload() {
            this.load.image("preloadBar", "assets/preloadBar.png");
        }

        create() {
            this.input.maxPointers = 1;

            this.game.state.start("Preloader", false, true);
        }
    }
} 