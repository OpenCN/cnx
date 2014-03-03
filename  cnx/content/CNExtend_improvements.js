var CNExtend_improvements = new function() {
	var that = this;
	
	/*var improvements = {
		bank: { name: "Bank" },
		borderWall: { name: "Border Wall" },
		church: { name: "Church" },
		clinic: { name: "Clinic" },
		factory: { name: "Factory" }
	};*/
	
	new function bank()
	{
		this.name =  "Bank";
		this.type =  CNExtend_modifiers.type.Bank;
		this.incomeMod = 0.07
		CNExtend_modifiers.registerModifier(this);

		this.addDecorationText = this.incomeDecoration;
		this.modifierEffects = CNExtend_modifiers.incomeEffect(this.incomeMod);
	};

	new function borderWall()
	{
		this.name = "Border Wall";
		this.type = CNExtend_modifiers.type.BorderWall;
		this.populationMod = -0.02
		CNExtend_modifiers.registerModifier(this);
		
		this.addDecorationText = this.enviroDecoration;
		this.modifierEffects = function(tempData, countChange)
		{
			CNExtend_modifiers.populationPrediction(tempData, this.populationMod, countChange, this.getCount(tempData.modifiers));
			CNExtend_modifiers.happinessPrediction(tempData, 2, countChange);
			CNExtend_modifiers.environmentPrediction(tempData, -1, countChange);
		}

	};

	new function church()
	{
		this.name = "Church";
		this.type = CNExtend_modifiers.type.Church;
		CNExtend_modifiers.registerModifier(this);

		this.addDecorationText = this.incomeDecoration;
		this.modifierEffects = CNExtend_modifiers.happinessEffect(1);
	};
		
	new function clinic()
	{
		this.name = "Clinic";
		this.type = CNExtend_modifiers.type.Clinic;
		this.populationMod = 0.02;
		CNExtend_modifiers.registerModifier(this);

		this.modifierEffects = CNExtend_modifiers.populationEffect(this.populationMod);
		this.addDecorationText = this.populationDecoration;
	};

	new function factory()
	{
		this.name = "Factory";
		this.type = CNExtend_modifiers.type.Factory;
		this.infraCostDiscount = -0.08;
		CNExtend_modifiers.registerModifier(this);

		this.addDecorationText = this.infraCostDecoration;
	};

	new function foreignMinistry()
	{
		this.name = "Foreign Ministry";
		this.type = CNExtend_modifiers.type.ForeignMinistry;
		this.incomeMod = 0.05;
		CNExtend_modifiers.registerModifier(this);

		this.modifierEffects = CNExtend_modifiers.incomeEffect(this.incomeMod);
		this.addDecorationText = function(tipToDecorate, playerData, improvementChange)
		{
			var predictedData = this.predictedEffect(playerData, improvementChange);

			tipToDecorate.addTextItem("Daily Collection Change").text(
				CNExtend_data.incomeDifference(predictedData, playerData), true);
			tipToDecorate.addTextItem("").text("The extra slot can be worth up to 300k in additional daily income.", false);
		}
	};

	new function guerrillaCamp()
	{
		this.name = "Guerrilla Camp";
		this.type = CNExtend_modifiers.type.GuerrillaCamp;
		this.incomeMod = -0.08;
		CNExtend_modifiers.registerModifier(this);

		this.modifierEffects = CNExtend_modifiers.incomeEffect(this.incomeMod);
		this.addDecorationText = this.incomeDecoration;
	};

	new function harbor()
	{
		this.name = "Harbor";
		this.type = CNExtend_modifiers.type.Harbor;
		this.incomeMod = 0.01;
		CNExtend_modifiers.registerModifier(this);

		this.modifierEffects = CNExtend_modifiers.incomeEffect(this.incomeMod);
		this.addDecorationText = this.incomeDecoration;
	};

	new function hospital()
	{
		this.name = "Hospital";
		this.type = CNExtend_modifiers.type.Hospital;
		this.populationMod = 0.06;
		CNExtend_modifiers.registerModifier(this);

		this.modifierEffects = CNExtend_modifiers.populationEffect(this.populationMod);
		this.addDecorationText = this.populationDecoration;
	};

	new function intelligenceAgency()
	{
		this.name = "Intelligence Agency";
		this.type = CNExtend_modifiers.type.IntelligenceAgency;
		CNExtend_modifiers.registerModifier(this);
		
		this.modifierEffects = CNExtend_modifiers.happinessEffect(1);
		this.addDecorationText = function(tipToDecorate, playerData, improvementChange)
		{
			if (playerData.taxRate > 23)
			{
				this.incomeDecoration(tipToDecorate, playerData, improvementChange);
			}
			else
			{
				tipToDecorate.addTextItem("Daily Collection Change").text(
					0, true);
				tipToDecorate.addTextItem("").text("There's no change because your tax rate is 23% or less.", false);
			}
		}
	};

	new function laborCamp()
	{
		this.name = "Labor Camp";
		this.type = CNExtend_modifiers.type.LaborCamp;
		this.infraBillDiscount = -0.1;
		CNExtend_modifiers.registerModifier(this);
	
		this.modifierEffects = CNExtend_modifiers.happinessEffect(-1);
		
		this.addDecorationText = function (tipToDecorate, playerData, improvementChange)
		{
			var predictedData = this.predictedEffect(playerData, improvementChange);

			var CNData = CNExtend_data;
			var income = CNExtend_data.incomeDifference(predictedData, playerData);

			tipToDecorate.addTextItem("Daily Collection Change").text(income, true);
								
			var bills = Math.round(CNData.discountedInfraBills(playerData) - CNData.discountedInfraBills(predictedData));
			
			tipToDecorate.addTextItem("Bill Change Effect on Daily Income").text(bills, true);
			tipToDecorate.addTextItem("Net Change in Daily Income").text(income + bills, true);
		}
	};
                                      
	new function policeHeadquarters()
	{
		this.name = "Police Headquarters";
		this.type = CNExtend_modifiers.type.PoliceHeadquarters;
		CNExtend_modifiers.registerModifier(this);
				
		this.modifierEffects = CNExtend_modifiers.happinessEffect(2);
		this.addDecorationText = this.incomeDecoration;
	};

	new function school()
	{
		this.name = "School";
		this.type = CNExtend_modifiers.type.School;
		this.incomeMod = 0.05;
		CNExtend_modifiers.registerModifier(this);		
		
		this.modifierEffects = CNExtend_modifiers.incomeEffect(this.incomeMod);
		this.addDecorationText = this.incomeDecoration;
	};

	new function stadium()
	{
		this.name = "Stadium";
		this.type = CNExtend_modifiers.type.Stadium;
		CNExtend_modifiers.registerModifier(this);		
		
		this.modifierEffects = CNExtend_modifiers.happinessEffect(3);
		this.addDecorationText = this.incomeDecoration;
	};

	new function university()
	{
		this.name = "University";
		this.type = CNExtend_modifiers.type.University;
		this.incomeMod = 0.08;
		CNExtend_modifiers.registerModifier(this);

		this.modifierEffects = CNExtend_modifiers.incomeEffect(this.incomeMod);
		this.addDecorationText = this.incomeDecoration;
	};
	
	/**
	 * Gets the current improvements table from a page.
	 * 
	 * @param {Object} page	The HTML page to retrieve the current improvements table from.
	 */
	function getCurrentImprovementsTable(page)
	{
		return ExtCNx.query("table#table23 + table#table1 table#table17 > tbody", page)[0];
	}
	
	this.applyTipsToPage = function(page)
	{
		if (!page)
		{
			return false;
		}
		
		CNExtend_tips.applyTipsToExpandableDeleteImages(page);
		CNExtend_tips.applyTipsToRadioButtons(page);
		
		return true;
	}

	this.getImprovementPageData = function(page)
	{
		var improvementPageData = new Object();
		improvementPageData.workingCitizens = that.workingCitizensFromImprovementsPage(page);
		improvementPageData.improvements = countHashFromImprovementsPage(page);

		return improvementPageData;
	}
	
	this.workingCitizensFromImprovementsPage = function(page)
	{
		var improvementTable = getCurrentImprovementsTable(page)

		if (!improvementTable)
		{
			CNExtend_util.error("We weren't able to locate the improvement count table.")
			return null;
		}

		var rowIterator = new CNExtend_util.elementNodeIterator(improvementTable.childNodes);

		while (!(rowIterator.done()))
		{
			var currentRow = rowIterator.nextNode();
			var childTDs = currentRow.getElementsByTagName("TD");
			if ((childTDs.length == 2) && (childTDs[0].textContent.CNtrimWhitespace() == "Current Citizens"))
			{
				return CNExtend_util.numberFromText(childTDs[1].textContent.CNtrimWhitespace());
			}
		}
		
		CNExtend_util.error("We weren't able to get the current working citizens from the improvement count table.")
		return null;
	}
		
	/**
	 *  Trawls through an improvements table in the given page, returning a hash with the enum and number of each improvement
	 * 
	 */
	function countHashFromImprovementsPage(page)
	{
		var improvementTable = getCurrentImprovementsTable(page)
		
		if (!improvementTable)
		{
			CNExtend_util.error("We weren't able to locate the improvement count table.")
			return null;
		}
		
		var tempImprovementHash = new Object();
		var rowIterator = new CNExtend_util.elementNodeIterator(improvementTable.childNodes);

		while (!(rowIterator.done()))
		{
			var currentRow = rowIterator.nextNode();
			var childTDs = currentRow.getElementsByTagName("TD");
			if (childTDs.length == 4) //then we are in a row like Bank | 0 | Hospital | 3 in the table
			{
				try {
						parseTDIntoHash(childTDs[0], childTDs[1], tempImprovementHash);
						parseTDIntoHash(childTDs[2], childTDs[3], tempImprovementHash);
					}
				catch (e)
				{
					e.message = "We ran into an error parsing the Improvement Count table: " + e.message;
					CNExtend_util.error(e, CNExtend_enum.errorType.ParseImprovementTable, false);
					return null;
				}
			}
		}
		
		function parseTDIntoHash(improvementNameTD, improvementNumberTD, improvementHash)
		{
			var improvementName = improvementNameTD.textContent.CNtrimWhitespace()
			var improvType = CNExtend_modifiers.enumFromModifierName(improvementName)
			var improvNumber = parseFloat(improvementNumberTD.textContent.CNtrimWhitespace());			
			if ((!improvType) || (isNaN(improvNumber)))
			{
				throw new CNExtend_exception.Base("We didn't recognize the following improvement: " + improvementName);
			}
			
			improvementHash[improvType] = improvNumber;
			return true;
		}
		
		return tempImprovementHash;
	}	
}
