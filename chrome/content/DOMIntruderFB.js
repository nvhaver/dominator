// This code is part of DOMinator extension                                                                         
// DOMinator script
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//


//Components.utils.import("resource://domintruder/DOMILogParser.js");
Components.utils.import("resource://domintruder/db.js");
Components.utils.import("resource://domintruder/exploitChecker.js");
Components.utils.import("resource://domintruder/objectAnalyzer.js");

FBL.ns(function() {

with (FBL) {
// returns info to retrieve data from DB.
function getKeysFromElement(elt){
   return {n:elt.getAttribute("n"),ctxid:elt.getAttribute("ctxid"),loc:elt.getAttribute("loc"),time:elt.getAttribute("time")};
}

// Need to overwrite due to RegExp Bug: http://code.google.com/p/fbug/issues/detail?id=4016
FBL.$STR= function $STR(name, bundle) {
    var strKey = name.split(" ").join("_");

    var useDefaultLocale = Firebug.getPref(Firebug.prefDomain, "useDefaultLocale");
    if (!useDefaultLocale) {
        try {
            if (typeof bundle == "string") {
                bundle = document.getElementById(bundle);
            }
            if (bundle) {
                return bundle.getString(strKey);
            } else {
                return Firebug.getStringBundle().GetStringFromName(strKey);
            }
        } catch (err) {
            if (FBTrace.DBG_LOCALE) {
                FBTrace.sysout("lib.getString FAILS '" + name + "'", err);
            }
        }
    }
    try {
        var bundle = Firebug.getDefaultStringBundle();
        return bundle.GetStringFromName(strKey);
    } catch (err) {
        if (FBTrace.DBG_LOCALE) {
            FBTrace.sysout("lib.getString (default) FAILS '" + name + "'", err);
        }
    }
    var index = name.lastIndexOf(".");
    if (index > 0 && name.charAt(index - 1) != "\\") {
        name = name.substr(index + 1);
    }
    name = name.split("_").join(" ");
    return name;
}

DOMLogParser={
  parseData: function (data){
     try{

      var dataObj=data;//JSON.parse(data );
      
      var xml=this.dataToNode(dataObj);
      return  xml.toXMLString();
      }catch(e){FBTrace.sysout(e+e.lineNumber );dump(e+unescape(data.callstack)+" "+data.value+" "+e.lineNumber+"\n")}
      return "Error";
     },   
     dataToNode: function(data){
        if(data.b64){
          data.value=atob( (data.value));
          data.loc=atob( (data.loc));
          data.callstack=JSON.parse(atob(data.callstack));
 
        }
        try{
        var parsedVal=JSON.parse(data.value)
        var resStr=parsedVal[0];
        var objFlow= parsedVal[1];
        }catch(exc){dump(exc+" \n")}
        function addDir(objF){
         
//         var s='try{ if(this.childNodes.length==1){var text=('+JSON.stringify(objF)+');var div=document.createElement("div");div.id="Obj";top.Firebug.DOMPanel.DirTable.tag.append({object: JSON.parse(text), toggles: {}},  div);this.appendChild(div)}';
         var s='try{ if(this.childNodes.length==1){var parsed=top.Firebug.DOMIntruder.DOMIModel.getLogParser().getObjectFlow(this);dump(parsed) ;var text=('+JSON.stringify(objF)+');var div=document.createElement("div");div.id="Obj";div.innerHTML=parsed;top.Firebug.DOMPanel.DirTable.tag.append({object: JSON.parse(text), toggles: {}},  div);this.appendChild(div)}';
         s=s.concat("else{/*a=this.childNodes.item(1).style;*/ a=this.childNodes.item(1);a.id=(a.id=='Obj'?'ObjHidden':'Obj'); }}catch(f){alert('dataToNode '+f+' '+f.lineNumber)}");
         return s;
        }
        var str=<span class="logRecord" ctxid={data.ctxId} n={data.n} loc={data.loc} time={data.time} >{data.n} {data.time} :[
        <span style="text-decoration: underline">{data.loc}
        </span>] 
        <span id={data.type}><br/>Target: [
        {data.target} CallCount: <span id="callcount">1</span>
        ]</span><br/>
        Data:<div id="value" class="value"  onclick={addDir(objFlow)}>+ { resStr }
        </div>
        <div id='callstack' > <span onclick="try{a=this.nextSibling.nextSibling.style;a.display=(a.display=='inline'?'none':'inline');}catch(f){alert(f)}">+ Stack Trace</span>
        <div style='display:none'><pre style="margin-top:0px;">{data.callstack}</pre></div>
        </div></span>;
        return str;
     },
    getObjectFlow: function _DIgetObject(target){

        var elt=getAncestorByClass(target, "logRecord");
        var sourceArr= (new DB).getSourcesRow(getKeysFromElement(elt));
        var aa=[].concat(sourceArr);
  //   for(var i in infoTip)
      dump(aa.toSource(2));
      dump(aa.length);
//       infoTip.innerHTML= getObjFlow(sourceArr  ,'');
     //  DIInfoTipSource.tag.replace({array: aa }, infoTip);
        return getObjFlow(sourceArr  ,'');
}
  }

// InfoTip
var DIInfoTipSource  = domplate(Firebug.Rep,
{
    tag:SPAN(DIV("Sources:"),
        FOR("item", "$array",
           DIV("$item.source")
        )) 
   
    
});
// showInfoTip common function

// showInfoTip common function
function _DIshowItip(infoTip, target, x, y){
         
        if (target.id!="value" ){
            delete this.className;
            return false;
        }
        if(this.className=="logRecord")
         return true;
        this.className="logRecord";
        var elt=getAncestorByClass(target, "logRecord");
        var sourceArr= (new DB).getSourcesRow(getKeysFromElement(elt));
        var aa=[].concat(sourceArr);
  //   for(var i in infoTip)
  //     dump(aa.toSource(2));
  //     dump(aa.length);
    //   infoTip.innerHTML= getObjFlow(sourceArr  ,'');
       DIInfoTipSource.tag.replace({array: aa }, infoTip);
        return true;
}

// Model 
Firebug.DOMIntruder={};

//DOMIntruder.DOMIModel = function() {};
Firebug.DOMIntruder.DOMIModel = extend(Firebug.Module,
{
   registered:false,
   showPanel: function(browser, panel) {
      var isHwPanel = panel && panel.name == "DomIntruder";
      if(isHwPanel){
       this.panelNode = panel.panelNode;
       this.panel=panel;
      }
      var hwButtons = browser.chrome.$("fbDIButtons");
      try{
       var prefs=Cc["@mozilla.org/preferences-service;1"]
           .getService(Ci.nsIPrefService)
           .getBranch("DOMIntruder.");
        prefs.QueryInterface(Ci.nsIPrefBranch2);

        var value = prefs.getBoolPref("logEnabled");
        var logEnButt=browser.chrome.$("hwLogToggleDIToolbarButton");
        logEnButt.setAttribute("checked",value);
        logEnButt.setAttribute("label","Log "+(value?"Enabled":"Disabled"));
        logEnButt.setAttribute("style","color:"+(value?"red":"black"));

        var value = prefs.getBoolPref("logCookieEnabled");
        var logEnButt=browser.chrome.$("hwLogToggleDICookieToolbarButton");
        logEnButt.setAttribute("checked",value);
        logEnButt.setAttribute("label","Log Cookies "+(value?"Enabled":"Disabled"));
        logEnButt.setAttribute("style","color:"+(value?"red":"black"));

        var value = prefs.getBoolPref("useStackTrace");
        var logEnButt=browser.chrome.$("hwLogToggleDIStackToolbarButton");
        logEnButt.setAttribute("checked",value);
        logEnButt.setAttribute("label","Stack Trace "+(value?"Enabled":"Disabled"));
        logEnButt.setAttribute("style","color:"+(value?"red":"black"));
      }catch(ee){ }
     
      collapse(hwButtons, !isHwPanel);
    }, 
    getLogParser: function(){return DOMLogParser},
     /* Init / Destroy Stuff*/
    initializeUI: function() {
      try{
//       Firebug.TabWatcher.addListener(this);
        var pnames=["alert","warning"]
        for(var i=0,len=pnames.length;i<len;i++){
        var panel=FirebugContext.getPanel(pnames[i]);
        panel.n++;
       }
      }catch(e){ }
    },
    initialize: function() {
    
        Firebug.Module.initialize.apply(this, arguments);
        this.register();
         
       //  TabWatcher.addListener(this);
    },
    shutdown: function()
    { 
      try{
        FBTrace.sysout("ShutDown\n");
        this.unregister();
        Firebug.Module.shutdown.apply(this, arguments);
   //   Firebug.InfoTip.removeListener(DIInfoTipSource);
   //   Firebug.TabWatcher.removeListener(this);
      } catch(e) {("\n[EE] Module DOMIModel "+e+" "+e.lineNumber+"\n");}
     //   prefs.removeObserver(Firebug.prefDomain, this, false);
    },
    
    watchWindow: function(context, win) {
        context.window.addEventListener("beforeunload", this.onBeforeUnload, false);
    },

    onBeforeUnload: function(event) 
    {
       try{
        var view = event.target.defaultView;
        var context = TabWatcher.getContextByWindow(view);
         
        if (!context)
            return;
         
         var pnames=["DomIntruder","alert","warning"]
         for(var i=0,len=pnames.length;i<len;i++){
         var panel=context.getPanel(pnames[i]);
          clearNode(panel);
         }
        
        (new DB()).deleteByContext(context.uid);
        
        }catch(e){
         FBTrace.sysout("Exception!!"+context.uid,e);
        }
    },

    
    /* Context Stuff 
    shouldNotCreateContext:function (browser, url, commands){
      
     return false;
    },*/
    showContext: function(browser, context) { 
     try{
         if(!context)
          return;
 
         var pnames=["alert","warning"]
         for(var i=0,len=pnames.length;i<len;i++){
         var panel=context.getPanel(pnames[i]);
         panel.n++;
       }
       }catch(r){dump("[EE] "+r+" "+r.lineNumber+"\n")}
    },
    /*showInfoTip: function(infoTip, target, x, y)
    {  dump("aaaaaaaaaaaaaa "+target+"\n")
    },*/
     onFilterButton: function(context) {
         //openDialog();
         
    },
    onLogToggleDOMIntruderLog: function(event) {
      try{
      var prefs=Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefService)
          .getBranch("DOMIntruder.");
       prefs.QueryInterface(Ci.nsIPrefBranch2);
      var  value = prefs.getBoolPref("logEnabled");
       var button=event.target;
       button.setAttribute("label","Log "+(value?"Disabled":"Enabled"));
       button.setAttribute("checked",!value);
       button.setAttribute("style","color:"+(value?"red":"black"));
       prefs.setBoolPref("logEnabled", !value );
      }catch(ee){alert(ee)}
    },
    onLogStackTraceToggleDOMIntruderLog: function(event) {
      try{
      var prefs=Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefService)
          .getBranch("DOMIntruder.");
       prefs.QueryInterface(Ci.nsIPrefBranch2);
        //  this.setAttribute("label","sss");
      var  value = prefs.getBoolPref("useStackTrace");
       var button=event.target;
       button.setAttribute("label","Stack Trace "+(value?"Disabled":"Enabled"));
       button.setAttribute("checked",!value);
       button.setAttribute("style","color:"+(value?"red":"black"));
       prefs.setBoolPref("useStackTrace", !value );
      }catch(ee){alert(ee+' '+ee.filename+' '+ee.lineNumber)} 
    },
    onClearDOMIntruderLog: function(context) {
       if (this.panelNode)
       {
         clearNode(this.panelNode);
       }else{
         try{
          var panel=context.getPanel("DomIntruder", true);
          this.panelNode=panel;
          clearNode(this.panelNode);
          }catch(e) {dump(e+" "+e.lineNumber+" \n"); }
       }
    }, 
    onLogCookiesToggleDOMIntruderLog: function(event) {
      try{
      var prefs=Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefService)
          .getBranch("DOMIntruder.");
       prefs.QueryInterface(Ci.nsIPrefBranch2);
        //  this.setAttribute("label","sss");
      var  value = prefs.getBoolPref("logCookieEnabled");
       var button=event.target;
       button.setAttribute("label","Log Cookies "+(value?"Disabled":"Enabled"));
       button.setAttribute("checked",!value);
       button.setAttribute("style","color:"+(value?"red":"black"));
       prefs.setBoolPref("logCookieEnabled", !value );
      }catch(ee){alert(ee+' '+ee.filename+' '+ee.lineNumber)} 
    },
    onClearDOMIntruderLog: function(context) {
       if (this.panelNode)
       {
         clearNode(this.panelNode);
       }else{
         try{
          var panel=context.getPanel("DomIntruder", true);
          this.panelNode=panel;
          clearNode(this.panelNode);
          }catch(e) {dump(e+" "+e.lineNumber+" \n"); }
       }
    },
    onGetEventsButton:function(context){
    
    function getWindows(frame){
     var documents = new Array();

    // If the frame is set
     if(frame) {
        var frames       = frame.frames;
        var framesLength = frames.length;

        // If the frame document exists
        if(frame.document)
        {
            documents.push(frame.document);
        }

        // Loop through the frames
        for(var i = 0; i < framesLength; i++)
        {
            documents = documents.concat( getWindows(frames[i]));
        }
      }

      return documents;
     }
  
      var docs=getWindows(context.window)
      if (!this.panelNode)
       {
         try{
          var panel=context.getPanel("DomIntruder", true);
          this.panelNode=panel;
           
          }catch(e) {dump(e+" Ddddddddddddd\n");alert(e)}
       }
       for(var i=0;i<docs.length;i++){
        var collection=docs[i].getElementsByTagName("*");
         dump(collection.length+"\n");
         for(var j=0;j<collection.length;j++){
            dump("Element: "+collection[j]+"\n");
            context.getPanel("DomIntruder", true).getEventListenerForElt(collection[j],function(a,b){if(b.toSource())dump(a+' _ '+b.type+" "+b.toSource()+"\n")});
         }
       }
    },
    getFromDB: function(){
     var ctxt=FirebugContext;
     (new DB).getRow({mCtxt:ctxt,loc:loc});
    },
    //////////  Observer
    observe: function(subject, topic, data) {
     // Do your stuff here.
       var ctxt=TabWatcher.getContextByWindow(subject);
       if(!ctxt)
         ctxt=FirebugContext;
 
       if(topic=="domintruder-logmessage" ){
       
     //    dump(TabWatcher.getContextByWindow(subject).uid+".getContextByWindow "+subject+"\n")
         try{
         var dd=JSON.parse(data);
          dd.ctxId=ctxt.uid;
         try{ 
        /* Cambio  
        
          data.value=atob( (data.value));
          data.loc=atob( (data.loc));
          data.callstack=JSON.parse(atob(data.callstack));
          data.b64=false;
          fin Cambio */
         var xmlData=DOMLogParser.parseData(dd ) ;
         }catch(e){
          dump("xmlData "+e+" "+e.lineNumber+" "+this.registered+" <<<<<<<\n");
       //   var xmlData=  this.DILog.parseData(data);  
         }
         var ob={};

         if(sinks.indexOf(dd.type)>-1 ){
          var parse1=JSON.parse( dd.value )[1];
          if(typeof parse1 !='object')
           parse1=JSON.parse(parse1);
          if(dd.target.match(/\.innerHTML|document\.write|createContextualFragment/) ){
             var ob=Sinks.classic.isExploitable(parse1);
          }else if(dd.target.match(/^location|^XMLHR\.open|^(SCRIPT|I?FRAME|EMBED)\.src|^A\.href/)){
              var ob=Sinks._location.isExploitable(parse1 );
          }else if(dd.target == "eval" || dd.target == "Function" || dd.target.indexOf("setTimeout")==0|| dd.target.indexOf("setInterval")==0){
              var ob=Sinks._eval.isExploitable( parse1); 
          }else if(dd.target == "cookie"  ){
              var ob=Sinks._cookie.isExploitable( parse1); 
          }
          ob.cid=  ctxt.uid;
          ob.logObj=dd;
          if(ob.obj==undefined){
            ob.obj=getSources(typeof parse1 =='object'?parse1:JSON.parse(parse1) ,null );
          }
      //    dump("addo "+FirebugContext.uid+"\n");
//          dump(ob.toSource(3)+" ------------------------------------------------\n"+ (dd.target  )+ " "+dd.type+" "+ ob +" "+ !ob.cookie +" "+ ob.isDecoded +"\n");
          if((dd.target != "cookie" && ob && !ob.cookie && ob.isExpl) || (dd.target == "cookie" && ob && !ob.cookie && ob.isDecoded)){
              ctxt.getPanel("alert").logIt(xmlData);
//              dump(this.dependents["alert"]+"\n");
             } else if(dd.target != "cookie" || (dd.target == "cookie" && ob   && ob.isExpl) ){
              ctxt.getPanel("warning").logIt(xmlData);
             }
         } else {
            // Here check for sources.
            var ob={};
            ob.cid= ctxt.uid;
            var vv=null;
            try{
             if(dd.value){
               var parse1=JSON.parse( dd.value )[1];
               vv=getSources(typeof parse1 =='object'?parse1:JSON.parse(parse1) ,null ); 
             }
            }catch(eee){dump("\n-----------------------\n"+eee+" "+"\n-------------\n");vv=null;}
            ob.logObj=dd;
            ob.obj=vv;
            
     /*         try{
            if(dd.value)
            dump("_____________________________________________________\n"+vv.toSource(2)+"\n"+(JSON.parse(JSON.parse( dd.value )[1])).toSource(2)+"\n===========================================\n")
            }catch(eee){dump("[EEEEEEEEEEEEEEEEEEEe] "+eee+" "+dd.value+" "+eee.lineNumber+"\n");}*/
            }
            (new DB()).addRow(ob);
            ctxt.getPanel("DomIntruder").logIt( xmlData );
         }catch(e){dump("[EEEEE] Errore DOMIntruderFB "+e+" "+e.lineNumber+"\n\n\n\n\n\n\n");}
      }else if(topic =="dominator-logtogui"){
                
         }
    },
    register: function(){
    try{
       if(!this.registered){
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(this, "domintruder-logmessage", false);
//        observerService.addObserver(this, "domintruder-logmessage", false);
        this.registered=true;

         }
         }catch(err){dump("[EE] "+err+" "+err.lineNumber+"\n")}
    },
    unregister: function(){

       try{
     if(this.registered){

       
       var observerService = Components.classes["@mozilla.org/observer-service;1"]
                             .getService(Components.interfaces.nsIObserverService);

       
       observerService.removeObserver(this, "domintruder-logmessage");

       this.registered=false; 
      }
      }catch(ee){dump("[EEE] Model "+ee+" "+ee.lineNumber+"\n"); }
    }
    
    });

