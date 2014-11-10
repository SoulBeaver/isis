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
        }

        create() {
            this.add.tween(this.preloadBar)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startMainMenu, this);
        }

        startMainMenu() {
            this.game.state.start("InGame", true, false);
        }
    }
}  