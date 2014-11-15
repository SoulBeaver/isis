module Isis {
    export function toTileCoordinates(map: Tilemap, worldCoordinates: WorldCoordinates): TileCoordinates {
        return {
            x: Math.floor(worldCoordinates.x / map.tileWidth),
            y: Math.floor(worldCoordinates.y / map.tileHeight)
        };
    }
} 