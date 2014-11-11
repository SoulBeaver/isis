window.onload = function () {
    var game = new Isis.Game();
};
var Isis;
(function (Isis) {
    Isis.Configuration = {};
})(Isis || (Isis = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Isis;
(function (Isis) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 640, 480, Phaser.AUTO, "content", null);

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
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y) {
            _super.call(this, game, x, y, "creature_atlas");
            this._acceleration = 150;
            this.onMoveLeft = new Phaser.Signal();
            this.onMoveRight = new Phaser.Signal();
            this.onMoveUp = new Phaser.Signal();
            this.onMoveDown = new Phaser.Signal();

            this.addAnimations();
            this.addPhysics();

            this.game.add.existing(this);
        }
        Player.prototype.addAnimations = function () {
            this.animations.add("idle", ["blue_knight_1.png", "blue_knight_2.png"], 2, true);
            this.animations.play("idle");
        };

        Player.prototype.addPhysics = function () {
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
        };

        Player.prototype.tryActOn = function (command) {
            switch (command) {
                case "move_left":
                    this.onMoveLeft.dispatch(this);
                    break;

                case "move_right":
                    this.onMoveRight.dispatch(this);
                    break;

                case "move_up":
                    this.onMoveUp.dispatch(this);
                    break;

                case "move_down":
                    this.onMoveDown.dispatch(this);
                    break;
            }
        };
        return Player;
    })(Phaser.Sprite);
    Isis.Player = Player;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.preload = function () {
            this.load.image("preloadBar", "assets/preloadBar.png");
            this.load.json("settings", "assets/settings.json");
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
            this.scale.setShowAll();
            this.scale.refresh();

            //have the game centered horizontally
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        };
        return Boot;
    })(Phaser.State);
    Isis.Boot = Boot;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var InGame = (function (_super) {
        __extends(InGame, _super);
        function InGame() {
            _super.apply(this, arguments);
            this.isAcceptingInput = true;
        }
        InGame.prototype.create = function () {
            this.game.stage.backgroundColor = "#000000";

            this.settings = this.game.cache.getJSON("settings");

            this.initializeMap();
            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();

            this.initializePlayer();
        };

        InGame.prototype.initializeMap = function () {
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
        };

        InGame.prototype.separateCreaturesFromTilemap = function () {
            var _this = this;
            this.creatures = this.game.add.group();
            this.creatures.enableBody = true;
            this.creatures.physicsBodyType = Phaser.Physics.ARCADE;

            this.creatureLayer.getTiles(0, 0, this.world.width, this.world.height).filter(function (tile) {
                return tile.properties.atlas_name;
            }).forEach(function (creatureTile) {
                var creatureSprite = _this.creatures.create(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creatureTile.properties.atlas_name + "_1.png", creatureTile.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");

                creatureSprite.body.immovable = true;

                _this.map.removeTile(creatureTile.x, creatureTile.y, "Creatures");
            });
        };

        InGame.prototype.separateItemsFromTilemap = function () {
            var _this = this;
            this.items = this.game.add.group();
            this.items.enableBody = true;

            this.itemLayer.getTiles(0, 0, this.world.width, this.world.height).filter(function (tile) {
                return tile.properties.atlas_name;
            }).forEach(function (itemTile) {
                var itemSprite = _this.items.create(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name + ".png");

                // Center sprite in tile.
                itemSprite.x += 4;
                itemSprite.y += 4;

                _this.map.removeTile(itemTile.x, itemTile.y, "Items");
            });
        };

        InGame.prototype.initializePlayer = function () {
            this.player = new Isis.Player(this.game, 48, 24);

            this.player.onMoveDown.add(this.movePlayerDown, this);
            this.player.onMoveUp.add(this.movePlayerUp, this);
            this.player.onMoveLeft.add(this.movePlayerLeft, this);
            this.player.onMoveRight.add(this.movePlayerRight, this);

            this.game.camera.follow(this.player);
        };

        InGame.prototype.update = function () {
            this.game.physics.arcade.overlap(this.player, this.items, this.collectItem, null, this);

            if (this.isAcceptingInput) {
                var keyboard = this.game.input.keyboard;

                for (var inputCommand in this.settings) {
                    var keyCode = this.toKeyCode(this.settings[inputCommand]);
                    if (keyboard.isDown(keyCode))
                        this.player.tryActOn(inputCommand);
                }
            }
        };

        InGame.prototype.toKeyCode = function (keyString) {
            return Phaser.Keyboard[keyString];
        };

        InGame.prototype.movePlayerDown = function (player) {
            this.tryMoveTo({ x: this.player.x, y: this.player.y + 24 });
        };

        InGame.prototype.movePlayerUp = function (player) {
            this.tryMoveTo({ x: this.player.x, y: this.player.y - 24 });
        };

        InGame.prototype.movePlayerLeft = function (player) {
            this.tryMoveTo({ x: this.player.x - 24, y: this.player.y });
        };

        InGame.prototype.movePlayerRight = function (player) {
            this.tryMoveTo({ x: this.player.x + 24, y: this.player.y });
        };

        InGame.prototype.tryMoveTo = function (destination) {
            if (this.isPassable(destination)) {
                var creatureBlockingPath = this.creatureAt(destination);
                if (creatureBlockingPath) {
                    this.attackCreature(this.player, creatureBlockingPath);
                } else {
                    this.moveRelatively(this.player, destination);
                }
            }
        };

        InGame.prototype.collectItem = function (player, item) {
            item.destroy();
        };

        InGame.prototype.attackCreature = function (player, creature) {
            var _this = this;
            this.isAcceptingInput = false;

            var xOffset = player.x - creature.x;
            var yOffset = player.y - creature.y;

            var tween = this.game.add.tween(player).to({ x: player.x - xOffset, y: player.y - yOffset, angle: xOffset <= 0 ? 20 : -20 }, 100, Phaser.Easing.Linear.None).yoyo(true);
            tween.onLoop.add(function () {
                return _this.creatures.remove(creature, true);
            }, this);
            tween.onComplete.add(function () {
                return _this.isAcceptingInput = true;
            }, this);
            tween.start();
        };

        InGame.prototype.isPassable = function (worldXY) {
            var tileCoordinates = this.toTileCoordinates(worldXY);
            var tile = this.map.getTile(tileCoordinates.x, tileCoordinates.y, "Walls", true);
            return tile && tile.index != 1;
        };

        InGame.prototype.creatureAt = function (worldXY) {
            var _this = this;
            var tileCoordinates = this.toTileCoordinates(worldXY);

            var tile = this.map.getTile(tileCoordinates.x, tileCoordinates.y);
            var found = null;
            if (tile) {
                this.creatures.forEachAlive(function (creature) {
                    var creatureTileCoordinates = _this.toTileCoordinates({ x: creature.x, y: creature.y });
                    if (creatureTileCoordinates.x == tileCoordinates.x && creatureTileCoordinates.y == tileCoordinates.y)
                        found = creature;
                }, this);
            }

            return found;
        };

        InGame.prototype.toTileCoordinates = function (worldXY) {
            return { x: worldXY.x / 24, y: worldXY.y / 24 };
        };

        InGame.prototype.moveRelatively = function (entity, to) {
            var _this = this;
            this.game.add.tween(entity).to(to, 300, Phaser.Easing.Linear.None, true).onComplete.add(function () {
                return _this.isAcceptingInput = true;
            }, this);

            this.isAcceptingInput = false;
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
            this.load.pack("maze", "assets/manifest.json");
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
