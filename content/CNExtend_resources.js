// cleaned
var CNExtend_resources = new function() {
	var that = this;
	
	var resources = {
		aluminum: {
			name: "Aluminum",
			type: CNExtend_modifiers.type.Aluminum,
			infraCostDiscount: -0.07
		},
		asphalt: {
			name: "Asphalt",
			type: CNExtend_modifiers.type.Asphalt,
			infraBillDiscount: -0.05
		},
		cattle: {
			name: "Cattle",
			type: CNExtend_modifiers.type.Cattle,
			populationMod: 0.05
		},
		coal: {
			name: "Coal",
			type: CNExtend_modifiers.type.Coal,
			infraCostDiscount: -0.04
		},
		construction: {
			name: "Construction",
			type: CNExtend_modifiers.type.Construction,
			infraCostDiscount: -0.05
		},
		fish: {
			name: "Fish",
			type: CNExtend_modifiers.type.Fish,
			populationMod: 0.08
		},
		iron: {
			name: "Iron",
			type: CNExtend_modifiers.type.Iron,
			infraBillDiscount: -0.1,
			infraCostDiscount: -0.05
		},
		lumber: {
			name: "Lumber",
			type: CNExtend_modifiers.type.Lumber,
			infraBillDiscount: -0.08,
			infraCostDiscount: -0.06
		},
		marble: {
			name: "Marble",
			type: CNExtend_modifiers.type.Marble,
			infraCostDiscount: -0.1
		},
		pigs: {
			name: "Pigs",
			type: CNExtend_modifiers.type.Pigs,
			populationMod: 0.035
		},
		rubber: {
			name: "Rubber",
			type: CNExtend_modifiers.type.Rubber,
			infraCostDiscount: -0.03
		},
		steel: {
			name: "Steel",
			type: CNExtend_modifiers.type.Steel,
			infraCostDiscount: -0.02
		},
		sugar: {
			name: "Sugar",
			type: CNExtend_modifiers.type.Sugar,
			populationMod: 0.03
		},
		uranium: {
			name: "Uranium",
			type: CNExtend_modifiers.type.Uranium,
			infraBillDiscount: -0.03
		},
		wheat: {
			name: "Wheat",
			type: CNExtend_modifiers.type.Wheat,
			populationMod: 0.08
		}
	};
	
	for (k in resources) { CNExtend_modifiers.registerModifier(resources[k]); }
};