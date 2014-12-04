module Isis.Tests {
	export class ManifestTest extends tsUnit.TestClass {
		manifest_containsFourManifestEntries() {
			this.areIdentical(_.values(this.manifest).length, 4);
		}

		manifestEntries_total21ManifestEntry() {
			var manifestEntries: number = _.values(this.manifest).reduce((prev, curr) => {
				return prev + curr.length;
			}, 0);
			this.areIdentical(manifestEntries, 21);
		}

		atlases_doesNotContainUrl() {
			var atlasesEntry = this.manifest["atlases"];

			_.forEach(atlasesEntry, (entry: ManifestEntry) => {
				this.isFalsey(entry.url);
			}, this);
		}

		maze_containsUrls() {
			var mazeEntry = this.manifest["maze"];

			_.forEach(mazeEntry, (entry: ManifestEntry) => {
				this.isTruthy(entry.url);
			});
		}

		sewer_firstEntry_hasCorrectProperties() {
			var sewerEntry: ManifestEntry = this.manifest["sewer"][0];

			this.areIdentical(sewerEntry.type, "tilemap");
			this.areIdentical(sewerEntry.key, "sewer");
			this.areIdentical(sewerEntry.url, "assets/tilemaps/maps/sewer.json");
		}

		manifest: Manifest = {
			"atlases": [
				{
					"type": "atlasJSONArray",
					"key": "creature_atlas",
					"textureURL": "assets/spritesheets/creature_atlas.png",
					"atlasURL": "assets/spritesheets/creature_atlas.json"
				},
				{
					"type": "atlasJSONArray",
					"key": "item_atlas",
					"textureURL": "assets/spritesheets/item_atlas.png",
					"atlasURL": "assets/spritesheets/item_atlas.json"
				},
				{
					"type": "atlasJSONArray",
					"key": "object_atlas",
					"textureURL": "assets/spritesheets/object_atlas.png",
					"atlasURL": "assets/spritesheets/object_atlas.json"
				}
			],
			"maze": [
				{
					"type": "tilemap",
					"key": "maze",
					"url": "assets/tilemaps/maps/maze.json",
					"data": null,
					"format": "TILED_JSON"
				},
				{
					"type": "image",
					"key": "creatures_tileset",
					"url": "assets/tilemaps/tiles/creatures.png"
				},
				{
					"type": "image",
					"key": "items_tileset",
					"url": "assets/tilemaps/tiles/items.png"
				},
				{
					"type": "image",
					"key": "world_tileset",
					"url": "assets/tilemaps/tiles/world_tiles.png"
				},
				{
					"type": "image",
					"key": "world_objects_tileset",
					"url": "assets/tilemaps/tiles/world_objects.png"
				},
				{
					"type": "image",
					"key": "world_dirt_shadows_tileset",
					"url": "assets/tilemaps/tiles/world_dirt_shadows.png"
				}
			],
			"volcano": [
				{
					"type": "tilemap",
					"key": "volcano",
					"url": "assets/tilemaps/maps/volcano.json",
					"data": null,
					"format": "TILED_JSON"
				},
				{
					"type": "image",
					"key": "creatures_tileset",
					"url": "assets/tilemaps/tiles/creatures.png"
				},
				{
					"type": "image",
					"key": "items_tileset",
					"url": "assets/tilemaps/tiles/items.png"
				},
				{
					"type": "image",
					"key": "world_tileset",
					"url": "assets/tilemaps/tiles/world_tiles.png"
				},
				{
					"type": "image",
					"key": "world_objects_tileset",
					"url": "assets/tilemaps/tiles/world_objects.png"
				},
				{
					"type": "image",
					"key": "world_dirt_shadows_tileset",
					"url": "assets/tilemaps/tiles/world_dirt_shadows.png"
				}
			],
			"sewer": [
				{
					"type": "tilemap",
					"key": "sewer",
					"url": "assets/tilemaps/maps/sewer.json",
					"data": null,
					"format": "TILED_JSON"
				},
				{
					"type": "image",
					"key": "creatures_tileset",
					"url": "assets/tilemaps/tiles/creatures.png"
				},
				{
					"type": "image",
					"key": "world_tileset",
					"url": "assets/tilemaps/tiles/world_tiles.png"
				},
				{
					"type": "image",
					"key": "world_objects_tileset",
					"url": "assets/tilemaps/tiles/world_objects.png"
				},
				{
					"type": "image",
					"key": "world_dirt_shadows_tileset",
					"url": "assets/tilemaps/tiles/world_dirt_shadows.png"
				},
				{
					"type": "image",
					"key": "world_paths_tileset",
					"url": "assets/tilemaps/tiles/world_paths.png"
				}
			]
		}
	}
} 