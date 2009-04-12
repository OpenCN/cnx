CNExtend_scripts.loadSharedXULScripts();

var CNx_options = new function(){
	var that = this;
	var global = window.arguments[0];
	var vStatus = CNExtend_enum.validationStatus;
	var nationList = global.validationStatus.getValidationObject();
	var statusTestInterval = null;

	this.init = function(){
		window.removeEventListener("load", CNx_options.init, false);
		that.calc();
		
		var data = CNExtend_data.getStoredSessionData();
		id("current-income").value = "$" + data.averageCitizenTax.toFixed(2);
		id("current-pophap").value = data.happiness.toFixed(2);
		id("current-enviro").value = data.environment.toFixed(2);
		id("best-enviro").value = Number(1 + data.globalRadiation).toFixed(2);
		
		//populateNationValidator();	
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
	}
	
	function id(i) { return document.getElementById(i); }
	
	function checkValidationStatus(nationData) {
			if (!nationData.passwordHash) {
				setStatus(vStatus.NotValidated)
			}
			
			var requestURL = global.getSecureAPIURL() + "registrationStatus.html?nationId=" + nationData.nationId +
			"&passwordHash=" + nationData.passwordHash + "&gameType=" + nationData.gameType;
			global.query.getJSON(requestURL, { name: "John", time: "2pm" }, function(json){
			  alert("JSON Data: " + json.result);
			});
	}
	
	function updateStatusIcon(nationData, status) {
		if (status == vStatus.NotValidated) {
			document.getElementById('')
		}
	}
	
	function setNationInfo(nationNumber) {
		var nationData = nationList[nationNumber];
		hideAll();
		if (!nationData) {
			show('no-nation-selected');
			return;
		}
		
		if (nationData.status != vStatus.Validated) {
			show('enter-validation-code');
		}
		
		switch (nationData.status) {
			case vStatus.NotValidated :
				updateNotValidated(nationData)
				show('not-validated-options');
			break;
			case vStatus.Pending :
				show('pending-options');
			break;
			case vStatus.Validated :
				show('validated-options');
			break;
		}
	}
	
	this.setValidationAbilities = function(listbox) {
		setNationInfo(listbox.value)
	}
	
	function updateNotValidated(nationData) {
		if (nationData.bioKey) {
			//hide "get biokey"
			//show "bio key is"	
		} else {
			//show "get biokey"
			//hide "bio key is
		}
	}

	function hideAll() {
		var vboxesFound = document.getElementsByTagName('vbox');
		for (var vboxIndex in vboxesFound) {
			var vbox = vboxesFound[vboxIndex];
			if (vbox.className == "ValidationStatusBox") {
				vbox.style.display = "none";
			}
		}
	}
	
	function show(IdOfGroupBox) {
		document.getElementById(IdOfGroupBox).style.display = "block";
	}
	
	function populateNationValidator(){
		setNationInfo(null);
		for (var i in nationList) {
			alert(i)
			addNation(nationList[i], i) //pass in Nation
			checkValidationStatus(nationList[i]);
		}

		/**
		 * Here's what we expect with the nationObject
		 * 'rulerName' : nationData.rulerName,
		 * 'nationName' : nationData.nationName,
		 * 'nationId' : nationData.nationNumber
		 * 'gameType' : nationData.gameType,
		 * 'validationCode' : null, //full stored GUID
		 * 'status' : vStatus.NotValidated
		 * 'bioKey : null, //the key
		 * @param {Object} nationData
		 */
		function addNation(nationData, nationUniqueId) {
			var listItem = document.createElement("listitem");
			listItem.style.height = '18px';
			listItem.style.cursor = 'pointer';
			//the nation name
			var nationCell = document.createElement("listcell");
			nationCell.setAttribute("width", "290px");
			nationCell.setAttribute("crop", "end");
			var fullNationPrefix = "";
			if (nationData.gameType == CNExtend_enum.gameType.Standard) {
				fullNationPrefix = "(CN:SE) ";
			} else if (nationData.gameType == CNExtend_enum.gameType.Tournament) {
				fullNationPrefix = "(CN:TE) ";
			}
			listItem.value = nationUniqueId;

			nationCell.setAttribute("label", fullNationPrefix + nationData.rulerName + ' - ' + nationData.nationName);

			//the nation validation status
			var validationStatusCell = document.createElement("listcell");
			validationStatusCell.className = "listcell-iconic hideLabel";
			validationStatusCell.setAttribute("image", "chrome://cnextend/content/Icons/spinner.gif");
			//validationStatusCell.setAttribute("id", "icon_" + nationData.gameType + )

			listItem.appendChild(nationCell);
			listItem.appendChild(validationStatusCell);
			
			var nationListBox = document.getElementById('nation-list-box');
			nationListBox.appendChild(listItem);
		}
	}
}

window.addEventListener("load", CNx_options.init, false);