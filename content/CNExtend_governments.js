
var CNExtend_governments = new function () {
	var that = this;
	
	this.type = {Unknown: 0,
						 Anarchy: 10,
						 Capitalist: 11,
						 Communist: 12, 
						 Democracy: 13,
						 Dictatorship: 14,
						 Federal: 15,
						 Monarchy: 16,
						 Republic: 17,
						 Revolutionary: 18,
						 Totalitarian: 19,
						 Transitional: 20}

	this.firstNumber = 10;
	this.lastNumber = 20;

	this.governmentStringsHash = new Object();
	this.governmentStrings = new Array();
	populateGovernmentStringsHash();

	this.enumFromString = function(governmentString)
	{
		ucGovString = governmentString.toUpperCase();
		for(var counter = this.firstNumber; counter <= this.lastNumber; counter++)
		{
			if (ucGovString.match(that.governmentStringsHash[counter]))
			{
				return counter;
			}
		}
		return that.type.Unknown;
	}

	function populateGovernmentStringsHash()
	{
		var rt = that.type;
		add(rt.Anarchy,"ANARCHY");
		add(rt.Capitalist,"CAPITALIST");
		add(rt.Communist, "COMMUNIST");
		add(rt.Democracy, "DEMOCRACY");
		add(rt.Dictatorship, "DICTATORSHIP");
		add(rt.Federal, "FEDERAL");
		add(rt.Monarchy, "MONARCHY");
		add(rt.Republic, "REPUBLIC");
		add(rt.Revolutionary, "REVOLUTIONARY");
		add(rt.Totalitarian, "TOTALITARIAN");
		add(rt.Transitional, "TRANSITIONAL");
		
		function add(name, number)
		{
			that.governmentStrings.push(name);
			that.governmentStringsHash[name] = number;
		}
	}
}	