
var CNExtend_editor = new function () 
{
	var that = this;
	
	this.loadAllFunctions = function()
	{
		var functionList = '';
		for (var func in CNExtend_editor)
		{
			if ((func != 'loadAllFunctions') && (func != 'activateEditor') && (func != 'saveXML'))
			{
				functionList += CNExtend_editor[func]() + ' ';
			}
		}
		
		return functionList;
	}
	
	this.activateEditor = function()
	{
		try
		{
			var HTMLPage = CNExtend_util.getActiveDocument();
			var tableToActivate = CNExtend_global.selfTables.getTableFromDocument(HTMLPage);
			CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/prototype.js");
			CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/builder.js");
			CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/effects.js");
			CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/dragdrop.js");
			CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/controls.js");
			CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/slider.js");
			CNExtend_util.injectFileScript(HTMLPage, "chrome://cnextend/content/scriptaculous/window.js");
			
			tableToActivate.setEditMode(true);
		}
		catch(e)
		{
			CNExtend_util.error(e);
		}
	}
	
	/**
	 * Saves the 
	 * 
	 **/
	this.saveXML = function(table)
	{
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
        var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

        fp.init(window, 'Save XML ', fp.modeSave);
		fp.defaultString = 'new_layout.xml';
        fp.defaultExtension = '.xml';
        fp.appendFilters(fp.filterXML);
		fp.displayDirectory = CNExtend_util.getLayoutDirectory();

        // If cancelled, return
        if (fp.show() == fp.returnCancel)
            return;

        if (fp.file.exists())
            fp.file.remove(true);
        
        fp.file.create(fp.file.NORMAL_FILE_TYPE, 0666);
        stream.init(fp.file, 0x02, 0x200, null);
       	
		var xml = table.serializeToXML();
		
        stream.write(xml, xml.length);
        stream.close();
	}

	this.generatePlaceHolder = function()
	{
		return function generatePlaceHolder(rowName) 
		{
			return '<td width="100%">This is a placeholder for <b>' + rowName + '</b></td>'
		};
	}
	
	this.addCloseButton = function()
	{
		return function addCloseButton(element)
		{
			function deleteRow()
			{
				element.parentNode.removeChild(element)
			}
			
			var closeButton = element.ownerDocument.createElement("img");
			closeButton.src = "chrome://cnextend/content/Icons/button-close-tiny.gif";
			closeButton.className = "closeButton";
			closeButton.addEventListener("mouseup", deleteRow, true)

			var innerElement = element.getElementsByTagName("td")[0];

			if (innerElement && innerElement.bgColor == '#000080') //then we have a header
			{
				closeButton.style.top = "1px"
				innerElement.parentNode.parentNode.border = 0;
			}
			
			element.appendChild(closeButton)
		}
	}

	this.updateRowContents = function()
	{
		return function updateRowContents(index)
		{
			var rowHTML = rowHash[rowItems[index].id];
			if (!rowHTML)
			{
				rowHTML = generatePlaceHolder(rowItems[index].name);
			}
			var pickRow = document.getElementById('pickRow');
			pickRow.innerHTML = rowHTML;
			pickRow.setAttribute('type', 'item');
			pickRow.setAttribute('itemid', rowItems[index].id)
		};
	}

	this.transferRow = function()
	{
		return function transferRow()
		{
			var tableString = '<li class="windowDraggableRow"><table width="100%" cellspacing="0" cellpadding="5" bordercolor="000080" border="1" bgcolor="f7f7f7"><tbody><tr id="pickRow">';
			var tableEndString = '</tr></tbody></table></li>';

			var droppedRow = document.getElementById('pickRow');
			addCloseButton(droppedRow.parentNode.parentNode.parentNode);
			droppedRow.id = '';
			droppedRow.parentNode.parentNode.parentNode.className = 'draggableRow';
			
			document.getElementById('windowSortable').innerHTML = tableString + tableEndString;
			updateRowContents(rowCounter);
			createSortables();
		};
	}
	
	this.createSortables = function()
	{
		return function createSortables()
		{
			function change()
			{
				
			}
			
			Sortable.create('mainSortable',{scroll: window, onUpdate: transferRow, containment: ['windowSortable', 'mainSortable']});
			Sortable.create('windowSortable',{onChange: change, constraint: false, containment: 'mainSortable'});
		};
	}
	
	this.leftArrow = function()
	{
		return function leftArrow()
		{
			if (rowCounter == 0) 
			{
				rowCounter = (rowItems.length - 1); 
			}
			else 
			{
				--rowCounter; 
			};
			document.getElementById('windowCombo').selectedIndex = rowCounter;
			updateRowContents(rowCounter);
		}
	}

	this.rightArrow = function()
	{
		return function rightArrow()
		{
			if (rowCounter >= rowItems.length - 1)
			{
				rowCounter = 0;
			}
			else
			{
				++rowCounter;
			};
			document.getElementById('windowCombo').selectedIndex = rowCounter;
			updateRowContents(rowCounter);
		}
	}
};