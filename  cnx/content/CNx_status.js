// cleaned
//CNExtend_scripts.loadSharedXULScripts();
//window.addEventListener("DOMContentLoaded", function() { CNx_status.init(); }, false);

var CNx_status = new function() {
	var that = this;
	var global = window.arguments[0];
	var statusGroupBox;

	this.init = function() {
		statusGroupBox = document.getElementById("cnextend-status-box");

		window.removeEventListener("DOMContentLoaded", function() { CNx_options.init(); }, false);

		for (var counter = 0; counter < global.messages.length(); counter++) {
			that.addMessage(global.messages.item(counter));
		}
	}
	
	this.addMessage = function(message) {
		var box = document.createElement("box");
		setMessageAttributes(box, message);
		statusGroupBox.appendChild(box);
	}

	function createErrorContainer(content) {
		var mainRow = document.createElement("box");
		
		var mainBox = document.createElement("hbox");
		mainBox.setAttribute("class", "console-row");
		mainBox.setAttribute("flex", "1");
		mainRow.appendChild(mainBox);
		
		var iconBox = document.createElement("box");
		iconBox.setAttribute("class", "console-row-icon");
		iconBox.setAttribute("flex", "1");
		mainBox.appendChild(iconBox);
		
		var iconImage = document.createElement("image");
		iconImage.setAttribute("class", "console-icon");
		iconBox.appendChild(iconImage);

		var internalBox = document.createElement("vbox");
		internalBox.setAttribute("flex", "1");
		mainBox.appendChild(internalBox);
		
		var label = document.createElement("text-link");
		label.setAttribute("value", "thingy");
		internalBox.appendChild(label);
		
		internalBox.appendChild(content);
		
		/*<xul:image class="console-icon" xbl:inherits="src,type"/>
			<xul:vbox class="console-internal-box" flex="1">
			<xul:label class="text-link" xbl:inherits="value=errorName,href"/>
	        <xul:vbox class="console-row-content" flex="1">
				<xul:description class="console-msg-text" xbl:inherits="xbl:text=msg"/>
	        </xul:vbox>
	      </xul:vbox> */
		 return mainRow;
	}
	
	this.clear = function() {
		CNExtend_util.removeAllChildren(statusGroupBox);
		global.messages.clear();
	};
	
	function setMessageAttributes(box, message) {
		box.setAttribute("class", "console-row");
		switch (message.type) {
			case CNExtend_enum.messageType.CriticalError :
				box.setAttribute("type", "critical");
			break;
			case CNExtend_enum.messageType.Warning :
				box.setAttribute("type", "warning");
			break;
			case CNExtend_enum.messageType.VersionMessage :
				box.setAttribute("type", "message");
			break;
		}

		box.setAttribute("msg", message.content);
		box.setAttribute("href", message.link);
		box.setAttribute("errorName", message.title);
	}
};
