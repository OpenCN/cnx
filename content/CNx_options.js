CNExtend_scripts.loadSharedXULScripts();

var CNx_options = new function() {
	this.init = function(){
		var countChange = 1; //This is important if you are predicting the addition multiple improvements of the same type.  For this purpose it will always be one.
		var modifier = 1;  //In this case the modifier is one, i.e. 1 dollar.
		var oldData, newData, effectOnIncome;
		
		/* Dollar effect */
			oldData = CNExtend_data.getStoredSessionData(); newData = CNExtend_data.getStoredSessionData();
			CNExtend_modifiers.cashEffect(modifier)(newData, countChange);
			effectOnIncome = CNExtend_data.incomeDifference(newData, oldData);
			document.getElementById("info-dollar").value = effectOnIncome;
		/* /Dollar */
		
		/* Happiness effect */
			oldData = CNExtend_data.getStoredSessionData(); newData = CNExtend_data.getStoredSessionData();
			CNExtend_modifiers.happinessEffect(modifier)(newData, countChange);
			effectOnIncome = CNExtend_data.incomeDifference(newData, oldData);
			document.getElementById("info-pophap").value = effectOnIncome;
		/* /Happiness */
		
		/* Enviroment effect */
			oldData = CNExtend_data.getStoredSessionData(); newData = CNExtend_data.getStoredSessionData();
			CNExtend_modifiers.enviroEffect(-1)(newData, countChange);
			effectOnIncome = CNExtend_data.incomeDifference(newData, oldData);
			document.getElementById("info-environment").value = effectOnIncome;
		/* /Enviroment */
		

		window.removeEventListener("load", CNx_options.init, false);
	};
}

window.addEventListener("load", CNx_options.init, false);