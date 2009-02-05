var CNExtend_modifiers = new function() {
	this.modifierRegistry = {};
	var that = this;
	that.modifierRegistry.count = 0;
	
	this.type = {
		Unknown: 0, 
		Bank: 10, 
		Barrack: 11, 
		BorderWall: 12,
		Church: 13,
		Clinic: 14,
		Factory: 15,
		ForeignMinistry: 16,
		GuerrillaCamp: 17,
		Harbor: 18,
		Hospital: 19,
		IntelligenceAgency: 20,
		LaborCamp: 21,
		MissileDefense: 22,
		PoliceHeadquarters: 23,
		Satellite: 24,
		School: 25,
		Stadium: 26,
		University: 27,
		Shipyard: 28,
		Drydock: 29,
		NavalAcademy: 30,
		NavalConstructionYard: 31,
		AirDefense : 100, 
		CentralIntelligence : 101, 
		DisasterRelief: 102,
		FederalAid: 103,
		AirForceBase: 104,
		GreatMonument: 105,
		GreatTemple: 106,
		GreatUniversity: 107,
		NuclearSilo: 108,
		Internet: 109,
		InterstateSystem: 110,
		ManhattanProject: 111,
		MovieIndustry: 112,
		ResearchLab: 113,
		WarMemorial: 114,
		Pentagon: 115,
		SocialSecurity: 116,
		SpaceProgram: 117,
		StockMarket: 118,
		SDI: 119,
		AgricultureDevelopment: 120,
		WeaponsResearch: 121,
		UniversalHealthCare: 122,
		NuclearPowerPlant: 123,
		MiningIndustry: 124,
		NationalEnvironment: 125,
		Aluminum: 210,
		Cattle: 211,
		Coal: 212, 
		Fish: 213,
		Furs: 214,
		Gems: 215,
		Gold: 216,
		Iron: 217,
		Lead: 218,
		Lumber: 219,
		Marble: 220,
		Oil: 221,
		Pigs: 222,
		Rubber: 223,
		Silver: 224,
		Spices: 225,
		Sugar: 226,
		Uranium: 227,
		Water: 228,
		Wheat: 229,
		Wine: 230,
		AffluentPopulation: 300,
		Asphalt: 301,
		Automobiles: 302,
		Beer: 303,
		Construction: 304,
		FastFood: 305,
		FineJewelry: 306,
		Microchips: 307,
		RadiationCleanup: 308,
		Scholars: 309,
		Steel: 310
	};
	
	var modifierStrings = {};

	populateModifierStringsHash();

	this.firstImprovement = 10;
	this.lastImprovement = 31;
	
	/**
	 * Given the name of an improvement, it pulls an object from the registry or null if the improvement isn't registered.
	 */
	this.objectFromImprovementName = function(improvToGet) {
		return that.modifierRegistry[that.enumFromModifierName(improvToGet)];		
	};
	
	/**
	 * Returns the enumeration that corresponds with a given improvement string, otherwise returns 0 (Unknown)
	 */
	this.enumFromModifierName = function(modifierName) {
		modifierName = modifierName.toUpperCase();
		if (!modifierName || !modifierStrings[modifierName]) {
			return that.type.Unknown;
		}

		return modifierStrings[modifierName];
	};
	
	this.isImprovement = function(improvementEnum) {
		return (improvementEnum >= that.firstImprovement && improvementEnum <= that.lastImprovement)
	};

	this.happinessEffect = function(modifier) {
		return function(tempData, countChange) {
			CNExtend_modifiers.happinessPrediction(tempData, modifier, countChange);
		}
	};

	this.populationEffect = function(modifier) {
		return function(tempData, countChange) {
			CNExtend_modifiers.populationPrediction(tempData, modifier, countChange, this.getCount(tempData.modifiers));
		}
	};
	
	this.enviroEffect = function(modifier) {
		return function(tempData, countChange) {
			CNExtend_modifiers.environmentPrediction(tempData, modifier, countChange);
		}
	};
	
	this.cashEffect = function(modifier) {
		return function(tempData, countChange) {
			CNExtend_modifiers.cashPrediction(tempData, modifier, countChange)
		}
	};
	
	this.incomeEffect = function(modifier) {
		return function (tempData, countChange) {
			CNExtend_modifiers.incomePrediction(tempData, modifier, countChange, this.getCount(tempData.modifiers));
		}
	};

	function soldierImpact(playerData) {
		return playerData.numberOfSoldiers * 0.01 * (playerData.environment - 1);
	}

	this.populationPrediction = function(tempData, modifier, modifierChange, modifierCount) {		
		var citizenChange = soldierImpact(tempData);
		
		tempData.workingCitizens = applyModifier(tempData.workingCitizens + citizenChange, modifier, modifierChange, modifierCount) - citizenChange;
		//There's a tiny, minor change in income when you change population this attempts to account for it
		tempData.averageCitizenTax -= modifier * 3.5 * that.calculateModifier("incomeMod", tempData) * modifierChange;
	};

	this.happinessPrediction = function(tempData, modifier, modifierChange) {
		var happinessChange =  modifierChange * modifier * (1 - ((tempData.environment - 1) / 100).toFixed(2));
		var happinessIncomeImpact = 2 * that.calculateModifier("incomeMod", tempData);
		tempData.averageCitizenTax += (happinessIncomeImpact * (happinessChange));
		tempData.happiness += happinessChange;
	};
	
	// For instance, + 10$ instead of +5 happiness
	this.cashPrediction = function(tempData, modifier, modifierChange) {
		tempData.averageCitizenTax += modifierChange * modifier * that.calculateModifier("incomeMod", tempData);
	}
	
	this.landPrediction = function(tempData, modifier, modifierChange, modifierCount) {
		var originalLand = tempData.land;
		tempData.land = applyModifier(tempData.land, modifier, modifierChange, modifierCount);
		tempData.workingCitizens += populationFromLand(tempData.land - originalLand, tempData);
	};
	
	function populationFromLand(landAmount, playerData) {
		var multiplier = 0.2;
		if (playerData.modifiers[CNExtend_modifiers.type.AgricultureDevelopment] > 0) {
			multiplier = 0.5;
		}
		return landAmount * multiplier * that.calculateModifier("populationMod", playerData);
	};
	
	this.incomePrediction = function(tempData, modifier, modifierChange, modifierCount) {		
		tempData.averageCitizenTax = applyModifier(tempData.averageCitizenTax, modifier, modifierChange, modifierCount);
	};
	
	this.environmentPrediction = function(tempData, modifier, improvementChange) {
		modifier = -modifier;
		var bestPossibleEnviro = (1 + tempData.globalRadiation).toFixed(2); //global radiation is already halved for radiation cleanup folks
																			//so you don't have to do anything further to account for it.
		var enviroIncomeChange = modifier * improvementChange;
		var originalEnv = tempData.environment; //for example, 1.88
		var newEnv = (tempData.environment - enviroIncomeChange).toFixed(2);
		if (parseFloat(newEnv) < parseFloat(bestPossibleEnviro)) { // then we stop at the best possible environment.
			newEnv = bestPossibleEnviro;
			enviroIncomeChange = originalEnv - bestPossibleEnviro;
		}
		
		var environmentModifierRatio =  (1 - (newEnv * 0.01)) / (1 - (originalEnv * 0.01));
		var happinessChange = tempData.happiness * environmentModifierRatio - tempData.happiness;

		var predictedIncomeEffect = happinessChange *  2 * that.calculateModifier("incomeMod", tempData);

		var citizenChange = soldierImpact(tempData);
		tempData.environment = newEnv;
		var newCitizenChange = soldierImpact(tempData);
		
		// This gives us our predicted effect from environment's direct impact to population
		var predictedPopulationEffect = applyModifier(tempData.workingCitizens + citizenChange , -0.01, -enviroIncomeChange, originalEnv - 1)
														- (tempData.workingCitizens + citizenChange);
		// This gives us our predicted effect from the environmental impact from soldiers
		var predictedSoldierEffect = citizenChange - newCitizenChange;
		predictedPopulationEffect += predictedSoldierEffect;
		
		if (parseFloat(originalEnv) == parseFloat(bestPossibleEnviro) && parseFloat(enviroIncomeChange) < 0) { //then we can't predict the real new effect
			tempData.unpredictable = true;
			tempData.environmentIncomeEffect = predictedIncomeEffect; //we save this so we can see what we'd be like without the effect
			tempData.environmentPopulationEffect = predictedPopulationEffect; //we save this also, since enviro has an impact on population
		}
		tempData.averageCitizenTax += predictedIncomeEffect;
		tempData.workingCitizens += predictedPopulationEffect;
		tempData.happiness += happinessChange;
	}

	this.registerModifier = function(improvementObject) {
		/* Error handling and such */
		if (that.modifierRegistry[improvementObject.type]) {
			throw new CNExtend_exception.Base("Improvement registered twice!");
		}
		
		improvementObject.getCount = function(countHash) {
			if (!countHash) {
				throw new CNExtend_exception.IllegalArgument("We were passed a null count hash list");
			}
			var count = countHash[this.type];			
			if (!count) {
				return 0;				
			}
			return count;
		};
		/* /Error handling */
		
		improvementObject.predictedEffect = function(playerData, improvementChange) {
			var tempData = CNExtend_util.shallowCopyObject(playerData);
				
			if (improvementObject.modifierEffects) {
				improvementObject.modifierEffects(tempData, improvementChange);
			}

			tempData.modifiers[improvementObject.type] += improvementChange;
			return tempData;
		};
		
		improvementObject.infraCostDecoration = function(tipToDecorate, playerData, improvementChange) {
			var predictedData = this.predictedEffect(playerData, improvementChange);
			
			var CNData = CNExtend_data;
			var discount = Math.round(CNData.discountedPurchaseCost(playerData) - CNData.discountedPurchaseCost(predictedData));
			tipToDecorate.addTextItem("Total discount on the next 10 infrastructure:").text(discount * 10, true);
		};
		
		improvementObject.incomeDecoration = function(tipToDecorate, playerData, improvementChange) {
			var predictedData = this.predictedEffect(playerData, improvementChange);
	
			tipToDecorate.addTextItem("Daily Collection Change").text(CNExtend_data.incomeDifference(predictedData, playerData), true);
		};
		
		improvementObject.populationDecoration = function(tipToDecorate, playerData, improvementChange) {
			var predictedData = this.predictedEffect(playerData, improvementChange);
			
			tipToDecorate.addTextItem("Population Change").text(CNExtend_data.populationDifference(predictedData, playerData), true);
			tipToDecorate.addTextItem("Daily Collection Change").text(CNExtend_data.incomeDifference(predictedData, playerData), true);
		};
		
		improvementObject.enviroDecoration = function(tipToDecorate, playerData, improvementChange) {
			var predictedData = this.predictedEffect(playerData, improvementChange);

			var predictedIncomeChange = CNExtend_data.incomeDifference(predictedData, playerData);
			var predictedPopulationChange = CNExtend_data.populationDifference(predictedData, playerData)
			
			if (predictedData.environmentIncomeEffect) { //then there are two possible predicted values for income
				var bestCasePopulationChange = Math.round((predictedData.workingCitizens - predictedData.environmentPopulationEffect) - playerData.workingCitizens);
				
				var bestCaseIncomeChange = Math.round(((predictedData.averageCitizenTax - predictedData.environmentIncomeEffect)
				* (predictedData.workingCitizens - predictedData.environmentPopulationEffect))
				- (playerData.averageCitizenTax * playerData.workingCitizens));
										
				tipToDecorate.addTextItem("Range of Possible Population Changes")
					.text(bestCasePopulationChange.toString(), true)
					.text(" <-> ")
					.text(predictedPopulationChange.toString(), true);
				
				tipToDecorate.addTextItem("Range of Possible Collection Changes")
					.text(bestCaseIncomeChange.toString(), true)
					.text(" <-> ")
					.text(predictedIncomeChange.toString(), true);
			} else {
				tipToDecorate.addTextItem("Population Change").text(predictedPopulationChange, true);

				tipToDecorate.addTextItem("Daily Collection Change").text(predictedIncomeChange, true);
			}
		};

		
		improvementObject.landDecoration = function(tipToDecorate, playerData, improvementChange) {
			var predictedData = this.predictedEffect(playerData, improvementChange);
			
			tipToDecorate.addTextItem("Land Change").text(
				CNExtend_data.landDifference(predictedData, playerData), true);
			tipToDecorate.addTextItem("Population Change").text(
				CNExtend_data.populationDifference(predictedData, playerData), true);
			tipToDecorate.addTextItem("Daily Collection Change").text(
				CNExtend_data.incomeDifference(predictedData, playerData), true);
		};
		
		that.modifierRegistry[improvementObject.type] = improvementObject;
		that.modifierRegistry.count++;
	};
	
	/**
	 * Extrapolates data based on current data and possible changes to the improvement page.  Basically, it compares
	 * the number of improvements in currentData with improvementPage data, and applies a transformation to currentdata 
	 * for each difference.
	 * 
	 * @param {Object} currentData
	 * @param {Object} page
	 */
	this.extrapolatedPlayerDataFromCurrentData = function(currentData, improvementPageData)
	{
		if (!currentData || !improvementPageData)
		{
			return null;
		}
		
		var playerData = CNExtend_util.shallowCopyObject(currentData);

		for(var improvEnum = that.firstImprovement; improvEnum <=that.lastImprovement; improvEnum++)
		{
			var change = (improvementPageData.improvements[improvEnum]- playerData.modifiers[improvEnum])
			if (change != 0 && !isNaN(change))
			{
				var transformingImprovement = that.modifierRegistry[improvEnum];
				if (transformingImprovement)
				{
					playerData = transformingImprovement.predictedEffect(playerData, change);
				}
			}
		}
		playerData.workingCitizens = improvementPageData.workingCitizens;
		return playerData;
	}
	
	this.calculateModifier = function(modifierName, playerData)
	{
		if (!playerData)
			return 0;
			
		var calculatedModifier = 1;

		if (that.modifierRegistry.count == 0) {
			throw "We couldnt' find any modifiers (improvements etc)!"
		}
		
		for (improvementName in that.type)
		{
			var typeNumber = that.type[improvementName];
			var modifierObject = that.modifierRegistry[typeNumber];

			if (modifierObject && modifierObject[modifierName])
			{
				calculatedModifier *= 1 + modifierObject.getCount(playerData.modifiers) * modifierObject[modifierName];
			}
		}

		if (modifierName == "incomeMod") //this is a bit of a hack
		{
			calculatedModifier *= (playerData.taxRate / 100);
		}
		
		return calculatedModifier;
	}
	
	/*
	 * Applies a modifier to a number
	 * 
	 */
	function applyModifier(currentNumber, modifier, modifierChange, modifierCount)
	{
		var ratio = ((1 + (modifier * (modifierCount + modifierChange))) / 
		(1 + (modifier * modifierCount)))
		
		return currentNumber * ratio;
	}

	this.getInitializedModifierHash = function()
	{
		var modifierHash = new Object();

		//Initialize improvementHash with zero values
		for (var i in that.type)
		{
			modifierHash[that.type[i]] = 0;
		}
		
		return modifierHash;
	}

	function populateModifierStringsHash()
	{
		var it = that.type;
		add("BANK", it.Bank);
		add("BANKS", it.Bank);
		add("BARRACK", it.Barrack);
		add("BARRACKS", it.Barrack);
		add("BORDER WALL", it.BorderWall);
		add("BORDERWALL", it.BorderWall);
		add("BORDER WALLS", it.BorderWall);
		add("CHURCH", it.Church);
		add("CHURCHES", it.Church);
		add("CLINIC", it.Clinic);
		add("CLINICS", it.Clinic);
		add("DRYDOCK", it.Drydock);
		add("DRYDOCKS", it.Drydock)
		add("FACTORY", it.Factory);
		add("FACTORIES", it.Factory);
		add("FOREIGN MINISTRY", it.ForeignMinistry);
		add("FOREIGNMINISTRY", it.ForeignMinistry);
		add("FOREIGN MINISTRIES", it.ForeignMinistry);
		add("GUERILLA CAMP", it.GuerrillaCamp);
		add("GUERILLACAMP", it.GuerrillaCamp);
		add("GUERRILLA CAMP", it.GuerrillaCamp);
		add("GUERRILLA CAMPS", it.GuerrillaCamp);
		add("GUERILLA CAMPS", it.GuerrillaCamp);	
		add("HARBOR", it.Harbor);
		add("HARBORS", it.Harbor);
		add("HOSPITAL", it.Hospital);
		add("HOSPITALS", it.Hospital);
		add("INTELLIGENCE AGENCY", it.IntelligenceAgency);
		add("INTELLIGENCEAGENCY", it.IntelligenceAgency);
		add("INTELLIGENCE AGENCIES", it.IntelligenceAgency);
		add("LABOR CAMP", it.LaborCamp);
		add("LABOR CAMPS", it.LaborCamp);
		add("MINING INDUSTRY", it.MiningIndustry);
		add("MISSILE DEFENSES", it.MissileDefense);
		add("MISSILE DEFENSE", it.MissileDefense);
		add("MISSILEDEFENSE", it.MissileDefense);
		add("NAVAL_ACADEMY", it.NavalAcademy);
		add("NAVAL ACADEMY", it.NavalAcademy);
		add("NAVAL ACADEMIES", it.NavalAcademy);
		add("NAVAL CONSTRUCTION YARDS", it.NavalConstructionYard);
		add("NAVAL_CONSTRUCTION", it.NavalConstructionYard);
		add("NUCLEAR POWER PLANT", it.NuclearPowerPlant)
		add("POLICE HEADQUARTERS", it.PoliceHeadquarters);
		add("POLICEHEADQUARTERS", it.PoliceHeadquarters);
		add("SATELLITE", it.Satellite);
		add("SATELLITES", it.Satellite);
		add("SCHOOL", it.School);
		add("SCHOOLS", it.School);
		add("SHIPYARD", it.Shipyard);
		add("SHIPYARDS", it.Shipyard);		
		add("STADIUM", it.Stadium);
		add("STADIUMS", it.Stadium);
		add("UNIVERSITY", it.University);
		add("UNIVERSITIES", it.University);
		add("AAA", it.AirDefense);
		add("CIA", it.CentralIntelligence);
		add("DISASTER_RELIEF", it.DisasterRelief);
		add("DISASTER RELIEF AGENCY", it.DisasterRelief);
		add("AID", it.FederalAid);
		add("AFB", it.AirForceBase);
		add("AGRICULTURE DEVELOPMENT PROGRAM", it.AgricultureDevelopment);
		add("FOREIGN AIRFORCE BASE", it.AirForceBase);
		add("GREAT_MONUMENT", it.GreatMonument);
		add("GREAT MONUMENT", it.GreatMonument);
		add("GREAT_TEMPLE", it.GreatTemple);
		add("GREAT TEMPLE", it.GreatTemple);
		add("GREAT_UNIVERSITY", it.GreatUniversity);
		add("GREAT UNIVERSITY", it.GreatUniversity);
		add("SILO", it.NuclearSilo);
		add("INTERNET", it.Internet);
		add("INTERSTATE_SYSTEM", it.InterstateSystem);
		add("INTERSTATE SYSTEM", it.InterstateSystem);
		add("MANHATTAN PROJECT", it.ManhattanProject);
		add("MINING INDUSTRY CONSORTIUM", it.MiningIndustry);
		add("MOVIE_INDUSTRY", it.MovieIndustry);
		add("MOVIE INDUSTRY", it.MovieIndustry);
		add("NATIONAL ENVIRONMENT OFFICE", it.NationalEnvironment);
		add("NATIONAL RESEARCH LAB", it.ResearchLab);
		add("NATIONAL WAR MEMORIAL", it.WarMemorial);
		add("PENTAGON", it.Pentagon);
		add("RESEARCH_LAB", it.ResearchLab);
		add("SOCIAL_SECURITY", it.SocialSecurity);
		add("SOCIAL SECURITY SYSTEM", it.SocialSecurity);
		add("SPACE_PROGRAM", it.SpaceProgram);
		add("SPACE PROGRAM", it.SpaceProgram);
		add("STOCK_MARKET", it.StockMarket);
		add("STOCK MARKET", it.StockMarket);
		add("STRATEGIC DEFENSE INITIATIVE", it.SDI);
		add("UNIVERSAL HEALTH CARE", it.UniversalHealthCare);
		add("WAR_MEMORIAL", it.WarMemorial);
		add("WEAPONS RESEARCH COMPLEX", it.WeaponsResearch);
		add("ALUMINUM", it.Aluminum);
		add("CATTLE", it.Cattle);
		add("COAL", it.Coal);
		add("FISH", it.Fish);
		add("FURS", it.Furs);
		add("GEMS", it.Gems);
		add("GOLD", it.Gold);
		add("IRON", it.Iron);
		add("LEAD", it.Lead);
		add("LUMBER", it.Lumber);
		add("MARBLE", it.Marble);
		add("OIL", it.Oil);
		add("PIGS", it.Pigs);
		add("RUBBER", it.Rubber);
		add("SILVER", it.Silver);
		add("SPICES", it.Spices);
		add("SUGAR", it.Sugar);
		add("URANIUM", it.Uranium);
		add("WATER", it.Water);
		add("WHEAT", it.Wheat);
		add("WINE", it.Wine);
		add("AFFLUENT", it.AffluentPopulation);
		add("ASPHALT", it.Asphalt);
		add("AUTOMOBILE", it.Automobiles);
		add("BEER", it.Beer);
		add("CONSTRUCTION", it.Construction);
		add("FASTFOOD", it.FastFood);
		add("JEWELRY", it.FineJewelry);
		add("MICROCHIP", it.Microchips);
		add("RADIATION", it.RadiationCleanup);
		add("SCHOLAR", it.Scholars);
		add("STEEL", it.Steel);
	}
	
	function add(name, number)
	{
		modifierStrings[name] = number;
	}
}
