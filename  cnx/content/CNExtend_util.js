//These functions are general utility functions that aren't specific to CN
//

String.prototype.CNtrimWhitespace=function(){
    return this.replace(/^\s*|\s*$/g,'');
};

var CNExtend_util = new function()
{
	
	//PRIVATE -------------------------------------------------------------

	var _logService = null;
	var _loggingLevel = CNExtend_enum.logLevel.Debug;
	var that = this;

	var log = function(message) {

		if (_logService == null) {
			_logService = Components.classes['@mozilla.org/consoleservice;1'].getService();
			_logService.QueryInterface(Components.interfaces.nsIConsoleService);
		}
		
			_logService.logStringMessage("CNExtend: " + message);
	 	}
	
	//PUBLIC  -------------------------------------------------------------

	//Implements observer class
	
	function myObserver() {
	
	}
	
	myObserver.prototype = {
	  observe: function(subject, topic, data) {
	  	if (CNExtend_global.messages) {
	  		CNExtend_global.messages.clearErrors();
		}
	  },
	  register: function() {
	    var observerService = Components.classes["@mozilla.org/observer-service;1"]
	                          .getService(Components.interfaces.nsIObserverService);
	    observerService.addObserver(this, "quit-application-requested", false);
	  },
	  unregister: function() {
	    var observerService = Components.classes["@mozilla.org/observer-service;1"]
	                            .getService(Components.interfaces.nsIObserverService);
	    observerService.removeObserver(this, "myTopicID");
	  }
	}
	
	var observe = new myObserver();
	observe.register();
				
	this.PrefObserver = {
		prefComponent: null,
		
		prefs: function()
		{
			if (this.prefComponent == null)
			{
				this.prefComponent = Components.classes["@mozilla.org/preferences-service;1"]
		     	.getService(Components.interfaces.nsIPrefService)
				
			 	//.getBranch(_prefPrefix);
				//this.prefComponent.QueryInterface(Components.interfaces.nsIPrefBranch2);
			}
			return this.prefComponent;
		},
		
		startup: function()
		{
			this.prefs().addObserver("", this, false);
			CNExtend_global.syncMessages();
			CNExtend_display.refreshStatusPanel();
			CNExtend_display.refreshSelfLayoutList();
			CNExtend_display.refreshCSS_State();
		},
		
		observe: function(subject, topic, data)
			{
				if (topic != "nsPref:changed")
				{
					return;
				}
				
				switch(data)
				{
					case CNExtend_enum.IS_ENABLED_PREF:
						CNExtend_display.refreshStatusPanel();
						CNExtend_display.refreshCSS_State();
					break;
					case CNExtend_enum.SELF_LAYOUT_PATH_PREF:
						CNExtend_display.refreshSelfLayoutList();
					break;
					case CNExtend_enum.MESSAGES_PREF:
						CNExtend_global.syncMessages();
						CNExtend_display.refreshStatusPanel();
					break;
				}
			},
	
		//Load a boolean preference from the preference manager
		getBoolPreference: function(preferenceString) {
			
			if (this.prefs().getPrefType(preferenceString) != this.prefs().PREF_BOOL)
				return false;
			else
				return this.prefs().getBoolPref(preferenceString);
		},
		
		setBoolPreference: function(preferenceString, setting) {
			this.prefs().setBoolPref(preferenceString, setting);
		},
		

		getStringPreference: function(preferenceString) {
			if (this.prefs().getPrefType(preferenceString) != this.prefs().PREF_STRING)
				return "";
			else
				return this.prefs().getCharPref(preferenceString);
		},

		setStringPreference: function(preferenceString, setting) {
			this.prefs().setCharPref(preferenceString, setting);
		},
		
		getIntPreference: function(preferenceString) {
			if (this.prefs().getPrefType(preferenceString) != this.prefs().PREF_INT)
				return 0;
			else
				return this.prefs().getIntPref(preferenceString);					
		},
		
		setIntPreference: function(preferenceString, setting) {
			this.prefs().setIntPref(preferenceString, setting);
		},
		
	
		shutdown: function()
		{
		    this.prefs().removeObserver("", this);
		}
	}
	
	this.error = function(exception, errorType, critical) {
		var logMessage = exception.toString();

		if (exception.lineNumber && exception.fileName) 
		{
			logMessage +=  " [line: " + exception.lineNumber + " in " + exception.fileName + "]";
		}
		
		log(logMessage);
		var type;
		if (critical)
		{
			type = CNExtend_enum.messageType.CriticalError;
		}
		else
		{
			type = CNExtend_enum.messageType.Warning;
		}
		
		var title;
		var titleLink = CNExtend_enum.website + CNExtend_enum.helpPage;
		
		switch(errorType)
		{
			case CNExtend_enum.errorType.Transformation:
				title = "Malformed Layout Error";
				titleLink += "#Transformation";
			break;
			case CNExtend_enum.errorType.Validation:
				title = "Interface Validation Failed";
				titleLink += "#Validation";
			break;
			case CNExtend_enum.errorType.CriticalFileMissing:
				title = "Critical File Missing";
				titleLink += "#CriticalFileMissing";
			break;
			case CNExtend_enum.errorType.CopyFiles:
				title = "Default Layout Copying Error";
				titleLink = "#CopyFiles";
			break;
			default:
				title = "Generic Exception";
				titleLink = null;
		}
		
		CNExtend_global.messages.add(logMessage, type, title, titleLink);
		return true;
	}

	this.debugLog = function(logString) {
		if (_loggingLevel >= CNExtend_enum.logLevel.Debug)
		{
			log(logString)
		}
		return true;
	}

	this.normalLog= function(logString) {
		if (_loggingLevel >= CNExtend_enum.logLevel.Normal)
		{
			log(logString)
		}
		return true;
	}

	//Unloads a CSS sheet
	this.unloadCSS = function(CSSPath)
	{
		CNExtend_util.debugLog("Unloading CSS:" + CSSPath)
		var styleSheetService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
		.getService(Components.interfaces.nsIStyleSheetService);

		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);

		var CSSURI = ioService.newURI(CSSPath, null, null);

		var registered = styleSheetService.sheetRegistered(CSSURI, styleSheetService.USER_SHEET);

		if(registered) 
		{
			styleSheetService.unregisterSheet(CSSURI, styleSheetService.USER_SHEET);
	    }
	}
	
	this.getFileFromChrome = function(chrome)
	{
		var URL = CNExtend_util.chromeToURL(chrome);
			
		var fileHandler = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService)
				.getProtocolHandler("file")
                .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
		
		return fileHandler.getFileFromURLSpec(URL);
		
	}
	
	/**
	 * Convenience function for getting the layout directory.  Will try to create it if it does not exist.
	 * 
	 */
	this.getLayoutDirectory = function() 
	{
		var layoutDirectory = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
		layoutDirectory.append(CNExtend_enum.layoutDirectoryName);
		
		that.makeDirectory(layoutDirectory);
		return layoutDirectory;
	}
	
	this.getActiveDocument = function()
	{
		const CC = Components.classes;
    	const CI = Components.interfaces;
    	var win = CC["@mozilla.org/appshell/window-mediator;1"]
                .getService(CI.nsIWindowMediator)
                .getMostRecentWindow("navigator:browser");
      
		return win.gBrowser.contentDocument;
	}
	
	/**
	 * Convenience function for getting the backup directory.  Will try to create it if it does not exist.
	 * 
	 */	
	this.getBackupDirectory = function() 
	{
		var layoutBackupDirectory = that.getLayoutDirectory();
		layoutBackupDirectory.append(CNExtend_enum.backupDirectoryName);

		that.makeDirectory(layoutBackupDirectory);
		return layoutBackupDirectory;
	}
	
	this.makeDirectory = function(directory)
	{
		if (!(directory.exists()))
		{
			directory.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
		}
	}
	
	this.copyDirectoryFiles = function(fromDir, dirToCopyTo)
	{
		var originalDirectoryIter = fromDir.directoryEntries;
		while (originalDirectoryIter.hasMoreElements())
		{
			var fileToCopy = originalDirectoryIter.getNext().QueryInterface(Components.interfaces.nsIFile);
			that.overwriteCopy(fileToCopy, dirToCopyTo);
		}
	}
	
	this.overwriteCopy = function(fileToCopy, dirToCopyTo)
	{
		if (fileToCopy.isFile())
		{
			var destinationFileName = dirToCopyTo.clone();
			destinationFileName.append(fileToCopy.leafName); //so we can check if we are overwriting anything
			
			removeFile(destinationFileName);
			fileToCopy.copyTo(dirToCopyTo, null);
		}	
	}
	
	function removeFile(destinationFileName)
	{
		if ((destinationFileName.exists() && destinationFileName.isFile()))
		{		
			destinationFileName.remove(false);
		}
	}

	//Loads a CSS sheet for all viewable pages	
	this.loadCSS = function(CSSPath) 
	{
		CNExtend_util.debugLog("Loading CSS:" + CSSPath)

		var styleSheetService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
		.getService(Components.interfaces.nsIStyleSheetService);

		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);

		var CSSURI = ioService.newURI(CSSPath, null, null);

		var registered = styleSheetService.sheetRegistered(CSSURI, styleSheetService.USER_SHEET);

		if(!registered) 
		{
				styleSheetService.loadAndRegisterSheet(CSSURI, styleSheetService.USER_SHEET);
	    }
	}
	
	//This function acts like an iterator, so we can iterate through the nodeList cleanly.  And because we CAN.
	//Really, it just makes the code after it much cleaner.
	this.elementNodeIterator = function(nodeList)
	{
		var iteratorCounter = -1;

		this.nextNode = function() 
		{
			var result = peekNextNode()
			if (result != -1)
			{
				iteratorCounter = result;
				return nodeList[iteratorCounter];
			}
			else
			{
				throw new CNExtend_exception.Iterator("Tried to get another node past the end of a list.");
			}
		}
		
		/**
		 * 
		 * @return	int		The location of the next node, or -1 if there is no next node.
		 */
		function peekNextNode()
		{
			var tempCounter = iteratorCounter;
			try 
			{
				do
				{
					if ((tempCounter) >= nodeList.length - 1)
					{
						
						return -1;
					}
					tempCounter++;
				} while(nodeList[tempCounter] == null || 
			            nodeList[tempCounter].nodeType != Node.ELEMENT_NODE)
				
				return tempCounter;
			}
			catch(e)		
			{
				return -1;	
			}
		}
		
		this.done = function() 
		{
			return (peekNextNode() == -1); 
		}
	}
	
	/**
	 * This was taken from jslib.  It converts a chrome URL to a regular path, which we need for certain RDF functionality.
	 *
	 * @param aPath 	This is a chrome path that needs to be converted into a file url.
	 * @return			A file:/// url string if the chrome URL string is converted successfully, otherwise null.
	 */
	this.chromeToURL = function (aPath) 
    {
      if (!aPath)
        return null;
  
      var rv;
      try {
	  	Components.classes["@mozilla.org/chrome/chrome-registry;1"]
		.getService(Components.interfaces.nsIChromeRegistry);
        var ios = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);

        var uri = ios.newURI(aPath, "UTF-8", null);
        var cr = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
		.getService(Components.interfaces.nsIChromeRegistry);
    
        rv = cr.convertChromeURL(uri);

        if (!(rv instanceof String))
          rv = rv.spec;
      } catch (e) { rv = null; }

      return rv;
    }
	
	this.firstColumnText = function(RowElement)
	{
		if ((!RowElement) || (!(RowElement.childNodes[1])))
		{
			return "";
		}
		return RowElement.childNodes[1].textContent.CNtrimWhitespace();
	}

	this.newTabSite = function(aURL) {
		setTimeout(function()
        { 
			var browser = document.getElementById("content");
          	var tab = browser.addTab(aURL);  
          	browser.selectedTab = tab;
		}, 100)
	}
	
	this.removeAllChildren = function(element)
	{
		while(!(element.firstChild == null))
		{
			element.removeChild(element.firstChild);
		}
	}

	this.injectTextScript = function(page,inputText)
	{
		var script = page.createElement('script');
		script.setAttribute("type", 'text/javascript');

		var text = page.createTextNode(inputText);
		script.appendChild(text);
		page.getElementsByTagName('head')[0].appendChild(script); 	
	}
	
	this.injectFileScript = function(page, scriptSource)
	{
		var script = page.createElement('script');
			script.setAttribute("type", 'text/javascript');
			script.setAttribute("src", scriptSource);
			page.getElementsByTagName('head')[0].appendChild(script);
	}
	
	this.numberFromText = function(text)
	{
		if (text == null)
		{
			return null;
		}
		var re = new RegExp("[0-9,]+(\.[0-9]+)?");
		var m = re.exec(text);
		return parseFloat(m[0].replace(",",""));
	}
	
	this.createObjectFromJSON = function(JSONString)
	{
		var JSONObject = ThirdPartyJSONParser.parse(JSONString,
			function (key, value)
				{ return key.indexOf('date') >= 0 ? new Date(value) : value;})
		return JSONObject;
	}
	
	this.mapTaggedElements = function(tag, todo, root)
	{
		var elements = Ext.query("[tag = '" + tag + "']");
		for (var i=0; i < elements.length; i++)
		{
			todo(elements[i]);
		}
		
	}
	
	this.shallowCopyObject = function(objToCopy)
	{
		return that.createObjectFromJSON(ThirdPartyJSONParser.stringify(objToCopy));
	}
	
	/**
	 * While normally getting the location in an HTMLDocument is simple, we want to handle the case of file locations smoothly.
	 * Thus, we check to see if the location protocol is file: vs http:, and then transform it towards http: for our testing purposes.
	 * 
	 * @param {Object} page
	 */
	this.getLocation = function(page)
	{
		if (page.location && (page.location.protocol == "file:") && (page.location.pathname.match("debug.cn")))
		{
			var mockLocation = {};
			mockLocation.protocol = "http:";
			mockLocation.host = "cybernations.net";
			mockLocation.search = "";
			mockLocation.toString = function()
			{
				var myString = (this.protocol + "//" + this.host + this.pathname + this.search);
				return myString;
			}		

			if (page.location.pathname.match("main.debug") || (page.location.pathname.match("extended.debug")))
			{
				mockLocation.pathname = CNExtend_enum.nationPath;
				mockLocation.search = "?Nation_ID=106861";
			}
			if (page.location.pathname.match("improvements.debug"))
			{
				mockLocation.pathname = CNExtend_enum.improvementPath;
			}
			if (page.location.pathname.match("wonders.debug"))
			{
				mockLocation.pathname = CNExtend_enum.wonderPath;
			}
			
			return mockLocation;
		}
		else
		{
			return page.location;
		}
	}
}
