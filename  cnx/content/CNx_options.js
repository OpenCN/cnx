
CNExtend_scripts.loadSharedXULScripts();

var CNx_options = new function() {
	this.init = function(){
		var countChange = -1; //This is important if you are predicting the addition multiple improvements of the same type.  For this purpose it will always be one.
		var modifier =  1;  //In this case the modifier is one, i.e. 1 dollar.
		var oldData = CNExtend_data.getStoredSessionData(); //This gets the stored player data in JSON format.  It does not check to see if it is out of date or if it exists, so we're going to have to address that.
		var newData = CNExtend_data.getStoredSessionData(); //this will be updated by the cashEffect function after we call it.
		debugger;
		CNExtend_modifiers.cashEffect(modifier)(newData, countChange); //Here we're getting the total effect.  The newData variable has now been updated with all the effects of the cash change.

		var effectOnIncome = CNExtend_data.incomeDifference(newData, oldData);
		//alert("a dollar:" + effectOnIncome)
		
		oldData = CNExtend_data.getStoredSessionData(); //This gets the stored player data in JSON format.  It does not check to see if it is out of date or if it exists, so we're going to have to address that.
		newData = CNExtend_data.getStoredSessionData(); //this will be updated by the cashEffect function after we call it.
		CNExtend_modifiers.happinessEffect(modifier)(newData, countChange); //Here we're getting the total effect.  The newData variable has now been updated with all the effects of the cash change.
		effectOnIncome = CNExtend_data.incomeDifference(newData, oldData);
		//alert("1 pt happiness:" + effectOnIncome)

		
		window.removeEventListener("load", CNx_options.init, false);
	};	
}

window.addEventListener("load", CNx_options.init, false);