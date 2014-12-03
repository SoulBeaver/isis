/// <reference path="../../libs/lodash/lodash.d.ts" />

module Isis {
	export interface TilemapLayers {
		[name: string]: Phaser.TilemapLayer;
	}

	export class Tilemap extends Phaser.Tilemap {
		// layers is already defined in Phaser.Tilemap, so we use tilemapLayers instead.
		private tilemapLayers: TilemapLayers = {};

		// A TileMap can have any number of layers, but
		// we're only concerned about the existence of two.
		// The collidables layer has the information about where
		// a Player or Enemy can move to, and where he cannot.
		private CollidablesLayer = "Collidables";
		// Triggers are map events, anything from loading
		// an item, enemy, or object, to triggers that are activated
		// when the player moves toward it.
		private TriggersLayer	 = "Triggers";

        private items: Array<Phaser.Sprite>;
		private creatures: Array<Phaser.Sprite>;
		private interactables: Array<ActivatableObject>;
		private triggers: Array<Trigger>;

        constructor(json: TilemapData) {
	        super(json.game, json.key);

			json.tilesets.forEach((tileset) => this.addTilesetImage(tileset.name, tileset.key), this);
			json.tileLayers.forEach((layer) => {
				this.tilemapLayers[layer] = this.createLayer(layer);
			}, this);

			/*
            this.separateCreaturesFromTilemap();
			this.separateItemsFromTilemap();
	        this.separateObjectsFromTilemap();
			*/

			this.identifyTriggers();

            this.tilemapLayers[this.CollidablesLayer].resizeWorld();
            this.setCollisionBetween(1, 2, true, this.CollidablesLayer);
        }

		destroy() {
			_.forEach(this.items, (item: Phaser.Sprite) => item.destroy());
			_.forEach(this.interactables, (object: Phaser.Sprite) => object.destroy());
			_.forEach(this.creatures, (creature: Phaser.Sprite) => creature.destroy());

			this.items = [];
			this.interactables = [];
			this.creatures = [];
			this.triggers = [];

			this.layers.forEach((layer) => layer.destroy(), this);
			this.layers = [];

			super.destroy();
		}

		/*
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
			this.interactables = this.extractFrom(this.objectLayer, (objectTile) => {
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
		*/

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
            var tile = this.getTile(at.x, at.y, this.CollidablesLayer);
            return tile && tile.index != 0;
        }

        itemAt(at: TileCoordinates) {
            return _.find(this.items, (item: Phaser.Sprite) => _.isEqual(this.toTileCoordinates(item), at));
        }

        objectAt(at: TileCoordinates) {
            return _.find(this.interactables, (object: ActivatableObject) => _.isEqual(this.toTileCoordinates(object), at));
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
