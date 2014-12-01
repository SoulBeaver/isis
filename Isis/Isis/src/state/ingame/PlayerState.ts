/// <reference path="InGameSubState.ts"/>

module Isis {
    /**
     * Controlling class for any player actions made.
     */
	export class PlayerState extends InGameSubState {
		onChangeMap: Phaser.Signal = new Phaser.Signal();

        private actionMap: Array<() => void> = [];
        private creaturesToDelete: Array<Phaser.Sprite> = [];

        constructor(game: Phaser.Game, view: GameView, map: Tilemap, player: Player) {
            super(game, view, map, player);

            this.initializeInputBindings();
        }

        private initializeInputBindings() {
            var settings = this.game.cache.getJSON("settings");

            // I'd like to keep the keys separate from the actions, so we read from the assets/settings.json to see which key is bound to which
            // action. We can then construct a decoupled associative array for every action. Currently, the player can only move via keyboard
            // but I'm hoping to allow for mouse input as well.
            // Caveat:  the settings.json input MUST be a string value of Phaser.Keyboard.<Key>. Otherwise an exception will be thrown.
            this.actionMap[settings.move_left]		= () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x - 24, y: this.player.y }));
            this.actionMap[settings.move_right]	= () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x + 24, y: this.player.y }));
            this.actionMap[settings.move_up]		= () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x, y: this.player.y - 24 }));
            this.actionMap[settings.move_down]	= () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x, y: this.player.y + 24 }));
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

        /*
         * A player can do three things when moving:
         *     Move if there is nothing in the way
         *     Attack if a creature is in the way
         *     Activate an object if it is in the way
         *
         * I chose not to ignore the movement if a creature or object is in the way because I find it
         * it intuitive that a "bump" between player and creature should mean attack, or that
         * the player bumping into an object should mean that the user wants to activate it.
         * Creating a special shortcut or method to activate these separate from moving into them
         * seems like too much work and not worth the effort.
         */
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

        // For now, attacking a creature will automatically kill it.
        private attack(player: Phaser.Sprite, creature: Phaser.Sprite) {
            this.view.attack(player, creature);
            this.creaturesToDelete.push(creature);
        }

		private activate(player: Player, object: ActivatableObject) {
			if (!object.trigger)
				return;

			var trigger = object.trigger;
			if (trigger.name == "warp")
				this.onChangeMap.dispatch(trigger.properties.map);
        }

        // For now, the item is destroyed. In future versions, the player will have an inventory.
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