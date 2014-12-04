module Isis {
    /**
     * Preloader loads all assets required by every state in the game.
     */ 
	export class Preloader extends Phaser.State {
        preloadBar: Phaser.Sprite;

		preload() {
			this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "preloadBar");
	        this.preloadBar.anchor.setTo(0.5, 0.5);

            this.startAssetLoad();
        }

		private startAssetLoad() {
			this.load.json("settings", "assets/settings.json");
			this.load.json("creature_definitions", "assets/creature_definitions.json");
			this.load.json("item_definitions", "assets/item_definitions.json");
			this.load.json("interactable_definitions", "assets/interactable_definitions.json");
			this.load.json("manifest", "assets/manifest.json").onLoadComplete.add(this.loadManifestEntries, this);
		}

		private loadManifestEntries() {
			// At the moment, we want to load ALL the data. The game is still small and there is no significant load time.
			// In the future, if it becomes too much to load at once, we can split the loading from the manifest into stages.
			// Until then, load everything.
			//
			// PS: Even if the load becomes significant, I'd rather look at optimization strategies such as shrinking tilesets and whatnot first.

			var manifest = this.game.cache.getJSON("manifest");

			var manualLoader = new Phaser.Loader(this.game);
			manualLoader.pack("atlases", "assets/manifest.json");

			for (var key in manifest) {
				manualLoader.pack(key, "assets/manifest.json");

				if (fileExists("assets/tilemaps/maps/" + key + ".json"))
					manualLoader.json(key + ".json", "assets/tilemaps/maps/" + key + ".json");
				else
					console.warn("The file 'assets/tilemaps/maps/" + key + ".json' does not exist!");
			}

			manualLoader.onLoadComplete.add(this.fadeOut, this);
			manualLoader.setPreloadSprite(this.preloadBar);
			manualLoader.start();
		}

        private fadeOut() {
            this.add.tween(this.preloadBar)
                .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true)
                .onComplete.add(this.startTesting, this);
        }

        private startTesting() {
            this.game.state.start(State.Tester, true, false);
        }
    }
}  