module Isis {
    /**
     * Controlling class for all in-game logic. Has the ability to call and create popups and switch to different States.
     */
    export class InGame extends Phaser.State {
		private view: GameView;
		private mapLoader: TilemapLoader;
        private map: Tilemap;
        private player: Player;

        // In a roguelike, there is a clear separation between the player and everything else.
        // Since I'm trying to emulate a turn-based roguelike, the InGame state includes
        // three Sub-States that allow for more fine-grained control.
        // The PlayerState handles player input and allows him to move,
        // The EnemyState performs any Ai logic necessary for the enemies to appear intelligent
        // and AnimatingState displays the Player's and Enemie's actions visually.
        private playerState: PlayerState;
        private enemyState: EnemyState;
        private animatingState: AnimatingState;

        private currentState: InGameSubState;

        create() {
            this.game.stage.backgroundColor = "#000000";

	        this.mapLoader = new TilemapLoader(this.game);
			
			this.initializeMap("maze");
			this.initializeView();

			var spawnPlayerTrigger = this.map.getTrigger("spawn_player");
			var spawnWorldCoordinates = this.map.toWorldCoordinates(this.map.toTileCoordinates({ x: spawnPlayerTrigger.x, y: spawnPlayerTrigger.y }));
			this.initializePlayer(spawnWorldCoordinates);
			this.initializeSubStates();
			
			this.currentState = this.playerState;
        }

        private initializeView() {
            this.view = new GameView(this.game);
        }

		private initializeMap(mapName: string) {
			var manifest = this.game.cache.getJSON("manifest");
			var mapDefinition = this.game.cache.getJSON(mapName + ".json");

			this.map = this.mapLoader.load(mapName, manifest, mapDefinition);
		}

		private initializePlayer(spawnCoordinates: WorldCoordinates) {
			this.player = new Player(this.game, spawnCoordinates);
            this.game.camera.follow(this.player);
        }

        private initializeSubStates() {
            this.playerState = new PlayerState(this.game, this.view, this.map, this.player);
			this.playerState.onSwitchState.add(this.switchFromPlayerState, this);
	        this.playerState.onChangeMap.add(this.initiateMapChange, this);

            this.enemyState = new EnemyState(this.game, this.view, this.map, this.player);
            this.enemyState.onSwitchState.add(this.switchFromEnemyState, this);

            // We're not adding a onSwitchState because we switch to either Player or EnemyState depending
            // on which state came before. Therefore, we add a callback to the animating state whenever
            // the Player or EnemyState is finished.
            this.animatingState = new AnimatingState(this.game, this.view, this.map, this.player);
        }

		update() {
			if (this.currentState)
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

		private initiateMapChange(mapName: string, spawnCoordinates: TileCoordinates) {
			this.removeListeners();

			this.currentState.finalize();
			this.currentState = null;

			this.view.fadeOut();
			this.view.onTweensFinished.addOnce(() => this.onMapFadeOutComplete(mapName, spawnCoordinates), this);
			this.view.play();
		}

		private onMapFadeOutComplete(mapName: string, spawnCoordinates: TileCoordinates) {
			this.destroyMap();
			this.switchToMap(mapName, spawnCoordinates);

			this.view.fadeIn();
			this.view.onTweensFinished.addOnce(() => this.currentState = this.playerState, this);
			this.view.play();
		}

		private destroyMap() {
			this.map.destroy();
			this.player.destroy();
		}

		private switchToMap(mapName: string, spawnCoordinates: TileCoordinates) {
			this.initializeMap(mapName);
			this.initializePlayer(this.map.toWorldCoordinates(spawnCoordinates));
			this.initializeSubStates();
		}

		private removeListeners() {
			this.playerState.onSwitchState.removeAll(this);
			this.playerState.onChangeMap.removeAll(this);

			this.enemyState.onSwitchState.removeAll(this);

			this.animatingState.onSwitchState.removeAll(this);
		}
    }
} 