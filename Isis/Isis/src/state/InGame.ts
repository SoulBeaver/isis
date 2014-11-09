module Isis {
    export class InGame extends Phaser.State {
        map: Phaser.Tilemap;
        wallLayer: Phaser.TilemapLayer;
        backgroundLayer: Phaser.TilemapLayer;
        shadowLayer: Phaser.TilemapLayer;
        itemLayer: Phaser.TilemapLayer;
        objectLayer: Phaser.TilemapLayer;
        creatureLayer: Phaser.TilemapLayer;

        cursors: Phaser.CursorKeys;

        player: Phaser.Sprite;
        playerSpeed: number = 150;
        isMoving: boolean = false;

        creatures: Phaser.Group;
        items: Phaser.Group;

        create() {
            this.game.stage.backgroundColor = "#000000";

            this.initializeMap();
            this.replaceCreatureTilesWithAtlasSprites();
            this.separateItemsFromTilemap();

            this.initializePlayer();

            this.wallLayer.debug = true;
            this.player.debug = true;

            this.cursors = this.game.input.keyboard.createCursorKeys();
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

        replaceCreatureTilesWithAtlasSprites() {
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
            this.player = this.game.add.sprite(48, 24, "creature_atlas");
            this.player.animations.add("idle", ["blue_knight_1.png", "blue_knight_2.png"], 2, true);
            this.player.animations.play("idle");
            this.player.name = "player";

            this.game.physics.arcade.enable(this.player);
            this.player.body.setSize(24, 24);

            this.game.camera.follow(this.player);
        }

        update() {
            this.game.physics.arcade.overlap(this.player, this.items, this.collectItem, null, this);

            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;

            if (!this.isMoving) {

                if (this.cursors.left.isDown) {
                    if (this.isPassable(this.player.x - 24, this.player.y)) {
                        if (this.isEnemy(this.player.x - 24, this.player.y)) {
                            this.attackCreature(this.player, this.creatureAt(this.player.x - 24, this.player.y));
                        } else {
                            this.moveLeft(this.player);
                        }
                    }
                }

                if (this.cursors.right.isDown) {
                    if (this.isPassable(this.player.x + 24, this.player.y)) {
                        if (this.isEnemy(this.player.x + 24, this.player.y)) {
                            this.attackCreature(this.player, this.creatureAt(this.player.x + 24, this.player.y));
                        } else {
                            this.moveRight(this.player);
                        }
                    }
                }

                if (this.cursors.up.isDown) {
                    if (this.isPassable(this.player.x, this.player.y - 24)) {
                        if (this.isEnemy(this.player.x, this.player.y - 24)) {
                            this.attackCreature(this.player, this.creatureAt(this.player.x, this.player.y - 24));
                        } else {
                            this.moveUp(this.player);
                        }
                    }
                }

                if (this.cursors.down.isDown) {
                    if (this.isPassable(this.player.x, this.player.y + 24)) {
                        if (this.isEnemy(this.player.x, this.player.y + 24)) {
                            this.attackCreature(this.player, this.creatureAt(this.player.x, this.player.y + 24));
                        } else {
                            this.moveDown(this.player);
                        }
                    }
                }
            }            
        }

        collectItem(player: Phaser.Sprite, item: Phaser.Sprite) {
            console.log("Yummy!");

            item.destroy();
        }

        attackCreature(player: Phaser.Sprite, creature: Phaser.Sprite) {
            console.log("Killing monster at " + creature.position);

            this.creatures.remove(creature, true);
        }

        isPassable(worldX: number, worldY: number) {
            var tileX = worldX / 24;
            var tileY = worldY / 24;

            var tile = this.map.getTile(tileX, tileY, "Walls", true);

            return tile && tile.index != 1;
        }

        isEnemy(worldX: number, worldY: number) { 
            var tileCoordinates = this.toTileCoordinates(worldX, worldY);

            var tile = this.map.getTile(tileCoordinates.x, tileCoordinates.y);
            var creatureExists = false;
            if (tile) {
                this.creatures.forEachAlive((creature) => {
                    var creatureTileCoordinates = this.toTileCoordinates(creature.x, creature.y);
                    if (creatureTileCoordinates.x == tileCoordinates.x && creatureTileCoordinates.y == tileCoordinates.y)
                        creatureExists = true;
                }, this);
            }

            return creatureExists;
        }

        creatureAt(worldX: number, worldY: number) {
            var tileCoordinates = this.toTileCoordinates(worldX, worldY);

            var tile = this.map.getTile(tileCoordinates.x, tileCoordinates.y);
            var found = null;
            if (tile) {
                this.creatures.forEachAlive((creature) => {
                    var creatureTileCoordinates = this.toTileCoordinates(creature.x, creature.y);
                    if (creatureTileCoordinates.x == tileCoordinates.x && creatureTileCoordinates.y == tileCoordinates.y)
                        found = creature;
                }, this);
            }

            return found;
        }

        toTileCoordinates(worldX, worldY) {
            return { x: worldX / 24, y: worldY / 24 };
        }

        moveRight(entity: Phaser.Sprite) {
            this.moveRelatively(entity, { x: "+24" });
        }

        moveLeft(entity: Phaser.Sprite) {
            this.moveRelatively(entity, { x: "-24" });
        }

        moveUp(entity: Phaser.Sprite) {
            this.moveRelatively(entity, { y: "-24" });
        }

        moveDown(entity: Phaser.Sprite) {
            this.moveRelatively(entity, { y: "+24" });
        }

        moveRelatively(entity: Phaser.Sprite, tween: any) {
            this.game.add.tween(entity)
                .to(tween, 300, Phaser.Easing.Linear.None, true)
                .onComplete.add(() => this.isMoving = false, this);

            this.isMoving = true;
        }
    }
} 