// This code is part of DOMinator extension                                                                                            
// DOMinator script
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//

/**
 * @name DOMIDebugger
 * @description Firebug extension to add support for remote debug protocol.
 * @public
 */

FBL.ns(function() { with(FBL) {

const Cc = Components.classes;
const Ci = Components.interfaces;
const jsdIScript = Ci.jsdIScript;
const jsdIStackFrame = Ci.jsdIStackFrame;
const jsdIExecutionHook = Ci.jsdIExecutionHook;
const nsISupports = Ci.nsISupports;
const nsICryptoHash = Ci.nsICryptoHash;
const nsIURI = Ci.nsIURI;

const PCMAP_SOURCETEXT = jsdIScript.PCMAP_SOURCETEXT;
const PCMAP_PRETTYPRINT = jsdIScript.PCMAP_PRETTYPRINT;

const RETURN_VALUE = jsdIExecutionHook.RETURN_RET_WITH_VAL;
const RETURN_THROW_WITH_VAL = jsdIExecutionHook.RETURN_THROW_WITH_VAL;
const RETURN_CONTINUE = jsdIExecutionHook.RETURN_CONTINUE;
const RETURN_CONTINUE_THROW = jsdIExecutionHook.RETURN_CONTINUE_THROW;
const RETURN_ABORT = jsdIExecutionHook.RETURN_ABORT;

const TYPE_THROW = jsdIExecutionHook.TYPE_THROW;
const TYPE_DEBUGGER_KEYWORD = jsdIExecutionHook.TYPE_DEBUGGER_KEYWORD;

const STEP_OVER = 1;
const STEP_INTO = 2;
const STEP_OUT = 3;

    /**
     * @name CrossfireModule
     * @module Firebug Module for Crossfire. This module acts as a controller
     * between Firebug and the remote debug connection.  It is responsible for
     * opening a connection to the remote debug host.
     */
   DOMIDebuggerModule = extend(Firebug.Module,  {
        contexts: [],
        dispatchName: "DOMIDebugger_1",
        
        /** 
         * @name initialize
         * @description Initializes Crossfire
         * @function
         * @private
         * @memberOf CrossfireModule
         * @extends Firebug.Module 
         */
        initialize: function() {

                     this._addListeners(); 
        },
        shutdown : function() {
                     this._removeListeners(); 
        },
  
        /**
         * @name _addListeners
         * @description Adds Crossfire as a listener to the core modules
         * @function
         * @private
         * @memberOf CrossfireModule
         */
        _addListeners: function() {

            Firebug.Debugger.addListener(this);
          //  Firebug.Debugger.addListener(DebuggerListener );
            Firebug.Console.addListener(this);
            Firebug.Inspector.addListener(this);
            Firebug.HTMLModule.addListener(this);
        },        
    /**
         * @name _removeListeners
         * @description Removes Crossfire as a listener from the core modules
         * @function
         * @private
         * @memberOf CrossfireModule
         * @since 0.3a1
         */
        _removeListeners: function() {
            Firebug.Debugger.removeListener(this);
            Firebug.Console.removeListener(this);
            Firebug.Inspector.removeListener(this);
            Firebug.HTMLModule.removeListener(this);
        },
        
    getInfoStackTrace: function(frame,context){
        try{
        var stackF=[];
        var kk=1;
        var j=0;
        var of=frame;
        var fArray=[];
        for (;  of && of.isValid && fArray.indexOf(of)==-1 &&(typeof of.script.fileName!="undefined" || of.script.fileName.indexOf("chrome:")==-1 ); of = of.callingFrame)  {
        try{
            fArray.push(of);
            if(of.script && j>1){
                stackF[j-2]=[1,2,3];
                stackF[j-2][0]= of.script.fileName+"\n";
                stackF[j-2][1]="Line:"+(of.script.pcToLine(of.pc, PCMAP_PRETTYPRINT) -1)+"\n";
            //     dump("Source: "+of.script.fileName+" <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
           //      stackF[j-2][2]= of.script.functionSource;//.replace(/.*\n/mg,function(a){return (kk++)+": "+a})+"\n";
         // Commented out because the replace could cause RegExp.$1 to be overwritten
               var fs=of.script.functionSource.split("\n");
               var v=1;
               stackF[j-2][2]='';
               for each(var i in fs)
                stackF[j-2][2]+=(v++)+': '+(i)+"\n"
                //stackF[j-2][2]= of.script.functionSource.replace(/.*\n/mg,function(a){return (kk++)+": "+a})+"\n";
               kk=1;
             }
             j++;
          }catch(e){dump("Error: getInfoStackTrace: "+e+" "+e.lineNumber+"\n");/*stackF=null;*/ break;}
          if(j>10)
            break; 
        }
        var result_src={};
        
        var evaled = frame.eval( "var callstackArr="+JSON.stringify(stackF)  , "lib.onError.getInfoStackTrace", 0 , result_src);
        result_src=null;
        }catch(exc){dump("***** getInfoStackTrace Exception: "+exc+" "); }
        // window.sidebar.DOMISidebar.addNodeToElement(window.sidebar.DOMISidebar.dataToString({n:0,time:"12345",type:"Sink",loc:getFrameWindow(frame).location.href,target:"eval",value:source,callstack: stackF.toString()}));

     }, 
        /**
         * @name onStop
         * @description Handles Firebug stopping
         * <br><br>
         * Fires an <code>onStop</code> event.
         * @function
         * @public 
         * @memberOf CrossfireModule
         * @param context the current Crossfire context
         * @param frame the current stackframe
         * @param type
         * @param rv
         */
        onStop: function(context, frame, type, rv) {
           try{
            if(type == TYPE_DEBUGGER_KEYWORD){
              this.getInfoStackTrace(frame,context);
              return Components.interfaces.jsdIExecutionHook.RETURN_CONTINUE;
             }
            }catch(e){dump("[eeeee] "+e)}
        } 
    });

    // register module
    Firebug.registerModule(DOMIDebuggerModule);


}});
