window.onload = function () {
    var game = new Isis.Game();
};
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Isis;
(function (Isis) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.preload = function () {
            this.load.image("preloadBar", "assets/preloadBar.png");
        };

        Boot.prototype.create = function () {
            this.input.maxPointers = 1;

            this.configureGame();

            this.game.state.start("Preloader", false, true);
        };

        Boot.prototype.configureGame = function () {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            //scaling options
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            //have the game centered horizontally
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;

            //screen size will be set automatically
            this.scale.setScreenSize(true);
        };
        return Boot;
    })(Phaser.State);
    Isis.Boot = Boot;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 800, 600, Phaser.AUTO, "content", null);

            this.state.add("Boot", Isis.Boot, false);
            this.state.add("Preloader", Isis.Preloader, false);
            this.state.add("MainMenu", Isis.MainMenu, false);
            this.state.add("InGame", Isis.InGame, false);

            this.state.start("Boot");
        }
        return Game;
    })(Phaser.Game);
    Isis.Game = Game;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var InGame = (function (_super) {
        __extends(InGame, _super);
        function InGame() {
            _super.apply(this, arguments);
            this.playerSpeed = 100;
        }
        InGame.prototype.create = function () {
            this.game.stage.backgroundColor = "#ffffff";

            this.initializeMap();
            this.replaceCreatureTilesWithAtlasSprites();
            this.initializePlayer();

            this.wallLayer.debug = true;
            this.player.debug = true;

            this.cursors = this.game.input.keyboard.createCursorKeys();
        };

        InGame.prototype.initializeMap = function () {
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
        };

        InGame.prototype.replaceCreatureTilesWithAtlasSprites = function () {
            var _this = this;
            var creatures = this.creatureLayer.getTiles(0, 0, this.world.width, this.world.height).filter(function (tile) {
                return tile.properties.atlas_name;
            });
            creatures.forEach(function (creature) {
                var creatureSprite = _this.game.add.sprite(creature.worldX, creature.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creature.properties.atlas_name + "_1.png", creature.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");

                _this.map.removeTile(creature.x, creature.y);
            });
        };

        InGame.prototype.initializePlayer = function () {
            this.player = this.game.add.sprite(48, 24, "creature_atlas");
            this.player.animations.add("idle", ["blue_knight_1.png", "blue_knight_2.png"], 2, true);
            this.player.animations.play("idle");

            this.game.physics.arcade.enable(this.player);
            this.player.body.setSize(24, 24);

            this.game.camera.follow(this.player);
        };

        InGame.prototype.update = function () {
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
        };
        return InGame;
    })(Phaser.State);
    Isis.InGame = InGame;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var MainMenu = (function (_super) {
        __extends(MainMenu, _super);
        function MainMenu() {
            _super.apply(this, arguments);
        }
        MainMenu.prototype.create = function () {
            var text = "Start";
            var style = { font: "65px Arial", fill: "#ffffff", align: "center" };

            this.title = this.game.add.text(this.game.world.centerX - 50, this.game.world.centerY - 10, text, style);

            this.input.onDown.addOnce(this.fadeOut, this);
        };

        MainMenu.prototype.fadeOut = function () {
            this.add.tween(this.title).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(this.startGame, this);
        };

        MainMenu.prototype.startGame = function () {
            this.game.state.start("InGame", true, false);
        };
        return MainMenu;
    })(Phaser.State);
    Isis.MainMenu = MainMenu;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            _super.apply(this, arguments);
        }
        Preloader.prototype.preload = function () {
            this.preloadBar = this.add.sprite(200, 250, "preloadBar");
            this.load.setPreloadSprite(this.preloadBar);

            this.loadAssets();
        };

        Preloader.prototype.loadAssets = function () {
            this.load.tilemap("maze", "assets/tilemaps/maps/Maze.json", null, Phaser.Tilemap.TILED_JSON);

            this.load.image("creatures_tileset", "assets/tilemaps/tiles/Creatures.png");
            this.load.image("items_tileset", "assets/tilemaps/tiles/Items.png");
            this.load.image("world_tileset", "assets/tilemaps/tiles/World_Tiles.png");
            this.load.image("world_objects_tileset", "assets/tilemaps/tiles/World_Objects.png");

            this.load.atlas("creature_atlas", "assets/spritesheets/creature_atlas.png", "assets/spritesheets/creature_atlas.json");
        };

        Preloader.prototype.create = function () {
            this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(this.startMainMenu, this);
        };

        Preloader.prototype.startMainMenu = function () {
            this.game.state.start("InGame", true, false);
        };
        return Preloader;
    })(Phaser.State);
    Isis.Preloader = Preloader;
})(Isis || (Isis = {}));
//# sourceMappingURL=game.js.map
