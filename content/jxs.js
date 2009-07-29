

CNExtend_AJAX = {
	//Create a xmlHttpRequest object - this is the constructor. 
	getHTTPObject : function() {
		var http = false;
		//Use IE's ActiveX items to load the file.
		//If ActiveX is not available, use the XMLHttpRequest of Firefox/Mozilla etc. to load the document.
		if (window.XMLHttpRequest) {
			try {http = new XMLHttpRequest();}
			catch (e) {http = false;}
		}
		return http;
	},
	
	// This function is called from the user's script. 
	//Arguments - 
	//	url	- The url of the serverside script that is to be called. Append all the arguments to 
	//			this url - eg. 'get_data.php?id=5&car=benz'
	//	callback - Function that must be called once the data is ready.
	//	format - The return type for this function. Could be 'xml','json' or 'text'. If it is json, 
	//			the string will be 'eval'ed before returning it. Default:'text'
	//	method - GET or POST. Default 'GET'
	load : function (url, method, content, callback, errorCallback) {
		var http = this.init(); //The XMLHttpRequest object is recreated at every call - to defeat Cache problem in IE
		if(!http||!url)
			return;

		if(!method)
			method = "GET";//Default method is GET
		method = method.toUpperCase();

		http.open(method, url, true);

		if(method=="POST") {
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http.setRequestHeader("Content-length", parameters.length);
			http.setRequestHeader("Connection", "close");
		}

		http.onreadystatechange = function () {//Call a function when the state changes.
			if (http.readyState == 4) {//Ready State will be 4 when the document is loaded.
				if(http.status == 200) {
					var result = CNExtend_util.createObjectFromJSON(http.responseText);
					//Give the data to the callback function.
					if(callback)
						callback(result);
				} else {
					if(errorCallback) 
						errorCallback(http.status);
				}
			}
		}
		http.send(content);
	},
	init : function() {return this.getHTTPObject();}
}
