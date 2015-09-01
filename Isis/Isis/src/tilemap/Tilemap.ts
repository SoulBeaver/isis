/// <reference path="../../libs/lodash/lodash.d.ts" />

module Isis {
    export class Tilemap extends Phaser.Tilemap {
        private WallsLayer      = "Walls";
        private BackgroundLayer = "Background";
        private ShadowsLayer    = "Shadows";
        private CreaturesLayer  = "Creatures";
        private ItemsLayer      = "Items";
        private ObjectsLayer    = "Objects";
        
        private wallLayer: Phaser.TilemapLayer;
        private backgroundLayer: Phaser.TilemapLayer;
        private shadowLayer: Phaser.TilemapLayer;
        private itemLayer: Phaser.TilemapLayer;
        private objectLayer: Phaser.TilemapLayer;
        private creatureLayer: Phaser.TilemapLayer;

        items: Array<Phaser.Sprite>;
        activatableObjects: Array<Phaser.Sprite>;
        creatures: Array<Phaser.Sprite>;

        constructor(game: Phaser.Game, key: string, manifest: any) {
            super(game, key);

            this.addTilesets(manifest.maze);
            
            this.wallLayer       = this.createLayer(this.WallsLayer);
            this.backgroundLayer = this.createLayer(this.BackgroundLayer);
            this.shadowLayer     = this.createLayer(this.ShadowsLayer);
            this.itemLayer       = this.createLayer(this.ItemsLayer);
            this.objectLayer     = this.createLayer(this.ObjectsLayer);
            this.creatureLayer   = this.createLayer(this.CreaturesLayer);

            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();

            this.backgroundLayer.resizeWorld();
            this.setCollisionBetween(1, 2, true, "Walls");
        }

        private addTilesets(manifestTilemap: any) {
            _.filter(manifestTilemap, (asset: JSONAsset) => asset.type == "image")
             .forEach((asset: JSONAsset) => {
                 var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
                 this.addTilesetImage(tileset, asset.key);
             });
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
            var centerItem = (item: Phaser.Sprite) => { item.x += this.tileWidth / 6; item.y += this.tileHeight / 6; }

            this.items = this.extractFrom(this.itemLayer, (itemTile) => {
                var itemSprite = this.game.add.sprite(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name + ".png");
                centerItem(itemSprite);

                return itemSprite;
            });
        }

        private extractFrom(layer: Phaser.TilemapLayer, converter: (tile: Phaser.Tile) => Phaser.Sprite): Array<Phaser.Sprite> {
            return _.filter(layer.getTiles(0, 0, this.widthInPixels, this.heightInPixels), (tile) => tile.properties.atlas_name)
                    .map((tile) => converter(this.removeTile(tile.x, tile.y, layer)));
        }

        wallAt(at: TileCoordinates) {
            var tile = this.getTile(at.x, at.y, this.WallsLayer);
            return tile && tile.index != 0;
        }

        itemAt(at: TileCoordinates) {
            return _.find(this.items, (item: Phaser.Sprite) => _.isEqual(this.toTileCoordinates(item), at));
        }

        objectAt(at: TileCoordinates) {
            return _.find(this.activatableObjects, (object: Phaser.Sprite) => _.isEqual(this.toTileCoordinates(object), at));
        }

        creatureAt(at: TileCoordinates) {
            return _.find(this.creatures, (creature: Phaser.Sprite) => _.isEqual(this.toTileCoordinates(creature), at));
        }

        leftOf(entity: Phaser.Sprite) {
            this.toTileCoordinates({ x: entity.x - 24, y: entity.y });
        }

        removeItem(item: Phaser.Sprite) {
            _.remove(this.items, (candidate) => _.isEqual(candidate, item));
            item.destroy();
        }

        removeCreature(creature: Phaser.Sprite) {
            _.remove(this.creatures, (candidate) => _.isEqual(candidate, creature));
            creature.destroy();
        }

        toTileCoordinates(worldCoordinates: WorldCoordinates): TileCoordinates {
            return {
                x: Math.floor(worldCoordinates.x / this.tileWidth),
                y: Math.floor(worldCoordinates.y / this.tileHeight)
            };
        }

        toWorldCoordinates(tileCoordinates: TileCoordinates): WorldCoordinates {
            return {
                x: tileCoordinates.x * this.tileWidth,
                y: tileCoordinates.y * this.tileHeight
            };
        }
    }
} 
