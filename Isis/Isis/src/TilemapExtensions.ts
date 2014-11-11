module Isis {
    export function extractFrom(map: Tilemap, layer: Phaser.TilemapLayer, converter: (tile: Phaser.Tile) => Phaser.Sprite): Array<Phaser.Sprite> {
        return _.filter(layer.getTiles(0, 0, map.widthInPixels, map.heightInPixels), (tile) => tile.properties.atlas_name)
                .map((tile) => converter(map.removeTile(tile.x, tile.y, layer)));
    }

    export function toTileCoordinates(map: Tilemap, worldCoordinates: WorldCoordinates): TileCoordinates {
        return {
            x: Math.floor(worldCoordinates.x / map.tileWidth),
            y: Math.floor(worldCoordinates.y / map.tileHeight)
        };
    }
} 