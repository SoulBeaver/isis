module Isis {
	export class Tester extends Phaser.State {
		create() {
			Isis.Tests.TestHarness.game = this.game;

			var test = new tsUnit.Test(Isis.Tests);
			test.showResults(document.getElementById("results"), test.run());

			// Explicitly avoiding the main menu until we actually need to work on it.
			this.game.state.start(State.InGame);
		}
	}
} 