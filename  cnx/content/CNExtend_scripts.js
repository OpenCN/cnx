var CNExtend_scripts = new function() {
	var that = this;

	function CN_scripts() {
		return ["chrome://cnextend/content/DomQuery.js",
				"chrome://cnextend/content/date-functions.js",
				"chrome://cnextend/content/CNExtend_exception.js",
				"chrome://cnextend/content/CNExtend_XML.js",
				"chrome://cnextend/content/CNExtend_editor.js",
				"chrome://cnextend/content/CNExtend_table.js",
				"chrome://cnextend/content/CNExtend_display.js",
				"chrome://cnextend/content/CNExtend_tips.js",
				"chrome://cnextend/content/CNExtend_main.js",
				"chrome://cnextend/content/jquery-1.3.2.js",
				"chrome://cnextend/content/CNExtend_global.js"
				];
	}

	function shared_scripts() {
		return ["chrome://cnextend/content/CNExtend_enum.js",
				"chrome://cnextend/content/json2.js",
				"chrome://cnextend/content/CNExtend_util.js",
				"chrome://cnextend/content/CNExtend_data.js",				
				"chrome://cnextend/content/CNExtend_modifiers.js",
				"chrome://cnextend/content/CNExtend_improvements.js",
				"chrome://cnextend/content/CNExtend_governments.js",
				"chrome://cnextend/content/CNExtend_wonders.js",
				"chrome://cnextend/content/CNExtend_resources.js"];
	}
	
	function all_scripts() { return shared_scripts().concat(CN_scripts()); }

	this.loadSharedXULScripts = function() { that.loadXULScripts(shared_scripts()); };

	this.loadCNXULScripts = function() {
		that.loadSharedXULScripts();
		that.loadXULScripts(CN_scripts());
	};

	this.loadXULScripts = function(scriptArray) {
		var jsLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
		for (scriptName in scriptArray) { jsLoader.loadSubScript(scriptArray[scriptName]); }
	};

	function staticLoadScript(url) { document.write('<script src="', url, '" type="text/JavaScript"><\/script>'); }

	/*
	 * This is just called from JSUnit
	 */
	this.loadHTMLScripts = function() {		
		for (scriptName in all_scripts()) { staticLoadScript(all_scripts()[scriptName]); }				
	};
};
