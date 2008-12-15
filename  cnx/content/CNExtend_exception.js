//Lists all the enumerations that we need

var CNExtend_exception = new function() {
	
	this.Base = function(message)
	{	
		this.message = message;
		this.toString = function()
		{
			return this.message;
		}
	}
	
	this.IllegalArgument = function(message)
	{
		this.message = "Illegal Argument: " + message;
	}
	this.IllegalArgument.prototype = new this.Base;
	
	this.Iterator = function(message)
	{
		this.message = message;
	}
	this.Iterator.prototype = new this.Base;
			
	this.MissingAttribute = function(tagName, attribute)
	{
		this.tagName = tagName;
		this.attribute = attribute;
		if (this.tagName == "sourcetext")
		{
			this.message = "It looks like one of the tags in your layout wasn't properly closed, look to see if a tag is missing a / at the end.";
		}
		else
		{
			this.message = "An element with a tag of [" + this.tagName + "] was missing the [" + this.attribute +  "] attribute.";
		}
	}
	this.MissingAttribute.prototype = new this.Base;

	this.XMLLoad = function(file, reason)
	{
		this.file = file;
		this.reason = reason;
		this.message = "Couldn't load: " + file + " because " + reason;
	}
	this.XMLLoad.prototype = new this.Base;

	this.ValidationError = function(matchWord, columnText)
	{
		this.message = "We were expecting to find [" + matchWord + "], but instead we found [" + columnText + "].";
	}
	this.ValidationError.prototype = new this.Base;		
	
};