﻿module Isis {
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

		load(key: string, manifest: Manifest, mapDefinition: TilemapDefinition) {
			 return new Tilemap({
				 game: this.game,
				 key: key,
				 tilesets: this.readTilesets(manifest[key]),
				 tileLayers: this.readLayers(mapDefinition.layers)
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