//                                                                                             
// This code is part of DOMinator extension
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
const Cc = Components.classes;
const Ci = Components.interfaces;

function DOMIntruder() {
 this.wrappedJSObject = this;
try{
Components.utils.import("resource://domintruder/db.js");

}catch(e){dump("[EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE] "+e);}
 function getContents(aURL){
     var ioService=Components.classes["@mozilla.org/network/io-service;1"]
       .getService(Components.interfaces.nsIIOService);
     var scriptableStream=Components
       .classes["@mozilla.org/scriptableinputstream;1"]
       .getService(Components.interfaces.nsIScriptableInputStream);
     var channel=ioService.newChannel(aURL,null,null);
     var input=channel.open();
     scriptableStream.init(input);
     var str=scriptableStream.read(input.available());
     scriptableStream.close();
     input.close();
     return str;
 }
 initializeDB();
 this.register();
 this.logEnabled=this.prefs.getBoolPref("logEnabled");
 if(this.JS==undefined) 
   this.JS = getContents("resource://domintruderjss/jsInject_obj_debug.js")
 /*
 var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
 file.append("DOMIntruderLog.sqlite");

 var storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
 this.mDBConn = storageService.openDatabase(file); 
 */
}

const NAME = "____DI____";
 DOMIntruder.prototype = {
  classDescription: "DOMIntruder Javascript XPCOM Component",
  classID:          Components.ID("{b450449f-e215-40d9-b550-c1b8479a4dbf}"),
  contractID:       "@mindedsecurity.com/domin;1",
  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDOMIntruder, Components.interfaces.nsIClassInfo]),
  doLog:true,
  _xpcom_categories: [
 //{ category: "JavaScript global property", entry: "MyAjax"},
 { category: "JavaScript global property", entry: NAME }],
  flags: Components.interfaces.nsIClassInfo.DOM_OBJECT,
  getInterfaces: function(countRef) {
    var interfaces = [Components.interfaces.nsIDOMIntruder, Components.interfaces.nsIClassInfo ];
    countRef.value = interfaces.length;
    return interfaces;
  },
  name: NAME,
  get stack(){ var s=Components.stack;do{dump(s+'\n')}while((s=s.caller));
  },
 /* _searchFrames: function(win){
              for(var j = 0; j <  win.frames.length; j++){
                var foo2 =  win.frames[j].wrappedJSObject[this.name];
                if (foo2 && foo2.wrappedJSObject == this) {
                  return win.frames[j].wrappedJSObject;
                }
                if(win.frames[j]===win) 
                  continue;
                else if(win.frames.length>0){
                  var rwin=this._searchFrames(win);
                  if(rwin)
                   return rwin;
                }
             }
             return null;
             
  },
  _findWindow: function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
    var e = wm.getEnumerator("navigator:browser");
    while (e.hasMoreElements()) {
        var w = e.getNext();
        dump(w+" WINDOWWINDOWWINDOWWINDOWWINDOWWINDOWWINDOWWINDOWWINDOWWINDOWWINDOWWINDOW\n");
        var tabBrowsers = w.document.getElementById("content");
        var browsers = tabBrowsers.browsers;
        for (var i = 0; i < browsers.length; i++) {
            var browser = browsers[i];
            var window = browser.docShell.DOMWindow;
 dump(window.wrappedJSObject+" "+window.wrappedJSObject[this.name] + " "+( window.wrappedJSObject[this.name] ? window.wrappedJSObject[this.name].wrappedJSObject:"")+ " "+ this +" dddddddddddddddddddddddddddddddddddddddddddddddddd\n");
            var foo =  window.wrappedJSObject[this.name];
            if (foo && foo.wrappedJSObject == this) {
                return window.wrappedJSObject;
            }
            if(window.frames.length>0){
                  var rwin=this._searchFrames(window);
                  if(rwin)
                   return rwin;
            }
        }
    }
    return null;
  }, */  
  dumpobj: function (ob){ 
            for(var i in ob){
              try{
              dump(i+' '+ob[i]+"\n");
              }catch(c){dump("Exception "+i+" "+c+"\n")}
            }
  },
  get wantStackTrace() {
       var prefs=Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefService)
          .getBranch("DOMIntruder.");
       prefs.QueryInterface(Ci.nsIPrefBranch2);  
      return  prefs.getBoolPref("useStackTrace");
  } 
  ,get wantCookies(){
       var prefs=Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefService)
          .getBranch("DOMIntruder.");
       prefs.QueryInterface(Ci.nsIPrefBranch2);
        //  this.setAttribute("label","sss");
      var  value = prefs.getBoolPref("logCookieEnabled");
      return value;
   },
  getHelperForLanguage: function(count) {return null;},
  go: function(win) { 
   var o=win.wrappedJSObject;if(o && !o.__domIntruderObj){ 
   try{ 
     var stag=o.document.createElement("script");
     stag.textContent=this.JS;
     o.document.getElementsByTagName("head")[0].appendChild(stag);
  
     }catch(s){o.alert(s)}
   }
   //else {dump("dddddddddddddddddddddddddd___________________  ________________________________________________________ window:"+o)}
   return "ok";
  },
  logMe:function(obj) {
     return btoa(String.unTaint(obj));
  },
  jsonstr: function (str){
      var obj=uneval(str);
      return JSON.stringify(obj);
  },
   register: function()
   {
      if(this.registered)
       return;
      try{
      this.prefs = Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefService)
          .getBranch("DOMIntruder.");
      this.prefs.QueryInterface(Ci.nsIPrefBranch2);
      this.prefs.addObserver("", this, false);
      this.registered=true;
      }catch(exc){dumpn("[EE] Observer Exception: "+exc);}
   },

   unregister: function()
   {  
      if(!this.registered)
       this.prefs.removeObserver("", this);
   }, 
  observe: function(subject, topic, data){
  
     if (topic != "nsPref:changed") 
       return;
     
     switch(data) {
       case "logEnabled":
         this.logEnabled = this.prefs.getBoolPref("logEnabled");
       /*   dump("ggoooo\n");
        if(this.enabled)
           this.enableDebugger();
         else
           this.disableDebugger(); */
         break;
       /*  case "url":
         this.JS = this.prefs.getCharPref("url");

         break;*/
     }
  },
  log:function(msg,winIn) {
     if(!this.logEnabled)
      return ;
      
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
  //  dump(msg +"\nsssssssssssssssssssssssssssssssssssssssssssssssssssssssss\n");
    // (new DB()).addRow(JSON.parse(msg));
    //  browserWindow.FirebugContext.getPanel("DomIntruder").logIt( msg.toString())
    // @mozilla.org/scriptsecuritymanager;1
    // try{
    // var xpc=Components.classes['@mozilla.org/scriptsecuritymanager;1'].getService();
    // dump("------------------------------------------------------------------->XPC "+xpc+" "+xpc.GetCurrentJSStack+"\n");
   // var jsd=Components.classes['@mozilla.org/js/jsd/debugger-service;1'].getService(Components.interfaces.jsdIDebuggerService);
   // var jsd=Components.classes["@mozilla.org/js/xpc/ContextStack;1"].getService().QueryInterface(Components.interfaces.nsISupportsWeakReference).GetWeakReference();
   // this.dumpobj(jsd);
    // }catch(e){dump("[EEEEE ] Errore: "+e);}
    Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService).notifyObservers( winIn,'domintruder-logmessage',msg)
     return ;
  }

  };
var components = [DOMIntruder];
//appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
//dump(appInfo.platformVersion+" <--------------------------------------------------VERSIONEs\n");
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}
 
