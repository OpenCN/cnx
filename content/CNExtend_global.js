// cleaned
var CNExtend_global = new function() {
	this.selfTables = new CNExtend_table.CNTableList();
	this.selfLayoutList = null;
	this.messages = null;
	this.validationStatus = null;
	this.debugMode = true;

	var that = this;

	this.getSecureAPIURL = function()
	{
		if (that.debugMode)
			return CNExtend_enum.testSecureAPIURL;
		else
			return CNExtend_enum.secureAPIURL;
	}
	
	this.getAPIURL = function()
	{
		if (that.debugMode)
			return CNExtend_enum.testAPIURL;
		else
			return CNExtend_enum.APIURL;
	}

	/**
	*  Synchronizes local message list with the one stored in the global preferences.
	*
	**/
	this.syncMessages = function() {
		var storedMessages = CNExtend_util.PrefObserver.getStringPreference(CNExtend_enum.MESSAGES_PREF);
		if (storedMessages !== "") {
			that.messages = new messageList(CNExtend_util.createObjectFromJSON(storedMessages));
		} else {
			that.messages = new messageList(null);
		}
	}

	this.syncValidationStatus = function() {
		var statusObject = CNExtend_util.PrefObserver.getStringPreference(CNExtend_enum.VALIDATION_STATUS_PREF);
		if (statusObject != "") {
			that.validationStatus = new validationStatusObject(CNExtend_util.createObjectFromJSON(statusObject));
		} else {
			that.validationStatus = new validationStatusObject(null);
		}
	}

	this.storeValidationStatus = function() {
		var list = ThirdPartyJSONParser.stringify(CNExtend_global.validationStatus.getValidationObject());
		CNExtend_util.PrefObserver.setStringPreference(CNExtend_enum.VALIDATION_STATUS_PREF, list);
	}

	this.storeMessages = function() {
		var list = ThirdPartyJSONParser.stringify(CNExtend_global.messages.getList());
		CNExtend_util.PrefObserver.setStringPreference(CNExtend_enum.MESSAGES_PREF, list);
	}
	
	this.uniqueNationKey = function(gameType, id) {
		return gameType + '_' + id;
	}

	function validationStatusObject(validationObject) {
		if (!validationObject)
			validationObject = {};
		
		/*
		 * gameType = 'Standard' or 'Tournament'
		 */
		this.addNation = function(nationData){
			var uniqueKey = that.uniqueNationKey(nationData.gameType, nationData.nationNumber)
			if (!validationObject[uniqueKey])
			{
				validationObject[uniqueKey] = { 
					'rulerName' : nationData.rulerName,
					'nationName' : nationData.nationName,
					'nationId' : nationData.nationNumber,
					'gameType' : nationData.gameType,
					'uniqueKey' : uniqueKey,
					'passwordHash' : null,
					'bioKey' : null }
				that.storeValidationStatus();
			}
		}
		
		this.setStatus = function(nationNumber, status) {
			if (!validationObject[nationNumber])
				throw new Exception("We don't have a record of nation " + nationNumber + " so we can't set its status.")
			validationObject[nationNumber].status = status;
		}
				
		this.getValidationObject = function() {
			return validationObject;
		}		
	}

	/**
	 * A managed list of messages
	 */
	function messageList(constructorList) {
		// constructor
		var list;
		if (constructorList !== null) {
			list = constructorList;
		} else {
			list = [];
		}
	
		// public functions
		this.getList = function() {
			return list;		
		}
		
		this.clear = function() {
			list.splice(0, list.length);
			that.storeMessages();
		}
		
		this.clearErrors = function() {
			newList = [];
			for (var i in list) {
				if (!((list[i].type == CNExtend_enum.messageType.CriticalError) ||
					(list[i].type == CNExtend_enum.messageType.Warning))) {
					newList.push(list[i]);
				}
			}
			list = newList;
			that.storeMessages();
		}
		
		this.add = function(content, type, title, link, messageID) {
			list.push(new message(content, type, title, link, messageID));
			that.storeMessages();
		}

		this.item = function(index) {
			return list[index];
		}
	
		this.length = function() {
			return list.length;
		}
		
		this.remove = function(messageID) {
			for (var i = 0; i < list.length; i++) {
				if (this.item(i).id == messageID) {
					list.splice(i,1);
				}
			}
			that.storeMessages();
		}
		
		//message object
		function message(content, type, title, link, id) {
			this.content = content; //HTML
			this.type = type; //CNExtend_enum.messageType
			this.title = title; //string
			this.link = link; //web address or null
			if (id == null) {
				this.id = CNExtend_util.generateGUID();//a GUID
			} else {
				this.id = id;
			}
 		}
	}
	
	this.viewLayouts = function() {
		var file = CNExtend_util.getLayoutDirectory().QueryInterface(Components.interfaces.nsILocalFile);
		try {
			file.reveal();
		} catch (e) {
 	       openExternal(file);
 	    }
 	}
	
	this.viewOptions = function() {
		window.openDialog('chrome://cnextend/content/CNx_options.xul', 'Options', 'chrome,toolbar,centerscreen,dialog', null, CNExtend_global);
	}
	
	this.viewMessages = function() {
		window.openDialog('chrome://cnextend/content/CNx_options.xul', 'Options', 'chrome,toolbar,centerscreen,dialog', 'cnextend-mail-pane', CNExtend_global);
	}
}
