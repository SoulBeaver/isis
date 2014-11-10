module Isis {
    export class Player extends Phaser.Sprite {
        private _acceleration = 150;

        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y, "creature_atlas");

            this.addAnimations();
            this.addPhysics();

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

        }
    }
} 