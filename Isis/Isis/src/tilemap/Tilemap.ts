/// <reference path="../../libs/lodash/lodash.d.ts" />

module Isis {
    export interface TileCoordinates { x: number; y: number };
    export interface WorldCoordinates { x: number; y: number };

    export class Tilemap extends Phaser.Tilemap {
        private WallsLayer      = "Walls";
        private BackgroundLayer = "Background";
        private ShadowsLayer    = "Shadows";
        private CreaturesLayer  = "Creatures";
        private ItemsLayer      = "Items";
        private ObjectsLayer    = "Objects";

        private items: Array<Phaser.Sprite>;
        private activatableObjects: Array<Phaser.Sprite>;
        private creatures: Array<Phaser.Sprite>;

        private wallLayer: Phaser.TilemapLayer;
        private backgroundLayer: Phaser.TilemapLayer;
        private shadowLayer: Phaser.TilemapLayer;
        private itemLayer: Phaser.TilemapLayer;
        private objectLayer: Phaser.TilemapLayer;
        private creatureLayer: Phaser.TilemapLayer;

        constructor(game: Phaser.Game, key: string, manifest: any) {
            super(game, key);

            _.filter(manifest.maze, (asset: JSONAsset) => asset.type == "image")
             .forEach((asset: JSONAsset) => {
                 var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
                 this.addTilesetImage(tileset, asset.key);
             });

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

        private extractFrom(layer: Phaser.TilemapLayer, converter: (tile: Phaser.Tile) => Phaser.Sprite): Array<Phaser.Sprite> {
            return _.filter(layer.getTiles(0, 0, this.widthInPixels, this.heightInPixels), (tile) => tile.properties.atlas_name)
                    .map((tile) => converter(this.removeTile(tile.x, tile.y, layer)));
        }

        wallAt(at: TileCoordinates) {
            return this.tileExists(at, this.WallsLayer);
        }

        itemAt(at: TileCoordinates) {
            return _.find(this.items, (item: Phaser.Sprite) => _.isEqual(toTileCoordinates(this, item), at));
        }

        objectAt(at: TileCoordinates) {
            return _.find(this.activatableObjects, (object: Phaser.Sprite) => _.isEqual(toTileCoordinates(this, object), at));
        }

        creatureAt(at: TileCoordinates) {
            return _.find(this.creatures, (creature: Phaser.Sprite) => _.isEqual(toTileCoordinates(this, creature), at));
        }

        tileExists(at: TileCoordinates, layer: string) {
            var tile = this.getTile(at.x, at.y, layer); 
            return tile && tile.index != 0;
        }

        removeItem(item: Phaser.Sprite) {
            _.remove(this.items, (candidate) => _.isEqual(candidate, item));
            item.destroy();
        }

        removeCreature(creature: Phaser.Sprite) {
            _.remove(this.creatures, (candidate) => _.isEqual(candidate, creature));
            creature.destroy();
        }

        tileLeftOf(tile: TileCoordinates) {
            var tileToTheLeft = this.getTile(tile.x - 1, tile.y);
            this.getTileBelow(this.getLayerIndex(this.WallsLayer), tile.x - 1, tile.y);
            if (!tileToTheLeft)
                return new Tile({ x: -1, y: -1 }, TileType.DoesNotExist);

            if (this.getTile(tile.x - 1, tile.y, this.WallsLayer))
                return new Tile(tileToTheLeft, TileType.Wall);

            var creature = _.find(this.creatures, (creature: Phaser.Sprite) => {
                var creatureCoordinates = toTileCoordinates(this, creature);
                return _.isEqual(creatureCoordinates, tileToTheLeft);
            });
            if (creature)
                return new Tile(tileToTheLeft, TileType.Creature);

            var item = _.find(this.items, (item: Phaser.Sprite) => {
                var itemCoordinates = toTileCoordinates(this, item);
                return _.isEqual(itemCoordinates, tileToTheLeft);
            });
            if (item)
                return new Tile(tileToTheLeft, TileType.Item);

            return new Tile(tileToTheLeft, TileType.Background);
        }
    }
} 
