module Isis {
    interface IInputActionMap {
        [input: string]: () => void;
    }

    export class InGame extends Phaser.State {
        private map: Tilemap;
        
        private actionMap: IInputActionMap = []; 

        private isAcceptingInput = true;
        private player: Player;

        create() {
            this.game.stage.backgroundColor = "#000000";

            this.initializeInputBindings();

            this.map = new Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));

            this.player = new Player(this.game, 48, 24);
            this.game.camera.follow(this.player);
        }

        initializeInputBindings() {
            var settings = this.game.cache.getJSON("settings");

            this.actionMap[settings.move_left]  = () => this.movePlayerLeft();
            this.actionMap[settings.move_right] = () => this.movePlayerRight();
            this.actionMap[settings.move_up]    = () => this.movePlayerUp();
            this.actionMap[settings.move_down]  = () => this.movePlayerDown();
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
        }

        movePlayerDown() {
            this.tryMoveTo({ x: this.player.x, y: this.player.y + 24 });
        }

        movePlayerUp() {
            this.tryMoveTo({ x: this.player.x, y: this.player.y - 24 });
        }

        movePlayerLeft() {
            this.tryMoveTo({ x: this.player.x - 24, y: this.player.y });
        }

        movePlayerRight() {
            this.tryMoveTo({ x: this.player.x + 24, y: this.player.y });
        }

        tryMoveTo(worldCoordinates: WorldCoordinates) {
            var tileCoordinates = toTileCoordinates(this.map, worldCoordinates);

            if (!this.map.isWall(tileCoordinates)) {
                var creatureBlockingPath = this.creatureAt(tileCoordinates);
                if (creatureBlockingPath) {
                    this.attackCreature(this.player, creatureBlockingPath);
                } else {
                    var itemInPath = this.itemAt(tileCoordinates);
                    if (itemInPath) {
                        this.collectItem(this.player, itemInPath);
                    }

                    this.moveRelatively(this.player, worldCoordinates);
                }
            }
        }

        collectItem(player: Player, item: Phaser.Sprite) {
            _.remove(this.map.items, item);
            item.destroy();
        }

        attackCreature(player: Phaser.Sprite, creature: Phaser.Sprite) {
            var xOffset = player.x - creature.x;
            var yOffset = player.y - creature.y;

            var tween = this.game.add.tween(player)
                .to({
                    x: player.x - xOffset,
                    y: player.y - yOffset, angle: xOffset <= 0 ? 20 : -20
                }, 100, Phaser.Easing.Linear.None)
                .yoyo(true);
            tween.onStart.add(() => this.isAcceptingInput = false, this);
            tween.onLoop.add(() => {
                _.remove(this.map.creatures, creature);
                creature.destroy();
            }, this);
            tween.onComplete.add(() => this.isAcceptingInput = true, this);
            tween.start();
        }

        creatureAt(tileCoordinates: TileCoordinates) {
            return _.find(this.map.creatures, (creature) => _.isEqual(toTileCoordinates(this.map, creature), tileCoordinates));
        }

        itemAt(tileCoordinates: TileCoordinates) {
            return _.find(this.map.items, (item) => _.isEqual(toTileCoordinates(this.map, item), tileCoordinates));
        }

        moveRelatively(entity: Phaser.Sprite, to: WorldCoordinates) {
            var tween = this.game.add.tween(entity).to(to, 300, Phaser.Easing.Linear.None, true);
            tween.onStart.add(() => this.isAcceptingInput = false, this);
            tween.onComplete.add(() => this.isAcceptingInput = true, this); 
        }
    }
} 