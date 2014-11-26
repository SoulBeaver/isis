module Isis {
    /**
     * Boot configures the game (dimensions, scale, platform-dependent code, etc)
     * and loads the loading bar for the upcoming asset loading.
     */
    export class Boot extends Phaser.State {
        preload() {
            this.load.image("preloadBar", "assets/preloadBar.png");
            this.load.json("settings", "assets/settings.json");
        }

        create() {
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