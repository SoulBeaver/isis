module Isis {
    export class EnemyState extends Phaser.State {
        private view: GameView;
        private map: Tilemap;
        private player: Player;

        create() {
            this.game.stage.backgroundColor = "#000000";
        }

        init(args: any) {
            this.view = args[0];
            this.map = args[1];
            this.player = args[2];
        }

        update() {
            this.switchToAnimatingState();
        }

        private switchToAnimatingState() {
            this.game.state.start(State.AnimatingState, false, false, [this.view, this.map, this.player, State.PlayerState]);
        }
    }
} 