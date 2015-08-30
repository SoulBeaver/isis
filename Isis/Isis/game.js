window.onload = () => {
    var game = new Isis.Game();
};
var Isis;
(function (Isis) {
    /**
     * Entry into the game. Define any states necessary, then start the loading process.
     */
    class Game extends Phaser.Game {
        constructor() {
            super(640, 480, Phaser.AUTO, "content", null);
            this.state.add(Isis.State.Boot, Isis.Boot, false);
            this.state.add(Isis.State.Preloader, Isis.Preloader, false);
            this.state.add(Isis.State.MainMenu, Isis.MainMenu, false);
            this.state.add(Isis.State.InGame, Isis.InGame, false);
            this.state.start(Isis.State.Boot);
        }
    }
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
    class Player extends Phaser.Sprite {
        constructor(game, x, y) {
            super(game, x, y, "creature_atlas");
            this._acceleration = 150;
            this.addAnimations();
            this.addPhysics();
            this.game.add.existing(this);
        }
        addAnimations() {
            this.animations.add("idle", ["blue_knight_1.png", "blue_knight_2.png"], 2, true);
            this.animations.play("idle");
        }
        addPhysics() {
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
        }
    }
    Isis.Player = Player;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Boot configures the game (dimensions, scale, platform-dependent code, etc)
     * and loads the loading bar for the upcoming asset loading.
     */
    class Boot extends Phaser.State {
        preload() {
            this.load.image("preloadBar", "assets/preloadBar.png");
            this.load.json("settings", "assets/settings.json");
        }
        create() {
            this.configureGame();
            this.game.state.start(Isis.State.Preloader, false, true);
        }
        configureGame() {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            //scaling options
            // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // this.scale.setShowAll();
            // this.scale.
            this.scale.refresh();
            //have the game centered horizontally
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }
    }
    Isis.Boot = Boot;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * A mini-controller that is part of a proper Phaser.State. Can still be updated
     * like a Phaser.State and performs whatever logic necessary.
     */
    class InGameSubState {
        constructor(game, view, map, player) {
            this.onSwitchState = new Phaser.Signal();
            this.game = game;
            this.view = view;
            this.map = map;
            this.player = player;
        }
        initialize() {
        }
        update() {
        }
        finalize() {
        }
    }
    Isis.InGameSubState = InGameSubState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    class AnimatingState extends Isis.InGameSubState {
        constructor(game, view, map, player) {
            super(game, view, map, player);
        }
        initialize() {
            this.view.onTweensFinished.add(this.switchToNextState, this);
            this.view.play();
        }
        update() {
        }
        switchToNextState() {
            this.onSwitchState.dispatch([this.nextState]);
        }
    }
    Isis.AnimatingState = AnimatingState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    class EnemyState extends Isis.InGameSubState {
        update() {
            this.switchToAnimatingState();
        }
        switchToAnimatingState() {
            this.onSwitchState.dispatch();
        }
    }
    Isis.EnemyState = EnemyState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    /**
     * Controlling class for any player actions made.
     */
    class PlayerState extends Isis.InGameSubState {
        constructor(game, view, map, player) {
            super(game, view, map, player);
            this.actionMap = [];
            this.creaturesToDelete = [];
            this.initializeInputBindings();
        }
        initializeInputBindings() {
            var settings = this.game.cache.getJSON("settings");
            var setActionMap = (collection, action) => {
                if (typeof collection === "string") {
                    this.actionMap[collection] = action;
                }
                else {
                    _.forEach(collection, (key) => {
                        this.actionMap[key] = action;
                    });
                }
            };
            // I'd like to keep the keys separate from the actions, so we read from the assets/settings.json to see which key is bound to which
            // action. We can then construct a decoupled associative array for every action. Currently, the player can only move via keyboard
            // but I'm hoping to allow for mouse input as well.
            setActionMap(settings.move_left, () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x - 24, y: this.player.y })));
            setActionMap(settings.move_right, () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x + 24, y: this.player.y })));
            setActionMap(settings.move_up, () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x, y: this.player.y - 24 })));
            setActionMap(settings.move_down, () => this.tryMoveTo(this.map.toTileCoordinates({ x: this.player.x, y: this.player.y + 24 })));
        }
        update() {
            var keyboard = this.game.input.keyboard;
            for (var inputCommand in this.actionMap) {
                var keyCode = Isis.toKeyCode(inputCommand);
                if (keyboard.isDown(keyCode)) {
                    this.actionMap[inputCommand]();
                    this.switchToAnimatingState();
                }
            }
        }
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
        tryMoveTo(destination) {
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
        }
        // For now, attacking a creature will automatically kill it.
        attack(player, creature) {
            this.view.attack(player, creature);
            this.creaturesToDelete.push(creature);
        }
        activate(player, object) {
            // TODO: Nothing to do yet.
        }
        // For now, the item is destroyed. In future versions, the player will have an inventory.
        pickUp(player, item) {
            this.map.removeItem(item);
        }
        move(player, to) {
            this.view.move(this.player, this.map.toWorldCoordinates(to));
        }
        switchToAnimatingState() {
            this.onSwitchState.dispatch();
        }
        finalize() {
            this.creaturesToDelete.forEach((creature) => this.map.removeCreature(creature), this);
            this.creaturesToDelete = [];
        }
    }
    Isis.PlayerState = PlayerState;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Controlling class for all in-game logic. Has the ability to call and create popups and switch to different States.
     */
    class InGame extends Phaser.State {
        create() {
            this.game.stage.backgroundColor = "#000000";
            this.initializeView();
            this.initializeMap();
            this.initializePlayer();
            this.initializeSubStates();
        }
        initializeView() {
            this.view = new Isis.GameView(this.game);
        }
        initializeMap() {
            this.map = new Isis.Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));
        }
        initializePlayer() {
            this.player = new Isis.Player(this.game, 48, 24);
            this.game.camera.follow(this.player);
        }
        initializeSubStates() {
            this.playerState = new Isis.PlayerState(this.game, this.view, this.map, this.player);
            this.playerState.onSwitchState.add(this.switchFromPlayerState, this);
            this.enemyState = new Isis.EnemyState(this.game, this.view, this.map, this.player);
            this.enemyState.onSwitchState.add(this.switchFromEnemyState, this);
            // We're not adding a onSwitchState because we switch to either Player or EnemyState depending
            // on which state came before. Therefore, we add a callback to the animating state whenever
            // the Player or EnemyState is finished.
            this.animatingState = new Isis.AnimatingState(this.game, this.view, this.map, this.player);
            this.currentState = this.playerState;
        }
        update() {
            this.currentState.update();
        }
        switchFromPlayerState() {
            this.currentState.finalize();
            this.currentState = this.animatingState;
            this.currentState.onSwitchState.addOnce(this.switchToEnemyState, this);
            this.currentState.initialize();
        }
        switchFromEnemyState() {
            this.currentState.finalize();
            this.currentState = this.animatingState;
            this.currentState.onSwitchState.addOnce(this.switchToPlayerState, this);
            this.currentState.initialize();
        }
        switchToEnemyState() {
            this.currentState.finalize();
            this.currentState = this.enemyState;
            this.currentState.initialize();
        }
        switchToPlayerState() {
            this.currentState.finalize();
            this.currentState = this.playerState;
            this.currentState.initialize();
        }
    }
    Isis.InGame = InGame;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    class MainMenu extends Phaser.State {
        create() {
            var text = "Start";
            var style = { font: "65px Arial", fill: "#ffffff", align: "center" };
            this.title = this.game.add.text(this.game.world.centerX - 50, this.game.world.centerY - 10, text, style);
            this.input.onDown.addOnce(this.fadeOut, this);
        }
        fadeOut() {
            this.add.tween(this.title)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startGame, this);
        }
        startGame() {
            this.game.state.start(Isis.State.InGame, true, false);
        }
    }
    Isis.MainMenu = MainMenu;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Preloader loads all assets required by every state in the game.
     */
    class Preloader extends Phaser.State {
        preload() {
            this.preloadBar = this.add.sprite(200, 250, "preloadBar");
            this.load.setPreloadSprite(this.preloadBar);
            this.loadAssets();
        }
        loadAssets() {
            this.load.pack("maze", "assets/manifest.json");
            // Explicitly load the manifest as well! It is used later for the tilemaps to identify which tilesets they require.
            this.load.json("manifest", "assets/manifest.json");
        }
        create() {
            this.add.tween(this.preloadBar)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startMainMenu, this);
        }
        startMainMenu() {
            // We're skipping the main menu to ease testing of gameplay- no need to click through the menu.
            this.game.state.start(Isis.State.InGame, true, false);
        }
    }
    Isis.Preloader = Preloader;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Enumeration class referring to every State- but not sub-state- found in this game.
     */
    // This is not an enum because TypeScript enums do not support string values.
    class State {
    }
    State.Boot = "Boot";
    State.Preloader = "Preloader";
    State.MainMenu = "MainMenu";
    State.InGame = "InGame";
    Isis.State = State;
})(Isis || (Isis = {}));
/// <reference path="../../../libs/lodash/lodash.d.ts" />
var Isis;
(function (Isis) {
    class GameView {
        constructor(game) {
            this.tweensToPlay = [];
            this.onTweensStarted = new Phaser.Signal();
            this.onTweensFinished = new Phaser.Signal();
            this.game = game;
        }
        move(entity, to) {
            var tween = this.game.add.tween(entity).to(to, 100, Phaser.Easing.Linear.None);
            this.registerTweenDeletion(tween);
            this.tweensToPlay.push(tween);
        }
        attack(player, creature) {
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
        }
        play() {
            _.forEach(this.tweensToPlay, (tween) => tween.start());
            this.onTweensStarted.dispatch();
            this.dispatchIfNoActiveTweensRemain();
        }
        registerTweenDeletion(tween) {
            tween.onComplete.add(() => {
                this.tweensToPlay = _.reject(this.tweensToPlay, tween);
                this.dispatchIfNoActiveTweensRemain();
            }, this);
        }
        dispatchIfNoActiveTweensRemain() {
            if (_.isEmpty(this.tweensToPlay))
                this.onTweensFinished.dispatch();
        }
    }
    Isis.GameView = GameView;
})(Isis || (Isis = {}));
/// <reference path="../../libs/lodash/lodash.d.ts" />
var Isis;
(function (Isis) {
    class Tilemap extends Phaser.Tilemap {
        constructor(game, key, manifest) {
            super(game, key);
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
        addTilesets(manifestTilemap) {
            _.filter(manifestTilemap, (asset) => asset.type == "image")
                .forEach((asset) => {
                var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
                this.addTilesetImage(tileset, asset.key);
            });
        }
        separateCreaturesFromTilemap() {
            this.creatures = this.extractFrom(this.creatureLayer, (creatureTile) => {
                var creatureSprite = this.game.add.sprite(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creatureTile.properties.atlas_name + "_1.png", creatureTile.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");
                return creatureSprite;
            });
        }
        separateItemsFromTilemap() {
            var centerItem = (item) => { item.x += this.tileWidth / 6; item.y += this.tileHeight / 6; };
            this.items = this.extractFrom(this.itemLayer, (itemTile) => {
                var itemSprite = this.game.add.sprite(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name + ".png");
                centerItem(itemSprite);
                return itemSprite;
            });
        }
        extractFrom(layer, converter) {
            return _.filter(layer.getTiles(0, 0, this.widthInPixels, this.heightInPixels), (tile) => tile.properties.atlas_name)
                .map((tile) => converter(this.removeTile(tile.x, tile.y, layer)));
        }
        wallAt(at) {
            var tile = this.getTile(at.x, at.y, this.WallsLayer);
            return tile && tile.index != 0;
        }
        itemAt(at) {
            return _.find(this.items, (item) => _.isEqual(this.toTileCoordinates(item), at));
        }
        objectAt(at) {
            return _.find(this.activatableObjects, (object) => _.isEqual(this.toTileCoordinates(object), at));
        }
        creatureAt(at) {
            return _.find(this.creatures, (creature) => _.isEqual(this.toTileCoordinates(creature), at));
        }
        removeItem(item) {
            _.remove(this.items, (candidate) => _.isEqual(candidate, item));
            item.destroy();
        }
        removeCreature(creature) {
            _.remove(this.creatures, (candidate) => _.isEqual(candidate, creature));
            creature.destroy();
        }
        toTileCoordinates(worldCoordinates) {
            return {
                x: Math.floor(worldCoordinates.x / this.tileWidth),
                y: Math.floor(worldCoordinates.y / this.tileHeight)
            };
        }
        toWorldCoordinates(tileCoordinates) {
            return {
                x: tileCoordinates.x * this.tileWidth,
                y: tileCoordinates.y * this.tileHeight
            };
        }
    }
    Isis.Tilemap = Tilemap;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    class WorldCoordinates {
    }
    Isis.WorldCoordinates = WorldCoordinates;
    ;
})(Isis || (Isis = {}));
//# sourceMappingURL=game.js.map