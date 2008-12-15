
var CNExtend_resources = new function () {
	var that = this;

	new function aluminum()
	{
		this.name = "Aluminum";
		this.type = CNExtend_modifiers.type.Aluminum;
		this.infraCostDiscount = -0.07;
		CNExtend_modifiers.registerModifier(this);		
	};

	new function asphalt()
	{
		this.name = "Asphalt";
		this.type = CNExtend_modifiers.type.Asphalt;
		this.infraBillDiscount = -0.05;
		CNExtend_modifiers.registerModifier(this);
	};
	
	new function cattle()
	{
		this.name = "Cattle";
		this.type = CNExtend_modifiers.type.Cattle;
		this.populationMod = 0.05;
		CNExtend_modifiers.registerModifier(this);
	};
	
	new function coal()
	{
		this.name = "Coal";
		this.type = CNExtend_modifiers.type.Coal;
		this.infraCostDiscount = -0.04;
		CNExtend_modifiers.registerModifier(this);
	};

	new function construction()
	{
		this.name = "Construction";
		this.type = CNExtend_modifiers.type.Construction;
		this.infraCostDiscount = -0.05;
		CNExtend_modifiers.registerModifier(this);		
	};
	
	new function fish()
	{
		this.name = "Fish";
		this.type = CNExtend_modifiers.type.Fish;
		this.populationMod = 0.08;
		CNExtend_modifiers.registerModifier(this);
	};
	
	new function iron()
	{
		this.name = "Iron";
		this.type = CNExtend_modifiers.type.Iron;
		this.infraBillDiscount = -0.1;
		this.infraCostDiscount = -0.05;
		CNExtend_modifiers.registerModifier(this);
	};
	
	new function lumber()
	{
		this.name = "Lumber";
		this.type = CNExtend_modifiers.type.Lumber;
		this.infraBillDiscount = -0.08;
		this.infraCostDiscount = -0.06;
		CNExtend_modifiers.registerModifier(this);
	};

	new function marble()
	{
		this.name = "Marble";
		this.type = CNExtend_modifiers.type.Marble;
		this.infraCostDiscount = -0.1;
		CNExtend_modifiers.registerModifier(this);
	};

	new function pigs()
	{
		this.name = "Pigs";
		this.type = CNExtend_modifiers.type.Pigs;
		this.populationMod = 0.035;
		CNExtend_modifiers.registerModifier(this);
	};

	new function rubber()
	{
		this.name = "Rubber";
		this.type = CNExtend_modifiers.type.Rubber;
		this.infraCostDiscount = -0.03;
		CNExtend_modifiers.registerModifier(this);
	};

	new function steel()
	{
		this.name = "Steel";
		this.type = CNExtend_modifiers.type.Steel;
		this.infraCostDiscount = -0.02;
		CNExtend_modifiers.registerModifier(this);
	};
	
	new function sugar()
	{
		this.name = "Sugar";
		this.type = CNExtend_modifiers.type.Sugar;
		this.populationMod = 0.03;
		CNExtend_modifiers.registerModifier(this);
	};
	
	new function uranium()
	{
		this.name = "Uranium";
		this.type = CNExtend_modifiers.type.Uranium;
		this.infraBillDiscount = -0.03;
		CNExtend_modifiers.registerModifier(this);
	};
	
	new function wheat()
	{
		this.name = "Wheat";
		this.type = CNExtend_modifiers.type.Wheat;
		this.populationMod = 0.08;
		CNExtend_modifiers.registerModifier(this);
	}
}