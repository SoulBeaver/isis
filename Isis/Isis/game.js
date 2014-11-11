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

            this.map = new Isis.Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));
            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();

            this.initializePlayer();
        };

        InGame.prototype.separateCreaturesFromTilemap = function () {
            var _this = this;
            this.creatures = Isis.extractFrom(this.map, this.map.creatureLayer, function (creatureTile) {
                var creatureSprite = _this.game.add.sprite(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creatureTile.properties.atlas_name + "_1.png", creatureTile.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");

                return creatureSprite;
            });
        };

        InGame.prototype.separateItemsFromTilemap = function () {
            var _this = this;
            this.items = Isis.extractFrom(this.map, this.map.itemLayer, function (itemTile) {
                var itemSprite = _this.game.add.sprite(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name + ".png");

                // Center sprite in tile.
                itemSprite.x += 4;
                itemSprite.y += 4;

                return itemSprite;
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

        InGame.prototype.tryMoveTo = function (worldCoordinates) {
            var tileCoordinates = Isis.toTileCoordinates(this.map, worldCoordinates);

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
        };

        InGame.prototype.collectItem = function (player, item) {
            this.items.splice(this.items.indexOf(item), 1);
            item.destroy();
        };

        InGame.prototype.attackCreature = function (player, creature) {
            var _this = this;
            var xOffset = player.x - creature.x;
            var yOffset = player.y - creature.y;

            var tween = this.game.add.tween(player).to({
                x: player.x - xOffset,
                y: player.y - yOffset, angle: xOffset <= 0 ? 20 : -20
            }, 100, Phaser.Easing.Linear.None).yoyo(true);
            tween.onStart.add(function () {
                return _this.isAcceptingInput = false;
            }, this);
            tween.onLoop.add(function () {
                _this.creatures.splice(_this.creatures.indexOf(creature), 1);
                creature.destroy();
            }, this);
            tween.onComplete.add(function () {
                return _this.isAcceptingInput = true;
            }, this);
            tween.start();
        };

        InGame.prototype.creatureAt = function (tileCoordinates) {
            var _this = this;
            return _.find(this.creatures, function (creature) {
                return _.isEqual(Isis.toTileCoordinates(_this.map, creature), tileCoordinates);
            });
        };

        InGame.prototype.itemAt = function (tileCoordinates) {
            var _this = this;
            return _.find(this.items, function (item) {
                return _.isEqual(Isis.toTileCoordinates(_this.map, item), tileCoordinates);
            });
        };

        InGame.prototype.moveRelatively = function (entity, to) {
            var _this = this;
            var tween = this.game.add.tween(entity).to(to, 300, Phaser.Easing.Linear.None, true);
            tween.onStart.add(function () {
                return _this.isAcceptingInput = false;
            }, this);
            tween.onComplete.add(function () {
                return _this.isAcceptingInput = true;
            }, this);
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
            this.load.json("manifest", "assets/manifest.json");
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
/// <reference path="../libs/lodash/lodash.d.ts" />
var Isis;
(function (Isis) {
    ;
    ;

    var Tilemap = (function (_super) {
        __extends(Tilemap, _super);
        function Tilemap(game, key, manifest) {
            var _this = this;
            _super.call(this, game, key);
            this.WALLS_LAYER = "Walls";
            this.BACKGROUND_LAYER = "Background";
            this.CREATURES_LAYER = "Creatures";
            this.ITEMS_LAYER = "Items";
            this.OBJECTS_LAYER = "Objects";

            var tilesetImages = _.filter(manifest.maze, function (asset) {
                return asset.type == "image";
            }).forEach(function (asset) {
                var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
                _this.addTilesetImage(tileset, asset.key);
            });

            this.wallLayer = this.createLayer("Walls");
            this.backgroundLayer = this.createLayer("Background");
            this.shadowLayer = this.createLayer("Shadows");
            this.itemLayer = this.createLayer("Items");
            this.objectLayer = this.createLayer("Objects");
            this.creatureLayer = this.createLayer("Creatures");

            this.backgroundLayer.resizeWorld();
            this.setCollisionBetween(1, 2, true, "Walls");
        }
        Tilemap.prototype.isWall = function (at) {
            return this.tileExists(at, this.WALLS_LAYER);
        };

        Tilemap.prototype.tileExists = function (at, layer) {
            var tile = this.getTile(at.x, at.y, layer);
            return tile && tile.index != 0;
        };
        return Tilemap;
    })(Phaser.Tilemap);
    Isis.Tilemap = Tilemap;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    function extractFrom(map, layer, converter) {
        return _.filter(layer.getTiles(0, 0, map.widthInPixels, map.heightInPixels), function (tile) {
            return tile.properties.atlas_name;
        }).map(function (tile) {
            return converter(map.removeTile(tile.x, tile.y, layer));
        });
    }
    Isis.extractFrom = extractFrom;

    function toTileCoordinates(map, worldCoordinates) {
        return {
            x: Math.floor(worldCoordinates.x / map.tileWidth),
            y: Math.floor(worldCoordinates.y / map.tileHeight)
        };
    }
    Isis.toTileCoordinates = toTileCoordinates;
})(Isis || (Isis = {}));
//# sourceMappingURL=game.js.map
