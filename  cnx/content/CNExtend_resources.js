// cleaned
var CNExtend_resources = new function() {
	var that = this;
	
	var resources = {
		Aluminum: {
			infraCostDiscount: -0.07
		},
		Asphalt: {
			infraBillDiscount: -0.05
		},
		Cattle: {
			populationMod: 0.05
		},
		Coal: {
			infraCostDiscount: -0.04,
			landMod: 0.15
		},
		Construction: {
			infraCostDiscount: -0.05
		},
		Fish: {
			populationMod: 0.08
		},
		Iron: {
			infraBillDiscount: -0.1,
			infraCostDiscount: -0.05
		},
		Lumber: {
			infraBillDiscount: -0.08,
			infraCostDiscount: -0.06
		},
		Marble: {
			infraCostDiscount: -0.1
		},
		Pigs: {
			populationMod: 0.035
		},
		Rubber: {
			infraCostDiscount: -0.03,
			landMod: 0.2
		},
		Spices: {
			landMod: 0.08
		},
		Steel: {
			infraCostDiscount: -0.02
		},
		Sugar: {
			populationMod: 0.03
		},
		Uranium: {
			infraBillDiscount: -0.03
		},
		Wheat: {
			populationMod: 0.08
		}
	};
	
	for (k in resources) {
		resources[k].name = k; // since all the names are one word
		resources[k].type = CNExtend_modifiers.type[k]; // since all the names currently = the types
		CNExtend_modifiers.registerModifier(resources[k]);
	}
};