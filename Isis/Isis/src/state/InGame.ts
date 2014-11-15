module Isis {
    export class InGame extends Phaser.State {
        map: Tilemap;
        creatures: Array<Phaser.Sprite>;
        items: Array<Phaser.Sprite>;

        isAcceptingInput = true;
        player: Player;

        settings: any;

        create() {
            this.game.stage.backgroundColor = "#000000";

            this.settings = this.game.cache.getJSON("settings");

            this.map = new Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));
            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();

            this.initializePlayer();
        }

        separateCreaturesFromTilemap() {
            this.creatures = extractFrom(this.map, this.map.creatureLayer, (creatureTile) => {
                var creatureSprite = this.game.add.sprite(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creatureTile.properties.atlas_name + "_1.png", creatureTile.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");

                return creatureSprite;
            });
        }

        separateItemsFromTilemap() {
            this.items = extractFrom(this.map, this.map.itemLayer, (itemTile) => {
                var itemSprite = this.game.add.sprite(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name + ".png");
                // Center sprite in tile.
                itemSprite.x += 4;
                itemSprite.y += 4;

                return itemSprite;
            });
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
            this.items.splice(this.items.indexOf(item), 1);
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
                _.remove(this.creatures, creature);
                creature.destroy();
            }, this);
            tween.onComplete.add(() => this.isAcceptingInput = true, this);
            tween.start();
        }

        creatureAt(tileCoordinates: TileCoordinates) {
            return _.find(this.creatures, (creature) => _.isEqual(toTileCoordinates(this.map, creature), tileCoordinates));
        }

        itemAt(tileCoordinates: TileCoordinates) {
            return _.find(this.items, (item) => _.isEqual(toTileCoordinates(this.map, item), tileCoordinates));
        }

        moveRelatively(entity: Phaser.Sprite, to: WorldCoordinates) {
            var tween = this.game.add.tween(entity).to(to, 300, Phaser.Easing.Linear.None, true);
            tween.onStart.add(() => this.isAcceptingInput = false, this);
            tween.onComplete.add(() => this.isAcceptingInput = true, this);
        }
    }
} 