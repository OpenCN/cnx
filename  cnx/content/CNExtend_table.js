//Any transformation or display function, including table related objects

var CNExtend_table = new function ()
{
	this.selfDescriptionList = null;  //These are only loaded once, and if the load fails the program aborts.
	this.extendedSelfDescriptionList = null;
	this.otherDescriptionList = null;
	this.extendedOtherDescriptionList = null;

	//these two things relate to the editor
	var that = this;

	/**
	 * This is more or less a factory method that returns a CNTable object.
	 * 
	 * @param page	An HTMLDocument that represents a page which we can extract a CNTable from.
	 * @return		A populated CNTable object if the page contains one, otherwise it returns null
	 */
	this.getTableFromPage = function(page)
	{
		var table = ExtCNx.query("div[class=shadetabs] + table", page)[0];

		if (table)
		{
			var tempTable = new CNTable(page, table);
			return tempTable;
		}
		
		return null;
	}
	
	/**
	 * This structure acts like a list of CNTables, so that they can all be refreshed simultaneously when the user selects a new layout.
	 * 
	 */
	this.CNTableList = function()
	{
		var tables = new Array();
		var that = this;
		
		/**
		 * Sets all the contained tables in the tableList to the layout specified by list passed in. 
		 * 
		 */
		this.refreshLayouts = function(layoutList)
		{
			for (var i=0; i < tables.length; i++) {
				tables[i].transform(layoutList);
			}
		}
		
		/**
		 * Adds a table to the tableList.
		 * 
		 * @param {Object} table 	The table to add.
		 */
		this.push = function(table)
		{
			if (table instanceof CNTable)
			{
				table.parentWindow.addEventListener("unload", remove, false);
				tables.push(table);
			}
		}
		
		/**
		 * An event handler that ensures that when a window is closed or unloaded, 
		 * the corresponding table will be removed from the list to prevent memory leaks.
		 * 
		 */
		function remove(aEvent)
		{
			var windowBeingUnloaded = aEvent.originalTarget;
			var result = (that.getTableIndex(windowBeingUnloaded));
			windowBeingUnloaded.removeEventListener("beforeunload", remove, false);
			if (result != -1)
			{
				tables.splice(result, 1);
			}
		}

		this.getTableFromDocument = function(myDocument)
		{
			for (var i=0; i < tables.length; i++)
			{
				if (tables[i].parentWindow.document == myDocument)
				{
					return tables[i];
				}
			}
			return -1;
		}

		/**
		 * Checks to see whether the tablelist has a table with a parentWindow corresponding to the window passed in.  Every new tab has a new window.
		 * 
		 * @param {Object} window	The window to check the tablelist for.
		 */
		this.getTableIndex =function(page)
		{
			for (var i=0; i < tables.length; i++)
			{
				if (tables[i].doc === page)
				{
					return i;
				}
			}
			return -1;
		}
	}

	function rowRepository(table)
	{
		var rows = {};
		var that = this;
		
		this.setRow = function(id, row) {
			if (row) {
				var td = row.getElementsByTagName("td")[0];
				if (td) {
					td.setAttribute("width", "155px");
				}
			}
			rows[id] = row;
		}
		
		this.getRow = function(rowObject, editOverride) {
			var id = rowObject;
			if (rowObject.id != null) { //then we received an object instead of just a straight ID
				id = rowObject.id;
			} else { //we create an object
				rowObject = {};
				rowObject.id = id;
			}
			
			var row = rows[id];
			if (row) {
				var cloneRow = row.cloneNode(true);
				if (row.applyData) {
					row.applyData(cloneRow, table, rowObject);
				}
				return cloneRow;
			}
		}
		
		/*
		 * Serializes rows to a string; the serialized rows will be in 'edit' mode.
		 */
		this.serialize = function()
		{
			var rowList = [];
			
			rowList.push('{');
			for (var itemIndex in rows) {
				var rowItem = itemIndex + " : '" + that.getRow(itemIndex, true).innerHTML.replace(/[\s]+/g," ").replace(/[']+/g,"\\'" ) + "'";
				rowList.push(rowItem);
				rowList.push(',');
			}
			rowList.pop();
			rowList.push(' };');
			return rowList.join('');
		}
	}

	/**
	 * This is a table that we're applying our validations and transformations to.
	 * @param {Object} page		The HTMLDocument that the table lives in.
	 * @param {Object} table	The live table element in the page that we derive a table from.
	 */
	function CNTable(page, table)
	{
		var isSelfCache = null;
		var currentMainItemList = table;
		this.viewType = typeOfViewSelected(page);
		this.validated = false;
		this.parentWindow = page.defaultView;
		this.doc = page;
		var _editMode = false;
		var parsedPlayerData = null;
		this.functionsInjected = false;
		var that = this;
		this.rowHash = new rowRepository(that); //here's our validated set of rows.  To get a row, do rowHash[id]

		function setMainItemList(newMainItemList)
		{
			var precedingItem = getNodeBeforeElement(currentMainItemList); //this is the item preceding our table
			var tableContainer = currentMainItemList.parentNode;
			tableContainer.removeChild(currentMainItemList);
			tableContainer.insertBefore(newMainItemList, precedingItem.nextSibling);
			currentMainItemList = newMainItemList;
		}

		/**
		 * Determines whether this table is the player's own nation.
		 * 
		 * @return	True if the table represents the player's own nation, otherwise it returns false.
		 */
		this.isSelf = function() {
			if (isSelfCache != null)
				return isSelfCache;
			
			var links = page.getElementsByTagName("a");
			// iterate through links until we find the one we want
			for(linkIndex = 0; linkIndex < links.length; linkIndex++)
			{
				if (links[linkIndex].textContent.match("View My Nation") != null)
				{
					var linkNationID = CNExtend_data.getNationID(links[linkIndex].href);
					if (linkNationID == CNExtend_data.getNationIDFromPage(page)) {
						isSelfCache = true;
						return isSelfCache;
					}
				}
			}
			isSelfCache = false;
			return isSelfCache;			
		}

		function getNodeBeforeElement(element)
		{
			i = -1;
			var testChild;
			while (!(testChild === element))
			{
				++i;
				testChild = element.parentNode.childNodes[i];
			}
			return element.parentNode.childNodes[i-1];
		}
	
		/*
		 * Returns the element that child items should be added to.
		 */
		function containerItem()
		{
			if (_editMode) {
				return currentMainItemList;
			}
			else {
				return currentMainItemList.getElementsByTagName('tbody')[0];
			}
		}
		
		//Determines whether the extended view or the standard view is selected
		function typeOfViewSelected(page)
		{
			var result = ExtCNx.query(".shadetabs > ul > li", page)
			if (result[0].getAttribute("class") == "selected")
			{
				return CNExtend_enum.pageType.StandardView;
			}
			if (result[1].getAttribute("class") == "selected")
			{
				return CNExtend_enum.pageType.ExtendedView;
			}			
		}
				
		this.setEditMode = function(isEditMode)
		{
			if (isEditMode != _editMode)
			{
				_editMode = isEditMode; //we set the edit mode

				that.transform(CNExtend_global.selfLayoutList);
			}
		}
		
		this.editMode = function() {
			return _editMode;
		}

		function getAppropriateValidationList()
		{
			var validationList;
			
			if (that.viewType == CNExtend_enum.pageType.StandardView)
			{
				if (that.isSelf()) {
					validationList = CNExtend_table.selfDescriptionList;
				} else {
					validationList = CNExtend_table.otherDescriptionList
				}
			}
			else if (that.viewType == CNExtend_enum.pageType.ExtendedView)
			{
				if (that.isSelf()) {
					validationList = CNExtend_table.extendedSelfDescriptionList;
				} else {
					validationList = CNExtend_table.extendOtherDescriptionList;
				}
			}
			
			return validationList;
		}

		/**
		 * Validates a table 
		 * 
		 * @exception	ValidationError			This function will throw a ValidationError if some part of the 
		 * @param 	{Object} validationList 	This is the list that the table is validated against.
		 * @return								True if the table validated against the list, otherwise false.
		 */
		this.validate = function(validationListOverride)
		{
			var validationList;
			if (validationListOverride != null)
			{
				validationList = validationListOverride;
			}
			else
				validationList = getAppropriateValidationList();
			
			if (!validationList) return false;
			
			var rowIterator = new CNExtend_util.elementNodeIterator(containerItem().childNodes);
			
			var validationNode;
			
			for (var i = 0; i < validationList.length; i++) //iterate through our validation items
			{
				validationNode = validationList[i];
				var currentRow = rowIterator.nextNode();
				validationNode.validate(currentRow);
				that.rowHash.setRow(validationNode.id, currentRow)
			}
			
			if (!(rowIterator.done())) //there are still items in the table
			{
				return false;
			}
			
			for(var customRowIndex in CNExtend_editor.customRows)
			{
				var customRow = CNExtend_editor.customRows[customRowIndex];
				that.rowHash.setRow(customRow.id, customRow.generateSelf(page));
			}
			
			this.validated = true;
			return true;
		}
		
		/**
		 * 
		 * @param {Object} rowNode This is the extracted data object from our XML layout.
		 * 
		 */
		this.addRow = function(rowObject)
		{
			var element = that.rowHash.getRow(rowObject);

			if (!element) //this is a row we don't have in our table (for instance, one that only exists in extended mode)
			{
				if (_editMode) //we create a placeholder
				{
					element = page.createElement('tr');
	
					//iterate through our extended description to find the name corresponding to the id.
					var list = CNExtend_table.extendedSelfDescriptionList;
					var rowName = rowObject.id;
					for (var index in list)
					{
						if (list[index].id == rowObject.id)
							rowName = list[index].name;
					}

					CNExtend_editor.autoload.generatePlaceHolder(rowName,element);
				}
			}

			if (element != null)
			{
				element.setAttribute('type', 'item');
				element.setAttribute('itemid', rowObject.id);
				addTableItem(element)
			}
		}
		
		/**
		 * Adds a new header to the table in the style of the current headers, with the text provided.
		 * 
		 * @param text	The text the new header should have.
		 */
		this.addHeader = function(text)
		{
			//We take a random header so that hopefully if the style changes our new headers will have the same style
			var newHeaderShell = this.rowHash.getRow("PrivateMessagesHeader");
			var innerTD = newHeaderShell.getElementsByTagName("td")[0]
			innerTD.innerHTML = "&nbsp&nbsp<b><font color='#ffffff'>:. " + text + " </font></b>";
			newHeaderShell.setAttribute('type', 'newHeader');
			newHeaderShell.setAttribute('text', text);
			addTableItem(newHeaderShell)
		}
		
		function addTableItem(element)
		{
			if (_editMode)
			{
				var listItemParent = element.ownerDocument.createElement("li");
				CNExtend_editor.autoload.addCloseButton(listItemParent);
				listItemParent.setAttribute("class", "draggableRow");
				var tableWrapper = table.cloneNode(false); //we are wrapping our items in individual clones of our big table
				listItemParent.appendChild(tableWrapper);
				tableWrapper.appendChild(element);
				tableWrapper.setAttribute('onmouseover', 'if (dragRowTitleOn != null) dragRowTitleOn()');
				tableWrapper.setAttribute('onmouseout', 'if (defaultTitleOn != null) defaultTitleOn()');
				
				element = listItemParent;				
			}
			
			containerItem().appendChild(element);
		}		
		
		/**
		 * Applies a transformation to the validated table.
		 *
		 *@param transformationList The list of transformations which define how the table will look.  If this is null, then the table reverts to its original state.
		 *@return 					True if the transformation was succesful, otherwise false.
		*/
		this.transform = function(transformationList)
		{
			if (!transformationList) //revert to how the table was originally
			{
				that.revert();
				return false;
			}
			
			if (this.validated)
			{
				var newMainItemList;
				if (_editMode)
				{
					newMainItemList = currentMainItemList.ownerDocument.createElement("ul");
					newMainItemList.setAttribute("id", "mainSortable");
				}
				else // we generate a regular table
				{
					newMainItemList = table.cloneNode(false);
					newMainItemList.innerHTML = "<tbody></tbody>";
				}
				
				setMainItemList(newMainItemList);
				for(var i=0; i < transformationList.length; i++)
				{
					//apply each transformations node addition to this table
					transformationList[i].addNodeTo(this);
				}
				
				currentMainItemList.setAttribute('layout', 'modified');
				
				if (_editMode) //ensure that the sortables are loaded and turned on.
				{
					if (!page.getElementById('window_content')) //create window
					{
						CNExtend_util.injectTextScript(page, 'launchWindow();')
					}
					CNExtend_editor.populateWindow(that)
				}
				
				return true;
			}
			else
			{
				CNExtend_util.error("We tried to transform this table without validating it.", CNExtend_enum.errorType.Transformation);
				return false;
			}
		}
				
		this.length = function()
		{
			var rowIterator = new CNExtend_util.elementNodeIterator(containerItem().childNodes);
			var count = 0;
			while (!(rowIterator.done()))
			{
				count++;
				rowIterator.nextNode();
			}
			return count;
		}
		
		/**
		 * 	Reverts the table to its original state, regardless of the transformations that have been performed.
		 */
		this.revert = function()
		{
			setMainItemList(table);
			currentMainItemList.setAttribute('layout', 'modified');
		}
		
		/**
		 * Serializes the table to an XML layout 
		 */
		this.serializeToXML = function()
		{
			var serialization = '<transformation version="1">\n';
			var rowIterator = new CNExtend_util.elementNodeIterator(containerItem().childNodes);
			
			while (!rowIterator.done()) {
				var currentRow = rowIterator.nextNode().getElementsByTagName('tr')[0];
				var type = currentRow.getAttribute('type');
				if (type == 'newHeader') {
					serialization += '<newHeader text="' + currentRow.getAttribute('text') + '"/>\n';
				}
				else if (type == 'item') {
					serialization += '<item id="' + currentRow.getAttribute('itemid') + '" ';
					for (attrIndex in currentRow.attributes) {
						var attribute = currentRow.attributes[attrIndex];
						if  ((attribute.name) && (attribute.name != 'itemid') && (attribute.name != 'type') && (attribute.name != 'id')) {
							serialization += attribute.name + '="' + attribute.value + '" ';
						}
					}
					serialization += '/>\n';
				}
			}
			
			serialization += '</transformation>';
			return serialization;
		}
		
		/**
		 * Patches the rowHash to make columns more uniform.  If more types of patches are necessary, this will be refactored to accept a patch as a parameter.
		 * 
		 */
		this.patch = function()
		{
			//We need to insert a TD now to balance out the following row in the table.
			var tagString = "<td><i>Citizens:</i></td>";
			var rowToFix = that.rowHash.getRow("WorkingCitizens");
			
			//newTD is the first column in the table, i.e. 'Citizens:'
			var newTD = rowToFix.getElementsByTagName("td")[0].cloneNode(true);
			newTD.innerHTML = tagString;

			rowToFix.getElementsByTagName("td")[0].setAttribute("width", ""); //fix width of second column			
			rowToFix.insertBefore(newTD, rowToFix.firstChild);
			that.rowHash.setRow("WorkingCitizens", rowToFix);
	
			if (that.rowHash.getRow("BillsPaid"))
			{
				var billsPaidTD = that.rowHash.getRow("BillsPaid").getElementsByTagName("td")[5];
				var newBillRow = page.createElement("tr");
				var titleTD = page.createElement("td");
				newBillRow.appendChild(titleTD);
				newBillRow.appendChild(billsPaidTD);
				titleTD.innerHTML = "<td bgcolor='#ffffff'>Bills Paid:</td>";
				that.rowHash.setRow("BillsPaid", newBillRow);
			}
		
			if (that.rowHash.getRow("TotalPurchases"))
			{
				var totalPurchasesRow = that.rowHash.getRow("TotalPurchases");
				var newTotalPurchasesRow = page.createElement("td");				
				totalPurchasesRow.insertBefore(newTotalPurchasesRow, totalPurchasesRow.firstChild);
				newTotalPurchasesRow.innerHTML = "<td>Purchases Over Time:</td>";
				that.rowHash.setRow("TotalPurchases", totalPurchasesRow);
			}		
		}
		/*
		 * Returns a populated improvement item.
		 */
		function getModifierCounts()
		{
			function splitString(rowName)
			{
				var unsplitString = new String(HTMLRowTextFromRowID(rowName));
				unsplitString = unsplitString.replace(/[\s]+/g," ");
				return unsplitString.split(",");
			}
			
			var cm = CNExtend_modifiers;
			var modifiers = cm.getInitializedModifierHash();
			
			//count improvements
			var splitImprovements = splitString("Improvements");
			improvementExpression = new RegExp("([A-z]+[ ]?[A-z]+): ([0-9])");
			for (var i = 0; i < splitImprovements.length; i++)
			{
				var subString = splitImprovements[i];
				var found = subString.match(improvementExpression);
				if (found)
				{
					modifiers[cm.enumFromModifierName(found[1])] = parseFloat(found[2]);
				}
			}
			
			//count wonders
			var splitWonders = splitString("Wonders");
			wonderExpression = new RegExp("([A-z]+( [A-z]+)*)$");
			for (var i = 0; i < splitWonders.length; i++)
			{
				var subString = splitWonders[i];
				var found = subString.match(wonderExpression);
				if (found)
				{
					modifiers[cm.enumFromModifierName(found[1])] = 1;
				}
			}
			
			//count resources
		var resourceList = getFromRowID(resourceSelector, "ConnectedResources").concat(getFromRowID(resourceSelector, "BonusResources"));
			for (var i=0; i < resourceList.length; i++)
			{
				modifiers[resourceList[i]] = 1;
			}
			
			return modifiers;
  		 }
		
		this.getPlayerData = function() {
			if (!parsedPlayerData) {
		
				parsedPlayerData = {
					"date" : CNExtend_data.getDateFromPage(page),
					"rulerName" : HTMLRowTextFromRowID("Ruler"),
					"nationName" : HTMLRowTextFromRowID("NationName"),
					"nationNumber" : CNExtend_data.getNationIDFromPage(page),
					"workingCitizens" : getNumberFromRowID("WorkingCitizens"),
					"averageCitizenTax" : getNumberFromRowID("AverageCitizenTax"),
					"taxRate" : getNumberFromRowID("Tax"),
					"modifiers" : getModifierCounts(),
					"environment" : getNumberFromRowID("Environment"),
					"infrastructure" : getNumberFromRowID("Infrastructure"),
					"technology" : getNumberFromRowID("Technology"),
					"nationStrength" : getNumberFromRowID("Strength"),
					"government" : CNExtend_governments.enumFromString(HTMLRowTextFromRowID("Government")),
					"globalRadiation" : getNumberFromRowID("GlobalRadiation"),
					"numberOfSoldiers" : getNumberFromRowID("NumberOfSoldiers"),
					"happiness" : getNumberFromRowID("Happiness"),
					"land" : getNumberFromRowID("Land"),
					"nukes" : getNumberFromRowID("NuclearWeapons"),
					"gameType" : CNExtend_data.determineGameType(page.location.host)
				}
			}
			
			return parsedPlayerData;
		}
								
		function getFromRowID(selector, rowID)
		{
			if (!that.rowHash.getRow(rowID))
			{
				return null;
			}
			if (!that.validated)
			{
				throw new CNExtend_exception.Base("Table wasn't validated while trying to retrieve " + rowID+ ".");
			}

			return selector(rowID);
		}
		
		/**
		 * Given a row ID, returns a list of resource enumerations associated with it.
		 *
		 * @param {Object} rowID
		 */
		function resourceSelector(rowID)
		{
			var resourceList = [];
			var imageNodeList = that.rowHash.getRow(rowID).getElementsByTagName("img");
			var imageIterator = new CNExtend_util.elementNodeIterator(imageNodeList);

			while (!(imageIterator.done()))
			{
				var imageNode = imageIterator.nextNode();
				var resourceName = imageNode.src.match(/\/([A-z]+)\.GIF/i);
				if(resourceName)
				{
					var resourceEnum = CNExtend_modifiers.enumFromModifierName(resourceName[1]);
					if (resourceEnum != CNExtend_modifiers.type.Unknown)
					{
						resourceList.push(resourceEnum);
					}
				}
			}
			return resourceList;
		}

		function HTMLRowTextFromRowID(rowID)
		{
			return getFromRowID(HTMLRowTextSelector, rowID);
		}

		function HTMLRowTextSelector(rowID)
		{
			return that.rowHash.getRow(rowID).textContent.CNtrimWhitespace();
		}

		function getNumberFromRowID(rowID)
		{
			var rowText = HTMLRowTextFromRowID(rowID);
			return CNExtend_util.numberFromText(rowText);
		}
	}
}