Firebug.DOMIntruder.MonitorPanel = function() {};
Firebug.DOMIntruder.MonitorPanel.prototype = extend(Firebug.ActivablePanel, {
   name: "DomIntruder",
   title: "DOMInator",
   dependents:[],
    // InfoTip listener
    showInfoTip: _DIshowItip ,
     initialize: function(context, doc) {
        //context.DILog=DOMLogParser;
        Firebug.Panel.initialize.apply(this, arguments);
        try{
        this.context=context
        this.document=doc; 
        // Add location to create window menu
         this.location = this.getDefaultLocation(this.context);


         appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
         }catch(ee){dump("[EEEEEEEEEEEEEEE] Errore initualize "+ee+"\n")};
        
    },
    initializeUI: function(detachArgs){
      dump("Firebug.DOMIntruder.MonitorPanel sinitializeUI \n");
    }, 
    showPanel: function(browser, panel) {
      dump("\nFirebug.DOMIntruder.MonitorPanel s SHOW PANEL\n\n");
      
    },
     
     reattach: function(doc){
        this.document = doc;

        if (this.panelNode)
        {
            this.panelNode = doc.adoptNode(this.panelNode, true);
            this.panelNode.ownerPanel = this;
            doc.body.appendChild(this.panelNode);
        }

     }
    ,  
    refresh: function()
    { 
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
        
    }, 
    detach:function(a,b){
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    },
    show:function(state){
       
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    },
 
    destroy: function(state) {
        

        Firebug.Panel.destroy.apply(this, arguments);
        // TODO: Panel cleanup.
     
       
    },

    shutdown: function()
    { 


     Firebug.Panel.shutdown.apply(this, arguments);
     //   prefs.removeObserver(Firebug.prefDomain, this, false);
    },
 
    onActivationChanged: function(enable)
    {

 
    },

    getOptionsMenuItems: function(context)    {
        return [
         /*   this.optionMenu("Log Enabled", "DOMIntruder.logEnabled"),
          {
            label: "My First Menu Item",
            nol10n: true,
            type: "checkbox",
            command: function(context) {  
                 var panel=FirebugContext.getPanel("DomIntruder");
                 if(this.checked){
                  alert(this.checked);
                 }else{
                  
                  alert(this.checked);
                 }
                  
                 var helloWorldRep = domplate(Firebug.Rep,{ myTag:
                       DIV({class: "MyDiv"},
                       "Hello World!"
             )
            });
            var parentNode = panel.panelNode;
             var rootTemplateElement = helloWorldRep.myTag.append(
        {}, parentNode, helloWorldRep);
         }
        }*/];
        },
   optionMenu: function(label, option){
      try{
      var prefs=Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefService)
          .getBranch("DOMIntruder.");
       prefs.QueryInterface(Ci.nsIPrefBranch2);
  
       value = prefs.getBoolPref("logEnabled");
       
         }catch(ee) {}
     return {
            label: label,
            nol10n: true,
            type: "checkbox",
            checked: value,
            command: (function(pref,val){return function(){ pref.setBoolPref("logEnabled", !val )}})(prefs,value)
        };
   },
    addDependentModule : function (dep){
     this.dependents[dep.name]=dep;
    },
   isEnabled: function(context) {
  
        // For backward compatibility with Firebug 1.1. ActivableModule has been
        // introduced in Firebug 1.2.
        if (!Firebug.ActivableModule)
            return true;

        return true;//BaseModule.isEnabled.apply(this, arguments);
   },
   createRow: function(rowName, className)
    {
        var elt = this.document.createElement("div");
        elt.className = rowName + (className ? " " + rowName + "-" + className : "");
        return elt;
    },
   logIt: function(html){
        try{
        var panel=this.context.getPanel("DomIntruder");
  
        function logText(text, row)
        {
            var node = row.ownerDocument.createTextNode(text);
            row.appendChild(node);
            return row.innerHTML;
        }
      
        var parentNode = panel.panelNode;
/*        if(!panel.context.added){
        var style= panel.document.createElement("style");
        style.textContent="body{font-size:small}#value{background-color: black;color: pink;}#Getter{background-color:  darkgreen;color: white;}#Flow{background-color: white;color: black;}#Setter{background-color: blue;color: white;}#Sink{background-color: red;color: black}#callstack{border:1px solid}"
        parentNode.appendChild(style);
         panel.context.added=true;
         dump("added\n");
         } */
        var te=parentNode.ownerDocument.createElement("div");
        te.innerHTML=html;
        parentNode.appendChild(te);
      /*  var helloWorldRep = domplate({ myTag:
                       DIV({class: "MyDiv"},
                        html 
                         )
            });
        var rootTemplateElement = helloWorldRep.myTag.append(
        {}, parentNode, helloWorldRep); */
        
      } catch(e) { dump(e.toSource(2)+" aaa\n"); }
   },
   
   // It seems this goes only on 3.5+ 
   getEventListenerService: function getEventListenerService() {
     if (!this.eventListenerService)
     {
        try
        {
            var eventListenerClass = Components.classes["@mozilla.org/eventlistenerservice;1"];
            this.eventListenerService = eventListenerClass.getService(Components.interfaces.nsIEventListenerService);
        }
        catch (exc)
        {
             dump("Error: events.getEventListenerService FAILS "+exc );
        }
     }
     return this.eventListenerService;
    },
    getEventListenerForElt :function appendEventInfos(elt, fnTakesEltInfo) {
      try{
        if(!this.els){
        var els = this.getEventListenerService();
         this.els=els;
        }
        if (!this.els){
         // alert(122)
            dump("no els");
            return;
        }
        
        var infos = this.els.getListenerInfoFor(elt, {});
         // alert(infos.length);
        for (var i = 0; i < infos.length; i++)
        {
            var anInfo = infos[i];
            if (anInfo instanceof  Components.interfaces.nsIEventListenerInfo) // QI
                fnTakesEltInfo(elt, anInfo);
        }
        }catch(e){dump("getEventListenerForElt: "+e);}
    },
    supportsObject: function(object) {
  
		if(object instanceof Window)
			return 2;
		/*else if (object instanceof Element ||
				object instanceof Text ||
				object instanceof Attr ||
				object instanceof Comment ||
				object instanceof Document ||
				object instanceof SourceText )
			return 0; */
		else
			return 0;
    },
    getLocationList: function() {
    
         function getWindows(frame){
          var documents = new Array();

         // If the frame is set
          if(frame) {
             var frames       = frame.frames;
             var framesLength = frames.length;

             // If the frame document exists
             if(frame )
             {
                 documents.push(frame );
             }

             // Loop through the frames
             for(var i = 0; i < framesLength; i++)
             {
                 documents = documents.concat( getWindows(frames[i]));
             }
           }

           return documents;
          }
  //    dump("aaaaaaaaaaaaaaaaaaaaa"+context.baseWindow+"\n");
              var docs=getWindows(this.context.window)
              
	      var locations = [];
	      var win = this.context.window;
	
	      //locations.push(this.context.window);
	
	      for(var i=0; i<docs.length; i++) {
	              locations.push(docs[i]);
	      }
	      return locations;
     },
     getObjectDescription: function(object) {
		var win = this.context.window;
		
		var path;
		try{
			path = object.location.host + object.location.pathname;
		} catch(e) {
			path = "" + object.location;
		}

		var name = "";

		if(object == win) name = "Top Window";
		else {
                 try{
                  win=object.parent;
                 // Firebug.Console.log(object , FirebugContext, "dir", Firebug.DOMPanel.DirTable);
                }catch(e){dumpMsg("Error: "+e);}
			for(var i=0; i<win.frames.length; i++)
				if(win.frames[i].window== object) {
					name = getElementCSSSelector(object.frameElement); //+ "["+i+"]";
					break;
				}
		}
		
		return {name: name, path: path};
     },
     getDefaultLocation: function(context) {
		return context.window;
     },
    
    
});
function SourcePanel() {}
SourcePanel.prototype = extend(Firebug.Panel,
/** @lends EventElementPanel */
{
    name: "sources",
    title: "Sources",
    parentPanel: "DomIntruder",
        initialize: function(context, doc)
    {
        Firebug.Panel.initialize.apply(this, arguments);
      //  appendStylesheet(doc, "chrome://eventbug/skin/eventbug.css");
//        this.panel=this.context.getPanel("sources");
         this.n setter=(function(pan,tit){return function(n){ var panel=pan;  
          try{
            panel.getTab().labelNode.value=panel.title=tit+' ('+(panel.panelNode.childNodes.length)+')';
          }catch(r){}
         }})(this,this.title);
    },  
    refresh: function()
    { this.n++;
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
        
    }, 
    detach:function(a,b){
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    },
    show:function(state){
      this.n++;
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    },

});

 function InfoPanel() {}
