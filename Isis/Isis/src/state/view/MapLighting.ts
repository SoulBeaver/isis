module Isis {
    export class MapLighting {
        private game: Phaser.Game;
        private map: Tilemap;

        private lightSprite: Phaser.Image;
        private lightRadius = 100;
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

            var radius = this.lightRadius + this.game.rnd.integerInRange(1, 3),
                heroX = where.x,
                heroY = where.y;

            var gradient =
                this.shadowTexture.context.createRadialGradient(
                    heroX, heroY, radius * 0.75,
                    heroX, heroY, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

            // Draw circle of light
            this.shadowTexture.context.beginPath();
            this.shadowTexture.context.fillStyle = gradient;
            this.shadowTexture.context.arc(where.x, where.y,
                                           radius, 0, Math.PI * 2, false);
            this.shadowTexture.context.fill();

            // This just tells the engine it should update the texture cache
            this.shadowTexture.dirty = true;
        }
    }
}