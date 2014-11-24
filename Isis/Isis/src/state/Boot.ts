module Isis {
    export class Boot extends Phaser.State {
        preload() {
            this.load.image("preloadBar", "assets/preloadBar.png");
            this.load.json("settings", "assets/settings.json");
        }

        create() {
            this.input.maxPointers = 1;

            this.configureGame();

            this.game.state.start(State.Preloader, false, true);
        }

        configureGame() {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            //scaling options
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setShowAll();
            this.scale.refresh();

            //have the game centered horizontally
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }
    }
} 