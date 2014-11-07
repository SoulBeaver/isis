module Isis {
    export class InGame extends Phaser.State {
        map: Phaser.Tilemap;
        wallLayer: Phaser.TilemapLayer;
        backgroundLayer: Phaser.TilemapLayer;
        itemLayer: Phaser.TilemapLayer;
        creatureLayer: Phaser.TilemapLayer;

        cursors: Phaser.CursorKeys;

        player: Phaser.Sprite;
        playerSpeed: number = 100;

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

            this.wallLayer = this.map.createLayer("Walls");
            this.backgroundLayer = this.map.createLayer("Background");
            this.itemLayer = this.map.createLayer("Objects");
            this.creatureLayer = this.map.createLayer("Creatures");

            this.backgroundLayer.resizeWorld();

            this.map.setCollisionBetween(1, 2, true, "Walls");
        }

        replaceCreatureTilesWithAtlasSprites() {
            var creatures = this.creatureLayer.getTiles(0, 0, this.world.width, this.world.height)
                                              .filter((tile) => tile.properties.atlas_name);
            creatures.forEach((creature) => {
                var creatureSprite = this.game.add.sprite(creature.worldX, creature.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creature.properties.atlas_name + "_1.png", creature.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");

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

            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;

            if (this.cursors.left.isDown) {
                this.player.body.velocity.x -= this.playerSpeed;
            } else if (this.cursors.right.isDown) {
                this.player.body.velocity.x += this.playerSpeed;
            }

            if (this.cursors.up.isDown) {
                this.player.body.velocity.y -= this.playerSpeed;
            } else if (this.cursors.down.isDown) {
                this.player.body.velocity.y += this.playerSpeed;
            }
        }
    }
} 