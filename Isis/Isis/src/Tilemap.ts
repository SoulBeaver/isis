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

        creatures: Array<Phaser.Sprite>;
        items: Array<Phaser.Sprite>;

        private wallLayer: Phaser.TilemapLayer;
        private backgroundLayer: Phaser.TilemapLayer;
        private shadowLayer: Phaser.TilemapLayer;
        private itemLayer: Phaser.TilemapLayer;
        private objectLayer: Phaser.TilemapLayer;
        private creatureLayer: Phaser.TilemapLayer;

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

            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();

            this.backgroundLayer.resizeWorld();
            this.setCollisionBetween(1, 2, true, "Walls");
        }

        private separateCreaturesFromTilemap() {
            this.creatures = this.extractFrom(this.creatureLayer, (creatureTile) => {
                var creatureSprite = this.game.add.sprite(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creatureTile.properties.atlas_name + "_1.png", creatureTile.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");

                return creatureSprite;
            });
        }

        private separateItemsFromTilemap() {
            this.items = this.extractFrom(this.itemLayer, (itemTile) => {
                var itemSprite = this.game.add.sprite(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name + ".png");
                // Center sprite in tile.
                itemSprite.x += 4;
                itemSprite.y += 4;

                return itemSprite;
            });
        }

        extractFrom(layer: Phaser.TilemapLayer, converter: (tile: Phaser.Tile) => Phaser.Sprite): Array<Phaser.Sprite> {
            return _.filter(layer.getTiles(0, 0, this.widthInPixels, this.heightInPixels), (tile) => tile.properties.atlas_name)
                    .map((tile) => converter(this.removeTile(tile.x, tile.y, layer)));
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
