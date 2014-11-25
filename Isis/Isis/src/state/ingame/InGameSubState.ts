module Isis {
    export class InGameSubState {
        game: Phaser.Game;
        view: GameView;
        map: Tilemap;
        player: Player;

        onSwitchState: Phaser.Signal = new Phaser.Signal();

        constructor(game: Phaser.Game, view: GameView, map: Tilemap, player: Player) {
            this.game = game;
            this.view = view;
            this.map = map;
            this.player = player;
        }

        initialize() {
            
        }

        update() {

        }

        finalize() {

        }
    }
} 