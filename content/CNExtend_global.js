

var CNExtend_global = new function()
{
	this.selfTables = new CNExtend_table.CNTableList();
	this.selfLayoutList = null;
	this.messages = new messageList();
	
	var that = this;
	
	/**
	 * A managed list of messages
	 */
	function messageList()
	{
		var list = new Array();
		
		this.clear = function()
		{
			list.splice(0, list.length);
			CNExtend_display.refreshStatusPanel();
		}
		
		this.add = function(content, type, title, link)
		{
			list.push(new message(content, type, title, link));
			CNExtend_display.refreshStatusPanel();
		}

		this.item = function(index)
		{
			return list[index];
		}
	
		this.length = function()
		{
			return list.length;
		}
		
		function message(content, type, title, link)
		{
			this.content = content; //HTML
			this.type = type; //CNExtend_enum.messageType
			this.title = title; //string
			this.link = link; //web address or null
		}
	}
	
	this.viewLayouts = function()
	{
		var file = CNExtend_util.getLayoutDirectory().QueryInterface(Components.interfaces.nsILocalFile);
		try {
			file.reveal();		
		} catch (e) {
 	       openExternal(file);
 	    }
 	}
	
	this.viewOptions = function()
	{
		window.open('chrome://cnextend/content/CNx_options.xul', 'Options', 'chrome,toolbar,modal,centerscreen', CNExtend_global);
	}
	
	this.viewStatus = function()
	{
		window.openDialog('chrome://cnextend/content/CNx_status.xul', 'Status', 'dialog=no,chrome=yes,modal=yes,centerscreen=yes,resizable=yes', CNExtend_global)
	}
		
}
