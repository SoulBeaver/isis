module Isis {
    export class InGame extends Phaser.State {
        private view: GameView;
        private map: Tilemap;
        private player: Player;

        private playerState: PlayerState;
        private enemyState: EnemyState;
        private animatingState: AnimatingState;

        private currentState: InGameSubState;

        create() {
            this.game.stage.backgroundColor = "#000000";

            this.initializeView();
            this.initializeMap();
            this.initializePlayer();
            this.initializeSubStates();
        }

        private initializeView() {
            this.view = new GameView(this.game);
        }

        private initializeMap() {
            this.map = new Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));
        }

        private initializePlayer() {
            this.player = new Player(this.game, 48, 24);
            this.game.camera.follow(this.player);
        }

        private initializeSubStates() {
            this.playerState = new PlayerState(this.game, this.view, this.map, this.player);
            this.playerState.onSwitchState.add(this.switchFromPlayerState, this);

            this.enemyState = new EnemyState(this.game, this.view, this.map, this.player);
            this.enemyState.onSwitchState.add(this.switchFromEnemyState, this);

            this.animatingState = new AnimatingState(this.game, this.view, this.map, this.player);

            this.currentState = this.playerState;
        }

        update() {
            this.currentState.update();
        }

        private switchFromPlayerState() {
            this.currentState.finalize();

            this.currentState = this.animatingState;
            this.currentState.onSwitchState.addOnce(this.switchToEnemyState, this);
            this.currentState.initialize();
        }

        private switchFromEnemyState() {
            this.currentState.finalize();

            this.currentState = this.animatingState;
            this.currentState.onSwitchState.addOnce(this.switchToPlayerState, this);
            this.currentState.initialize();
        }

        private switchToEnemyState() {
            this.currentState.finalize();

            this.currentState = this.enemyState;
            this.currentState.initialize();
        }

        private switchToPlayerState() {
            this.currentState.finalize();

            this.currentState = this.playerState;
            this.currentState.initialize();
        }
    }
} 