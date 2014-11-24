module Isis {
  export class Game extends Phaser.Game {
      constructor() {
          super(640, 480, Phaser.AUTO, "content", null);

          this.state.add(State.Boot, Boot, false);
          this.state.add(State.Preloader, Preloader, false);
          this.state.add(State.MainMenu, MainMenu, false);
          this.state.add(State.PlayerState, PlayerState, false);
          this.state.add(State.EnemyState, EnemyState, false);
          this.state.add(State.AnimatingState, AnimatingState, false);

          this.state.start(State.Boot);
      }
  }
}