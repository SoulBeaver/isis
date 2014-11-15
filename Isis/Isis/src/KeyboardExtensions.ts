module Isis {
    export function toKeyCode(keyString: string): number {
        return Phaser.Keyboard[keyString];
    }
} 