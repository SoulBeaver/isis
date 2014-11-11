module Isis {
    export class InGame extends Phaser.State {
        map: Phaser.Tilemap;
        wallLayer: Phaser.TilemapLayer;
        backgroundLayer: Phaser.TilemapLayer;
        shadowLayer: Phaser.TilemapLayer;
        itemLayer: Phaser.TilemapLayer;
        objectLayer: Phaser.TilemapLayer;
        creatureLayer: Phaser.TilemapLayer;

        isAcceptingInput = true;

        player: Player;

        creatures: Phaser.Group;
        items: Phaser.Group;

        settings: any;

        create() {
            this.game.stage.backgroundColor = "#000000";

            this.settings = this.game.cache.getJSON("settings");

            this.initializeMap();
            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();

            this.initializePlayer();
        }

        initializeMap() {
            this.map = this.game.add.tilemap("maze");

            this.map.addTilesetImage("World_Tiles", "world_tileset");
            this.map.addTilesetImage("Creatures", "creatures_tileset");
            this.map.addTilesetImage("Items", "items_tileset");
            this.map.addTilesetImage("World_Objects", "world_objects_tileset");
            this.map.addTilesetImage("World_Dirt_Shadows", "world_dirt_shadows_tileset");

            this.wallLayer = this.map.createLayer("Walls");
            this.backgroundLayer = this.map.createLayer("Background");
            this.shadowLayer = this.map.createLayer("Shadows");
            this.itemLayer = this.map.createLayer("Items");
            this.objectLayer = this.map.createLayer("Objects");
            this.creatureLayer = this.map.createLayer("Creatures");

            this.backgroundLayer.resizeWorld();

            this.map.setCollisionBetween(1, 2, true, "Walls");
        }

        separateCreaturesFromTilemap() {
            this.creatures = this.game.add.group();
            this.creatures.enableBody = true;
            this.creatures.physicsBodyType = Phaser.Physics.ARCADE;

            this.creatureLayer.getTiles(0, 0, this.world.width, this.world.height)
                .filter((tile) => tile.properties.atlas_name)
                .forEach((creatureTile) => {
                    var creatureSprite = this.creatures.create(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                    creatureSprite.animations.add("idle", [creatureTile.properties.atlas_name + "_1.png", creatureTile.properties.atlas_name + "_2.png"], 2, true);
                    creatureSprite.animations.play("idle");

                    creatureSprite.body.immovable = true;

                    this.map.removeTile(creatureTile.x, creatureTile.y, "Creatures");
                });
        }

        separateItemsFromTilemap() {
            this.items = this.game.add.group();
            this.items.enableBody = true;

            this.itemLayer.getTiles(0, 0, this.world.width, this.world.height)
                .filter((tile) => tile.properties.atlas_name)
                .forEach((itemTile) => {
                    var itemSprite = this.items.create(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name +".png");
                    // Center sprite in tile.
                    itemSprite.x += 4;
                    itemSprite.y += 4;

                    this.map.removeTile(itemTile.x, itemTile.y, "Items");
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
            this.game.physics.arcade.overlap(this.player, this.items, this.collectItem, null, this);

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

        tryMoveTo(destination: { x: number; y: number }) {
            if (this.isPassable(destination)) {
                var creatureBlockingPath = this.creatureAt(destination);
                if (creatureBlockingPath) {
                    this.attackCreature(this.player, creatureBlockingPath);
                } else {
                    this.moveRelatively(this.player, destination);
                }
            }
        }

        collectItem(player: Phaser.Sprite, item: Phaser.Sprite) {
            item.destroy();
        }

        attackCreature(player: Phaser.Sprite, creature: Phaser.Sprite) {
            this.isAcceptingInput = false;

            var xOffset = player.x - creature.x;
            var yOffset = player.y - creature.y;
            
            var tween = this.game.add.tween(player)
                .to({ x: player.x - xOffset, y: player.y - yOffset, angle: xOffset <= 0 ? 20 : -20 }, 100, Phaser.Easing.Linear.None)
                .yoyo(true);
            tween.onLoop.add(() => this.creatures.remove(creature, true), this);
            tween.onComplete.add(() => this.isAcceptingInput = true, this);
            tween.start();
        }

        isPassable(worldXY: { x: number; y: number }) {
            var tileCoordinates = this.toTileCoordinates(worldXY);
            var tile = this.map.getTile(tileCoordinates.x, tileCoordinates.y, "Walls", true);
            return tile && tile.index != 1;
        }

        creatureAt(worldXY: { x: number; y: number }) {
            var tileCoordinates = this.toTileCoordinates(worldXY);

            var tile = this.map.getTile(tileCoordinates.x, tileCoordinates.y);
            var found = null;
            if (tile) {
                this.creatures.forEachAlive((creature) => {
                    var creatureTileCoordinates = this.toTileCoordinates({ x: creature.x, y: creature.y });
                    if (creatureTileCoordinates.x == tileCoordinates.x && creatureTileCoordinates.y == tileCoordinates.y)
                        found = creature;
                }, this);
            }

            return found;
        }

        toTileCoordinates(worldXY: { x: number; y: number }) {
            return {
                x: worldXY.x / this.map.tileWidth,
                y: worldXY.y / this.map.tileHeight
            };
        }

        moveRelatively(entity: Phaser.Sprite, to: { x: number; y: number }) {
            this.game.add.tween(entity)
                .to(to, 300, Phaser.Easing.Linear.None, true)
                .onComplete.add(() => this.isAcceptingInput = true, this);

            this.isAcceptingInput = false;
        }
    }
} 