/// <reference path="../../../libs/lodash/lodash.d.ts" />

module Isis {
    export class GameView {
        private game: Phaser.Game;

		private tweensToPlay: Array<Phaser.Tween> = [];

        onTweensStarted: Phaser.Signal = new Phaser.Signal();
        onTweensFinished: Phaser.Signal = new Phaser.Signal();

        constructor(game: Phaser.Game) {
			this.game = game;

			
        }

        move(entity: Phaser.Sprite, to: WorldCoordinates) {
            var tween = this.game.add.tween(entity).to(to, 300, Phaser.Easing.Linear.None);
            this.registerTweenDeletion(tween);

            this.tweensToPlay.push(tween);
        }

        attack(player: Phaser.Sprite, creature: Phaser.Sprite) {
            var xOffset = player.x - creature.x;
            var yOffset = player.y - creature.y;

            var tween = this.game.add.tween(player)
                .to({
                    x: player.x - xOffset,
                    y: player.y - yOffset, angle: xOffset <= 0 ? 20 : -20
                }, 100, Phaser.Easing.Linear.None)
                .yoyo(true);
            this.registerTweenDeletion(tween);

            this.tweensToPlay.push(tween);
		}

		fadeOut() {
			var fadeRectangle = this.createFullScreenRectangle(-this.game.world.width, 0);

			var tween = this.game.add.tween(fadeRectangle).to({ x: 0 }, 500, Phaser.Easing.Linear.None);
			tween.onComplete.add(() => fadeRectangle.destroy());
			this.registerTweenDeletion(tween);

			this.tweensToPlay.push(tween);
		}

		fadeIn() {
			var fadeRectangle = this.createFullScreenRectangle(0, 0);

			var tween = this.game.add.tween(fadeRectangle).to({ x: this.game.world.width }, 500, Phaser.Easing.Linear.None);
			tween.onComplete.add(() => fadeRectangle.destroy());
			this.registerTweenDeletion(tween);

			this.tweensToPlay.push(tween);
		}

		private createFullScreenRectangle(x: number, y: number) {
			var fadeRectangle = this.game.add.graphics(x, y);
			fadeRectangle.lineStyle(1, 0x000000, 1);
			fadeRectangle.beginFill(0x000000, 1);
			fadeRectangle.drawRect(0, 0, this.game.world.width, this.game.world.height);

			return fadeRectangle;
		}

		play() {
            _.forEach(this.tweensToPlay, (tween: Phaser.Tween) => tween.start());

            this.onTweensStarted.dispatch();
            this.dispatchIfNoActiveTweensRemain();
        }

        private registerTweenDeletion(tween: Phaser.Tween) {
            tween.onComplete.add(() => {
                this.tweensToPlay = _.reject(this.tweensToPlay, tween);
                this.dispatchIfNoActiveTweensRemain();
            }, this);
        }

		private dispatchIfNoActiveTweensRemain() {
            if (_.isEmpty(this.tweensToPlay))
                this.onTweensFinished.dispatch();
        }
    }
} 