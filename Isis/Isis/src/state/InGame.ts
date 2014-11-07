module Isis {
    export class InGame extends Phaser.State {
        map: Phaser.Tilemap;
        backgroundLayer: Phaser.TilemapLayer;
        itemLayer: Phaser.TilemapLayer;
        creatureLayer: Phaser.TilemapLayer;

        create() {
            this.game.stage.backgroundColor = "#ffffff";

            this.map = this.game.add.tilemap("maze");

            this.map.addTilesetImage("World_Tiles", "world_tileset");
            this.map.addTilesetImage("Creatures", "creatures_tileset");
            this.map.addTilesetImage("Items", "items_tileset");
            this.map.addTilesetImage("World_Objects", "world_objects_tileset");

            this.backgroundLayer = this.map.createLayer("Background");
            this.itemLayer = this.map.createLayer("Objects");
            this.creatureLayer = this.map.createLayer("Creatures");

            this.backgroundLayer.resizeWorld();
        }
    }
} 