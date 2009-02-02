// cleaned
//Lists all the enumerations that we need
var CNExtend_enum = new function() {
	const _prefPrefix = "extensions.cnextend.";
	
	this.pageType = { Invalid: 0, Other: 11, StandardView: 12, BattleView: 13, BattleResult: 14, ExtendedView: 15, DebugFile: 16 };
	this.logLevel = { Invalid: 0, None: 10, Normal: 11, Debug: 12};
	this.errorType = { None: 0, Unknown: 11, Validation: 12, CriticalFileMissing: 13, CopyFiles: 14, Transformation: 15, ParseImprovementTable: 16 };
	this.messageType = { Invalid: 0, CriticalError: 1, Warning: 2, VersionMessage: 3 };
	this.tableMode = { Invalid: 0, Normal: 1, Edit: 2}
	this.website = "http://www.babelphish.net/cnextend/";
	
	//paths
	this.nationPath = "/nation_drill_display.asp";
	this.improvementPath = "/improvements_purchase.asp";
	this.wonderPath = "/national_wonders_purchase.asp";
	this.techPath = "/technology_purchase.asp";
	this.infraPath = "/infrastructurebuysell.asp";
	this.soldiersPath = "/militarybuysell.asp";
	
	
	this.helpPage = "cnextend-faq-and-error-guide";
	this.backupDirectoryName = "backup";
	this.layoutDirectoryName = "CNExtend_Profiles";
	this.normalLayoutName = "normal.xml"
	
	this.SELF_LAYOUT_PATH_PREF = _prefPrefix + "selfProfilePath";
	this.IS_ENABLED_PREF = _prefPrefix + "isEnabled";
	this.DEBUG_FILES_PREF = _prefPrefix + "debug.files";
	this.TIPS_ENABLED_PREF = _prefPrefix + "tips.areEnabled";
	this.PLAYER_DATA_PREF = _prefPrefix + "playerData";
	this.MESSAGES_PREF = _prefPrefix + "messages";
};