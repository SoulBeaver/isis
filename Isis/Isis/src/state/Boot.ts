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
            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            //scaling options
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            //have the game centered horizontally
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;

            //screen size will be set automatically
            this.scale.setScreenSize(true);
        }
    }
} 