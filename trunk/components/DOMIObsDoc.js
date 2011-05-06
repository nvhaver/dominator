//                                                                                             
// This code is part of DOMinator extension
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const Cc = Components.classes;
const Ci = Components.interfaces;

 
function DOMIObsDoc() {
 this.init();
}

DOMIObsDoc.prototype = {
    classDescription: "DOMIntruder Doc Object Monitor",
    contractID: "@mindedsecurity.com/docob;1",
    classID: Components.ID("{79effc9e-158c-4986-9c34-ca47391b7ae9}"),
QueryInterface : XPCOMUtils.generateQI([ Ci.nsISupportsWeakReference]),
__logService : null, // Console logging service, used for debugging.
    get _logService() {
        if (!this.__logService)
            this.__logService = Cc["@mozilla.org/consoleservice;1"].
                                getService(Ci.nsIConsoleService);
        return this.__logService;
    },
  __observerService : null, // Observer Service, for notifications
    get _observerService() {
        if (!this.__observerService)
            this.__observerService = Cc["@mozilla.org/observer-service;1"].
                                     getService(Ci.nsIObserverService);
        return this.__observerService;
    },
 /*   _xpcom_categories: [{ category: "some-category",  service: true  }], */
 init : function () {
        try{
        this.prefs = Cc["@mozilla.org/preferences-service;1"]
            .getService(Ci.nsIPrefService)
            .getBranch("DOMIntruder.");
        this.prefs.QueryInterface(Ci.nsIPrefBranch2);
        this.prefs.addObserver("", this._webProgressListener, false);
        }catch(exc){dumpn("[EE] Observer Exception: "+exc);}
        // Cache references to current |this| in utility objects
        this._webProgressListener._domEventListener = this._domEventListener;
        this._webProgressListener.prefs = this.prefs;
        this._webProgressListener.enabled = this.prefs.getBoolPref("enabled");
        this._webProgressListener._pwmgr = this;
        this._domEventListener._pwmgr    = this;
      //  this._observer._pwmgr            = this;

         // Get current preference values.
        this._debug = true;
 
 
        // WebProgressListener for getting notification of new doc loads.
        var progress = Cc["@mozilla.org/docloaderservice;1"].
                       getService(Ci.nsIWebProgress);
        progress.addProgressListener(this._webProgressListener,
                                     Ci.nsIWebProgress.NOTIFY_STATE_DOCUMENT);


    },
  log : function (message) {
        if (!this._debug)
            return;
        dump("Injector: " + message + "\n");
       // this._logService.logStringMessage("Injector: " + message);
    },
  _webProgressListener : {
        _pwmgr : null,
        _domEventListener : null,

        QueryInterface : XPCOMUtils.generateQI([Ci.nsIWebProgressListener,
                                                Ci.nsISupportsWeakReference]),


        onStateChange : function (aWebProgress, aRequest,
                                  aStateFlags,  aStatus) {

            // STATE_START is too early, doc is still the old page.
 /* function getContents(aURL){
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
 if(this.JS==undefined)    
   this.JS = getContents("resource://domintruderjss/jsInject_obj_debug.js")
   */ 
            if(!this.enabled)
             return;
            if ( (aStateFlags & Ci.nsIWebProgressListener.STATE_STOP) )
               return;
 

            var domWin = aWebProgress.DOMWindow;
            var domDoc = domWin.document;
             
            // Only process things which might have HTML forms.
            try{
            if (!(domDoc instanceof Ci.nsIDOMHTMLDocument)|| !aRequest ||  !aRequest.name || aRequest.name.match(/^jar:|^file:|^ftp:|^chrome:/))
                return;
            }catch(ex){
            }
            var head=domDoc.getElementsByTagName("head")[0];
            if(!head) 
             return ;
            
            if(domWin.test)
             return;
            else
             domWin.test=1;
            
            var el=domDoc.createElement("script");
            
            el.textContent='if(typeof __TestDI123=="undefined"){__TestDI123=1;____DI____.go(window)}else{t=0x'+aStateFlags.toString(16)+'}';
 //         el.textContent=this.JS;
            if(head.hasChildNodes())
             head.insertBefore(el,head.firstChild);
            else
             head.appendChild(el);
/*
            var nodes=head.childNodes
            for(var i=0;i<nodes.length;i++)
            this._pwmgr.log("Nodi:"+i+"/"+nodes.length+' su '+(aRequest ?  aRequest.name : "(null)"));
            this._pwmgr.log("onStateChange accepted: req = " +
                            (aRequest ?  aRequest.name : "(null)") +
                            ", flags = 0x" + aStateFlags.toString(16));

            // Fastback doesn't fire DOMContentLoaded, so process forms now.
            if (aStateFlags & Ci.nsIWebProgressListener.STATE_RESTORING) {
                this._pwmgr.log("onStateChange: restoring document");
                return ; //this._pwmgr._fillDocument(domDoc);
            } */

            // Add event listener to process page when DOM is complete.
            domDoc.addEventListener("DOMContentLoaded",
                                    this._domEventListener, false);
            return;
        },

        // stubs for the nsIWebProgressListener interfaces which we don't use.
        onProgressChange : function() { throw "Unexpected onProgressChange"; },
        onLocationChange : function() { throw "Unexpected onLocationChange"; },
        onStatusChange   : function() { throw "Unexpected onStatusChange";   },
        onSecurityChange : function() { throw "Unexpected onSecurityChange"; },
        
        observe: function(subject, topic, data) {
        if (topic != "nsPref:changed")
         {
           return;
         }
         switch(data)
         {
           case "enabled":
             this.enabled = this.prefs.getBoolPref("enabled");
             dumpn("ggoooo");
           /*  if(this.enabled)
               this.enableDebugger();
             else
               this.disableDebugger(); */
             break; 
         }
      },
    },


    /*
     * _domEventListener object
     *
     * Internal utility object, implements nsIDOMEventListener
     * Used to catch certain DOM events needed to properly implement form fill.
     */
    _domEventListener : {
        _pwmgr : null,

        QueryInterface : XPCOMUtils.generateQI([Ci.nsIDOMEventListener,
                                                Ci.nsISupportsWeakReference]),


        handleEvent : function (event) {
            if (!event.isTrusted)
                return;

            this._pwmgr.log("domEventListener: got event " + event.type +' ' +event.target);

            switch (event.type) {
                case "DOMContentLoaded":
                   // this._pwmgr._fillDocument(event.target);
                    return;

                case "DOMAutoComplete":
                case "blur": 
                    return;

                default:
                    this._pwmgr.log("Oops! This event unexpected.");
                    return;
            }
        }
    }

};

var component = [ DOMIObsDoc ];
function NSGetModule (compMgr, fileSpec) {
    return XPCOMUtils.generateModule(component);
}
