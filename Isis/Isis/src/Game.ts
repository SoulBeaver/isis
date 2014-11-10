module Isis {
  export class Game extends Phaser.Game {
      constructor() {
          super(640, 480, Phaser.AUTO, "content", null);

          this.state.add("Boot", Boot, false);
          this.state.add("Preloader", Preloader, false);
          this.state.add("MainMenu", MainMenu, false);
          this.state.add("InGame", InGame, false);

          this.state.start("Boot");
      }
  }
}