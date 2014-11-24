module Isis {
    interface IInputActionMap {
        [input: string]: () => void;
    }

    export class InGame extends Phaser.State {
        private view: InGameView;
        private map: Tilemap;
        
        private actionMap: IInputActionMap = []; 

        private isAcceptingInput = true;
        private player: Player;

        create() {
            this.game.stage.backgroundColor = "#000000";

            this.view = new InGameView(this.game, this);

            this.initializeInputBindings();

            this.map = new Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));

            this.player = new Player(this.game, 48, 24);
            this.game.camera.follow(this.player);
        }

        initializeInputBindings() {
            var settings = this.game.cache.getJSON("settings");
            
            this.actionMap[settings.move_left]  = () => this.tryMoveTo(toTileCoordinates(this.map, { x: this.player.x - 24, y: this.player.y }));
            this.actionMap[settings.move_right] = () => this.tryMoveTo(toTileCoordinates(this.map, { x: this.player.x + 24, y: this.player.y }));
            this.actionMap[settings.move_up]    = () => this.tryMoveTo(toTileCoordinates(this.map, { x: this.player.x, y: this.player.y - 24 }));
            this.actionMap[settings.move_down]  = () => this.tryMoveTo(toTileCoordinates(this.map, { x: this.player.x, y: this.player.y + 24 }));
        }

        update() {
            if (this.isAcceptingInput) {
                var keyboard = this.game.input.keyboard;
                
                for (var inputCommand in this.actionMap) {
                    var keyCode = toKeyCode(inputCommand);
                    if (keyboard.isDown(keyCode))
                        this.actionMap[inputCommand]();
                }
            }

            this.view.play();
        }

        tryMoveTo(tileCoordinates: TileCoordinates) {
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

        attack(player: Phaser.Sprite, creature: Phaser.Sprite) {
            var tween = this.view.attack(player, creature);
            tween.onStart.addOnce(() => this.isAcceptingInput = false, this);
            tween.onLoop.addOnce(() => this.map.removeCreature(creature), this);
            tween.onComplete.addOnce(() => this.isAcceptingInput = true, this);
        }

        activate(player: Player, object: Phaser.Sprite) {

        }

        pickUp(player: Player, item: Phaser.Sprite) {
            this.map.removeItem(item);
        }

        move(player: Player, to: TileCoordinates) {
            var tween = this.view.move(this.player, toWorldCoordinates(this.map, to));
            tween.onStart.addOnce(() => this.isAcceptingInput = false, this);
            tween.onComplete.addOnce(() => this.isAcceptingInput = true, this);
        }
    }
} 