module Isis {
    export class Player extends Phaser.Sprite {
        private _acceleration = 150;

        private lightSprite: Phaser.Image;
        private shadowTexture: Phaser.BitmapData;
        private LIGHT_RADIUS = 50;

        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y, "creature_atlas");

            this.addAnimations();
            this.addPhysics();

            this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
            this.lightSprite = this.game.add.image(0, 0, this.shadowTexture);
            this.lightSprite.blendMode = PIXI.blendModes.MULTIPLY;

            this.game.add.existing(this);
        }

        private addAnimations() {
            this.animations.add("idle", ["blue_knight_1.png", "blue_knight_2.png"], 2, true);
            this.animations.play("idle");
        }

        private addPhysics() {
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
        }

        update() {
            // Draw shadow
            this.shadowTexture.context.fillStyle = 'rgb(10, 10, 10)';
            this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

            // Draw circle of light
            this.shadowTexture.context.beginPath();
            this.shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
            this.shadowTexture.context.arc(this.x + this.width / 2, this.y + this.height / 2,
                                           this.LIGHT_RADIUS, 0, Math.PI * 2);
            this.shadowTexture.context.fill();

            // This just tells the engine it should update the texture cache
            this.shadowTexture.dirty = true;
        }
    }
} 