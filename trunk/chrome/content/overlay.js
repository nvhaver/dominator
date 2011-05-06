//                                                                                             
// This code is part of DOMinator extension
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//

var DOMinatorStart = {
  prefs:null,
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("test-strings"); 
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("DOMIntruder.");
    /* toggleSidebar("viewDbgSidebar",true); */
     try{
  var test=Cc["@mindedsecurity.com/docob;1"].getService(Ci.nsIWebProgressListener);
  
  dump("____________________________________________________________________________________________________ Registrato!1\n");
  }catch(ee){}
     if(!this.prefs.prefHasUserValue("enabled")){
       this.prefs.setBoolPref("enabled",false);
       document.getElementById("DomIntruder").label="Off" ;
       Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).savePrefFile(null);
     }else{
     document.getElementById("DomIntruder").src= "chrome://domintruder/skin/hal"+(this.prefs.getBoolPref("enabled" )?"_green":"")+".png";
    }
  },
  onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
  },
  toggle: function toggle(event){
     try{
     dump("onToggle\n");
     this.prefs.setBoolPref("enabled",!this.prefs.getBoolPref("enabled" ));
     event.target.label =(this.prefs.getBoolPref("enabled" )?"On":"Off");
     event.target.src="chrome://domintruder/skin/hal"+(this.prefs.getBoolPref("enabled" )?"_green":"")+".png"
     Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).savePrefFile(null);
     }catch(exc){dump(exc);}
     
  }
};


window.addEventListener("load", function(e) {  DOMinatorStart.onLoad(e); }, false);
if(gBrowser)
gBrowser.addEventListener("load", function(e) {  DOMinatorStart.onLoad(e); }, false);


