module Isis {
    export class Tile {
        coordinates: TileCoordinates;
        type: TileType;

        constructor(coordinates: TileCoordinates, type: TileType) {
            this.coordinates = coordinates;
            this.type = type;
        }
    }
} 