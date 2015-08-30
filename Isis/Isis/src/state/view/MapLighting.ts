module Isis {
    export class MapLighting {
        private game: Phaser.Game;
        private map: Tilemap;

        private lightSprite: Phaser.Image;
        private lightRadius = 50;
        private shadowTexture: Phaser.BitmapData;

        constructor(game: Phaser.Game, map: Tilemap) {
            this.game = game;
            this.map = map;

            this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
            this.lightSprite = this.game.add.image(0, 0, this.shadowTexture);
            this.lightSprite.blendMode = PIXI.blendModes.MULTIPLY;
        }

        illuminate(where: WorldCoordinates) {
            // Draw shadow
            this.shadowTexture.context.fillStyle = 'rgb(10, 10, 10)';
            this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

            // Draw circle of light
            this.shadowTexture.context.beginPath();
            this.shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
            this.shadowTexture.context.arc(where.x, where.y,
                                           this.lightRadius, 0, Math.PI * 2);
            this.shadowTexture.context.fill();

            // This just tells the engine it should update the texture cache
            this.shadowTexture.dirty = true;
        }
    }
}