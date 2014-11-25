/// <reference path="InGameSubState.ts"/>

module Isis {
    export class EnemyState extends InGameSubState {
        update() {
            this.switchToAnimatingState();
        }

        private switchToAnimatingState() {
            this.onSwitchState.dispatch();
        }
    }
} 