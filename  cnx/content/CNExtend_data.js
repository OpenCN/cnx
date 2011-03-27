// cleaned
var CNExtend_data = new function() {
        var sessionData = null;
        var that = this;
        
        /**
         * Tests to see if the current session data is stale
         * 
         * @param {Object} currentDate
         */
        this.isStale = function(currentDate) {
                pullSessionDataIfMissing();
                if (!sessionData) return true;
                
                var oneHour = 1000 * 60 * 60;
                var staleHours = 24;
                if (!currentDate) {
                        throw new CNExtend_exception.IllegalArgument("Null argument was passed to isStale.");
                }
                
                return (((currentDate - sessionData.date) / oneHour) > staleHours);
        }

        this.setSessionData = function(playerData) {
                sessionData = playerData;
                storeSessionData(playerData);
        }

        /**
         * Returns current player data provided it exists and isn't stale, and isn't for the wrong game type.
         */
        this.getSessionData = function(page) {
                var currentDate = CNExtend_data.getDateFromPage(page);
                if (!currentDate || that.isStale(currentDate) || (sessionData.gameType != that.determineGameType(page.location.host))) {
                        return null;
                }
                
                return sessionData;
        }
        
        this.determineGameType = function(hostname)
        {
                switch(hostname)
                {
                        case "www.cybernations.net" :
                                return CNExtend_enum.gameType.Standard;
                        break;
                        case "tournament.cybernations.net" :
                                return CNExtend_enum.gameType.Tournament;                               
                        break;
                        default :
                                return CNExtend_enum.gameType.Invalid;
                }                       
        }

        
        function pullSessionDataIfMissing() {
                if (!sessionData) {
                        sessionData = that.getStoredSessionData();
                }
        }
        
        this.getDateFromPage = function(page) {
                var adjacentTable = ExtCNx.query("table#table51", page)[0];
                if (!adjacentTable) return null;
                var parentTD = adjacentTable.parentNode;
                var DateText = parentTD.textContent.CNtrimWhitespace();

                if (DateText.search(/Current Time/) != -1) { //then we need to parse a tournament edition time
                        var findTimeRegexp = /Current Time: (.+)/;
                        myMatches = findTimeRegexp.exec(DateText);
                        DateText = myMatches[1];
                }
                var d = Date.parseDate(DateText, "m/d/Y g:i:s A");
                return d;
        }
        
        /**
         * Returns an ID number given a page
         */
        this.getNationIDFromPage = function(page)
        {
                var location = CNExtend_util.getLocation(page)
                if (location == null) {
                        throw new CNExtend_exception.Base("Couldn't get location!");
                }
                
                return that.getNationID(location);
        }
        
        /**
         * Given a text string, parseLandData extracts the relevant data.
         * Failure to parse causes an exception to be thrown.
         */
        this.parseLandData = function(landText)
        {
                var landResult = {}
                var reg = /-?[0-9][0-9\,\.]+/gm;
                var matches = landText.match(reg);
                landResult.total = CNExtend_util.numberFromText(matches[0]);
                landResult.purchases = CNExtend_util.numberFromText(matches[1]);
                landResult.modifiers = CNExtend_util.numberFromText(matches[2]);
                landResult.growth = CNExtend_util.numberFromText(matches[3]);
                return landResult;
        }
        
        this.getNationID = function(href)
        {
                var result = new RegExp("Nation_ID=([0-9]+)").exec(href);
                if (result && result[1]) {
                        return parseInt(result[1]);
                }
                else {
                        throw new CNExtend_exception.Base("Nation_ID wasn't found in URL.");
                }
        }
        
        this.clearStoredSessionData = function() {
                CNExtend_util.PrefObserver.setStringPreference(CNExtend_enum.PLAYER_DATA_PREF, "");
                sessionData = null;
        }
        
        this.markDataAsUpdateNeeded = function(page) {
                var data = that.getSessionData(page);
                        if (data) {
                                data.updateNeeded = true;
                        }
                        that.setSessionData(data);
        }
                
        /**
         * Stores a playerdata object into a preference string
         * 
         * @param {Object} playerData
         */
        function storeSessionData(playerData) {
                //first we have to check to make sure the current data isn't newer
                var currentStored = that.getStoredSessionData();
                if (!currentStored || currentStored.date <= playerData.date) {
                        var JSONPlayer = ThirdPartyJSONParser.stringify(playerData);
                        CNExtend_util.PrefObserver.setStringPreference(CNExtend_enum.PLAYER_DATA_PREF, JSONPlayer);
                }
                return true;
        }

        this.getStoredSessionData = function() {
                var JSONPlayer = CNExtend_util.PrefObserver.getStringPreference(CNExtend_enum.PLAYER_DATA_PREF);
                
                if (!JSONPlayer || JSONPlayer === "") {
                        return null;
                }
                
                return CNExtend_util.createObjectFromJSON(JSONPlayer);
        }
                
        this.discountedInfraBills = function(playerData) {
                /**
                 * Given a infrastructure level, this function determines the bills associated with it
                 * not including discounts. 
                 */
                function getInfraBillCost(infraLevel) { 
                        var modifier = getInfraBillModifier(infraLevel);
                        return ((modifier * infraLevel) + 20) * infraLevel;
                }
                
                /**
                 * Calculates infrastructure discount (ignoring improvements)
                 * given some playerData.
                 * 
                 * @param {Object} playerData
                 */
                function getInfraBillDiscount(playerData) {
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
        this.discountedPurchaseCost = function(playerData) {
                /**
                 * Given an infrastructure level, this function determines the undiscounted cost of purchasing infrastructure.
                 * @param {Object} infraLevel
                 */
                function getInfraPurchaseCost(infraLevel) {
                        var modifier = getInfraCostModifier(infraLevel);
                        return ((modifier * infraLevel) + 500);
                }
                
                function getInfraPurchaseDiscount(playerData) { 
                        var modifier = CNExtend_modifiers.calculateModifier("infraCostDiscount", playerData);
                                                                                
                        //governments
                        var myGov = playerData.government;
                        
                        var gt = CNExtend_governments.type;
                        if ([gt.Capitalist, gt.Dictatorship, gt.FederalGovernment, gt.Monarchy, gt.Republic, gt.Revolutionary].indexOf(myGov) != -1) { modifier *= 0.95; }
                                                
                        return modifier;                
                }
                return getInfraPurchaseCost(playerData.infrastructure) * getInfraPurchaseDiscount(playerData);
        }
                
        function incomeFrom(playerData) {
                return playerData.averageCitizenTax * playerData.workingCitizens;
        }
        
        this.incomeDifference = function(predictedData, playerData) {
                return Math.round(incomeFrom(predictedData) - incomeFrom(playerData));
        }
        
        this.populationDifference = function(predictedData, playerData) {
                return Math.round(predictedData.workingCitizens - playerData.workingCitizens);
        }
        
        this.landDifference = function(predictedData, playerData) {
                return Math.round(predictedData.land.total - playerData.land.total);
        }
        
        function getInfraCostModifier(infraLevel) {
                var infraCutoffs = { 20: 1, 100: 12, 200: 15, 1000: 20, 3000: 25, 4000: 30, 5000: 40, 8000: 60 },
                        modifier = 70;
                
                for (var k in infraCutoffs) {
                        if (infraLevel < k) {
                                modifier = infraCutoffs[k];
                                break;
                        }
                }
                
                return modifier;
        }
        
        function getInfraBillModifier(infraLevel) {
                var infraCutoffs = { 100: 0.04, 200: 0.05, 300: 0.06, 500: 0.07, 700: 0.08, 1000: 0.09, 2000: 0.11, 3000: 0.13, 4000: 0.15, 5000: 0.17, 8000: 0.1725 },
                        modifier = 0.175;
                
                for (var k in infraCutoffs) {
                        if (infraLevel < k) {
                                modifier = infraCutoffs[k];
                                break;
                        }
                }
                
                return modifier;
        }
}