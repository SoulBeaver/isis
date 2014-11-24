module Isis {
    export function toTileCoordinates(map: Tilemap, worldCoordinates: WorldCoordinates): TileCoordinates {
        return {
            x: Math.floor(worldCoordinates.x / map.tileWidth),
            y: Math.floor(worldCoordinates.y / map.tileHeight)
        };
    }

    export function toWorldCoordinates(map: Tilemap, tileCoordinates: TileCoordinates): WorldCoordinates {
        return {
            x: tileCoordinates.x * map.tileWidth,
            y: tileCoordinates.y * map.tileHeight
        };
    }
} 