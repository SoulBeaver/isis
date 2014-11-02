module Isis {
    export class InGame extends Phaser.State {
        map: Phaser.Tilemap;
        layer: Phaser.TilemapLayer;

        create() {
            this.game.stage.backgroundColor = "#ffffff";

            this.map = this.game.add.tilemap("oryx_tilemap");
            this.map.addTilesetImage("oryx_world", "oryx_world");
            this.map.addTilesetImage("oryx_creatures", "oryx_creatures");
            this.map.addTilesetImage("oryx_items", "oryx_items");
            this.map.addTilesetImage("oryx_world2", "oryx_world2");

            this.layer = this.map.createLayer("background");
            this.layer.resizeWorld();
        }
    }
} 