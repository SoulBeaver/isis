module Isis {
    export class Preloader extends Phaser.State {
        preloadBar: Phaser.Sprite;

        preload() {
            this.preloadBar = this.add.sprite(200, 250, "preloadBar");
            this.load.setPreloadSprite(this.preloadBar);

            this.loadAssets();
        }

        loadAssets() {
            this.load.tilemap("maze", "assets/tilemaps/maps/Maze.json", null, Phaser.Tilemap.TILED_JSON);

            this.load.image("creatures_tileset", "assets/tilemaps/tiles/Creatures.png");
            this.load.image("items_tileset", "assets/tilemaps/tiles/Items.png");
            this.load.image("world_tileset", "assets/tilemaps/tiles/World_Tiles.png");
            this.load.image("world_objects_tileset", "assets/tilemaps/tiles/World_Objects.png");

            this.load.atlas("creature_atlas", "assets/spritesheets/creature_atlas.png", "assets/spritesheets/creature_atlas.json");
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