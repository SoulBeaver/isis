/// <reference path="../libs/lodash/lodash.d.ts" />

module Isis {
    export interface TileCoordinates { x: number; y: number };
    export interface WorldCoordinates { x: number; y: number };

    export class Tilemap extends Phaser.Tilemap {
        WALLS_LAYER      = "Walls";
        BACKGROUND_LAYER = "Background";
        CREATURES_LAYER  = "Creatures";
        ITEMS_LAYER      = "Items";
        OBJECTS_LAYER    = "Objects";

        wallLayer: Phaser.TilemapLayer;
        backgroundLayer: Phaser.TilemapLayer;
        shadowLayer: Phaser.TilemapLayer;
        itemLayer: Phaser.TilemapLayer;
        objectLayer: Phaser.TilemapLayer;
        creatureLayer: Phaser.TilemapLayer;

        constructor(game: Phaser.Game, key: string, manifest: any) {
            super(game, key);

            var tilesetImages = _.filter(manifest.maze, (asset: JSONAsset) => asset.type == "image")
                                 .forEach((asset: JSONAsset) => {
                                     var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
                                     this.addTilesetImage(tileset, asset.key);
                                 });

            this.wallLayer       = this.createLayer("Walls");
            this.backgroundLayer = this.createLayer("Background");
            this.shadowLayer     = this.createLayer("Shadows");
            this.itemLayer       = this.createLayer("Items");
            this.objectLayer     = this.createLayer("Objects");
            this.creatureLayer   = this.createLayer("Creatures");

            this.backgroundLayer.resizeWorld();
            this.setCollisionBetween(1, 2, true, "Walls");
        }

        isWall(at: TileCoordinates) {
            return this.tileExists(at, this.WALLS_LAYER);
        }

        tileExists(at: TileCoordinates, layer: string) {
            var tile = this.getTile(at.x, at.y, layer); 
            return tile && tile.index != 0;
        }
    }
} 
