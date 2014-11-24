module Isis {
    interface IInputActionMap {
        [input: string]: () => void;
    }

    export class PlayerState extends Phaser.State {
        private static hasBeenCreated = false;
        private view: GameView;
        private map: Tilemap;
        
        private actionMap: IInputActionMap = []; 
        private player: Player;

        create() {
            if (!PlayerState.hasBeenCreated) {
                this.game.stage.backgroundColor = "#000000";

                this.initializeView();
                this.initializeInputBindings();
                this.initializeMap();
                this.initializePlayer();

                PlayerState.hasBeenCreated = true;
            }
        }

        init(args: any) {
            // PlayerState is the first state started after MainMenu finishes.
            // The main menu, however, has no args to pass to the PlayerState.
            // So args will be undefined until we complete the PlayerState -> AnimatingState -> EnemyState loop once.
            if (!args)
                return;

            this.view = args[0];
            this.map = args[1];
            this.player = args[2];
        }

        private initializeView() {
            this.view = new GameView(this.game);
        }

        private initializeInputBindings() {
            var settings = this.game.cache.getJSON("settings");
            
            this.actionMap[settings.move_left]  = () => this.tryMoveTo(toTileCoordinates(this.map, { x: this.player.x - 24, y: this.player.y }));
            this.actionMap[settings.move_right] = () => this.tryMoveTo(toTileCoordinates(this.map, { x: this.player.x + 24, y: this.player.y }));
            this.actionMap[settings.move_up]    = () => this.tryMoveTo(toTileCoordinates(this.map, { x: this.player.x, y: this.player.y - 24 }));
            this.actionMap[settings.move_down]  = () => this.tryMoveTo(toTileCoordinates(this.map, { x: this.player.x, y: this.player.y + 24 }));
        }

        private initializeMap() {
            this.map = new Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));
        }

        private initializePlayer() {
            this.player = new Player(this.game, 48, 24);
            this.game.camera.follow(this.player);
        }

        update() {
            var keyboard = this.game.input.keyboard;
                
            for (var inputCommand in this.actionMap) {
                var keyCode = toKeyCode(inputCommand);
                if (keyboard.isDown(keyCode)) {
                    this.actionMap[inputCommand]();

                    this.switchToAnimatingState();
                }
            }
        }

        private tryMoveTo(tileCoordinates: TileCoordinates) {
            if (this.map.wallAt(tileCoordinates))
                return;

            if (this.map.creatureAt(tileCoordinates)) {
                this.attack(this.player, this.map.creatureAt(tileCoordinates));
            } else if (this.map.objectAt(tileCoordinates)) {
                this.activate(this.player, this.map.objectAt(tileCoordinates));
            } else {
                if (this.map.itemAt(tileCoordinates))
                    this.pickUp(this.player, this.map.itemAt(tileCoordinates));

                this.move(this.player, tileCoordinates);
            }
        }

        private attack(player: Phaser.Sprite, creature: Phaser.Sprite) {
            var tween = this.view.attack(player, creature);
            tween.onLoop.addOnce(() => this.map.removeCreature(creature), this);
        }

        private activate(player: Player, object: Phaser.Sprite) {
            // TODO: Nothing to do yet.
        }

        private pickUp(player: Player, item: Phaser.Sprite) {
            this.map.removeItem(item);
        }

        private move(player: Player, to: TileCoordinates) {
            this.view.move(this.player, toWorldCoordinates(this.map, to));
        }

        private switchToAnimatingState() {
            this.game.state.start(State.AnimatingState, false, false, [this.view, this.map, this.player, State.EnemyState]);
        }
    }
} 