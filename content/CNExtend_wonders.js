
var CNExtend_wonders = new function () {
	var that = this;								
		
	//WONDERS
	
	new function agricultureDevelopment()
	{
		this.name = "Agriculture Development Program";
		this.type = CNExtend_modifiers.type.AgricultureDevelopment;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = function(tipToDecorate, playerData, improvementChange)
		{
			this.landDecoration(tipToDecorate, playerData, improvementChange);
		}
		
		this.modifierEffects = function(tempData, countChange)
		{
			CNExtend_modifiers.cashPrediction(tempData, 2, countChange)
			CNExtend_modifiers.landPrediction(tempData, 0.15, countChange, this.getCount(tempData.modifiers))
			
			tempData.workingCitizens += tempData.land * CNExtend_modifiers.calculateModifier("populationMod", tempData) * 0.3 * countChange;
		}
		
	};
	
	new function disasterRelief()
	{
		this.name = "Disaster Relief Agency";
		this.type = CNExtend_modifiers.type.DisasterRelief;
		this.populationMod = 0.03;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.populationDecoration;
		this.modifierEffects = CNExtend_modifiers.populationEffect(this.populationMod);		
	};
	
	new function greatMonument()
	{
		this.name = "Great Monument";
		this.type = CNExtend_modifiers.type.GreatMonument;
		CNExtend_modifiers.registerModifier(this);
				
		this.addDecorationText = function(tipToDecorate, playerData, improvementChange)
		{
			this.incomeDecoration(tipToDecorate, playerData, improvementChange);
			
			var predictedData = this.predictedEffect(playerData, improvementChange);
			
			tipToDecorate.addTextItem("Change If Citizens Are Unhappy With Gov:").text(Math.round((CNExtend_data.incomeDifference(predictedData, playerData) * 5) / 4), true);
		}

		this.modifierEffects = CNExtend_modifiers.happinessEffect(4);
	};
	
	new function greatTemple()
	{
		this.name = "Great Temple";
		this.type = CNExtend_modifiers.type.GreatTemple;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = function(tipToDecorate, playerData, improvementChange)
		{
			this.incomeDecoration(tipToDecorate, playerData, improvementChange);

			var predictedData = this.predictedEffect(playerData, improvementChange);

			tipToDecorate.addTextItem("Change If Citizens Are Unhappy With Religion").text(Math.round((CNExtend_data.incomeDifference(predictedData, playerData) * 5) / 4), true);
		}
		this.modifierEffects = CNExtend_modifiers.happinessEffect(5);
	};
	
	new function greatUniversity()
	{
		this.name = "Great University";
		this.type = CNExtend_modifiers.type.GreatUniversity;
		CNExtend_modifiers.registerModifier(this);

		this.addDecorationText = this.incomeDecoration;
		this.modifierEffects = function(tempData, countChange)
		{
			var techEffect = tempData.technology;
			techEffect -= 200;
			if (techEffect < 0) techEffect = 0;
			if (techEffect > 2800) techEffect = 2800;
			
			var happiness = (techEffect * 0.002);
			CNExtend_modifiers.happinessPrediction(tempData, happiness, countChange);
		}
	};
	
	new function internet()
	{
		this.name = "Internet";
		this.type = CNExtend_modifiers.type.Internet;
		CNExtend_modifiers.registerModifier(this);
		
		this.modifierEffects = CNExtend_modifiers.happinessEffect(5);		
		this.addDecorationText = this.incomeDecoration;
	};

	new function interstateSystem()
	{
		this.name = "Interstate System";
		this.type = CNExtend_modifiers.type.InterstateSystem;
		this.infraBillDiscount = -0.08;
		this.infraCostDiscount = -0.08;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = function(tipToDecorate, playerData, modifierChange)
		{
			this.infraCostDecoration(tipToDecorate, playerData, modifierChange);
			
			var CNData = CNExtend_data;
			var predictedData = this.predictedEffect(playerData, modifierChange);
			var bills = Math.round(CNData.discountedInfraBills(playerData) - CNData.discountedInfraBills(predictedData));
			tipToDecorate.addTextItem("Bill Change Effect on Daily Income").text(bills, true);
		}
	};
	
	new function miningIndustryConsortium()
	{
		this.name = "Mining Industry Consortium";
		this.type = CNExtend_modifiers.type.MiningIndustry;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.incomeDecoration;
		this.modifierEffects = function(tempData, countChange)
		{
			var types = CNExtend_modifiers.type;
			var resourcesFound = 0;
			[types.Coal, types.Lead, types.Oil, types.Uranium].map(function(item)
			{
				if (tempData.modifiers[item] > 0)
				{
					++resourcesFound;
				}
			})
			CNExtend_modifiers.cashPrediction(tempData, resourcesFound * 2, countChange)
		}
	};
	
	new function movieIndustry()
	{
		this.name = "Movie Industry";
		this.type = CNExtend_modifiers.type.MovieIndustry;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.incomeDecoration;
		this.modifierEffects = CNExtend_modifiers.happinessEffect(3);
	};
	
	new function nationalResearchLab()
	{
		this.name ="National Research Lab";
		this.type = CNExtend_modifiers.type.ResearchLab;
		this.populationMod = 0.05;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.populationDecoration;		
		this.modifierEffects = CNExtend_modifiers.populationEffect(this.populationMod);
	};
/*	
	new function nationalEnvironmentOffice()
	{
		this.name = "National Environment Office";
		this.type = CNExtend_modifiers.type.NationalEnvironment;
		this.populationMod = 0.03;
		this.infraBillDiscount = -0.03;

		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.enviroDecoration;
		this.modifierEffects = function(tempData, countChange)
		{
			var CNData = CNExtend_data;
			var predictedData = this.predictedEffect(playerData, modifierChange);
			var bills = Math.round(CNData.discountedInfraBills(playerData) - CNData.discountedInfraBills(predictedData));
			tipToDecorate.addTextItem("Bill Change Effect on Daily Income").text(bills, true);
		}
	}
*/	
	new function spaceProgram()
	{
		this.name = "Space Program";
		this.type = CNExtend_modifiers.type.SpaceProgram;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.incomeDecoration;
		this.modifierEffects = CNExtend_modifiers.happinessEffect(3);
	};

	new function socialSecuritySystem()
	{
		this.name = "Social Security System";
		this.type = CNExtend_modifiers.type.SocialSecurity;
		CNExtend_modifiers.registerModifier(this);

		this.addDecorationText = function(tipToDecorate, playerData, improvementChange)
		{	
			this.incomeDecoration(tipToDecorate, playerData, improvementChange);
			
			if (improvementChange == 1)
			{
				tipToDecorate.addTextItem("").text("This assumes that your current tax rate is 28%, and " + 
			"it is changed to 30% after purchasing this wonder.", false);
			}
			else if (improvementChange == -1)
			{
				tipToDecorate.addTextItem("").text("This assumes that your current tax rate is 30%, and " + 
			"it is changed to 28% after deleting this wonder.", false);
			}

		}
		
		this.modifierEffects = function(tempData, countChange)
		{
			if (countChange == 1)
			{
				tempData.averageCitizenTax *= (0.30 / 0.28);
			}
			else if (countChange == -1)
			{
				tempData.averageCitizenTax *= (0.28 / 0.30);
			}
		}		
	};

	new function stockMarket()
	{
		this.name = "Stock Market";
		this.type = CNExtend_modifiers.type.StockMarket;
		CNExtend_modifiers.registerModifier(this);

		this.addDecorationText = this.incomeDecoration;
		this.modifierEffects = CNExtend_modifiers.cashEffect(10);
	};
	
	new function universalHealthCare()
	{
		this.name = "Universal Health Care";
		this.type = CNExtend_modifiers.type.UniversalHealthCare;
		this.populationMod = 0.03;
		CNExtend_modifiers.registerModifier(this);
		
		this.modifierEffects = function(tempData, countChange)
		{
			CNExtend_modifiers.populationPrediction(tempData, this.populationMod, countChange, this.getCount(tempData.modifiers));
			CNExtend_modifiers.happinessPrediction(tempData, 2, countChange)
		}
		this.addDecorationText = this.populationDecoration;
	};

	new function warMemorial()
	{
		this.name = "War Memorial";
		this.type = CNExtend_modifiers.type.WarMemorial;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.incomeDecoration;
		this.modifierEffects = CNExtend_modifiers.happinessEffect(4);
	};
	
	new function weaponsResearchComplex()
	{
		this.name = "Weapons Research Complex";
		this.type = CNExtend_modifiers.type.WeaponsResearch;
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.enviroDecoration;
		this.modifierEffects = CNExtend_modifiers.enviroEffect(1);
	}

	/**
	 * Gets the current improvements table from a page.
	 * 
	 * @param {Object} page	The HTML page to retrieve the current improvements table from.
	 */
	this.getCurrentWondersTable = function(page)
	{
		return Ext.query("table#table4 > tbody", page)[0];
	}

	this.applyTipsToPage = function(page)
	{
		if (!page)
		{
			return false;
		}
		
		CNExtend_tips.applyTipsToDeleteButtons(page);
		CNExtend_tips.applyTipsToRadioButtons(page);
		
		return true;
	}
	
}