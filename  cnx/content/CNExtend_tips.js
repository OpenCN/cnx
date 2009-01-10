var CNExtend_tips = new function() {
	var that = this;
	
	var currentShowingTip = null;

	/**
	 * Given an event, the dom node of a tip is returned
	 * 
	 */
	function getAssociatedTipFromEvent(aEvent) {
		try {
			var parentTableNode = aEvent.originalTarget.parentNode;
			while (parentTableNode.nodeName != "TD") { //We go up higher in the DOM tree until we hit a TD.
				parentTableNode = parentTableNode.parentNode;
			}
			var associatedTip = parentTableNode.getElementsByTagName("cnextendtip")[0];
			return associatedTip;
		} catch(e) {
			CNExtend_util.error("We failed to show this tip for some reason.", CNExtend_enum.errorType.Unknown, false);
			return null;
		}
	}

	this.applyTipsToRadioButtons = function(page) {
		var inputList = page.getElementsByTagName("input");
			
		for (var index = 0; index < inputList.length; index++) {
			if (inputList[index].getAttribute("type") == "radio") {
				var radioButton = inputList[index];
				var name = radioButton.getAttribute("value");
				
				if (CNExtend_modifiers.enumFromModifierName(name) == CNExtend_modifiers.type.Unknown) {
					//we try and get a name from 
					name = radioButton.parentNode.parentNode.getElementsByTagName("td")[1].getElementsByTagName("b")[0].innerHTML;
				}
				
				var newTip = CNExtend_tips.createTip(page, name).decorateWithPrediction(1, page);
				CNExtend_tips.applyTip("cnextend-purchase-tip-layout", newTip, radioButton);
			}
		}
	};

	/**
	 * Displays the tip associated with the target element.
	 * 
	 */
	function showTip(aEvent) {
		var tip = getAssociatedTipFromEvent(aEvent);
		
		if (tip) tip.show();
	}
	
	function lockTip(aEvent) {
		var tip = getAssociatedTipFromEvent(aEvent);
		if (tip) {
			tip.locked = true;
			tip.show();
		}
	}
	
	function unlockTip(aEvent) {
		var tip = getAssociatedTipFromEvent(aEvent);
		if (tip) {
			tip.locked = false;
			tip.hide();
		}
	}
	
	/**
	 * Hides the tip associated with the target element.  Does nothing if tip is 'locked'.
	 * 
	 */
	function hideTip(aEvent) {
		var tip = getAssociatedTipFromEvent(aEvent);
		
		if (tip) tip.slowHide();
	}

	function changeTip(aEvent) {
		var tip = getAssociatedTipFromEvent(aEvent);
		var page = aEvent.originalTarget;
		   while (!page.location) page = page.parentNode;
			  
		if (tip) {
			var numberForm = getNumberForm(tip.parentNode);
			if (numberForm && CNExtend_data.getSessionData(page)) {
				var numberToDelete = parseInt(numberForm.value);
				var maxToDelete = 5;
				if (tip.modifierObject) {
					maxToDelete = tip.modifierObject.getCount(CNExtend_data.getSessionData(page).modifiers);
				}
				
				if (isNaN(numberToDelete) || numberToDelete < 1 || numberToDelete > maxToDelete) {
					tip.decorateWithPrediction(-1, page);
				} else {
					tip.decorateWithPrediction(numberToDelete * -1, page);
				}
			}
		}
	}
	
	function getNumberForm(tipElement) {
		var numberForm = tipElement.parentNode.getElementsByTagName("input")[0];
		if (numberForm && numberForm.name == "Decommission") {
			return numberForm;
		}
		return null;
	}

	this.applyTip = function(layoutClass, tip, elementToApplyTo) {
		var layoutDIV = elementToApplyTo.ownerDocument.createElement("div");
		layoutDIV.setAttribute("class", layoutClass);

		elementToApplyTo.parentNode.insertBefore(layoutDIV, elementToApplyTo.nextSibling);
		tip.hide();
		layoutDIV.appendChild(tip);
		elementToApplyTo.addEventListener("mouseover", showTip, false);
		elementToApplyTo.addEventListener("mouseout", hideTip, false);
		var numberForm = getNumberForm(elementToApplyTo);
		if (numberForm) {
			numberForm.addEventListener("focus", lockTip, false);
			numberForm.addEventListener("blur", unlockTip, false);
			numberForm.addEventListener("keyup", changeTip, false);
		}
	};
	
	this.applyTipsToExpandableDeleteImages = function(page) {
		var imageList = page.getElementsByTagName("img");
		
		for (var index = 0; index < imageList.length; index++) {
			var title = imageList[index].title;
			if (title && title == "Decommission Improvement") {
				var deletionImage = imageList[index];
				var actionString = deletionImage.parentNode.getElementsByTagName("form")[0].action;			
				identifyAndApplyTo(page, deletionImage, actionString);
			}	
		}		
	};
	
	this.applyTipsToDeleteButtons = function(page) {
		var anchorList = page.getElementsByTagName("a");
		
		for (var index = 0; index < anchorList.length; index++) {
			var href = anchorList[index].getAttribute("href");
			if (href && href.match("purchase_destroy.asp")) {
				var deletionImage = anchorList[index];
				
				identifyAndApplyTo(page, deletionImage, href);
			}
		}
	};

	function identifyAndApplyTo(page, elementToApplyTo, improvementString) {
		improvementString = improvementString.replace(/%20/," ");
		improvementExpression = new RegExp("Improvement=([A-z]+[ ]?[A-z]+)&"); //it says "improvement" even for wonders
		var found = improvementString.match(improvementExpression);
		if (found) {
			var name = found[1];
			var newTip = CNExtend_tips.createTip(page, name).decorateWithPrediction(-1, page);
			CNExtend_tips.applyTip("cnextend-delete-tip-layout", newTip , elementToApplyTo);
		}
	} 
		
	/**
	 * Creates an improvement or wonder tip with information for the player on the effect of that improvement.
	 *
	 */
	this.createTip = function(page, name) {
		var newTipContainer = page.createElement("cnextendtip");
		newTipContainer.setAttribute("class", "CNxTipContainer");
		newTipContainer.modifierObject = CNExtend_modifiers.objectFromImprovementName(name);
		newTipContainer.linkValue = name;
		
		newTipContainer.name = function() {
			if (newTipContainer.modifierObject) {
				return newTipContainer.modifierObject.name;	
			} else {
				return newTipContainer.linkValue;
			}
		};
		
		newTipContainer.slowHide = function() {
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = 0;
			}
			
			currentShowingTip = this;
        	this.timer = setTimeout(currentShowingTip.hide, 100);
		};
		
		newTipContainer.hide = function() {
			if (!this.locked) {
				newTipContainer.style.setProperty("visibility", "hidden", "important");
			}
		};
		
		newTipContainer.show = function() {
			if (currentShowingTip) {
				currentShowingTip.hide();
				clearTimeout(this.timer);
			}

			newTipContainer.style.setProperty("visibility", "visible", "important");
		};

		newTipContainer.setDisplayName = function(name) {
			this.getElementsByTagName("tiptitle")[0].textContent = name;
		};
		
		newTipContainer.clearTextItems = function() {
			child(this, "div").innerHTML = "";
		};
		
		newTipContainer.addTextItem = function(title) {
			function addCommas(nStr) {
				nStr += '';
				x = nStr.split('.');
				x1 = x[0];
				x2 = x.length > 1 ? '.' + x[1] : '';
				var rgx = /(\d+)(\d{3})/;
				while (rgx.test(x1)) {
					x1 = x1.replace(rgx, '$1' + ',' + '$2');
				}
				return x1 + x2;
			}

			//create newTextItem container and append title
			var newTextItem = this.ownerDocument.createElement("textitem");
			["textitemtitle", "br"].forEach(sub, newTextItem);
			child(newTextItem, "textitemtitle").textContent = title;

			newTextItem.text = function(text, isNumber) {
				var textSpan = page.createElement("span");

				if (isNumber) {
					if (parseInt(text) > 0) {
						textSpan.setAttribute("class", "increase");
						text = "+" + text;
					} else if (parseInt(text) < 0) {
						textSpan.setAttribute("class", "decrease");
					}
					text = addCommas(text);
				}
				textSpan.textContent = text;
				this.appendChild(textSpan);
				return this;
			};
			
			child(this, "div").appendChild(newTextItem);
			return newTextItem;
		};
		
		newTipContainer.decorateWithPrediction = function(improvementChange, page) {
			var playerData = CNExtend_data.getSessionData(page);

			this.clearTextItems();

			var changeMultipleText = "";
			
			if (Math.abs(improvementChange) > 1) {
				changeMultipleText = " X " + Math.abs(improvementChange);
			}
			
			if (improvementChange < 0) {
				this.setDisplayName("Destroy " + this.name() + changeMultipleText);
			} else if (improvementChange > 0) {
				this.setDisplayName("Purchase " + this.name() + changeMultipleText);
			}
			
			if (!playerData) { //Then the player data is stale or missing.
				this.addTextItem("").text("CNx doesn't have current data to base predictions on.");
				this.addTextItem("").text("To update prediction data, view your nation.");
			} else if (playerData.unpredictable) {
				this.addTextItem("").text("An improvement was destroyed or added with an unpredictable effect.");
				this.addTextItem("").text("View your nation again to get updated information for estimates.");
			} else {
				if (newTipContainer.modifierObject) {
					newTipContainer.modifierObject.addDecorationText(this, playerData, improvementChange);
				} else {
					this.addTextItem("").text("No info on this item at the moment");
				}
			}
			return this;
		};
		
		['tipheader', 'blockquote', 'img'].forEach(sub, newTipContainer);
		['tiptitle', 'div'].forEach(sub, child(newTipContainer, 'blockquote'));

		child(child(newTipContainer, "blockquote"), "div").setAttribute("class", "textitems");
		newTipContainer.addEventListener("mouseover", function(aEvent) { currentShowingTip.show(); }, false);
		newTipContainer.addEventListener("mouseout", function() { currentShowingTip.slowHide(); }, false);
		
		child(newTipContainer, "tipheader").textContent = "CNxtimate";
		child(newTipContainer, "img").setAttribute("src", "chrome://cnextend/content/Icons/tip-rounded.gif");
		child(newTipContainer, "img").setAttribute("class", "CNxTipPointer");

		return newTipContainer;
	};
		
	function sub(newNodeName) {
		var tempNode = this.ownerDocument.createElement(newNodeName);
		this.appendChild(tempNode);
	}
	
	function child(node, childTagName) {
		return node.getElementsByTagName(childTagName)[0];
	}
};
