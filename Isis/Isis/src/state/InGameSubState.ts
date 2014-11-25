module Isis {
    export class InGameSubState {
        /* 
         * Even though the TypeScript 1.3 Compiler has been installed
         * I cannot use the protected keyword. Most likely this is a bug
         * or something only the VS2015 can handle.
         */
        game: Phaser.Game;
        view: GameView;
        map: Tilemap;
        player: Player;

        onSwitchState: Phaser.Signal = new Phaser.Signal();

        constructor(game: Phaser.Game,
                    view: GameView,
                    map: Tilemap,
                    player: Player) {
            this.game = game;
            this.view = view;
            this.map = map;
            this.player = player;
        }

        /* abstract */ update() {

        }

        /* abstract */ finalize() {

        }
    }
} 