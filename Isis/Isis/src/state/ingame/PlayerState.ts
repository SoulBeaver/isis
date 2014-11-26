/// <reference path="InGameSubState.ts"/>

module Isis {
    export class PlayerState extends InGameSubState {
        private actionMap: Array<() => void> = [];
        private creaturesToDelete: Array<Phaser.Sprite> = [];

        constructor(game: Phaser.Game, view: GameView, map: Tilemap, player: Player) {
            super(game, view, map, player);

            this.initializeInputBindings();
        }

        private initializeInputBindings() {
            var settings = this.game.cache.getJSON("settings");

            this.actionMap[settings.move_left]  = () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x - 24, y: this.player.y }));
            this.actionMap[settings.move_right] = () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x + 24, y: this.player.y }));
            this.actionMap[settings.move_up]    = () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x, y: this.player.y - 24 }));
            this.actionMap[settings.move_down]  = () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x, y: this.player.y + 24 }));
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

        private tryMoveTo(destination: TileCoordinates) {
            if (this.map.wallAt(destination))
                return;

            if (this.map.creatureAt(destination)) {
                this.attack(this.player, this.map.creatureAt(destination));
            } else if (this.map.objectAt(destination)) {
                this.activate(this.player, this.map.objectAt(destination));
            } else {
                if (this.map.itemAt(destination))
                    this.pickUp(this.player, this.map.itemAt(destination));

                this.move(this.player, destination);
            }
        }

        private attack(player: Phaser.Sprite, creature: Phaser.Sprite) {
            this.view.attack(player, creature);
            this.creaturesToDelete.push(creature);
        }

        private activate(player: Player, object: Phaser.Sprite) {
            // TODO: Nothing to do yet.
        }

        private pickUp(player: Player, item: Phaser.Sprite) {
            this.map.removeItem(item);
        }

        private move(player: Player, to: TileCoordinates) {
            this.view.move(this.player, this.map.toWorldCoordinates(to));
        }

        private switchToAnimatingState() {
            this.onSwitchState.dispatch();
        }

        finalize() {
            this.creaturesToDelete.forEach((creature: Phaser.Sprite) => this.map.removeCreature(creature), this);
            this.creaturesToDelete = [];
        }
    }
} 