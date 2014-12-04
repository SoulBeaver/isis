﻿module Isis.Tests {
	export class TilemapDefinitionTest extends tsUnit.TestClass {
		json_hasFourLayers() {
			this.areIdentical(this.json.layers.length, 4);
		}

		json_hasThreeTileLayers() {
			this.areIdentical(_.filter(this.json.layers, { type: "tilelayer" }).length, 3);
		}

		json_hasOneObjectLayer() {
			this.areIdentical(_.filter(this.json.layers, { type: "objectgroup" }).length, 1);
		}

		json: TilemapDefinition = {
			"backgroundcolor": "#000000",
			"height": 8,
			"layers": [
				{
					"data": [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
					"height": 8,
					"name": "Collidables",
					"opacity": 1,
					"type": "tilelayer",
					"visible": true,
					"width": 12,
					"x": 0,
					"y": 0
				},
				{
					"data": [395, 391, 1096, 389, 390, 400, 390, 390, 390, 405, 390, 396, 393, 301, 301, 301, 301, 393, 301, 301, 301, 301, 301, 394, 402, 390, 390, 391, 301, 393, 301, 389, 400, 391, 301, 1097, 404, 301, 301, 301, 301, 393, 301, 301, 393, 301, 301, 392, 404, 301, 395, 390, 390, 403, 396, 301, 393, 301, 395, 401, 393, 301, 394, 301, 301, 301, 394, 301, 393, 301, 397, 401, 393, 301, 301, 301, 392, 301, 301, 301, 393, 301, 301, 393, 397, 390, 390, 390, 403, 390, 405, 390, 403, 390, 390, 398],
					"height": 8,
					"name": "Background",
					"opacity": 1,
					"type": "tilelayer",
					"visible": true,
					"width": 12,
					"x": 0,
					"y": 0
				},
				{
					"data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2716, 2716, 2716, 2716, 0, 2716, 2716, 2716, 2716, 2716, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2716, 2716, 2716, 0, 0, 0, 2716, 0, 2716, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2716, 2716, 2716, 0, 0, 0, 0, 0, 0, 0, 0, 2716, 0, 0, 0, 2716, 0, 0, 0, 2716, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					"height": 8,
					"name": "Shadows",
					"opacity": 1,
					"type": "tilelayer",
					"visible": true,
					"width": 12,
					"x": 0,
					"y": 0
				},
				{
					"draworder": "topdown",
					"height": 0,
					"name": "Triggers",
					"objects": [
						{
							"height": 0,
							"name": "warp",
							"properties":
							{
								"map": "volcano",
								"spawnX": "6",
								"spawnY": "6"
							},
							"rotation": 0,
							"type": "object",
							"visible": true,
							"width": 0,
							"x": 60,
							"y": 12
						},
						{
							"height": 0,
							"name": "warp",
							"properties":
							{
								"map": "sewer",
								"spawnX": "6",
								"spawnY": "1"
							},
							"rotation": 0,
							"type": "object",
							"visible": true,
							"width": 0,
							"x": 276,
							"y": 60
						},
						{
							"height": 0,
							"name": "spawn_player",
							"properties":
							{
								"spawnX": "2",
								"spawnY": "1"
							},
							"rotation": 0,
							"type": "",
							"visible": true,
							"width": 0,
							"x": 60,
							"y": 36
						},
						{
							"height": 0,
							"name": "item",
							"properties":
							{
								"effects": "random_diamond"
							},
							"rotation": 0,
							"type": "",
							"visible": true,
							"width": 0,
							"x": 36,
							"y": 156
						},
						{
							"height": 0,
							"name": "item",
							"properties":
							{

							},
							"rotation": 0,
							"type": "red_diamond",
							"visible": true,
							"width": 0,
							"x": 108,
							"y": 60
						},
						{
							"height": 0,
							"name": "item",
							"properties":
							{

							},
							"rotation": 0,
							"type": "blue_diamond",
							"visible": true,
							"width": 0,
							"x": 108,
							"y": 36
						},
						{
							"height": 0,
							"name": "item",
							"properties":
							{

							},
							"rotation": 0,
							"type": "yellow_diamond",
							"visible": true,
							"width": 0,
							"x": 252,
							"y": 36
						},
						{
							"height": 0,
							"name": "creature",
							"properties":
							{

							},
							"rotation": 0,
							"type": "robed_drow",
							"visible": true,
							"width": 0,
							"x": 36,
							"y": 84
						},
						{
							"height": 0,
							"name": "creature",
							"properties":
							{

							},
							"rotation": 0,
							"type": "blue_blob_man",
							"visible": true,
							"width": 0,
							"x": 204,
							"y": 36
						},
						{
							"height": 0,
							"name": "object",
							"properties":
							{
								"destination": "random",
								"effects": "teleport"
							},
							"rotation": 0,
							"type": "blue_star_circle",
							"visible": true,
							"width": 0,
							"x": 156,
							"y": 84
						},
						{
							"height": 0,
							"name": "object",
							"properties":
							{
								"creature": "robed_drow",
								"effects": "summon",
								"spawnX": "10",
								"spawnY": "6"
							},
							"rotation": 0,
							"type": "red_skull_circle",
							"visible": true,
							"width": 0,
							"x": 228,
							"y": 156
						},
						{
							"height": 0,
							"name": "object",
							"properties":
							{
								"destination": "random",
								"effects": "teleport"
							},
							"rotation": 0,
							"type": "blue_star_circle",
							"visible": true,
							"width": 0,
							"x": 156,
							"y": 84
						}
					],
					"opacity": 1,
					"type": "objectgroup",
					"visible": true,
					"width": 0,
					"x": 0,
					"y": 0
				}
			],
			"orientation": "orthogonal",
			"properties":
			{

			},
			"renderorder": "right-down",
			"tileheight": 24,
			"tilesets": [
				{
					"firstgid": 1,
					"image": "..\/..\/..\/..\/..\/..\/..\/..\/Downloads\/oryx_16-bit_fantasy_1.1\/World\/World_Tiles.png",
					"imageheight": 936,
					"imagewidth": 648,
					"margin": 0,
					"name": "world_tiles",
					"properties":
					{

					},
					"spacing": 0,
					"tileheight": 24,
					"tilewidth": 24
				},
				{
					"firstgid": 1054,
					"image": "..\/..\/..\/..\/..\/..\/..\/..\/Downloads\/oryx_16-bit_fantasy_1.1\/World\/World_Objects.png",
					"imageheight": 261,
					"imagewidth": 336,
					"margin": 0,
					"name": "world_objects",
					"properties":
					{

					},
					"spacing": 0,
					"tileheight": 24,
					"tileproperties":
					{
						"42":
						{
							"atlas_name": "closed_steel_gate"
						},
						"43":
						{
							"atlas_name": "opened_steel_gate"
						}
					},
					"tilewidth": 24
				},
				{
					"firstgid": 1194,
					"image": "..\/..\/..\/..\/..\/..\/..\/..\/Downloads\/oryx_16-bit_fantasy_1.1\/oryx_16bit_fantasy_items_trans.png",
					"imageheight": 304,
					"imagewidth": 384,
					"margin": 0,
					"name": "items",
					"properties":
					{

					},
					"spacing": 0,
					"tileheight": 16,
					"tileoffset":
					{
						"x": 4,
						"y": -4
					},
					"tileproperties":
					{
						"83":
						{
							"atlas_name": "green_diamond"
						},
						"84":
						{
							"atlas_name": "blue_diamond"
						},
						"85":
						{
							"atlas_name": "red_diamond"
						},
						"86":
						{
							"atlas_name": "yellow_diamond"
						}
					},
					"tilewidth": 16
				},
				{
					"firstgid": 1650,
					"image": "..\/..\/..\/..\/..\/..\/..\/..\/Downloads\/oryx_16-bit_fantasy_1.1\/oryx_16bit_fantasy_creatures_trans.png",
					"imageheight": 648,
					"imagewidth": 480,
					"margin": 0,
					"name": "creatures",
					"properties":
					{

					},
					"spacing": 0,
					"tileheight": 24,
					"tileoffset":
					{
						"x": 0,
						"y": -4
					},
					"tileproperties":
					{
						"146":
						{
							"atlas_name": "robed_drow"
						},
						"21":
						{
							"atlas_name": "blue_knight"
						},
						"432":
						{
							"atlas_name": "blue_blob_man"
						}
					},
					"tilewidth": 24
				},
				{
					"firstgid": 2190,
					"image": "..\/..\/..\/..\/..\/..\/..\/..\/Downloads\/oryx_16-bit_fantasy_1.1\/World\/World_Dirt_Shadows.png",
					"imageheight": 528,
					"imagewidth": 600,
					"margin": 0,
					"name": "world_dirt_shadows",
					"properties":
					{

					},
					"spacing": 0,
					"tileheight": 24,
					"tilewidth": 24
				}
			],
			"tilewidth": 24,
			"version": 1,
			"width": 12
		};
	}
} 