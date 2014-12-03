module Isis {
	export interface Tileset {
		key: string;
		name: string;
	}

	export interface TilemapLayer {
		name: string;
		type: string;
	}

	export interface TilemapData {
		game: Phaser.Game;
		key: string;
		tilesets: Array<Tileset>;
		tileLayers: Array<string>;
	}

	export class TilemapLoader {
		private game: Phaser.Game;

		constructor(game: Phaser.Game) {
			this.game = game;
		}

		load(key: string) {
			var manifestEntry = this.game.cache.getJSON("manifest")[key];
			var mapJSON = this.game.cache.getJSON(key +".json");

			 return new Tilemap({
				 game: this.game,
				 key: key,
				 tilesets: this.readTilesets(manifestEntry),
				 tileLayers: this.readLayers(mapJSON.layers)
			 });
		 }

		 private readTilesets(manifestEntry: Array<JSONAsset>) {
			 return _.chain(manifestEntry)
				 .filter({ type: "image" })
				 .map((asset: JSONAsset) => {
					 var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
					 return {
						 key: asset.key,
						 name: tileset
					 };
				 }).value();
		 }

		private readLayers(layers: Array<TilemapLayer>) {
			 return _.chain(layers)
				 .filter({ type: "tilelayer" })
				 .map((layer) => layer.name)
				 .value();
		 }
	 }
 }