module Isis {
    export class Preloader extends Phaser.State {
        preloadBar: Phaser.Sprite;

        preload() {
            this.preloadBar = this.add.sprite(200, 250, "preloadBar");
            this.load.setPreloadSprite(this.preloadBar);

            this.loadAssets();
        }

        loadAssets() {
            this.load.pack("maze", "assets/manifest.json");
            this.load.json("manifest", "assets/manifest.json");
        }

        create() {
            this.add.tween(this.preloadBar)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startMainMenu, this);
        }

        startMainMenu() {
            // We're skipping the main menu to ease testing of gameplay- no need to click through the menu.
            this.game.state.start(State.InGame, true, false);
        }
    }
}  