CNExtend_scripts.loadSharedXULScripts();

var CNx_options = new function() {
	this.init = function(){
		var oldData, effect, elem, elemval;
		
		var effects = {
			dollar: function(data){ CNExtend_modifiers.cashEffect(1)(data, 1); return [data, "info-dollar"]; },
			pophap: function(data){ CNExtend_modifiers.happinessEffect(1)(data, 1); return [data, "info-pophap"]; },
			enviro: function(data){ CNExtend_modifiers.enviroEffect(-1)(data, 1); return [data, "info-enviro"]; }
		};
		
		for (k in effects) {
			effect = effects[k](CNExtend_data.getStoredSessionData());
			elem = document.getElementById(effect[1]);
			elemval = CNExtend_data.incomeDifference(effect[0], CNExtend_data.getStoredSessionData());
			elem.value = "$" + CNExtend_util.numberToText(elemval);
			if (elemval > 0) {
				elem.setAttribute("style", "color: green;");
			} else if (elemval < 0) {
				elem.setAttribute("style", "color: red;");
			} else if (elemval == 0) {
				elem.setAttribute("style", "color: gray;");
			}
		}

		window.removeEventListener("load", CNx_options.init, false);
	};
};

window.addEventListener("load", CNx_options.init, false);