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
            this.animatingState.onSwitchState.add(this.switchFromAnimatingState, this);

            this.currentState = this.playerState;
        }

        update() {
            this.currentState.update();
        }

        private switchFromPlayerState(nextState: State) {
            switch (nextState) {
                case State.AnimatingState:
                    this.currentState.finalize();

                    this.animatingState.nextState = State.EnemyState;
                    this.currentState = this.animatingState;
                    break;

                default:
                    throw new Error("PlayerState cannot switch into anything other than AnimatingState!");
            }
        }

        private switchFromEnemyState(nextState: State) {
            switch (nextState) {
                case State.AnimatingState:
                    this.currentState.finalize();

                    this.animatingState.nextState = State.PlayerState;
                    this.currentState = this.animatingState;
                    break;

                default:
                    throw new Error("PlayerState cannot switch into anything other than AnimatingState!");
            }
        }

        private switchFromAnimatingState(nextState: State) {
            switch (nextState) {
                case State.PlayerState:
                    this.currentState.finalize();
                    this.currentState = this.playerState;
                    break;

                case State.EnemyState:
                    this.currentState.finalize();
                    this.currentState = this.enemyState;
                    break;

                default:
                    throw new Error("AnimatingState cannot switch into anything other than PlayerState or EnemyState!");
            }
        }
    }
} 