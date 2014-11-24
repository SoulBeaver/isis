module Isis {
    export class InGameView {
        private game: Phaser.Game;
        private controller: Phaser.State;

        private tweensToPlay: Array<Phaser.Tween> = [];

        constructor(game: Phaser.Game, controller: Phaser.State) {
            this.game = game;
            this.controller = controller;
        }

        move(entity: Phaser.Sprite, to: WorldCoordinates) {
            var tween = this.game.add.tween(entity).to(to, 300, Phaser.Easing.Linear.None);

            this.tweensToPlay.push(tween);
            return tween;
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

            this.tweensToPlay.push(tween);
            return tween;
        }

        play() {
            _.forEach(this.tweensToPlay, (tween: Phaser.Tween) => tween.start());
            this.tweensToPlay = [];
        }
    }
} 