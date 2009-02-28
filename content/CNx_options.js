CNExtend_scripts.loadSharedXULScripts();

var CNx_options = new function(){
	var that = this;
	this.init = function(){
		window.removeEventListener("load", CNx_options.init, false);
		that.calc();
	};
	this.calc = function(){
		var oldData, effect, elem, elemval;
		
		var effects = {
			income: function(data){ CNExtend_modifiers.cashEffect(id("mod-income").value)(data, 1); return [data, "info-income"]; },
			pophap: function(data){ CNExtend_modifiers.happinessEffect(id("mod-pophap").value)(data, 1); return [data, "info-pophap"]; },
			enviro: function(data){ CNExtend_modifiers.enviroEffect(id("mod-enviro").value)(data, 1); return [data, "info-enviro"]; }
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
	};
	function id(i) { return document.getElementById(i); }
};

window.addEventListener("load", CNx_options.init, false);