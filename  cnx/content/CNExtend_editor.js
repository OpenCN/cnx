// cleaned
var CNExtend_editor = new function() {
	const tableString = '<li class="windowDraggableRow"><table width="100%" onmouseover="if (dragRowTitleOn) dragRowTitleOn()" onmouseout="if (defaultTitleOn) defaultTitleOn()"  cellspacing="0" cellpadding="5" bordercolor="000080" border="1" bgcolor="f7f7f7"><tbody><tr id="pickRow">';
	const tableEndString = '</tr></tbody></table></li>';

	var that = this;

	/**
	 * When called, this generates a string of functions and variables which can be injected into a page to make the layout editor work.
	 */
	this.loadAllFunctions = function() {
		var functionList = 'var win; var tableString = \'' + tableString + '\'; var tableEndString = \'' + tableEndString + '\';';
		
		for (var func in CNExtend_editor.autoload) {
			functionList += CNExtend_editor.autoload[func]() + " ";
		}
		
		return functionList;
	};

	this.activateEditor = function() {
		try {
			var HTMLPage = CNExtend_util.getActiveDocument();
			var tableToActivate = CNExtend_global.selfTables.getTableFromDocument(HTMLPage);

			if (!tableToActivate.functionsInjected) {
				CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/prototype.js");
				CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/builder.js");
				CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/effects.js");
				CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/dragdrop.js");
				CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/controls.js");
				CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/slider.js");
				CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/window.js");
				CNExtend_util.injectTextScript(HTMLPage, CNExtend_editor.loadAllFunctions());
			
				tableToActivate.functionsInjected = true;
			}

			tableToActivate.setEditMode(true);
		} catch(e) { CNExtend_util.error(e); }
	};
	
	/**
	* Given a table to save, opens a dialog and serializes the table as a layout to the chosen file.
	* 
	**/
	this.saveXML = function(table) {
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
        var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

        fp.init(window, "Save XML ", fp.modeSave);
		fp.defaultString = "new_layout.xml";
        fp.defaultExtension = ".xml";
        fp.appendFilters(fp.filterXML);
		fp.displayDirectory = CNExtend_util.getLayoutDirectory();

        // If cancelled, return
        if (fp.show() == fp.returnCancel) return;

        if (fp.file.exists()) fp.file.remove(true);
        
		//write the new file
        fp.file.create(fp.file.NORMAL_FILE_TYPE, 0666);
        stream.init(fp.file, 0x02, 0x200, null);
		      
		var xml = table.serializeToXML();
		
        stream.write(xml, xml.length);
        stream.close();

		var fileHandler = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService)
		.getProtocolHandler("file")
        .QueryInterface(Components.interfaces.nsIFileProtocolHandler);

		CNExtend_main.setLayoutPath(fileHandler.getURLSpecFromFile(fp.file));
		CNExtend_display.refreshSelfLayoutList();
	};


	/*
	 * This populates a layout window once it's loaded.
	 */
	this.populateWindow = function(table) {
		var windowPopulationInterval; //Interval that spins until the layout editor window is loaded.
		var windowActionInterval; //Interval that spins until they either hit the save button or quit the layout editor.
		
		clearInterval(windowPopulationInterval);
		windowPopulationInterval = setInterval(function() { populateWindowPoll(table); }, 50);

		function populateWindowPoll(table) {
			var page = table.doc;
		
			function sortByName(a, b) {
				if (a.name < b.name) {
					return -1;	
				} else if (a.name > b.name) {
					return 1;
				} else {
					return 0;
				}
			}

			var sortedValidationList = CNExtend_table.extendedSelfDescriptionList.slice();
			sortedValidationList.sort(sortByName);

			if (page.getElementById("window_content")) {
				clearInterval(windowPopulationInterval);
				var layoutEditWindowContent = page.getElementById("window_content");

				//push all known elements

				var windowUpdate = [];
				windowUpdate.push('<center><input id="SaveLayoutButton" action="none" type="Button" value="Save Layout" onclick="this.setAttribute(\'action\', \'save\')"></input><br/><div style="height: 35px"><img class="CNxNav" onmouseout="this.src = \'chrome://cnextend/content/Icons/left.png\'" onmouseup="this.src = \'chrome://cnextend/content/Icons/left.png\'" onmousedown="this.src = \'chrome://cnextend/content/Icons/left_down.png\'"' +
				'src=\"chrome://cnextend/content/Icons/left.png\" onclick="leftArrow()" />');

				windowUpdate.push('<select id="windowCombo" onchange="rowCounter = this.options[this.selectedIndex].value; updateRowContents(rowCounter)">');
				for (var item in sortedValidationList) {
					windowUpdate.push('<option value="' + item +'">' + sortedValidationList[item].name + '</option>');
				}
				windowUpdate.push('</select>');
				
				windowUpdate.push('<img class="CNxNav" onmouseout="this.src = \'chrome://cnextend/content/Icons/right.png\'" onmouseup="this.src = \'chrome://cnextend/content/Icons/right.png\'" onmousedown="this.src = \'chrome://cnextend/content/Icons/right_down.png\'"' +
				'src=\"chrome://cnextend/content/Icons/right.png\" onclick="rightArrow()"/> </div></center>');

				windowUpdate.push('<ul id="windowSortable">');
				windowUpdate.push(tableString);
				windowUpdate.push(table.rowHash[sortedValidationList[0].id].innerHTML);
				windowUpdate.push(tableEndString);
				windowUpdate.push('</ul>');

				layoutEditWindowContent.innerHTML = windowUpdate.join('');
				injectRowData();
				CNExtend_util.injectTextScript(page, "updateRowContents(rowCounter);");
				CNExtend_util.injectTextScript(page, "createSortables();");
			}

			clearInterval(windowActionInterval);
			windowActionInterval = setInterval(actionPoll, 100);
			
			function injectRowData() {
				var rowList = [];
				
				rowList.push('var rowCounter = 0; var rowHash = {');
				for (var items in table.rowHash) {
					var rowItem = items + " : '" + table.rowHash[items].innerHTML.replace(/[\s]+/g," ").replace(/[']+/g,"\\'" ) + "'";
					rowList.push(rowItem);
					rowList.push(',');
				}
				rowList.pop();
				rowList.push(' };');
				rowList.push("var rowItems = [");
				for (var i = 0; i < sortedValidationList.length; ++i)
				{
					rowList.push("{id : '" + sortedValidationList[i].id + "', name: '" + sortedValidationList[i].name + "' }");
					rowList.push(',');
				}
				rowList.pop();
				rowList.push('];');
				CNExtend_util.injectTextScript(page, rowList.join(''));
			}

			/**
			 * Called until the user hits the save layout button.
			 */
			function actionPoll() {
				if (CNExtend_global.selfTables.getTableIndex(page) == -1) { //then the user refreshed or otherwise navigated away from the page we were monitoring.
					clearInterval(windowActionInterval); //cancel polling
				} else if (page.getElementById('SaveLayoutButton') != null && (page.getElementById('SaveLayoutButton').getAttribute('action') != 'none')) {
					var action = page.getElementById('SaveLayoutButton').getAttribute('action');
					if (action == "save") {
						page.getElementById("SaveLayoutButton").setAttribute("action", "none");
						CNExtend_editor.saveXML(table);
					} else if (action == "close") {
						table.setEditMode(false);
					}
				}
			}
		} //end populatewindowPoll function
	}; //end populateWindow function
		

//------------------Autoloaded functions ---------------------------------------------//
	this.autoload = new function() {
		this.generatePlaceHolder = function() {
			return function generatePlaceHolder(rowName) {
				return '<td width="100%">This is a placeholder for <b>' + rowName + '</b></td>';
			};
		};
		
		this.defaultTitle = function() {
			return function defaultTitle() {
				return "Hover over things for info.";
			};
		};
		
		this.dragRowTitleOn = function() {
			return function dragRowTitleOn() {
				if (typeof(win) != "undefined") win.setTitle("Drag this row to place it.");
			};
		};
		
		this.defaultTitleOn = function() {
			return function defaultTitleOn() {
				if (typeof(win) != "undefined") win.setTitle(defaultTitle());
			};
		};
		
		this.launchWindow = function() {
			return function launchWindow() {	
				win = new Window({
					id: "window",
					top: 10,
					left: 10,
					destroyOnClose: true,
					maximizable: false,
					width: 260,
					height: 150,
					resizable: true,
					title: defaultTitle(),
					draggable: true
				});
				win.show(); 
				win.setZIndex(10);
				win.setCloseCallback(function() {
					document.getElementById('SaveLayoutButton').setAttribute('action','close');
					return true;
				});
			};
		};
				
		this.addCloseButton = function() {
			return function addCloseButton(element) {
				function deleteRow() { element.parentNode.removeChild(element); }
				
				function closeTipOn() {
					if (typeof(win) != 'undefined') win.setTitle('Click to remove this row.');
				}
				
				function closeTipOff() {
					if (typeof(win) != 'undefined') win.setTitle(defaultTitle());
				}
				
				var closeButton = element.ownerDocument.createElement("img");
				closeButton.src = "chrome://cnextend/content/Icons/button-close-tiny.gif";
				closeButton.className = "closeButton";
				closeButton.addEventListener("mouseup", deleteRow, true);
	
				var innerElement = element.getElementsByTagName("td")[0];
	
				if (innerElement && innerElement.bgColor == '#000080') { //then we have a header
					closeButton.style.top = "1px";
					innerElement.parentNode.parentNode.border = 0;
				}
				
				closeButton.addEventListener("mouseover", closeTipOn, true);
				closeButton.addEventListener("mouseout", closeTipOff, true);
								
				element.appendChild(closeButton);
			};
		};
	
		this.updateRowContents = function() {
			return function updateRowContents(index) {
				var rowHTML = rowHash[rowItems[index].id];
				if (!rowHTML) { rowHTML = generatePlaceHolder(rowItems[index].name); }
				var pickRow = document.getElementById("pickRow");
				pickRow.innerHTML = rowHTML;
				pickRow.setAttribute("type", "item");
				pickRow.setAttribute("itemid", rowItems[index].id);
			};
		};

		this.transferRow = function() {
			return function transferRow() {
				var droppedRow = document.getElementById("pickRow");
				addCloseButton(droppedRow.parentNode.parentNode.parentNode);
				droppedRow.id = "";
				droppedRow.parentNode.parentNode.parentNode.className = "draggableRow";

				document.getElementById("windowSortable").innerHTML = tableString + tableEndString;
				updateRowContents(rowCounter);
				createSortables();
			};
		};

		this.createSortables = function() {
			return function createSortables() {
				//Ensures that the dragged row is visible past the edges of the DHTML window.
				function visibleOverflow() {
					document.getElementById("window_table_content").style.overflow = "visible";
					document.getElementById("window_content").style.overflow = "visible";
				}
				
				function hiddenOverflow() {
					document.getElementById("window_table_content").style.overflow = "hidden";
					document.getElementById("window_content").style.overflow = "hidden";
				}

				
				Sortable.create("mainSortable", { scroll: window, onUpdate: transferRow, containment: ["windowSortable", "mainSortable"] });
				Sortable.create("windowSortable", { onStart: visibleOverflow, onEnd: hiddenOverflow, constraint: false, containment: "mainSortable" });
			};
		};
		
		this.leftArrow = function() {
			return function leftArrow() {
				if (rowCounter === 0)  {
					rowCounter = (rowItems.length - 1); 
				} else {
					--rowCounter; 
				}
				document.getElementById("windowCombo").selectedIndex = rowCounter;
				updateRowContents(rowCounter);
			};
		};
	
		this.rightArrow = function() {
			return function rightArrow() {
				if (rowCounter >= rowItems.length - 1) { rowCounter = 0; } else { ++rowCounter; }
				document.getElementById("windowCombo").selectedIndex = rowCounter;
				updateRowContents(rowCounter);
			};
		};
	};
};
