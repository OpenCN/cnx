//Any transformation or display function, including table related objects

var CNExtend_display = new function () {
	var bindingList = [	"chrome://cnextend/skin/CNx_editor.css",
						"chrome://cnextend/skin/CNx_tips.css",
						"chrome://cnextend/skin/CNx_tablehide.css",
						"chrome://cnextend/skin/CNx_defaultWindow.css"];

	var that = this;

	//PUBLIC FUNCTIONS----------------------------------------------
	/**
	 * Refreshes the list of user tables.  A user table is generated whenever the player views their nation,
	 * where the table is the HTML table underneath tabs.
	 * 
	 */
	this.refreshSelfLayoutList = function()
	{
		try
		{
			var x = CNExtend_XML;
			var FilePath = CNExtend_util.PrefObserver.getStringPreference(CNExtend_enum.SELF_LAYOUT_PATH_PREF);
			CNExtend_global.selfLayoutList = x.getListFromPath(x.getTransformationAccumulator(),FilePath);
		}
		catch(e)
		{
			CNExtend_global.selfLayoutList = null;
			e.message = "There was a problem loading a layout: " + e.message;
			CNExtend_util.error(e, CNExtend_enum.errorType.Transformation, false);
		}
		//Since our layout is changed, we need to refresh any tables currently displaying things
		CNExtend_global.selfTables.refreshLayouts(CNExtend_global.selfLayoutList);
	}
	
	this.decorateContextMenu = function()
	{
		that.refreshPopupMenuItems( document.getElementById('contentAreaContextMenu'));
	}
	
	/**
	 * This refreshes the layout menu list and makes sure that the current, activated layout is checked.
	 * 
	 * @param {Object} popup	The menu in question.  
	 */
	this.decorateLayoutPopup = function(popup)
	{
		if (popup.builder)
		{
			popup.builder.refresh();
			popup.builder.rebuild();
		}
		var nodelist = popup.childNodes;
		for (var i=0; i < nodelist.length; i++)
		{
			if ((CNExtend_main.selfLayoutPath() == null) || CNExtend_main.selfLayoutPath() == '')
			{
				if (nodelist[i].tagName =="menuitem" && (nodelist[i].getAttribute('label') == 'No Layout'))
				{
					nodelist[i].setAttribute("checked", "true");
				}
				else
				{
					nodelist[i].setAttribute("checked", "false");
				}
			}
			else
			{
				if (nodelist[i].tagName == "menuitem" && (nodelist[i].value == CNExtend_main.selfLayoutPath()))
				{
					nodelist[i].setAttribute("checked", "true");
				}
				else
				{
					nodelist[i].setAttribute("checked", "false");
				}
			}
		}
	}

	this.refreshPopupMenuItems = function(me)
	{
		
		if (CNExtend_util.PrefObserver.getBoolPreference(CNExtend_enum.IS_ENABLED_PREF)) //then our preferences have CNExtend enabled
		{
			document.getElementById("CNExtend-enable").hidden = true;
			document.getElementById("CNExtend-disable").hidden = false;
			CNExtend_util.mapTaggedElements("CNExtend-layouts", function(item) {item.hidden = false}, me)
			if (CNExtend_main.atCN(CNExtend_util.getActiveDocument()))
			{
				CNExtend_util.mapTaggedElements("CNExtend-contextlayouts", function(item){item.hidden = false },me)
			}
			else
			{
				CNExtend_util.mapTaggedElements("CNExtend-contextlayouts", function(item){item.hidden = true },me)
			}
			if (CNExtend_global.selfTables.getTableIndex(CNExtend_util.getActiveDocument()) != -1)
			{
				CNExtend_util.mapTaggedElements("LayoutEditor", function(item) {item.hidden=false}, me);
			}
			else
			{
				CNExtend_util.mapTaggedElements("LayoutEditor", function(item) {item.hidden=true}, me);
			}
		}
		else
		{
			document.getElementById("CNExtend-enable").hidden = false;
			document.getElementById("CNExtend-disable").hidden = true;
			CNExtend_util.mapTaggedElements("CNExtend-layouts", function(item) {item.hidden = true}, me)
			CNExtend_util.mapTaggedElements("CNExtend-contextlayouts", function(item){item.hidden = true}, me)
		}
	
	}
	
	/**
	 * Set the status icon based on current preferences.
	 * 
	 */
	this.refreshStatusPanel = function()
	{
		//refresh enabled/disabled status icon
		var panel = document.getElementById("CNExtend-panel");
		
		if (CNExtend_util.PrefObserver.getBoolPreference(CNExtend_enum.IS_ENABLED_PREF)) //then our preferences have CNExtend enabled
		{
			if (CNExtend_global.messages.length() > 0)
			{
				var message = CNExtend_global.messages.item(0);
				if (message.type == CNExtend_enum.messageType.VersionMessage)
				{					
					panel.src = "chrome://cnextend/content/Icons/mail-anim.gif";
					panel.tooltipText = "Click to read CNx messages.";
				}
				else
				{
					panel.src = "chrome://cnextend/content/Icons/error.png";
					panel.tooltipText = "Error: Click for more information."
				}
			}
			else
			{
				panel.src = "chrome://cnextend/content/Icons/Statusbar-icon_enabled.gif";
				panel.tooltipText = "CNExtend is enabled.";				
			}
		}
		else
		{
			panel.src = "chrome://cnextend/content/Icons/Statusbar-icon_disabled.gif";
			panel.tooltipText = "CNExtend is disabled.";
		}
	}
	
	/**
	 * Loads or unloads CSS tables related to CNExtend based on observed preferences.
	 * 
	 */
	this.refreshCSS_State = function()
	{
		if (CNExtend_util.PrefObserver.getBoolPreference(CNExtend_enum.IS_ENABLED_PREF))
		{
			bindingList.forEach(CNExtend_util.loadCSS)
		}
		else //we unload these sheets
		{
			bindingList.forEach(CNExtend_util.unloadCSS)
		}
	}				
}