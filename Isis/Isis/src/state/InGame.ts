module Isis {
    export class InGame extends Phaser.State {
        map: Phaser.Tilemap;
        backgroundLayer: Phaser.TilemapLayer;
        itemLayer: Phaser.TilemapLayer;
        creatureLayer: Phaser.TilemapLayer;

        cursors: Phaser.CursorKeys;

        player: Phaser.Sprite;

        create() {
            this.game.stage.backgroundColor = "#ffffff";

            this.initializeMap();
            this.game.physics.p2.convertTilemap(this.map, this.backgroundLayer);

            this.player = this.game.add.sprite(48, 24, "hero");
            this.game.physics.p2.enable(this.player);
            this.game.camera.follow(this.player);

            this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

            this.cursors = this.game.input.keyboard.createCursorKeys();
        }

        initializeMap() {
            this.map = this.game.add.tilemap("maze");

            this.map.addTilesetImage("World_Tiles", "world_tileset");
            this.map.addTilesetImage("Creatures", "creatures_tileset");
            this.map.addTilesetImage("Items", "items_tileset");
            this.map.addTilesetImage("World_Objects", "world_objects_tileset");

            this.backgroundLayer = this.map.createLayer("Background");
            this.itemLayer = this.map.createLayer("Objects");
            this.creatureLayer = this.map.createLayer("Creatures");

            this.backgroundLayer.resizeWorld();

            this.map.setCollisionBetween(387, 405)
        }

        update() {
            if (this.cursors.left.isDown) {
                this.player.body.moveLeft(200);
            } else if (this.cursors.right.isDown) {
                this.player.body.moveRight(200);
            } else if (this.cursors.up.isDown) {
                this.player.body.moveUp(200);
            } else if (this.cursors.down.isDown) {
                this.player.body.moveDown(200);
            }
        }
    }
} 