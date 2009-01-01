
var CNExtend_data = new function () {

	var sessionData = null;
	var that = this;
	
	/**
	 * Tests to see if the current session data is stale
	 * 
	 * @param {Object} currentDate
	 */
	this.isStale = function(currentDate)
	{
		pullSessionDataIfMissing();
		if (!sessionData)
		{
			return true;
		}
		
		var oneHour = 1000*60*60;
		var staleHours = 24;
		if (!currentDate)
		{
			throw new CNExtend_exception.IllegalArgument("Null argument was passed to isStale.");
		}
		
		return (((currentDate - sessionData.date) / oneHour) > staleHours);
	}

	this.playerData = function(date, nationNumber, workingCitizens, averageCitizenTax, taxRate, modifiers, environment, infrastructure, technology, nationStrength, government, globalRadiation, numberOfSoldiers, happiness, land)
	{
		this.date = date;
		this.nationNumber = nationNumber;
		this.workingCitizens = workingCitizens;
		this.averageCitizenTax = averageCitizenTax;
		this.taxRate = taxRate;
		this.modifiers = modifiers;
		this.environment = environment;
		this.infrastructure = infrastructure;
		this.technology = technology;
		this.nationStrength = nationStrength;
		this.government = government;
		this.globalRadiation = globalRadiation;
		this.numberOfSoldiers = numberOfSoldiers;
		this.happiness = happiness;
		this.land = land;
	}

	this.setSessionData = function(playerData, page)
	{
		playerData.host = page.location.host
		sessionData = playerData;
		storeSessionData(playerData)
	}

	/**
	 * Returns current player data provided it exists and isn't stale, and isn't for the wrong game type.
	 */
	this.getSessionData = function(page)
	{
		var currentDate = CNExtend_data.getDateFromPage(page)
		if (that.isStale(currentDate) || (sessionData.host != page.location.host))
		{
			return null;
		}
		
		return sessionData;
	}
	
	function pullSessionDataIfMissing()
	{
		if (!sessionData)
		{
			sessionData = that.getStoredSessionData();
		}
	}
	
	this.getDateFromPage = function(page)
	{
		var adjacentTable = Ext.query("table#table51", page)[0];
		if (!adjacentTable)
		{
			return null;
		}
		var parentTD = adjacentTable.parentNode;
		var DateText = parentTD.textContent.CNtrimWhitespace();

		if (DateText.search(/Current Time/) != -1) //then we need to parse a tournament edition time
		{
			var findTimeRegexp = /Current Time: (.+)/;
			myMatches = findTimeRegexp.exec(DateText);
			DateText = myMatches[1];
		}
		var d = Date.parseDate(DateText, "m/d/Y g:i:s A");
		return d;
	}

	this.clearStoredSessionData = function()
	{
		CNExtend_util.PrefObserver.setStringPreference(CNExtend_enum.PLAYER_DATA_PREF, null);
	}
		
	/**
	 * Stores a playerdata object into a preference string
	 * 
	 * @param {Object} playerData
	 */
	function storeSessionData(playerData)
	{
		//first we have to check to make sure the current data isn't newer
		var currentStored = that.getStoredSessionData()
		if ((!currentStored) || (currentStored.date <= playerData.date))
		{
			var JSONPlayer = ThirdPartyJSONParser.stringify(playerData);
			CNExtend_util.PrefObserver.setStringPreference(CNExtend_enum.PLAYER_DATA_PREF, JSONPlayer);
		}
		return true;
	}

	this.getStoredSessionData = function()
	{
		var JSONPlayer = CNExtend_util.PrefObserver.getStringPreference(CNExtend_enum.PLAYER_DATA_PREF);
		
		if ((!JSONPlayer) || (JSONPlayer == ""))
		{
			return null;
		}
		
		return CNExtend_util.createObjectFromJSON(JSONPlayer);
	}
		
	this.discountedInfraBills = function(playerData)
	{
		/**
		 * Given a infrastructure level, this function determines the bills associated with it
		 * not including discounts. 
		 */
		function getInfraBillCost(infraLevel)
		{ 
			var modifier = getInfraBillModifier(infraLevel)
			return ((modifier * infraLevel) + 20) * infraLevel;
		}
		
		/**
		 * Calculates infrastructure discount (ignoring improvements)
		 * given some playerData.
		 * 
		 * @param {Object} playerData
		 */
		function getInfraBillDiscount(playerData)
		{
			var modifier = CNExtend_modifiers.calculateModifier("infraBillDiscount", playerData);

			//tech
			var techModifier = (1 - ((2 * playerData.technology) / playerData.nationStrength));
			if (techModifier < 0.9) techModifier = 0.9;
			
			modifier *= techModifier;
			
			return modifier;
		}
		return getInfraBillCost(playerData.infrastructure) * getInfraBillDiscount(playerData);
	}
	
	/**
	 * The cost of buying one unit of infrastructure after discounts
	 * 
	 * @param {Object} playerData
	 */
	this.discountedPurchaseCost = function(playerData)
	{
		/**
		 * Given an infrastructure level, this function determines the undiscounted cost of purchasing infrastructure.
		 * @param {Object} infraLevel
		 */
		function getInfraPurchaseCost(infraLevel)
		{
			var modifier = getInfraCostModifier(infraLevel)
			return ((modifier * infraLevel) + 500);
		}
		
		function getInfraPurchaseDiscount(playerData)
		{
			
			var modifier = CNExtend_modifiers.calculateModifier("infraCostDiscount", playerData);
										
			//governments
			
			var myGov = playerData.government;
			
			var gt = CNExtend_governments.type;
			if ([gt.Capitalist, 
				 gt.Dictatorship, 
				 gt.FederalGovernment, 
				 gt.Monarchy, 
				 gt.Republic, 
				 gt.Revolutionary].indexOf(myGov) != -1)
			{
				modifier *= 0.95;			 
			}
						
			return modifier;		
		}
		return getInfraPurchaseCost(playerData.infrastructure) * getInfraPurchaseDiscount(playerData);
	}
		
	function incomeFrom(playerData)
	{
		return playerData.averageCitizenTax * playerData.workingCitizens;
	}
	
	this.incomeDifference = function(predictedData, playerData)
	{
		return Math.round(incomeFrom(predictedData) - incomeFrom(playerData));
	}
	
	this.populationDifference = function(predictedData, playerData)
	{
		return Math.round(predictedData.workingCitizens - playerData.workingCitizens);
	}
	
	this.landDifference = function(predictedData, playerData)
	{
		return Math.round(predictedData.land - playerData.land);
	}
	
	function getInfraCostModifier(infraLevel)
	{
		var infraCutoff =	[20, 100, 200, 1000, 3000, 4000, 5000, 8000];
		var infraModifier =	[1,  12,  15,  20,   25,   30,   40,   60];
		
		var modifier = 70;
		
		for (var count=0; count < infraCutoff.length; count++)
		{
			if (infraLevel < infraCutoff[count])
			{
				modifier = infraModifier[count];
			}
		}
		return modifier;
	}
	
	function getInfraBillModifier(infraLevel)
	{
		//if it's less than 100, it's 0.04
		//if it's 4000-4999.99, it's 0.17
		//if it's 8000 or more, it's 0.1725
		var infraCutoff =   [100,  200,  300,  500,  700,  1000, 2000, 3000, 4000, 5000, 8000];
		var infraModifier = [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.11, 0.13, 0.15, 0.17, 0.1725];
		
		var modifier = 0.175;
		
		for (var count = 0; count < infraCutoff.length; count++)
		{
			if (infraLevel < infraCutoff[count]) 
			{
				modifier = infraModifier[count];
			}
		}
		return modifier;
	}
}