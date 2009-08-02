// cleaned
var CNExtend_XML = new function() {

	/**
	* Given a path, tries to accumulate data.  Throws exceptions if accumulation runs into XML files that
	* don't meet the specifications of this accumulator or are invalid.
	* 
	* @exception XMLLoad	Throws an XMLLoad exception if the file at the path can't be loaded.;
	* @exception IllegalArgument	Throws this if XMLDoc is empty or has no child nodes.
	* @param {function}
	* @param {string} Path
	*/
	this.getListFromPath = function(nodeTransformer, path) {

		if (!path || path === "")
			return null;
		
		
		var req = new XMLHttpRequest();
		
		try {
			req.open('GET', path, false);
			req.send(null);			
			var XMLDoc = req.responseXML;

			var rootNode = null;
			if (XMLDoc) {
				rootNode = XMLDoc.childNodes[0];
			}
			if (!rootNode || !rootNode.childNodes || !(rootNode.childNodes.length > 0)) {
				throw new CNExtend_exception.IllegalArgument(path + " is broken, does not have a root node, or does not have any child nodes");
			}

			var nodeIterator = new CNExtend_util.elementNodeIterator(rootNode.childNodes);			
			var list = [];
			while(!nodeIterator.done()) {
				list.push(nodeTransformer(nodeIterator.nextNode()))
			}
			
			return list;

		} catch (e) {
			CNExtend_util.error(e, CNExtend_enum.errorType.Transformation, false);
		}
	}
	
	this.transformNode = function(elementNode) {
		var tempNode = new AttribNode(elementNode);

		if (elementNode.tagName == "newHeader") {
			tempNode.require("text");
			
			tempNode.addNodeTo = function(myTable) {
				myTable.addHeader(this.text);
			}
					
			return tempNode;
		} else {
			var tempNode = new AttribNode(elementNode);
			tempNode.require("id").desire("display").desire("text").desire("extended_only");
			tempNode.addNodeTo = function(myTable) {
				myTable.addRow(this);
			}
			return tempNode;
		}
	}

	this.validNode = function(elementNode) {
		var tempNode = new AttribNode(elementNode);
		tempNode.require("id").desire("match").desire("name").desire("find")

		if (tempNode.match) {
			tempNode.matchWord = tempNode.match;
		} else {
			tempNode.matchWord = tempNode.id;
		}
		
		if (!tempNode.name)
			tempNode.name = tempNode.matchWord;
			
		return tempNode;
	}
		
	function AttribNode(elementNode) {
		if (!elementNode)
			throw new CNExtend_exception.IllegalArgument("Something went wrong parsing an XML node.");
		
		this.require = function(attribute) {
			var attributeValue = elementNode.getAttribute(attribute);
			if (!attributeValue)
				throw new CNExtend_exception.MissingAttribute(elementNode.tagName, attribute);
			
			this[attribute] = attributeValue;
			return this;
		}
		
		this.desire = function(attribute) {
			var attributeValue = elementNode.getAttribute(attribute);
			if (attributeValue) {
				this[attribute] = attributeValue;
			}
			return this;
		}
	}
}