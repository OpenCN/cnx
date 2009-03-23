CNExtend_scripts.loadSharedXULScripts();

var CNx_options = new function(){
	var that = this;
	var global = window.arguments[0];


	this.init = function(){
		window.removeEventListener("load", CNx_options.init, false);
		that.calc();
		
		var data = CNExtend_data.getStoredSessionData();
		id("current-income").value = "$" + data.averageCitizenTax.toFixed(2);
		id("current-pophap").value = data.happiness.toFixed(2);
		id("current-enviro").value = data.environment.toFixed(2);
		id("best-enviro").value = Number(1 + data.globalRadiation).toFixed(2);
		
		populateNationValidator();
		
	}
	this.calc = function(){
		var oldData, effect, elem, elemval;
		
		var effects = {
			income: function(data){ CNExtend_modifiers.cashEffect(id("mod-income").value)(data, 1); return [data, "info-income"]; },
			pophap: function(data){ CNExtend_modifiers.happinessEffect(id("mod-pophap").value)(data, 1); return [data, "info-pophap"]; },
			enviro: function(data){ CNExtend_modifiers.enviroEffect(id("mod-enviro").value)(data, 1); return [data, "info-enviro"]; }
		};
		
		for (k in effects) {
			effect = effects[k](CNExtend_data.getStoredSessionData());
			elem = document.getElementById(effect[1]);
			elemval = CNExtend_data.incomeDifference(effect[0], CNExtend_data.getStoredSessionData());
			elem.value = "$" + CNExtend_util.numberToText(elemval);
			if (elemval > 0) {
				elem.setAttribute("style", "color: green;");
			} else if (elemval < 0) {
				elem.setAttribute("style", "color: red;");
			} else if (elemval == 0) {
				elem.setAttribute("style", "color: gray;");
			}
		}
	};
	function id(i) { return document.getElementById(i); }
	
	function populateNationValidator(){
		var nationListBox = document.getElementById("NationListBox");
		var nationList = global.validationStatus.getValidationObject();

		for (var i in nationList) {
			addNation(nationList[i]) //pass in Nation
		}
		
		/**
		 * Here's what we expect with the nationObject
		 * 'rulerName' : nationData.rulerName,
		 * 'nationName' : nationData.nationName,
		 * 'gameType' : nationData.gameType,
		 * 'validationCode' : null,
		 * 'status' : CNExtend_enum.validationStatus.NotValidated
		 * 
		 * @param {Object} nationData
		 */
		function addNation(nationData)
		{
			var listItem = document.createElement("listitem");
			listItem.style.height = '18px'
			//the nation name
			var nationCell = document.createElement("listcell");
			nationCell.setAttribute("width", "190px");
			nationCell.setAttribute("crop", "end");
			var fullNationPrefix = "";
			if (nationData.gameType == CNExtend_enum.gameType.Standard) {
				fullNationPrefix = "(Standard) ";
			} else if (nationData.gameType == CNExtend_enum.gameType.Tournament) {
				fullNationPrefix = "(Tournament) ";
			} 

			nationCell.setAttribute("label", fullNationPrefix + nationData.rulerName + ' - ' + nationData.nationName);

			//the nation validation status
			var validationStatusCell = document.createElement("listcell");
			validationStatusCell.className = "listcell-iconic hideLabel";
			var statusIcon = "";
			switch(nationData.status) {
				case CNExtend_enum.validationStatus.NotValidated :
					statusIcon = "cross.png";
				break;
				case CNExtend_enum.validationStatus.Validated:
					statusIcon = "check.png";
				break;
				default:
					throw "Didn't recognize validation status.";
			}
			validationStatusCell.setAttribute("image", "chrome://cnextend/content/Icons/" + statusIcon);
			
			listItem.appendChild(nationCell);
			listItem.appendChild(validationStatusCell);
			
			nationListBox.appendChild(listItem);
		}
		
	}
	
}

window.addEventListener("load", CNx_options.init, false);