/// <reference path="../../libs/lodash/lodash.d.ts" />

module Isis {
    export class Tilemap extends Phaser.Tilemap {
        private WallsLayer			= "Walls";
        private BackgroundLayer	= "Background";
        private ShadowsLayer		= "Shadows";
        private CreaturesLayer		= "Creatures";
        private ItemsLayer			= "Items";
		private ObjectsLayer			= "Objects";
		private TriggersLayer			= "Triggers";

        private items: Array<Phaser.Sprite>;
		private creatures: Array<Phaser.Sprite>;
		private activatableObjects: Array<ActivatableObject>;
		private triggers: Array<Trigger>;

        private wallLayer: Phaser.TilemapLayer;
        private backgroundLayer: Phaser.TilemapLayer;
        private shadowLayer: Phaser.TilemapLayer;
        private itemLayer: Phaser.TilemapLayer;
        private objectLayer: Phaser.TilemapLayer;
        private creatureLayer: Phaser.TilemapLayer;

        constructor(game: Phaser.Game, key: string, manifest: any) {
            super(game, key);
		
            this.addTilesets(manifest[key]);
            
            this.wallLayer	= this.createLayer(this.WallsLayer);
            this.backgroundLayer	= this.createLayer(this.BackgroundLayer);
            this.shadowLayer	= this.createLayer(this.ShadowsLayer);
            this.itemLayer	= this.createLayer(this.ItemsLayer);
            this.objectLayer	= this.createLayer(this.ObjectsLayer);
            this.creatureLayer	= this.createLayer(this.CreaturesLayer);

            this.separateCreaturesFromTilemap();
			this.separateItemsFromTilemap();
	        this.separateObjectsFromTilemap();

			this.identifyTriggers();

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

		destroy() {
			_.forEach(this.items, (item: Phaser.Sprite) => item.destroy());
			_.forEach(this.objects, (object: Phaser.Sprite) => object.destroy());
			_.forEach(this.creatures, (creature: Phaser.Sprite) => creature.destroy());

			this.items = [];
			this.objects = [];
			this.creatures = [];
			this.triggers = [];

			this.wallLayer.destroy();
			this.backgroundLayer.destroy();
			this.itemLayer.destroy();
			this.objectLayer.destroy();
			this.creatureLayer.destroy();

			this.wallLayer = null;
			this.backgroundLayer = null;
			this.itemLayer = null;
			this.objectLayer = null;
			this.creatureLayer = null;

			super.destroy();
		}

        private separateCreaturesFromTilemap() {
            this.creatures = this.extractFrom(this.creatureLayer, (creatureTile) => {
                var creatureSprite = this.game.add.sprite(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
				creatureSprite.animations.add("idle",
										   [
											   creatureTile.properties.atlas_name + "_1.png",
											   creatureTile.properties.atlas_name + "_2.png"
										   ],
										   2,
										   true);
                creatureSprite.animations.play("idle");

                return creatureSprite;
            });
		}

		private separateObjectsFromTilemap() {
			this.activatableObjects = this.extractFrom(this.objectLayer, (objectTile) => {
				var objectSprite = new ActivatableObject(this.game,
																		 objectTile.worldX,
																	     objectTile.worldY,
																	     "object_atlas",
																		 objectTile.properties.atlas_name + ".png");

				return objectSprite;
			});
		}

        private separateItemsFromTilemap() {
            var centerItem = (item: Phaser.Sprite) => { item.x += this.tileWidth / 6; item.y += this.tileHeight / 6; }

            this.items = this.extractFrom(this.itemLayer, (itemTile) => {
				var itemSprite = this.game.add.sprite(itemTile.worldX,
																   itemTile.worldY,
																   "item_atlas",
																   itemTile.properties.atlas_name + ".png");
                centerItem(itemSprite);

                return itemSprite;
            });
        }

        private extractFrom<T>(layer: Phaser.TilemapLayer, converter: (tile: Phaser.Tile) => T) {
            return _.filter(layer.getTiles(0, 0, this.widthInPixels, this.heightInPixels), (tile) => tile.properties.atlas_name)
                       .map((tile) => converter(this.removeTile(tile.x, tile.y, layer)));
		}

		private identifyTriggers() {
			/*
			A typical JSON entry for an object in the object layer (our triggers), looks like this:

			    {
                 "height":0,
                 "name":"warp",
                 "properties":
                    {
                     "map":"volcano"
                    },
                 "rotation":0,
                 "type":"object",
                 "visible":true,
                 "width":0,
                 "x":60,
                 "y":12
                }
			 */
			var mixedTriggers = _.map(this.objects[this.TriggersLayer], (json: any) => new Trigger(json));

			_.chain(mixedTriggers)
				.filter({ type: "object" })
				.forEach((trigger: Trigger) => {
					var object = this.objectAt(this.toTileCoordinates(trigger));
					object.trigger = trigger;
				});

			this.triggers = _.reject(mixedTriggers, { type: "object" });
		}

        wallAt(at: TileCoordinates) {
            var tile = this.getTile(at.x, at.y, this.WallsLayer);
            return tile && tile.index != 0;
        }

        itemAt(at: TileCoordinates) {
            return _.find(this.items, (item: Phaser.Sprite) => _.isEqual(this.toTileCoordinates(item), at));
        }

        objectAt(at: TileCoordinates) {
            return _.find(this.activatableObjects, (object: ActivatableObject) => _.isEqual(this.toTileCoordinates(object), at));
        }

        creatureAt(at: TileCoordinates) {
            return _.find(this.creatures, (creature: Phaser.Sprite) => _.isEqual(this.toTileCoordinates(creature), at));
		}

		triggerAt(at: TileCoordinates) {
			return _.find(this.triggers, (trigger: Trigger) => _.isEqual(this.toTileCoordinates(trigger), at));
		}

		getTrigger(name: string) {
			return _.find(this.triggers, { name: name });
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
