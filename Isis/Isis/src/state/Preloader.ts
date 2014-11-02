module Isis {
    export class Preloader extends Phaser.State {
        preloadBar: Phaser.Sprite;

        preload() {
            this.preloadBar = this.add.sprite(200, 250, "preloadBar");
            this.load.setPreloadSprite(this.preloadBar);

            this.loadAssets();
        }

        loadAssets() {
            this.load.tilemap("oryx_tilemap", "assets/tilemaps/maps/oryx_test.json", null, Phaser.Tilemap.TILED_JSON);
            this.load.image("oryx_creatures", "assets/tilemaps/tiles/oryx_creatures.png");
            this.load.image("oryx_items", "assets/tilemaps/tiles/oryx_items.png");
            this.load.image("oryx_tiles", "assets/tilemaps/tiles/oryx_tiles.png");
            this.load.image("oryx_world", "assets/tilemaps/tiles/oryx_world.png");
            this.load.image("oryx_world2", "assets/tilemaps/tiles/oryx_world2.png");
        }

        create() {
            this.add.tween(this.preloadBar)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startMainMenu, this);
        }

        startMainMenu() {
            this.game.state.start("MainMenu", true, false);
        }
    }
}  