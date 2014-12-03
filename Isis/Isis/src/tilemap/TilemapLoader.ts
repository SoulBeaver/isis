module Isis {
	export interface TilemapData {
		game: Phaser.Game;
		key: string;
		tilesets: Array<{ name: string; key: string }>;
		tileLayers: Array<TilemapLayer>;
	}

	export class TilemapLoader {
		private game: Phaser.Game;

		constructor(game: Phaser.Game) {
			this.game = game;
		}

		load(key: string) {
			var manifestEntries: Array<ManifestEntry> = this.game.cache.getJSON("manifest")[key];
			var mapJSON = this.game.cache.getJSON(key +".json");

			 return new Tilemap({
				 game: this.game,
				 key: key,
				 tilesets: this.readTilesets(manifestEntries),
				 tileLayers: this.readLayers(mapJSON.layers)
			 });
		 }

		private readTilesets(manifestEntries: Array<ManifestEntry>) {
			 return _.chain(manifestEntries)
				 .filter({ type: "image" })
				 .map((entry: ManifestEntry) => {
					 var tileset = entry.url.substring(entry.url.lastIndexOf('/') + 1, entry.url.lastIndexOf('.'));
					 return {
						 key: entry.key,
						 name: tileset
					 };
				 })
				 .value();
		 }

		private readLayers(layers: Array<TilemapLayer>) {
			 return _.chain(layers)
				 .filter({ type: "tilelayer" })
				 .value();
		 }
	 }
 }