InfoPanel.prototype = extend(Firebug.Panel,
/** @lends EventElementPanel */
{
    name: "info",
    title: "Info",
    parentPanel: "DomIntruder",
    initialize: function(context, doc)
    {
        Firebug.Panel.initialize.apply(this, arguments);
      //  appendStylesheet(doc, "chrome://eventbug/skin/eventbug.css");
//        this.panel=FirebugContext.getPanel("info");
         this.n setter=(function(pan,tit){return function(n){ var panel=pan;  
          try{
            panel.getTab().labelNode.value=panel.title=tit+' ('+(panel.panelNode.childNodes.length)+')';
          }catch(r){}
         }})(this,this.title);/* function(n){ var panel=FirebugContext.getPanel("info");  
           try{
            panel.getTab().labelNode.value=panel.title='info ('+(panel.panelNode.childNodes.length)+')';
           } catch(e){}
         }; */
    },  
    refresh: function()
    { this.n++;
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
        
    }, 
    detach:function(a,b){
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    },
    show:function(state){
      this.n++;
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    }

});
function WarningPanel() {}
WarningPanel.prototype = extend(Firebug.Panel,
/** @lends EventElementPanel */
{
    name: "warning",
    title: "Warning",
    parentPanel: "DomIntruder",
    initialize: function(context, doc)
    {
        Firebug.Panel.initialize.apply(this, arguments);
//        this.panel= this.context.getPanel("warning");
        appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
        
         this.n setter=(function(pan,tit){return function(n){ var panel=pan;  
          try{
            panel.getTab().labelNode.value=panel.title=tit+' ('+(panel.panelNode.childNodes.length)+')';
          }catch(r){}
         }})(this,this.title);
         /* function(n){ var panel=FirebugContext.getPanel("warning");  
           try{
            panel.getTab().labelNode.value=panel.title='Warning ('+(panel.panelNode.childNodes.length)+')';
           }catch(er){}
         }; */
         
    
      //  appendStylesheet(doc, "chrome://eventbug/skin/eventbug.css");
    }, 
    showInfoTip:  _DIshowItip,    
    logIt: function(html){
        try{
        var panel=this.context.getPanel("warning");
        function logText(text, row)
        {
            var node = row.ownerDocument.createTextNode(text);
            row.appendChild(node);
            return row.innerHTML;
        }
      
        var parentNode = panel.panelNode;
        /*
        var style= panel.document.createElement("style");
        style.textContent="body{font-size:small}#value{background-color: black;color: pink;}#Getter{background-color:  darkgreen;color: white;}#Flow{background-color: white;color: black;}#Setter{background-color: blue;color: white;}#Sink{background-color: red;color: black}#callstack{border:1px solid}"
        parentNode.appendChild(style);
          */
        var te=parentNode.ownerDocument.createElement("div");
        te.innerHTML=html;
        parentNode.appendChild(te);
        this.n++;
      /*  var helloWorldRep = domplate({ myTag:
                       DIV({class: "MyDiv"},
                        html 
                         )
            });
        var rootTemplateElement = helloWorldRep.myTag.append(
        {}, parentNode, helloWorldRep); */
        
      } catch(e) { dump(e.toSource(2)+" aaa\n"); }
   },  
    refresh: function()
    { 
     this.n++;
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
        
    }, 
    detach:function(a,b){
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    },
    show:function(state){
      this.n++;
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    }, 

});
function AlertPanel() {}
AlertPanel.prototype = extend(Firebug.Panel,
/** @lends EventElementPanel */
{
    name: "alert",
    title: "Alerts",
    parentPanel: "DomIntruder",
    initialize: function(context, doc)
    {
        Firebug.Panel.initialize.apply(this, arguments);
//        context.getPanel(this.parentPanel).addDependentModule(this);
        this.doc=doc;
        appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
         
        this._n=0
        this.n setter=(function(pan,tit){return function(n){ var panel=pan;  
          try{
            panel.getTab().labelNode.value=panel.title=tit+' ('+(panel.panelNode.childNodes.length)+')';
          }catch(r){}
         }})(this,this.title);
    },
    showInfoTip: _DIshowItip,
    refresh: function() {
     this.n++;
     appendStylesheet(this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    }, 
    detach:function(a,b) {
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    },
    show:function(state) {
      this.n++;
     appendStylesheet( this.panelNode.ownerDocument,"chrome://domintruder/skin/DOMIStyle.css");
    }, 
    logIt: function(html) {
       try{
        var panel=this.context.getPanel("alert");
        function logText(text, row)
        {
            var node = row.ownerDocument.createTextNode(text);
            row.appendChild(node);
            return row.innerHTML;
        }
      
        var parentNode = panel.panelNode;
        var te=parentNode.ownerDocument.createElement("div");
        te.innerHTML=html;
        parentNode.appendChild(te);
        this.n++;
      } catch(e) { dump(e+" "+e.filename+" "+e.lineNumber+"\n"); }
   }

});

Firebug.registerActivableModule(Firebug.DOMIntruder.DOMIModel); 
Firebug.registerPanel(Firebug.DOMIntruder.MonitorPanel);
/*Firebug.registerPanel(SourcePanel);
Firebug.registerPanel(InfoPanel); */
Firebug.registerPanel(WarningPanel);
Firebug.registerPanel(AlertPanel);

}});
