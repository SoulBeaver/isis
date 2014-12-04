module Isis {
	export interface TilemapDefinition {
		layers: Array<TilemapLayer>;
		tilesets: Array<Tileset>;
	}

	export interface TilemapLayer {
		name: string;
		type: string;
	}

	export interface Tileset {
		name: string;
	}
}