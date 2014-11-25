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