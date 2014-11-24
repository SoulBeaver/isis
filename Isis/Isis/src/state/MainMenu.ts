module Isis {
    export class MainMenu extends Phaser.State {
        title: Phaser.Text;

        create() {
            var text = "Start";
            var style = { font: "65px Arial", fill: "#ffffff", align: "center" };

            this.title = this.game.add.text(
                this.game.world.centerX - 50,
                this.game.world.centerY - 10,
                text,
                style
            );

            this.input.onDown.addOnce(this.fadeOut, this);
        }

        fadeOut() {
            this.add.tween(this.title)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startGame, this);
        }

        startGame() {
            this.game.state.start("PlayerState", true, false);
        }
    }
}  