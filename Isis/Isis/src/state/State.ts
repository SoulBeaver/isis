module Isis {
    /*
     * The original implementation used an Enum, which seems to be the correct solution:
     *
     * export enum State { Boot, Preloader, MainMenu, ... }
     *
     * However, you can't get a string representation of the enum doing
     * 
     *     State.Boot.toString(); // Returns 0
     *
     * Instead, you use the index to get the valid representation.
     *
     *     State[State.Boot].toString(); // Returns "Boot"
     *     or
     *     State[0].toString();
     *
     * And that's just too silly and nonsensical. So we're using a static class.
     */
    export class State {
        static Boot = "Boot";
        static Preloader = "Preloader";
        static MainMenu = "MainMenu";
        static PlayerState = "PlayerState";
        static EnemyState = "EnemyState";
        static AnimatingState = "AnimatingState";
    }
} 