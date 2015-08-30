window.onload = function () {
    var game = new Isis.Game();
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Isis;
(function (Isis) {
    /**
     * Entry into the game. Define any states necessary, then start the loading process.
     */
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 640, 480, Phaser.AUTO, "content", null);
            this.state.add(Isis.State.Boot, Isis.Boot, false);
            this.state.add(Isis.State.Preloader, Isis.Preloader, false);
            this.state.add(Isis.State.MainMenu, Isis.MainMenu, false);
            this.state.add(Isis.State.InGame, Isis.InGame, false);
            this.state.start(Isis.State.Boot);
        }
        return Game;
    })(Phaser.Game);
    Isis.Game = Game;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    function toKeyCode(keyString) {
        return Phaser.Keyboard[keyString];
    }
    Isis.toKeyCode = toKeyCode;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y) {
            _super.call(this, game, x, y, "creature_atlas");
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
        return Player;
    })(Phaser.Sprite);
    Isis.Player = Player;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Boot configures the game (dimensions, scale, platform-dependent code, etc)
     * and loads the loading bar for the upcoming asset loading.
     */
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
            this.configureGame();
            this.game.state.start(Isis.State.Preloader, false, true);
        };
        Boot.prototype.configureGame = function () {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            //scaling options
            // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // this.scale.setShowAll();
            // this.scale.
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
    /**
     * A mini-controller that is part of a proper Phaser.State. Can still be updated
     * like a Phaser.State and performs whatever logic necessary.
     */
    var InGameSubState = (function () {
        function InGameSubState(game, view, map, player) {
            this.onSwitchState = new Phaser.Signal();
            this.game = game;
            this.view = view;
            this.map = map;
            this.player = player;
        }
        InGameSubState.prototype.initialize = function () {
        };
        InGameSubState.prototype.update = function () {
        };
        InGameSubState.prototype.finalize = function () {
        };
        return InGameSubState;
    })();
    Isis.InGameSubState = InGameSubState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    var AnimatingState = (function (_super) {
        __extends(AnimatingState, _super);
        function AnimatingState(game, view, map, player) {
            _super.call(this, game, view, map, player);
        }
        AnimatingState.prototype.initialize = function () {
            this.view.onTweensFinished.add(this.switchToNextState, this);
            this.view.play();
        };
        AnimatingState.prototype.update = function () {
        };
        AnimatingState.prototype.switchToNextState = function () {
            this.onSwitchState.dispatch([this.nextState]);
        };
        return AnimatingState;
    })(Isis.InGameSubState);
    Isis.AnimatingState = AnimatingState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    var EnemyState = (function (_super) {
        __extends(EnemyState, _super);
        function EnemyState() {
            _super.apply(this, arguments);
        }
        EnemyState.prototype.update = function () {
            this.switchToAnimatingState();
        };
        EnemyState.prototype.switchToAnimatingState = function () {
            this.onSwitchState.dispatch();
        };
        return EnemyState;
    })(Isis.InGameSubState);
    Isis.EnemyState = EnemyState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    /**
     * Controlling class for any player actions made.
     */
    var PlayerState = (function (_super) {
        __extends(PlayerState, _super);
        function PlayerState(game, view, map, player) {
            _super.call(this, game, view, map, player);
            this.actionMap = [];
            this.creaturesToDelete = [];
            this.initializeInputBindings();
        }
        PlayerState.prototype.initializeInputBindings = function () {
            var _this = this;
            var settings = this.game.cache.getJSON("settings");
            var setActionMap = function (collection, action) {
                if (typeof collection === "string") {
                    _this.actionMap[collection] = action;
                }
                else {
                    _.forEach(collection, function (key) {
                        _this.actionMap[key] = action;
                    });
                }
            };
            // I'd like to keep the keys separate from the actions, so we read from the assets/settings.json to see which key is bound to which
            // action. We can then construct a decoupled associative array for every action. Currently, the player can only move via keyboard
            // but I'm hoping to allow for mouse input as well.
            setActionMap(settings.move_left, function () { return _this.tryMoveTo(_this.map.toTileCoordinates({ x: _this.player.x - 24, y: _this.player.y })); });
            setActionMap(settings.move_right, function () { return _this.tryMoveTo(_this.map.toTileCoordinates({ x: _this.player.x + 24, y: _this.player.y })); });
            setActionMap(settings.move_up, function () { return _this.tryMoveTo(_this.map.toTileCoordinates({ x: _this.player.x, y: _this.player.y - 24 })); });
            setActionMap(settings.move_down, function () { return _this.tryMoveTo(_this.map.toTileCoordinates({ x: _this.player.x, y: _this.player.y + 24 })); });
        };
        PlayerState.prototype.update = function () {
            var keyboard = this.game.input.keyboard;
            for (var inputCommand in this.actionMap) {
                var keyCode = Isis.toKeyCode(inputCommand);
                if (keyboard.isDown(keyCode)) {
                    this.actionMap[inputCommand]();
                    this.switchToAnimatingState();
                }
            }
        };
        /*
         * A player can do three things when moving:
         *     Move if there is nothing in the way
         *     Attack if a creature is in the way
         *     Activate an object if it is in the way
         *
         * I chose not to ignore the movement if a creature or object is in the way because I find it
         * it intuitive that a "bump" between player and creature should mean attack, or that
         * the player bumping into an object should mean that the user wants to activate it.
         * Creating a special shortcut or method to activate these separate from moving into them
         * seems like too much work and not worth the effort.
         */
        PlayerState.prototype.tryMoveTo = function (destination) {
            if (this.map.wallAt(destination))
                return;
            if (this.map.creatureAt(destination)) {
                this.attack(this.player, this.map.creatureAt(destination));
            }
            else if (this.map.objectAt(destination)) {
                this.activate(this.player, this.map.objectAt(destination));
            }
            else {
                if (this.map.itemAt(destination))
                    this.pickUp(this.player, this.map.itemAt(destination));
                this.move(this.player, destination);
            }
        };
        // For now, attacking a creature will automatically kill it.
        PlayerState.prototype.attack = function (player, creature) {
            this.view.attack(player, creature);
            this.creaturesToDelete.push(creature);
        };
        PlayerState.prototype.activate = function (player, object) {
            // TODO: Nothing to do yet.
        };
        // For now, the item is destroyed. In future versions, the player will have an inventory.
        PlayerState.prototype.pickUp = function (player, item) {
            this.map.removeItem(item);
        };
        PlayerState.prototype.move = function (player, to) {
            this.view.move(this.player, this.map.toWorldCoordinates(to));
        };
        PlayerState.prototype.switchToAnimatingState = function () {
            this.onSwitchState.dispatch();
        };
        PlayerState.prototype.finalize = function () {
            var _this = this;
            this.creaturesToDelete.forEach(function (creature) { return _this.map.removeCreature(creature); }, this);
            this.creaturesToDelete = [];
        };
        return PlayerState;
    })(Isis.InGameSubState);
    Isis.PlayerState = PlayerState;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Controlling class for all in-game logic. Has the ability to call and create popups and switch to different States.
     */
    var InGame = (function (_super) {
        __extends(InGame, _super);
        function InGame() {
            _super.apply(this, arguments);
        }
        InGame.prototype.create = function () {
            this.game.stage.backgroundColor = "#000000";
            this.initializeView();
            this.initializeMap();
            this.initializePlayer();
            this.initializeSubStates();
        };
        InGame.prototype.initializeView = function () {
            this.view = new Isis.GameView(this.game);
        };
        InGame.prototype.initializeMap = function () {
            this.map = new Isis.Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));
            this.mapLighting = new Isis.MapLighting(this.game, this.map);
        };
        InGame.prototype.initializePlayer = function () {
            this.player = new Isis.Player(this.game, 48, 24);
            this.game.camera.follow(this.player);
        };
        InGame.prototype.initializeSubStates = function () {
            this.playerState = new Isis.PlayerState(this.game, this.view, this.map, this.player);
            this.playerState.onSwitchState.add(this.switchFromPlayerState, this);
            this.enemyState = new Isis.EnemyState(this.game, this.view, this.map, this.player);
            this.enemyState.onSwitchState.add(this.switchFromEnemyState, this);
            // We're not adding a onSwitchState because we switch to either Player or EnemyState depending
            // on which state came before. Therefore, we add a callback to the animating state whenever
            // the Player or EnemyState is finished.
            this.animatingState = new Isis.AnimatingState(this.game, this.view, this.map, this.player);
            this.currentState = this.playerState;
        };
        InGame.prototype.update = function () {
            this.currentState.update();
            // this.player.update();
            this.mapLighting.illuminate({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2
            });
        };
        InGame.prototype.switchFromPlayerState = function () {
            this.currentState.finalize();
            this.currentState = this.animatingState;
            this.currentState.onSwitchState.addOnce(this.switchToEnemyState, this);
            this.currentState.initialize();
        };
        InGame.prototype.switchFromEnemyState = function () {
            this.currentState.finalize();
            this.currentState = this.animatingState;
            this.currentState.onSwitchState.addOnce(this.switchToPlayerState, this);
            this.currentState.initialize();
        };
        InGame.prototype.switchToEnemyState = function () {
            this.currentState.finalize();
            this.currentState = this.enemyState;
            this.currentState.initialize();
        };
        InGame.prototype.switchToPlayerState = function () {
            this.currentState.finalize();
            this.currentState = this.playerState;
            this.currentState.initialize();
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
            this.add.tween(this.title)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startGame, this);
        };
        MainMenu.prototype.startGame = function () {
            this.game.state.start(Isis.State.InGame, true, false);
        };
        return MainMenu;
    })(Phaser.State);
    Isis.MainMenu = MainMenu;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Preloader loads all assets required by every state in the game.
     */
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
            // Explicitly load the manifest as well! It is used later for the tilemaps to identify which tilesets they require.
            this.load.json("manifest", "assets/manifest.json");
        };
        Preloader.prototype.create = function () {
            this.add.tween(this.preloadBar)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startMainMenu, this);
        };
        Preloader.prototype.startMainMenu = function () {
            // We're skipping the main menu to ease testing of gameplay- no need to click through the menu.
            this.game.state.start(Isis.State.InGame, true, false);
        };
        return Preloader;
    })(Phaser.State);
    Isis.Preloader = Preloader;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Enumeration class referring to every State- but not sub-state- found in this game.
     */
    // This is not an enum because TypeScript enums do not support string values.
    var State = (function () {
        function State() {
        }
        State.Boot = "Boot";
        State.Preloader = "Preloader";
        State.MainMenu = "MainMenu";
        State.InGame = "InGame";
        return State;
    })();
    Isis.State = State;
})(Isis || (Isis = {}));
/// <reference path="../../../libs/lodash/lodash.d.ts" />
var Isis;
(function (Isis) {
    var GameView = (function () {
        function GameView(game) {
            this.tweensToPlay = [];
            this.onTweensStarted = new Phaser.Signal();
            this.onTweensFinished = new Phaser.Signal();
            this.game = game;
        }
        GameView.prototype.move = function (entity, to) {
            var tween = this.game.add.tween(entity).to(to, 100, Phaser.Easing.Linear.None);
            this.registerTweenDeletion(tween);
            this.tweensToPlay.push(tween);
        };
        GameView.prototype.attack = function (player, creature) {
            var xOffset = player.x - creature.x;
            var yOffset = player.y - creature.y;
            var tween = this.game.add.tween(player)
                .to({
                x: player.x - xOffset,
                y: player.y - yOffset, angle: xOffset <= 0 ? 20 : -20
            }, 100, Phaser.Easing.Linear.None)
                .yoyo(true);
            this.registerTweenDeletion(tween);
            this.tweensToPlay.push(tween);
        };
        GameView.prototype.play = function () {
            _.forEach(this.tweensToPlay, function (tween) { return tween.start(); });
            this.onTweensStarted.dispatch();
            this.dispatchIfNoActiveTweensRemain();
        };
        GameView.prototype.registerTweenDeletion = function (tween) {
            var _this = this;
            tween.onComplete.add(function () {
                _this.tweensToPlay = _.reject(_this.tweensToPlay, tween);
                _this.dispatchIfNoActiveTweensRemain();
            }, this);
        };
        GameView.prototype.dispatchIfNoActiveTweensRemain = function () {
            if (_.isEmpty(this.tweensToPlay))
                this.onTweensFinished.dispatch();
        };
        return GameView;
    })();
    Isis.GameView = GameView;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var MapLighting = (function () {
        function MapLighting(game, map) {
            this.lightRadius = 50;
            this.game = game;
            this.map = map;
            this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
            this.lightSprite = this.game.add.image(0, 0, this.shadowTexture);
            this.lightSprite.blendMode = PIXI.blendModes.MULTIPLY;
        }
        MapLighting.prototype.illuminate = function (where) {
            // Draw shadow
            this.shadowTexture.context.fillStyle = 'rgb(10, 10, 10)';
            this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);
            // Draw circle of light
            this.shadowTexture.context.beginPath();
            this.shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
            this.shadowTexture.context.arc(where.x, where.y, this.lightRadius, 0, Math.PI * 2);
            this.shadowTexture.context.fill();
            // This just tells the engine it should update the texture cache
            this.shadowTexture.dirty = true;
        };
        return MapLighting;
    })();
    Isis.MapLighting = MapLighting;
})(Isis || (Isis = {}));
/// <reference path="../../libs/lodash/lodash.d.ts" />
var Isis;
(function (Isis) {
    var Tilemap = (function (_super) {
        __extends(Tilemap, _super);
        function Tilemap(game, key, manifest) {
            _super.call(this, game, key);
            this.WallsLayer = "Walls";
            this.BackgroundLayer = "Background";
            this.ShadowsLayer = "Shadows";
            this.CreaturesLayer = "Creatures";
            this.ItemsLayer = "Items";
            this.ObjectsLayer = "Objects";
            this.addTilesets(manifest.maze);
            this.wallLayer = this.createLayer(this.WallsLayer);
            this.backgroundLayer = this.createLayer(this.BackgroundLayer);
            this.shadowLayer = this.createLayer(this.ShadowsLayer);
            this.itemLayer = this.createLayer(this.ItemsLayer);
            this.objectLayer = this.createLayer(this.ObjectsLayer);
            this.creatureLayer = this.createLayer(this.CreaturesLayer);
            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();
            this.backgroundLayer.resizeWorld();
            this.setCollisionBetween(1, 2, true, "Walls");
        }
        Tilemap.prototype.addTilesets = function (manifestTilemap) {
            var _this = this;
            _.filter(manifestTilemap, function (asset) { return asset.type == "image"; })
                .forEach(function (asset) {
                var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
                _this.addTilesetImage(tileset, asset.key);
            });
        };
        Tilemap.prototype.separateCreaturesFromTilemap = function () {
            var _this = this;
            this.creatures = this.extractFrom(this.creatureLayer, function (creatureTile) {
                var creatureSprite = _this.game.add.sprite(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creatureTile.properties.atlas_name + "_1.png", creatureTile.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");
                return creatureSprite;
            });
        };
        Tilemap.prototype.separateItemsFromTilemap = function () {
            var _this = this;
            var centerItem = function (item) { item.x += _this.tileWidth / 6; item.y += _this.tileHeight / 6; };
            this.items = this.extractFrom(this.itemLayer, function (itemTile) {
                var itemSprite = _this.game.add.sprite(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name + ".png");
                centerItem(itemSprite);
                return itemSprite;
            });
        };
        Tilemap.prototype.extractFrom = function (layer, converter) {
            var _this = this;
            return _.filter(layer.getTiles(0, 0, this.widthInPixels, this.heightInPixels), function (tile) { return tile.properties.atlas_name; })
                .map(function (tile) { return converter(_this.removeTile(tile.x, tile.y, layer)); });
        };
        Tilemap.prototype.wallAt = function (at) {
            var tile = this.getTile(at.x, at.y, this.WallsLayer);
            return tile && tile.index != 0;
        };
        Tilemap.prototype.itemAt = function (at) {
            var _this = this;
            return _.find(this.items, function (item) { return _.isEqual(_this.toTileCoordinates(item), at); });
        };
        Tilemap.prototype.objectAt = function (at) {
            var _this = this;
            return _.find(this.activatableObjects, function (object) { return _.isEqual(_this.toTileCoordinates(object), at); });
        };
        Tilemap.prototype.creatureAt = function (at) {
            var _this = this;
            return _.find(this.creatures, function (creature) { return _.isEqual(_this.toTileCoordinates(creature), at); });
        };
        Tilemap.prototype.removeItem = function (item) {
            _.remove(this.items, function (candidate) { return _.isEqual(candidate, item); });
            item.destroy();
        };
        Tilemap.prototype.removeCreature = function (creature) {
            _.remove(this.creatures, function (candidate) { return _.isEqual(candidate, creature); });
            creature.destroy();
        };
        Tilemap.prototype.toTileCoordinates = function (worldCoordinates) {
            return {
                x: Math.floor(worldCoordinates.x / this.tileWidth),
                y: Math.floor(worldCoordinates.y / this.tileHeight)
            };
        };
        Tilemap.prototype.toWorldCoordinates = function (tileCoordinates) {
            return {
                x: tileCoordinates.x * this.tileWidth,
                y: tileCoordinates.y * this.tileHeight
            };
        };
        return Tilemap;
    })(Phaser.Tilemap);
    Isis.Tilemap = Tilemap;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var WorldCoordinates = (function () {
        function WorldCoordinates() {
        }
        return WorldCoordinates;
    })();
    Isis.WorldCoordinates = WorldCoordinates;
    ;
})(Isis || (Isis = {}));
//# sourceMappingURL=game.js.map