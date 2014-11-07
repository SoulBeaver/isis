module Isis {
    export class Boot extends Phaser.State {
        preload() {
            this.load.image("preloadBar", "assets/preloadBar.png");
        }

        create() {
            this.input.maxPointers = 1;

            this.configureGame();

            this.game.state.start("Preloader", false, true);
        }

        configureGame() {
            this.game.physics.startSystem(Phaser.Physics.P2JS);
            this.game.physics.p2.restitution = 0;
            this.game.physics.p2.gravity.y = 0;
        }
    }
} 