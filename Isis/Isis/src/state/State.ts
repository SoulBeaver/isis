module Isis {
    /**
     * Enumeration class referring to every State- but not sub-state- found in this game.
     */
    // This is not an enum because TypeScript enums do not support string values.
    export class State {
        static Boot = "Boot";
        static Preloader = "Preloader";
        static MainMenu = "MainMenu";
        static InGame = "InGame";
    }
} 