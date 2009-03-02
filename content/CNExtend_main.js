// This is where the main flow of functionality is stored.

var CNExtend_main = new function() {
	/**
	 * 	This event fires whenever a page is refreshed or a new window is opened. This page isn't necessarily visible.  
	 *  It could be a tab loading in the background.
	 * 
	 * @param {Object} aEvent  The event which caused the page load.  We use this to get a link to the page, whether it is in the foreground or background. 
	 */
	function onPageLoad(aEvent) {
		try {
			var currentPage = aEvent.originalTarget; // currentPage is document that triggered "onload" event
			if (!(CNExtendIsEnabled()) || !(CNExtend_main.atCN(currentPage))) {	return; }
			pageController(currentPage);
		} catch(e) {
			CNExtend_util.error(e, CNExtend_enum.errorType.Unknown, false);
		} finally { //we make sure that no matter what the page is displayed.
			revealTable(currentPage);
		}
		return;
	}
	
	/**
	 * Tests to see if the given page is a Cybernations page.
	 * 
	 * @param {Object} page		The page to check.
	 */
	this.atCN = function(page) {
		var myLocation = CNExtend_util.getLocation(page);
		if (myLocation && ((myLocation.protocol == "http:") || (myLocation.protocol == "https:"))) {
			if (!myLocation.host) { return false; }
			return (myLocation.host.indexOf("cybernations.net") != -1);
		} else { return false; }
	};

	function processNationView(page) {
		CNExtend_util.debugLog("Processing Nation View");
		var CNTable = CNExtend_table.getTableFromPage(page);
		if (!CNTable) {
			CNExtend_util.debugLog("Table should have loaded, but didn't.");
			return false;
		}

		if (!(CNTable.isSelf)) {
			return true;
		}

		try {
			if (CNTable.validate()) {
				//This ensures that we still have a reference to a table even if it is not the active table, in case a new layout is applied.
				CNExtend_global.selfTables.push(CNTable);
				CNTable.patch();
				CNExtend_data.setSessionData(CNTable.getPlayerData(), page);
				CNTable.transform(CNExtend_global.selfLayoutList);
				CNExtend_util.debugLog("Validated Table and applied transformations");
			}
		} catch(e) {
			if (e instanceof CNExtend_exception.ValidationError) {
				CNExtend_util.error(e, CNExtend_enum.errorType.Validation, true);
			} else { throw e; }
		}
		
		return true;
	}
	
	/**
	 * Does all high level actions on an improvement page in order to generate improvement tips. 
	 * 
	 * @param {Object} page The page to be processed.
	 */
	function processImprovementView(page) {
		var currentData = CNExtend_data.getSessionData(page);
		if (currentData) { //then we attempt to extrapolate what the data should be
			var improvementData = CNExtend_improvements.getImprovementPageData(page);
			var extrapolatedPlayerData = CNExtend_modifiers.extrapolatedPlayerDataFromCurrentData(currentData, improvementData);
			CNExtend_data.setSessionData(extrapolatedPlayerData, page);
		}
		CNExtend_improvements.applyTipsToPage(page);
	}
	

	/**
	 * 	When a table is hidden by our anti-flicker CSS file, we 'reveal' it by setting an attribute which cancels the effect of the CSS file.
	 * 
	 * @param {Object} page	The page to reveal.
	 */
	function revealTable(page) {
		tableArray = ExtCNx.query("div[class=shadetabs] + table", page);
		if (!(tableArray.length === 0)) {
			tableArray[0].setAttribute("layout","modified");
		}
	}
			
	function pageController(page) {
		if (!page) return false;
		var myLocation = CNExtend_util.getLocation(page);
		
		if (myLocation && myLocation.protocol == "http:") {
			switch(myLocation.pathname) {
				case (CNExtend_enum.nationPath):
					processNationView(page);
				break;
				case (CNExtend_enum.improvementPath):
					processImprovementView(page);
				break;
				case (CNExtend_enum.wonderPath):
					CNExtend_wonders.applyTipsToPage(page);
				break;
				case (CNExtend_enum.techPath):
					CNExtend_data.markDataAsUpdateNeeded(page);
				break;
				case (CNExtend_enum.infraPath):
					CNExtend_data.markDataAsUpdateNeeded(page);
				break;
				case (CNExtend_enum.soldiersPath):
					CNExtend_data.markDataAsUpdateNeeded(page);
				break;
			}
		}
		return true;
	}
	
	/**
	 * Convenience function tied to a about:config preference determining whether CNExtend is disabled or not.
	 * 
	 */
	function CNExtendIsEnabled() {
		return CNExtend_util.PrefObserver.getBoolPreference(CNExtend_enum.IS_ENABLED_PREF);
	}
	
	function setupLayoutPopupMenus() {
		var layoutDirNSIFile = CNExtend_util.getLayoutDirectory();
		
		var fileHandler = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService)
			.getProtocolHandler("file")
            .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

		var layoutDirPath = fileHandler.getURLSpecFromFile(layoutDirNSIFile);
		
		//This could be a little more elegant.  We really only need two ids, and then look for the "menupopup" child to get the corresponding popup.
		//These two popups are virtually identical and contain the same functionality, but there's currently no way to
		//apply the same XUL overlay in two different places in the same containing overlay.
		if (layoutDirPath) { CNExtend_util.mapTaggedElements('cnextend-layouts-popup', function(item) {item.ref=layoutDirPath;}, document, 'menupopup'); }
		
	}
	
	/**
	 * Copies the default layouts included with the extension to the firefox layout directory.
	 * 
	 */
	function copyDefaultLayouts() {
		try {
			var originalDirectory = CNExtend_util.getFileFromChrome("chrome://cnextend/content/Layouts");

			var layoutDirectory = CNExtend_util.getLayoutDirectory(); //creates if it doesn't exist
			var backupDirectory = CNExtend_util.getBackupDirectory(); //creates if it doesn't exist
			CNExtend_util.copyDirectoryFiles(layoutDirectory, backupDirectory); //backup layouts
			CNExtend_util.copyDirectoryFiles(originalDirectory, layoutDirectory); //copy layouts
			
			return true;
		} catch(e) {
			e.message = "Problem while copying default layouts: " + e.message;
			CNExtend_util.error(e, CNExtend_enum.errorType.CopyFiles, true);
			return false;
		}		
	}
					
	//PUBLIC FUNCTIONS----------------------------------------------
		
	/**
	 * 	Initializes CNExtend including the menus, preference observer, and table validators.
	 * 
	 */
	this.init = function() {
		CNExtend_util.normalLog("Initializing CNExtend.");
		document.getElementById("CNExtend-panel").addEventListener("click", CNExtend_main.leftClickViewStatus, false);
		
		try {
			var x = CNExtend_XML;
			CNExtend_table.selfDescriptionList = x.getListFromPath(x.getValidationAccumulator(), "chrome://cnextend/content/Validation/selfDescription.xml");
			CNExtend_table.extendedSelfDescriptionList = x.getListFromPath(x.getValidationAccumulator(), "chrome://cnextend/content/Validation/extendedSelfDescription.xml");
		} catch(e) {
			CNExtend_util.error(e, CNExtend_enum.errorType.CriticalFileMissing);
			return false;
		}
		
		CNExtend_util.normalLog("Checking to see if this is a new install");

		var installMarker = CNExtend_util.getFileFromChrome("chrome://cnextend/content/install.marker");
		
		if (installMarker.exists()) { //if the extension was just installed or upgraded:
			CNExtend_global.syncMessages();
			CNExtend_global.messages.add("You've just installed the latest version of CNExtend!"
				+ " Click the link to find out what's new in this version. If you're a first time user, "
				+ "right click (or control-click for Mac) on the CNx logo in the lower right hand corner of your browser for more options.",
				CNExtend_enum.messageType.VersionMessage,
				"Click to see what's new!",
				CNExtend_enum.website + "category/version-notes/");
			copyDefaultLayouts();
			installMarker.remove(false);
		}
			
		setupLayoutPopupMenus();

		var appcontent = document.getElementById("appcontent"); // browser
		if (appcontent) { appcontent.addEventListener("DOMContentLoaded", onPageLoad, true); }

		document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", CNExtend_display.decorateContextMenu, true);

		CNExtend_global.syncMessages();

		CNExtend_util.debugLog("Initializing Observer");
		CNExtend_util.PrefObserver.startup();
		
		return true;
	};
	
	this.cleanup = function() {
		CNExtend_util.PrefObserver.shutdown();
		var appcontent = document.getElementById("appcontent"); // browser
		if (appcontent) { 
			appcontent.removeEventListener("DOMContentLoaded", onPageLoad, true);
		}
		
		document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", CNExtend_display.decorateContextMenu, false);
	};

	this.enableCNExtend = function() { CNExtend_util.PrefObserver.setBoolPreference(CNExtend_enum.IS_ENABLED_PREF, true); };

	this.disableCNExtend = function() { CNExtend_util.PrefObserver.setBoolPreference(CNExtend_enum.IS_ENABLED_PREF, false); };
	
	this.setLayoutPath = function(pathToSet) { CNExtend_util.PrefObserver.setStringPreference(CNExtend_enum.SELF_LAYOUT_PATH_PREF, pathToSet); };
	
	this.selfLayoutPath = function() { return CNExtend_util.PrefObserver.getStringPreference(CNExtend_enum.SELF_LAYOUT_PATH_PREF); };
	
	this.leftClickViewStatus = function(aEvent) {
		if (aEvent.which != 1) { return false; }
		
		if (CNExtend_global.messages.length() > 0) {
			CNExtend_global.viewStatus();
		} else {
			//There isn't anything on our options page worth looking at, so.. how about no. (uncommented for now)
			CNExtend_global.viewOptions();
		}
		return true;
	}
	
	this.helpPage = function() { CNExtend_util.newTabSite(CNExtend_enum.website + CNExtend_enum.helpPage); }
	
}();