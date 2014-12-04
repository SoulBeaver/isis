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

        private items: Array<Phaser.Sprite> = [];
		private creatures: Array<Phaser.Sprite> = [];
		private interactables: Array<ActivatableObject> = [];
		private triggers: Array<Trigger> = [];

        constructor(json: TilemapData) {
	        super(json.game, json.key);

			json.tilesets.forEach((tileset) => this.addTilesetImage(tileset.name, tileset.key), this);
			json.tileLayers.forEach((layer) => {
				this.tilemapLayers[layer.name] = this.createLayer(layer.name);
			}, this);

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

		private identifyTriggers() {
			this.spawnItems();
			this.spawnInteractables();
			this.spawnCreatures();
			this.activateImmediateTriggers();
			this.saveDelayedTriggers();
		}

		private spawnItems() {
			var triggers: Array<Trigger> = this.objects[this.TriggersLayer];

			this.items = _.chain(triggers)
				.filter({ type: "item" })
				.map(this.toItem, this)
				.value();
		}

		private toItem(trigger: Trigger) {
			var creatureDefinitions = this.game.cache.getJSON("item_definitions");
			var atlasName = creatureDefinitions[trigger.name].atlas_name;
			var coordinates = this.toWorldCoordinates(this.toTileCoordinates(trigger));

			var centerItem = (item: Phaser.Sprite) => { item.x += this.tileWidth / 6; item.y += this.tileHeight / 6; }

			var item = this.game.add.sprite(coordinates.x, coordinates.y, "item_atlas", atlasName + ".png");
			centerItem(item);

			return item;
		}

		private spawnInteractables() {
			var triggers: Array<Trigger> = this.objects[this.TriggersLayer];

			this.interactables = _.chain(triggers)
				.filter({ type: "interactable" })
				.map(this.toInteractable, this)
				.value();
		}

		private toInteractable(trigger: Trigger) {
			var creatureDefinitions = this.game.cache.getJSON("interactable_definitions");
			var atlasName = creatureDefinitions[trigger.name].atlas_name;
			var coordinates = this.toWorldCoordinates(this.toTileCoordinates(trigger));

			var interactable = new ActivatableObject(this.game,
													 coordinates.x,
													 coordinates.y,
													 "interactable_atlas",
													 atlasName + ".png");

			return interactable;
		}

		private spawnCreatures() {
			var triggers: Array<Trigger> = this.objects[this.TriggersLayer];

			this.creatures = _.chain(triggers)
				.filter({ type: "creature" })
				.map(this.toCreature, this)
				.value();
		}

		private toCreature(trigger: Trigger) {
			var creatureDefinitions = this.game.cache.getJSON("creature_definitions");
			var atlasName = creatureDefinitions[trigger.name].atlas_name;
			var coordinates = this.toWorldCoordinates(this.toTileCoordinates(trigger));

			var creature = this.game.add.sprite(coordinates.x, coordinates.y, "creature_atlas");
			creature.animations.add("idle", [atlasName + "_1.png", atlasName + "_2.png"], 2, true);
			creature.animations.play("idle");

			return creature;
		}

		private activateImmediateTriggers() {
			var triggers: Array<Trigger> = this.objects[this.TriggersLayer];

			_.chain(triggers)
				.filter({ type: "trigger_immediate" })
				.forEach(this.activateTrigger, this);
		}

		private saveDelayedTriggers() {
			var mixedTriggers: Array<Trigger> = this.objects[this.TriggersLayer];

			this.triggers = _.filter(mixedTriggers, { type: "trigger_delayed" });
		}

		private activateTrigger(trigger: Trigger) {
			switch (trigger.properties.effects) {
				case "summon_random_set":
					var names: Array<string> = trigger.properties.names.split(", ");
					var chosenName: string = names[Math.floor(Math.random() * names.length)];
					var spawnCoordinates = this.toWorldCoordinates({
						x: trigger.properties.spawn_x,
						y: trigger.properties.spawn_y
					});

					var itemTrigger = new Trigger({
						name: chosenName,
						x: spawnCoordinates.x,
						y: spawnCoordinates.y,
						type: "item",
						properties: {}
					});

					this.items.push(this.toItem(itemTrigger));
			}
		}

        wallAt(at: TileCoordinates) {
            var tile = this.getTile(at.x, at.y, this.CollidablesLayer);
            return tile && tile.index != 0;
        }

        itemAt(at: TileCoordinates) {
            return _.find(this.items, (item: Phaser.Sprite) => _.isEqual(this.toTileCoordinates(item), at));
        }

        interactableAt(at: TileCoordinates) {
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
