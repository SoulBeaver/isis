module Isis {
	export class ActivatableObject extends Phaser.Sprite {
		trigger: Trigger;

		constructor(game: Phaser.Game, x: number, y: number, key: any, frame: any) {
			super(game, x, y, key, frame);

			game.add.existing(this);
		}
	}
} 