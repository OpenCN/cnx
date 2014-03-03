//These functions are general utility functions that aren't specific to CN
//

String.prototype.CNtrimWhitespace=function(){
    return this.replace(/^\s*|\s*$/g,'');
};

var CNExtend_util = new function()
{
        
        //PRIVATE -------------------------------------------------------------

        var _logService = null;
        var _loggingLevel = CNExtend_enum.logLevel.Debug;
        var that = this;

        var log = function(message) {

                if (_logService == null) {
                        _logService = Components.classes['@mozilla.org/consoleservice;1'].getService();
                        _logService.QueryInterface(Components.interfaces.nsIConsoleService);
                }
                
                        _logService.logStringMessage("CNExtend: " + message);
                }
        
        //PUBLIC  -------------------------------------------------------------

        //Implements observer class
        
        this.quitObserver =  {
                observe: function(subject, topic, data) {
                        if (CNExtend_global.messages) {
                                CNExtend_global.messages.clearErrors();
                        }
                  },
                  startup: function() {
                    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                          .getService(Components.interfaces.nsIObserverService);
                    observerService.addObserver(this, "quit-application-requested", false);
                  },
                  cleanup: function() {
                    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                            .getService(Components.interfaces.nsIObserverService);
                    observerService.removeObserver(this, "quit-application-requested");
                  }
        }
                                
        this.PrefObserver = {
                prefComponent: null,
                
                prefs: function()
                {
                        if (this.prefComponent == null)
                        {
                                this.prefComponent = Components.classes["@mozilla.org/preferences-service;1"]
                        .getService(Components.interfaces.nsIPrefService)
                                
                                //.getBranch(_prefPrefix);
                                //this.prefComponent.QueryInterface(Components.interfaces.nsIPrefBranch2);
                        }
                        return this.prefComponent;
                },
                
                startup: function()
                {
                        this.prefs().addObserver("", this, false);
                        CNExtend_global.syncMessages();
                        CNExtend_global.syncValidationStatus();
                        CNExtend_display.refreshStatusPanel();
                        CNExtend_display.refreshSelfLayoutList();
                        CNExtend_display.refreshCSS_State();
                },
                
                observe: function(subject, topic, data)
                        {
                                if (topic != "nsPref:changed")
                                {
                                        return;
                                }
                                
                                switch(data)
                                {
                                        case CNExtend_enum.IS_ENABLED_PREF:
                                                CNExtend_display.refreshStatusPanel();
                                                CNExtend_display.refreshCSS_State();
                                        break;
                                        case CNExtend_enum.SELF_LAYOUT_PATH_PREF:
                                                CNExtend_display.refreshSelfLayoutList();
                                        break;
                                        case CNExtend_enum.MESSAGES_PREF:
                                                CNExtend_global.syncMessages();
                                                CNExtend_display.refreshStatusPanel();
                                        break;
                                        case CNExtend_enum.VALIDATION_STATUS_PREF:
                                                CNExtend_global.syncValidationStatus();
                                        break;
                                }
                        },
        
                //Load a boolean preference from the preference manager
                getBoolPreference: function(preferenceString) {
                        
                        if (this.prefs().getPrefType(preferenceString) != this.prefs().PREF_BOOL)
                                return false;
                        else
                                return this.prefs().getBoolPref(preferenceString);
                },
                
                setBoolPreference: function(preferenceString, setting) {
                        this.prefs().setBoolPref(preferenceString, setting);
                },
                

                getStringPreference: function(preferenceString) {
                        if (this.prefs().getPrefType(preferenceString) != this.prefs().PREF_STRING)
                                return "";
                        else
                                return this.prefs().getCharPref(preferenceString);
                },

                setStringPreference: function(preferenceString, setting) {
                        this.prefs().setCharPref(preferenceString, setting);
                },
                
                getIntPreference: function(preferenceString) {
                        if (this.prefs().getPrefType(preferenceString) != this.prefs().PREF_INT)
                                return 0;
                        else
                                return this.prefs().getIntPref(preferenceString);                                       
                },
                
                setIntPreference: function(preferenceString, setting) {
                        this.prefs().setIntPref(preferenceString, setting);
                },
                
        
                shutdown: function()
                {
                    this.prefs().removeObserver("", this);
                }
        }
        
        this.error = function(exception, errorType, critical) {
                var logMessage = exception.toString();

                if (exception.lineNumber && exception.fileName) 
                {
                        logMessage +=  " [line: " + exception.lineNumber + " in " + exception.fileName + "]";
                }
                
                log(logMessage);
                var type;
                if (critical)
                {
                        type = CNExtend_enum.messageType.CriticalError;
                }
                else
                {
                        type = CNExtend_enum.messageType.Warning;
                }
                
                var title;
                var titleLink = CNExtend_enum.website + CNExtend_enum.helpPage;
                
                switch(errorType)
                {
                        case CNExtend_enum.errorType.Transformation:
                                title = "Malformed Layout Error";
                                titleLink += "#Transformation";
                        break;
                        case CNExtend_enum.errorType.Validation:
                                title = "Interface Validation Failed";
                                titleLink += "#Validation";
                        break;
                        case CNExtend_enum.errorType.CriticalFileMissing:
                                title = "Critical File Missing";
                                titleLink += "#CriticalFileMissing";
                        break;
                        case CNExtend_enum.errorType.CopyFiles:
                                title = "Default Layout Copying Error";
                                titleLink = "#CopyFiles";
                        break;
                        default:
                                title = "Generic Exception";
                                titleLink = null;
                }
                
                CNExtend_global.messages.add(logMessage, type, title, titleLink, null);
                return true;
        }

        this.debugLog = function(logString) {
                if (_loggingLevel >= CNExtend_enum.logLevel.Debug)
                {
                        log(logString)
                }
                return true;
        }

        this.normalLog= function(logString) {
                if (_loggingLevel >= CNExtend_enum.logLevel.Normal)
                {
                        log(logString)
                }
                return true;
        }

        //Unloads a CSS sheet
        this.unloadCSS = function(CSSPath)
        {
                CNExtend_util.debugLog("Unloading CSS:" + CSSPath)
                var styleSheetService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                .getService(Components.interfaces.nsIStyleSheetService);

                var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService);

                var CSSURI = ioService.newURI(CSSPath, null, null);

                var registered = styleSheetService.sheetRegistered(CSSURI, styleSheetService.USER_SHEET);

                if(registered) 
                {
                        styleSheetService.unregisterSheet(CSSURI, styleSheetService.USER_SHEET);
            }
        }
                
        this.generateGUID = function() {
                return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
                
                function S4() {
                        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                }
        }
        
        this.getFileFromChrome = function(chrome)
        {
                var URL = CNExtend_util.chromeToURL(chrome);
                        
                var fileHandler = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService)
                                .getProtocolHandler("file")
                .QueryInterface(Components.interfaces.nsIFileProtocolHandler);                
                return fileHandler.getFileFromURLSpec(URL);
                
        }
        
        /**
         * Convenience function for getting the layout directory.  Will try to create it if it does not exist.
         * 
         */
        this.getLayoutDirectory = function() 
        {
                var layoutDirectory = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
                layoutDirectory.append(CNExtend_enum.layoutDirectoryName);
                
                that.makeDirectory(layoutDirectory);
                return layoutDirectory;
        }
        
        this.getActiveDocument = function()
        {
                const CC = Components.classes;
        const CI = Components.interfaces;
        var win = CC["@mozilla.org/appshell/window-mediator;1"]
                .getService(CI.nsIWindowMediator)
                .getMostRecentWindow("navigator:browser");
      
                return win.gBrowser.contentDocument;
        }
        
        this.getFileNameFromPath = function (path)
        {
                var ios = Components.classes["@mozilla.org/network/io-service;1"].
                    getService(Components.interfaces.nsIIOService);
                var URL = ios.newURI(path, null, null);

                var file = URL.QueryInterface(Components.interfaces.nsIFileURL).file;
                return file.leafName;
        }
        
        /**
         * Convenience function for getting the backup directory.  Will try to create it if it does not exist.
         * 
         */     
        this.getBackupDirectory = function() 
        {
                var layoutBackupDirectory = that.getLayoutDirectory();
                layoutBackupDirectory.append(CNExtend_enum.backupDirectoryName);

                that.makeDirectory(layoutBackupDirectory);
                return layoutBackupDirectory;
        }
        
        this.makeDirectory = function(directory)
        {
                if (!(directory.exists()))
                {
                        directory.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
                }
        }
        
        this.copyDirectoryFiles = function(fromDir, dirToCopyTo)
        {
                var originalDirectoryIter = fromDir.directoryEntries;
                while (originalDirectoryIter.hasMoreElements())
                {
                        var fileToCopy = originalDirectoryIter.getNext().QueryInterface(Components.interfaces.nsIFile);
                        that.overwriteCopy(fileToCopy, dirToCopyTo);
                }
        }
        
        this.overwriteCopy = function(fileToCopy, dirToCopyTo)
        {
                if (fileToCopy.isFile())
                {
                        var destinationFileName = dirToCopyTo.clone();
                        destinationFileName.append(fileToCopy.leafName); //so we can check if we are overwriting anything
                        
                        removeFile(destinationFileName);
                        fileToCopy.copyTo(dirToCopyTo, null);
                }       
        }
        
        function removeFile(destinationFileName)
        {
                if ((destinationFileName.exists() && destinationFileName.isFile()))
                {               
                        destinationFileName.remove(false);
                }
        }

        //Loads a CSS sheet for all viewable pages      
        this.loadCSS = function(CSSPath) 
        {
                CNExtend_util.debugLog("Loading CSS:" + CSSPath)

                var styleSheetService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                .getService(Components.interfaces.nsIStyleSheetService);

                var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService);

                var CSSURI = ioService.newURI(CSSPath, null, null);

                var registered = styleSheetService.sheetRegistered(CSSURI, styleSheetService.USER_SHEET);

                if(!registered) 
                {
                                styleSheetService.loadAndRegisterSheet(CSSURI, styleSheetService.USER_SHEET);
            }
        }
        
        //This function acts like an iterator, so we can iterate through the nodeList cleanly.  And because we CAN.
        //Really, it just makes the code after it much cleaner.
        this.elementNodeIterator = function(nodeList)
        {
                var iteratorCounter = -1;

                this.nextNode = function() 
                {
                        var result = peekNextNode()
                        if (result != -1)
                        {
                                iteratorCounter = result;
                                return nodeList[iteratorCounter];
                        }
                        else
                        {
                                throw new CNExtend_exception.Iterator("Tried to get another node past the end of a list.");
                        }
                }
                
                /**
                 * 
                 * @return      int             The location of the next node, or -1 if there is no next node.
                 */
                function peekNextNode()
                {
                        var elementnode = Node.ELEMENT_NODE
                        var tempCounter = iteratorCounter;
                        do
                        {
                                if (tempCounter == (nodeList.length - 1)) {
                                        return -1;
                                }
                                ++tempCounter;
                        } while(nodeList[tempCounter].nodeType != elementnode)

                        return tempCounter;
                }
                
                this.done = function() 
                {
                        return (peekNextNode() == -1); 
                }
        }
        
        /**
         * This was taken from jslib.  It converts a chrome URL to a regular path, which we need for certain RDF functionality.
         *
         * @param aPath         This is a chrome path that needs to be converted into a file url.
         * @return                      A file:/// url string if the chrome URL string is converted successfully, otherwise null.
         */
        this.chromeToURL = function (aPath) 
    {
      if (!aPath)
        return null;
  
      var rv;
      try {
                Components.classes["@mozilla.org/chrome/chrome-registry;1"]
                .getService(Components.interfaces.nsIChromeRegistry);
        var ios = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService);

        var uri = ios.newURI(aPath, "UTF-8", null);
        var cr = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
                .getService(Components.interfaces.nsIChromeRegistry);
    
        rv = cr.convertChromeURL(uri);

        if (!(rv instanceof String))
          rv = rv.spec;
      } catch (e) { rv = null; }

      return rv;
    }
        
        this.firstColumnText = function(RowElement)
        {
                if ((!RowElement) || (!(RowElement.childNodes[1])))
                {
                        return "";
                }
                return RowElement.childNodes[1].textContent.CNtrimWhitespace();
        }

        this.newTabSite = function(aURL) {
                setTimeout(function()
        { 
                        var browser = document.getElementById("content");
                var tab = browser.addTab(aURL);  
                browser.selectedTab = tab;
                }, 100)
        }
        
        this.removeAllChildren = function(element)
        {
                while(!(element.firstChild == null))
                {
                        element.removeChild(element.firstChild);
                }
        }

        this.injectTextScript = function(page,inputText)
        {
                var script = page.createElement('script');
                script.setAttribute("type", 'text/javascript');

                var text = page.createTextNode(inputText);
                script.appendChild(text);
                page.getElementsByTagName('head')[0].appendChild(script);       
        }
        
        this.injectFileScript = function(page, scriptSource)
        {
                var script = page.createElement('script');
                        script.setAttribute("type", 'text/javascript');
                        script.setAttribute("src", scriptSource);
                        page.getElementsByTagName('head')[0].appendChild(script);
        }
        
        this.numberFromText = function(text)
        {
                if (text == null)
                {
                        return null;
                }
                var re = new RegExp("-?[0-9,]+(\.[0-9]+)?");
                var m = re.exec(text);
                return parseFloat(m[0].replace(",",""));
        };
        
        this.numberToText = function(number) {
                number += "";
                x = number.split(".");
                x1 = x[0];
                x2 = x.length > 1 ? "." + x[1] : "";
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, "$1" + "," + "$2");
                }
                return x1 + x2;
        };
        
        this.createObjectFromJSON = function(JSONString)
        {
                var JSONObject = ThirdPartyJSONParser.parse(JSONString,
                        function (key, value)
                                { return key.indexOf('date') >= 0 ? new Date(value) : value;})
                return JSONObject;
        }
        
        this.mapTaggedElements = function(tag, todo, root, tagName)
        {
                var query = '';
                
                if (tagName)
                        query = tagName;
                        
                query += "[tag = '" + tag + "']";
                
                var elements = ExtCNx.query(query, root);
                
                for (var i=0; i < elements.length; i++)
                {
                        todo(elements[i]);
                }       
        }
        
        this.shallowCopyObject = function(objToCopy)
        {
                return that.createObjectFromJSON(ThirdPartyJSONParser.stringify(objToCopy));
        }

        /**
        *
        *  Secure Hash Algorithm (SHA256)
        *  http://www.webtoolkit.info/
        *
        *  Original code by Angel Marin, Paul Johnston.
        *
        **/     
        this.SHA256 = function(s) {

            var chrsz   = 8;
            var hexcase = 0;
        
            function safe_add (x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }
        
            function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
            function R (X, n) { return ( X >>> n ); }
            function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
            function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
            function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
            function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
            function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
            function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
        
            function core_sha256 (m, l) {
                var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
                var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
                var W = new Array(64);
                var a, b, c, d, e, f, g, h, i, j;
                var T1, T2;
        
                m[l >> 5] |= 0x80 << (24 - l % 32);
                m[((l + 64 >> 9) << 4) + 15] = l;
        
                for ( var i = 0; i<m.length; i+=16 ) {
                    a = HASH[0];
                    b = HASH[1];
                    c = HASH[2];
                    d = HASH[3];
                    e = HASH[4];
                    f = HASH[5];
                    g = HASH[6];
                    h = HASH[7];
        
                    for ( var j = 0; j<64; j++) {
                        if (j < 16) W[j] = m[j + i];
                        else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
        
                        T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                        T2 = safe_add(Sigma0256(a), Maj(a, b, c));
        
                        h = g;
                        g = f;
                        f = e;
                        e = safe_add(d, T1);
                        d = c;
                        c = b;
                        b = a;
                        a = safe_add(T1, T2);
                    }
        
                    HASH[0] = safe_add(a, HASH[0]);
                    HASH[1] = safe_add(b, HASH[1]);
                    HASH[2] = safe_add(c, HASH[2]);
                    HASH[3] = safe_add(d, HASH[3]);
                    HASH[4] = safe_add(e, HASH[4]);
                    HASH[5] = safe_add(f, HASH[5]);
                    HASH[6] = safe_add(g, HASH[6]);
                    HASH[7] = safe_add(h, HASH[7]);
                }
                return HASH;
            }
        
            function str2binb (str) {
                var bin = Array();
                var mask = (1 << chrsz) - 1;
                for(var i = 0; i < str.length * chrsz; i += chrsz) {
                    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
                }
                return bin;
            }
        
            function Utf8Encode(string) {
                string = string.replace(/\r\n/g,"\n");
                var utftext = "";
        
                for (var n = 0; n < string.length; n++) {
        
                    var c = string.charCodeAt(n);
        
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    }
                    else if((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
        
                }
        
                return utftext;
            }
        
            function binb2hex (binarray) {
                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var str = "";
                for(var i = 0; i < binarray.length * 4; i++) {
                    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
                    hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
                }
                return str;
            }
        
            s = Utf8Encode(s);
            return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
        }
        
        /**
         * While normally getting the location in an HTMLDocument is simple, we want to handle the case of file locations smoothly.
         * Thus, we check to see if the location protocol is file: vs http:, and then transform it towards http: for our testing purposes.
         * 
         * @param {Object} page
         */
        this.getLocation = function(page)
        {
                if (page.location && (page.location.protocol == "file:") && (page.location.pathname.match("debug.cn")))
                {
                        var mockLocation = {};
                        mockLocation.protocol = "http:";
                        mockLocation.host = "cybernations.net";
                        mockLocation.search = "";
                        mockLocation.toString = function()
                        {
                                var myString = (this.protocol + "//" + this.host + this.pathname + this.search);
                                return myString;
                        }               

                        if (page.location.pathname.match("main.debug") || (page.location.pathname.match("extended.debug")))
                        {
                                mockLocation.pathname = CNExtend_enum.nationPath;
                                mockLocation.search = "?Nation_ID=106861";
                        }
                        if (page.location.pathname.match("improvements.debug"))
                        {
                                mockLocation.pathname = CNExtend_enum.improvementPath;
                        }
                        if (page.location.pathname.match("wonders.debug"))
                        {
                                mockLocation.pathname = CNExtend_enum.wonderPath;
                        }
                        
                        return mockLocation;
                }
                else
                {
                        return page.location;
                }
        }       
}
