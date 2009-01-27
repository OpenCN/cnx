// cleaned
var CNExtend_global = new function() {
	this.selfTables = new CNExtend_table.CNTableList();
	this.selfLayoutList = null;
	this.messages = null;
	
	var that = this;
	
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
	};
	
	this.storeMessages = function() {
		var list = ThirdPartyJSONParser.stringify(CNExtend_global.messages.getList());
		CNExtend_util.PrefObserver.setStringPreference(CNExtend_enum.MESSAGES_PREF, list);
	};

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
		};
		
		this.clear = function() {
			list.splice(0, list.length);
			that.storeMessages();
		};
		
		this.add = function(content, type, title, link) {
			list.push(new message(content, type, title, link));
			that.storeMessages();
		};

		this.item = function(index) {
			return list[index];
		};
	
		this.length = function() {
			return list.length;
		};
		
		//message object
		function message(content, type, title, link) {
			this.content = content; //HTML
			this.type = type; //CNExtend_enum.messageType
			this.title = title; //string
			this.link = link; //web address or null
 		}
	}
	
	this.viewLayouts = function() {
		var file = CNExtend_util.getLayoutDirectory().QueryInterface(Components.interfaces.nsILocalFile);
		try {
			file.reveal();
		} catch (e) {
 	       openExternal(file);
 	    }
 	};
	
	this.viewOptions = function() {
		window.open('chrome://cnextend/content/CNx_options.xul', 'Options', 'chrome,toolbar,modal,centerscreen', CNExtend_global);
	};
	
	this.viewStatus = function() {
		window.openDialog('chrome://cnextend/content/CNx_status.xul', 'Status', 'dialog=no,chrome=yes,modal=yes,centerscreen=yes,resizable=yes', CNExtend_global);
	};
};
