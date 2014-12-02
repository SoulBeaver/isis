module Isis {
	export class Trigger {
		x: number;
		y: number;
		name: string;
		properties: any;

		constructor(json: { x: number; y: number; name: string; properties: any }) {
			this.x = json.x;
			this.y = json.y;
			this.name = json.name;
			this.properties = json.properties;
		}
	}
} 