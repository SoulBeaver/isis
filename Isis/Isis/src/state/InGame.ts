module Isis {
    export class InGame extends Phaser.State {
        map: Tilemap;
        
        isAcceptingInput = true;
        player: Player;

        settings: any;

        create() {
            this.game.stage.backgroundColor = "#000000";

            this.settings = this.game.cache.getJSON("settings");

            this.map = new Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));

            this.initializePlayer();
        }

        initializePlayer() {
            this.player = new Player(this.game, 48, 24);

            this.player.onMoveDown.add(this.movePlayerDown, this);
            this.player.onMoveUp.add(this.movePlayerUp, this);
            this.player.onMoveLeft.add(this.movePlayerLeft, this);
            this.player.onMoveRight.add(this.movePlayerRight, this);

            this.game.camera.follow(this.player);
        }

        update() {
            if (this.isAcceptingInput) {
                var keyboard = this.game.input.keyboard;
                
                for (var inputCommand in this.settings) {
                    var keyCode = this.toKeyCode(this.settings[inputCommand]);
                    if (keyboard.isDown(keyCode))
                        this.player.tryActOn(inputCommand);
                }
            }            
        }

        toKeyCode(keyString: string): number {
            return Phaser.Keyboard[keyString];
        }

        movePlayerDown(player: Player) {
            this.tryMoveTo({ x: this.player.x, y: this.player.y + 24 });
        }

        movePlayerUp(player: Player) {
            this.tryMoveTo({ x: this.player.x, y: this.player.y - 24 });
        }

        movePlayerLeft(player: Player) {
            this.tryMoveTo({ x: this.player.x - 24, y: this.player.y });
        }

        movePlayerRight(player: Player) {
            this.tryMoveTo({ x: this.player.x + 24, y: this.player.y });
        }

        tryMoveTo(worldCoordinates: WorldCoordinates) {
            var tileCoordinates = toTileCoordinates(this.map, worldCoordinates);
            console.log("Moving to: " + tileCoordinates.x + ", " + tileCoordinates.y);

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
            this.map.items.splice(this.map.items.indexOf(item), 1);
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