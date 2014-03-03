//We have this as a separate file for testing purposes.  We don't want this to be attached to the page
//when we are testing CNExtend_main and others in JSUnit.
CNExtend_scripts.loadCNXULScripts();

window.addEventListener("load", CNExtend_main.init, false);
window.addEventListener("unload", CNExtend_main.cleanup, false);