module Isis {
	export class Trigger {
		name: string;
		type: string;
		x: number;
		y: number;
		properties: any;

		constructor(json: { name: string; type: string; x: number; y: number; properties?: any }) {
			this.name = json.name;
			this.type = json.type;
			this.x = json.x;
			this.y = json.y;
			this.properties = json.properties;
		}
	}
} 