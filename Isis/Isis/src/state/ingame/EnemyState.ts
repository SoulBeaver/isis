/// <reference path="InGameSubState.ts"/>

module Isis {
    export class EnemyState extends InGameSubState {
        update() {
            _.forEach(this.map.creatures, (creature) => {
                const moveLeft = this.map.toTileCoordinates({ x: creature.x - 24, y: creature.y });
                const moveRight = this.map.toTileCoordinates({ x: creature.x + 24, y: creature.y });
                const moveUp = this.map.toTileCoordinates({ x: creature.x, y: creature.y - 24 });
                const moveDown = this.map.toTileCoordinates({ x: creature.x, y: creature.y + 24 });

                const moveActions = [moveLeft, moveRight, moveUp, moveDown];
                const rand = Math.random();
                const index = Math.floor(rand * moveActions.length);
                const moveAction = moveActions[index];
                
                if (!this.map.wallAt(moveAction) && !this.map.creatureAt(moveAction) && this.map.toTileCoordinates(this.player) != moveAction)
                    this.view.move(creature, this.map.toWorldCoordinates(moveAction));
            });

            this.switchToAnimatingState();
        }
        
        private switchToAnimatingState() {
            this.onSwitchState.dispatch();
        }
    }
} 