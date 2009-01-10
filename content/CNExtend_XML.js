var CNExtend_XML = new function() {
	this.getListFromPath = function(accumulator, path) {
		if (!path || path === "") { return null; }
		accumulator.accumulateFromPath(path);
		return accumulator.list;
	};
	
	var nodeAccumulator = function() {
		this.list = [];
		
		var that = this;
		
		/**
		 * Accumulates a node into the accumulator's list.
		 *
		 * @exception MissingAttribute 	If elementNode is missing a required field.
		 */
		this.accumulate = function(elementNode) {
			var objectNode = that.objFromElem(elementNode);
			this.list.push(objectNode);
		};

		/**
		 * Stores all nodes accumulated from the XML Document in contained list item.
		 * 
		 * @exception IllegalArgument	Throws this if XMLDoc is empty or has no child nodes.
		 * @param {Object} XMLDoc
		 */
		this.accumulateFromXMLDoc = function(XMLDoc) {
			var rootNode = null;
			if (XMLDoc) {
				rootNode = XMLDoc.childNodes[0];
			}
			if (!rootNode || !rootNode.childNodes) {
				throw new CNExtend_exception.IllegalArgument("The document provided is broken, does not have a root node, or does not have any child nodes");
			}

			var nodeList = rootNode.childNodes;
			var nodeIterator = new CNExtend_util.elementNodeIterator(nodeList);
			while(!nodeIterator.done()) {
				that.accumulate(nodeIterator.nextNode());
			}
			return true;
		};
		
		/**
		 * Given a path, tries to accumulate data.  Throws exceptions if accumulation runs into XML files that
		 * don't meet the specifications of this accumulator or 
		 * 
		 * @exception XMLLoad	Throws an XMLLoad exception if the file at the path can't be loaded.;
		 * @exception IllegalArgument	Throws this if XMLDoc is empty or has no child nodes.
		 * @param {Object} Path
		 */
		this.accumulateFromPath = function(Path) {
			var req = new XMLHttpRequest();
			req.open('GET', Path, false);
			req.send(null);
			try {
				that.accumulateFromXMLDoc(req.responseXML);
			} catch (e) {
				CNExtend_util.error(e, CNExtend_enum.errorType.Transformation, false);
			}
		};

	};

	this.getTransformationAccumulator = function() {
		var accumulator = new nodeAccumulator();

		accumulator.objFromElem = function(elementNode) {
			if (elementNode.tagName == "newHeader") {
				transformationNode = CNExtend_XML.transNewHeaderNode(elementNode);
			} else {
				transformationNode = CNExtend_XML.transDefaultNode(elementNode);
			}
			return transformationNode;
		};
		return accumulator;
	};

	this.getValidationAccumulator = function() {
		var accumulator = new nodeAccumulator();
		
		/**
		 * 
		 * @exception	MissingAttribute	
		 * @param {Object} elementNode	The element node
		 */
		accumulator.objFromElem = function(elementNode) {
			return CNExtend_XML.validNode(elementNode);						
		};
		return accumulator;
	};
	
	this.validNode = function(elementNode) {
		var tempNode = new AttribNode(elementNode);
		tempNode.require("id");
		tempNode.desire("match");
		tempNode.desire("name");
		
		if (tempNode.match) {
			tempNode.matchWord = tempNode.match;
		} else {
			tempNode.matchWord = tempNode.id; 
		}
		
		tempNode.name = (tempNode.name) ? (tempNode.name) : tempNode.matchWord;
		
		if (tempNode.tagName == "misc") {
			tempNode.validate = function() { return true; };
		} else {
			tempNode.validate = function(elementNode) {
					var columnText = CNExtend_util.firstColumnText(elementNode);
					if (!columnText.match(this.matchWord)) {
						throw new CNExtend_exception.ValidationError(this.matchWord, columnText);
					}
			};
		}
		
		return tempNode;
	};
		
	this.transNewHeaderNode = function(elementNode) {
		var tempNode = new AttribNode(elementNode);
		
		tempNode.require("text");
		
		tempNode.addNodeTo = function(myTable) {
			myTable.addHeader(this.text);
		};
				
		return tempNode;
	};
	
	this.transDefaultNode = function(elementNode) {
		var tempNode = new AttribNode(elementNode);

		tempNode.require("id");
		tempNode.desire("display");
	
		tempNode.addNodeTo = function(myTable) {
			if (this.display != "hide") {
				myTable.addRow(this.id);
			}
		};
		
		return tempNode;
	};
		
	function AttribNode(elementNode) {
		if (!elementNode) throw new CNExtend_exception.IllegalArgument("An elementNode was null");
		
		this.elementNode = elementNode;
		this.tagName = elementNode.tagName;
		var that = this;
		
		this.require = function(attribute) {
			var attributeValue = this.elementNode.getAttribute(attribute);
			if (attributeValue === null) {
				throw new CNExtend_exception.MissingAttribute(this.tagName, attribute);
			}
			
			this[attribute] = attributeValue;
		};
		
		this.desire = function(attribute) {
			this[attribute] = this.elementNode.getAttribute(attribute);
		};
	}

};