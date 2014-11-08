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
        playerSpeed: number = 100;
        isMoving: boolean = false;

        creatures: Array<Phaser.Sprite> = [];

        create() {
            this.game.stage.backgroundColor = "#ffffff";

            this.initializeMap();
            this.replaceCreatureTilesWithAtlasSprites();
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
            var creatures = this.creatureLayer.getTiles(0, 0, this.world.width, this.world.height)
                .filter((tile) => tile.properties.atlas_name)
                .forEach((creature) => {
                    var creatureSprite = this.game.add.sprite(creature.worldX, creature.worldY, "creature_atlas");
                    creatureSprite.animations.add("idle", [creature.properties.atlas_name + "_1.png", creature.properties.atlas_name + "_2.png"], 2, true);
                    creatureSprite.animations.play("idle");

                    this.creatures.push(creatureSprite);
                    this.map.removeTile(creature.x, creature.y);
                });
        }

        initializePlayer() {
            this.player = this.game.add.sprite(48, 24, "creature_atlas");
            this.player.animations.add("idle", ["blue_knight_1.png", "blue_knight_2.png"], 2, true);
            this.player.animations.play("idle");

            this.game.physics.arcade.enable(this.player);
            this.player.body.setSize(24, 24);

            this.game.camera.follow(this.player);
        }

        update() {
            this.game.physics.arcade.collide(this.player, this.wallLayer);
            this.game.physics.arcade.overlap(this.player, this.itemLayer, this.collectItem, null, this);

            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;

            if (!this.isMoving) {
                if (this.cursors.left.isDown && !this.isWall(this.player.x - 24, this.player.y)) {
                    this.moveLeft(this.player);
                } else if (this.cursors.right.isDown && !this.isWall(this.player.x + 24, this.player.y)) {
                    this.moveRight(this.player);
                }

                if (this.cursors.up.isDown && !this.isWall(this.player.x, this.player.y - 24)) {
                    this.moveUp(this.player);
                } else if (this.cursors.down.isDown && !this.isWall(this.player.x, this.player.y + 24)) {
                    this.moveDown(this.player);
                }
            }            
        }

        collectItem(player: Phaser.Sprite, item: any) {
            item.destroy();
        }

        isWall(worldX: number, worldY: number) {
            var tileX = worldX / 24;
            var tileY = worldY / 24;

            var tile = this.map.getTile(tileX, tileY, "Walls", true);

            return tile == null || tile.index == 1;
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