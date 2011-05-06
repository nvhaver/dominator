//                                                                                             
//                                                                                             
// This code is part of DOMinator extension                                                                                      
// DOMinator script
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//
// Lista di Todo urgenti:
// 1.capire come mai l'help di vmware ha l'eccezione sul firefox compilato
//   ..visto che il firefox ubuntu non la da'...  
// manca:  window.open()
// 
// Le regexp non sono ancora tainted.  var match = taintedVar.match(/([^?#]*)(#.*)?$/);

/** 
Non e' possibile prendere cose come
fromCharCode(Num, num)
dove num e' preso da una qualche stringa tainted...
charAt
charCodeAt
***** Da provare  

*/
/**
 navigate IE.. to DO

**/

/** 
Note Varie, capire se si puo' fare qualcosa sui Css. Es.
setter sul CssText etc capendo se e' tainted il valore.
Forse ma forse gli eventlistener dal momento che viene creato anche attraverso una stringa?

Ci sono da definire tutti i setter per le funzioni wrappate viwsto che 
il Js potrebbe cercare di ridefinirle.. :(

Onthrow : To do similar coding as on createScript to catch Event, Top-Level and eval stuff 
Nota:
Interessante la cosa del CaptureEvents ReleaseEvents routeEvent
**/
 
___domIntruderDXUI=function ___domIntruderDXUI(dbg){
 
  this.debug=dbg; 
  this.n=0;
  this.index=0; 
}
  
___domIntruderDXUI.prototype={};
 
try{

___domIntruderDXUI.prototype.send=function (obj){
   ____DI____.log(__domIntruderObj.stringify(obj,false),window);
   
   return;
}
}catch(err){alert(err+' '+err.lineNumber)}
/**

FixMe: old, got to be updated
Data Obj Format:
{
 n:"Seq#",
 time:"HH:MM.mm",
 type:[Getter,Setter,Sink,Error],
 val:"Data gotten, set, or input from sink",
 loc:sourceLocation,
 target:target sink|source,
 callstack: [Func1,Func2] 
};
 **/
// log(logType,target,value,callstack)
___domIntruderDXUI.prototype.log=function log(logType, targ ,val, callstack){
         try{
           if(callstack && callstack.length==0)
              return;
           this.n++;
           this.index++;
           var loc = Components.lookupMethod(window,"location")();
           var domUtil=__domIntruderObj._domIntruderUtil;

           try {
            var d= String.getTaintInfo(val.toString());
            var theobj={
                          n: this.n, 
                          time:domUtil.time(),
                          value:(
                                 val!=undefined ?
                                   ____DI____.logMe(
                                                     __domIntruderObj.stringify([String.unTaint(val),
                                                     __domIntruderObj.stringify(d,false)
                                                               ],false)
                                                )
                                    :
                                    /*"null"*/ 
                                    "bnVsbA=="
                                ),
                          type:logType,
                          loc:____DI____.logMe(loc)
                       };
           } catch(e) {
           
              function getSource(obj,str){
                if(obj==null)
                  return "Object is Null!!";
                 var s=''+obj.op+' '; 
                if(obj.source){
                 s+=' '+obj.source+' ';
                }

                if(obj.dep)
                for(var i=0,length=obj.dep.length;i<length;i++){
                 s+= arguments.callee( obj.dep[i],obj.val )
                }
                return s;
              }  
              console.error("log "+e+' '+e.lineNumber);
              dump("Exceprion[ee ] "+e+"\n");
              var theobj={n: this.n, time:domUtil.time(),value:(val!=undefined?____DI____.logMe("Error BTOA"+" "+getSource(String.getTaintInfo(val),String.unTaint(val))):/*"null"*/"bnVsbA=="),type:logType,loc:____DI____.logMe(loc)};
           }
           theobj.target=targ;
           theobj.b64=true;
           if(!logType)
             theobj.type="undefined";
           if(typeof  callstack!="undefined"){
            theobj.callstack=(callstack[0]==null?'["top-level"]':__domIntruderObj.stringify( callstack ,false));
            theobj.callstack= ____DI____.logMe(!theobj.callstack.tainted?theobj.callstack:String.unTaint(theobj.callstack));
           }
           this.send(theobj);
        }catch(e){
          console.error(e+" "+val+" "+loc)
        }
}


var __domIntruderObj={
stringify:JSON.stringify,
__domIntruderui:new ___domIntruderDXUI(false,false),///
__errorManager: function(event,c,b){  try{alert(event+' '+c+' '+b);}catch(e){console.log("ErrorManager!")};return false;},
}
HTMLDocument.prototype.write = function(str){
/*     delete dump;
     dump("--------------\n"+(new Error().stack)+"\n  "+String.unTaint(str)+" "+str.toString().tainted+"\n\n\n\n\n\n\n\n");
    dump=function(){} */
     var str1 = str
     if(arguments.length>1){ 
        for(var i=0,ll=arguments.length;i<ll;i++)
        str1+=arguments[i];  
     }
     if(str1.toString().tainted){
	 __domIntruderObj.__domIntruderui.log("Sink","document.write",(str),__domIntruderObj._domIntruderUtil.getCallStack(arguments)); 
     }
     return Components.lookupMethod(this,"write").apply(this,arguments);
   };
HTMLDocument.prototype.writeln = function(str){
 /*    delete dump;
     dump("--------------\n"+(new Error().stack)+"\n  "+String.unTaint(str)+" "+str.toString().tainted+"\n\n\n\n\n\n\n\n");
    dump=function(){} */
     var str1 = str
     if(arguments.length>1){
        for(var i=0,ll=arguments.length;i<ll;i++)
        str1+=arguments[i];  
     }
      if(str1.toString().tainted){
	 __domIntruderObj.__domIntruderui.log("Sink","document.writeln",(str1),__domIntruderObj._domIntruderUtil.getCallStack(arguments)); 
         }
     return Components.lookupMethod(this,"writeln").apply(this,arguments);
};

__domIntruderObj._domIntrudersavedEP={
           "window": {
	               "location":window.location,
		       "parent":  window.parent,  
                       "self":   window.self,
		       "top":     window.top,
		       "frames":  window.frames,
		       "name":    window.name,
                       "opener": window.opener
		      } 
	      };

__domIntruderObj._domIntruderDebugDom = {
   htmlPrototypes_IEEmu: function()  { 
                           /* HTMLElement.prototype.insertAdjacentHTML=function(where,val){
                              if(val.toString().tainted)
                                  __domIntruderObj.__domIntruderui.log("Sink",this.tagName+".insertAdjacentHTML",val.toString(), __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                             //  throw Error("undefined");
                                
                             }  */
                        // Test 
                            HTMLElement.prototype.outerHTML getter=function(){return "aaaaaaaaaaOUTERHTML"}
                            HTMLElement.prototype.outerHTML setter=function(a){alert(a);}
                            navigator.plugins getter=function(){return undefined};
                            ActiveXObject=function(){return {GetVariable:function(){return "1 3,4"}}};
                        // Fine Test
                        function globaliseEventObject($event) {
                          window.event = $event;
                        };
                         window.attachEvent =
                          HTMLDocument.prototype.attachEvent =
                          HTMLElement.prototype.attachEvent = function($name, $handler) {
	                          this.addEventListener($name.slice(2), globaliseEventObject, true);
	                          this.addEventListener($name.slice(2), $handler, false);
                          };
                         // mimic the "removeEvent" method
                         window.removeEvent =
                         HTMLDocument.prototype.removeEvent =
                         HTMLElement.prototype.removeEvent = function($name, $handler) {
	                         this.removeEventListener($name.slice(2), $handler, false);
                         };
                     },
	htmlPrototypes_setters: function (){
        
                           var tags={"*":/^on.*$|^style$/,"A":["href"],"LINK":["href"],"SCRIPT":["src","charset"],"APPLET":['code','archive','codebase'],"AREA":['href'],"BASE":['href'],"BODY":['background'],"PARAM":['name','value'],"FORM":['action']/*,"IMG":["src"]*/,"OBJECT":['archive','codebase','data','name','usemap'],"FRAME":["src"],"IFRAME":["src"],"EMBED":['src'],"INPUT":["src","name","value"],"META":['scheme','content','http-equiv'],"OPTION":['label','value'],"SELECT":["name"],"TEXTAREA":['name',"value"]}
                          
                       //    HTMLDocument.prototype.__defineGetter__("images",function(){return undefined})

                           function innerHTMLSetter(val){
                             var str=val; 
                             if(val != undefined && typeof val!="string"  ){
                               str =val.toString();
                             }
                             
                                0*this;
                             if(str!=undefined && str.tainted)
                                __domIntruderObj.__domIntruderui.log("Sink",this.tagName+".innerHTML",str, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                            // alert(val)
                             try{
                             Components.lookupMethod(this,"innerHTML")(str?str:"");
                             }catch(e){console.log(str); console.log(this.tagName); console.log(e) }
                             return str;
                           }
                           this.UnkProtoSetAtt=HTMLUnknownElement.prototype.setAttribute;
                          var HtmlProtos=[ HTMLUnknownElement.prototype ,
                           HTMLAnchorElement.prototype  ,
                           HTMLAppletElement.prototype  ,
                           HTMLAreaElement.prototype    ,
                           HTMLBRElement.prototype      ,
                           HTMLBaseElement.prototype    ,
                           HTMLBaseFontElement.prototype,
                           HTMLBodyElement.prototype    ,
                           HTMLButtonElement.prototype  ,
                           HTMLDListElement.prototype   ,
                           HTMLDirectoryElement.prototype,
                           HTMLDivElement.prototype     ,
                           HTMLElement.prototype        ,
                           HTMLEmbedElement.prototype   ,
                           HTMLFieldSetElement.prototype,
                           HTMLFontElement.prototype    ,
                           HTMLFormElement.prototype    ,
                           HTMLFrameElement.prototype   ,
                           HTMLFrameSetElement.prototype,
                           HTMLHRElement.prototype      ,
                           HTMLHeadElement.prototype    ,
                           HTMLHeadingElement.prototype ,
                           HTMLHtmlElement.prototype    ,
                           HTMLIFrameElement.prototype  ,
                           HTMLImageElement.prototype   ,
                           HTMLInputElement.prototype   ,
                           HTMLIsIndexElement.prototype ,
                           HTMLLIElement.prototype      ,
                           HTMLLabelElement.prototype   ,
                           HTMLLegendElement.prototype  ,
                           HTMLLinkElement.prototype    ,
                           HTMLMapElement.prototype     ,
                           HTMLMenuElement.prototype    ,
                           HTMLMetaElement.prototype    ,
                           HTMLSpanElement.prototype    ,
                           HTMLOListElement.prototype   ,
                           HTMLObjectElement.prototype  ,
                           HTMLOptGroupElement.prototype,
                           HTMLOptionElement.prototype  ,
                           HTMLParagraphElement.prototype,
                           HTMLParamElement.prototype   ,
                           HTMLPreElement.prototype     ,
                           HTMLQuoteElement.prototype   ,
                           HTMLScriptElement.prototype  ,
                           HTMLSelectElement.prototype  ,
                           HTMLStyleElement.prototype   ,
                           HTMLTableCaptionElement.prototype,
                           HTMLTableCellElement.prototype,
                           HTMLTableColElement.prototype,
                           HTMLTableElement.prototype   ,
                           HTMLTableRowElement.prototype,
                           HTMLTableSectionElement.prototype,
                           HTMLTextAreaElement.prototype,
                           HTMLTitleElement.prototype   ,
                           HTMLUListElement.prototype   ,
                           HTMLCanvasElement.prototype  ];
                           for(var i=0;i<HtmlProtos.length;i++)
                             HtmlProtos[i].__defineSetter__("innerHTML",innerHTMLSetter);
                        
                           HTMLAnchorElement.prototype.search getter=function(){
                           try{
                             var hr=this.href; 
                             0*this;
                             var rv=Components.lookupMethod(this,"search")();
                             if(this.href.tainted){
                               var ri=hr.indexOf("#");
                                rv=hr.substring(hr.indexOf("?"),(ri==-1?hr.length:ri-1));
                               //if(rv==rv) alert("ok")
                             }
                             }catch(ee){alert(ee+' '+ee.lineNumber)}  
                             return rv; 
                           }
                            
                         //  for(var i=0;i<HtmlProtos.length;i++)
                         //    HtmlProtos[i].__defineSetter__("insertAdjacentHTML",innerHTMLSetter);

                           function srcSetter(val){
                             if(  val.toString().tainted)
                                __domIntruderObj.__domIntruderui.log("Sink",this.tagName+".src",val.toString(), __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                             //alert(val)
                             0*this;
                             Components.lookupMethod(this,"src")(val.toString());
                             return val;
                           }
                            HTMLFrameSetElement.prototype.__defineSetter__("src",srcSetter);
                           HTMLIFrameElement.prototype.__defineSetter__("src",srcSetter );
                           HTMLScriptElement.prototype.__defineSetter__("src",srcSetter );
                           HTMLInputElement.prototype.__defineSetter__("src",srcSetter);
                          // HTMLImageElement.prototype.__defineSetter__("src",srcSetter);
                           HTMLEmbedElement.prototype.__defineSetter__("src",srcSetter);
                           Range.prototype.createContextualFragment=(function(r){return function(a){
                                  if(typeof a=="string" && a.tainted){ 
                                       __domIntruderObj.__domIntruderui.log("Sink","createContextualFragment("+a+")", a , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                                     } 
                            return r.apply(this,[a]);
                          }})(Range.prototype.createContextualFragment )
                             // Check if the tainting is passed to the value (from set a taint to get from area).
                             // no. it doesn't do it.
                             // we should change the code.
                          /* function inGetter(){
                             
                            var gin=  Components.lookupMethod(this,"value")();
                           // alert(gin.tainted)
                            gin=String.newTainted(gin,"Area.value");
                                __domIntruderObj.__domIntruderui.log("Getter",this.tagName+".value",gin, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                             //alert(val)
                           
                             return gin;
                           }
                           
                          HTMLTextAreaElement.prototype.__defineGetter__("value",inGetter); */
                        /*
                              */
                          HTMLDocument.prototype.getElementById=(function(r){return function(a){
                                  if(typeof a=="string" && a.tainted){ 
                                       __domIntruderObj.__domIntruderui.log("Sink","getDocumentById("+a+")", a , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                                     } 
                            return r.apply(this,[a]);
                          }})(HTMLDocument.prototype.getElementById)
                          if(true){
                          function inGetter(){
                             0*this;
                            var gin=  Components.lookupMethod(this,"value")();
                           // alert(gin.tainted)
                            gin=String.newTainted(gin,"Input.Value");
                                __domIntruderObj.__domIntruderui.log("Getter",this.tagName+".value",gin, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                             //alert(val)
                           
                             return gin;
                           }
                          HTMLInputElement.prototype.__defineGetter__("value",inGetter);  
                          }
                          var elob=[HTMLScriptElement.prototype,
                          HTMLScriptElement.prototype,
                          HTMLScriptElement.prototype,
                          HTMLInputElement.prototype,
                          HTMLLinkElement.prototype,
                          HTMLAreaElement.prototype,
                          HTMLAnchorElement.prototype];
                          var attob=["text",
                          "innerText",
                          "textContent",
                          "value",
                          "href",
                          "href",
                          "href"];
                          for (var i=0,length=elob.length;i<length;i++){
                            (function(y,x){
                                            function textSetter(val){
                                                if(val && val.toString().tainted)
                                                 __domIntruderObj.__domIntruderui.log("Sink",this.tagName+"."+x,val.toString(), __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                                                try{
                                                 0*this;
// console.dir(this);
                                                Components.lookupMethod(this,x)(val.toString());
                                                }catch(e){console.log("L.520 Error: "+e,this.tagName,x, typeof val,val);
                                                 if(val)
                                                   Components.lookupMethod(this,x)(val.toString());
                                                }
                                                return val;
                                            }
                                            y.__defineSetter__(x,textSetter );
                            })(elob[i],attob[i]);                            
                          }
                          
                          /*function textSetter(val){
                    
                             if(typeof val=="string"  && val.tainted)
                                __domIntruderObj.__domIntruderui.log("Sink",this.tagName+".text",val, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                             //alert(val)
                             Components.lookupMethod(this,"text")(val);
                             return val;
                           }
                           
                           HTMLScriptElement.prototype.__defineSetter__("text",textSetter );
                           HTMLScriptElement.prototype.__defineSetter__("innerText",textSetter );
                           HTMLScriptElement.prototype.__defineSetter__("textContent",textSetter );
                            
                           
                           function hrefSetter(val){
                              
                             if(typeof val=="string"  && val.tainted)
                                __domIntruderObj.__domIntruderui.log("Sink",this.tagName+".href",val, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                             //alert(val)
                             Components.lookupMethod(this,"href")(val);
                             return val;
                           }
                           
                           HTMLLinkElement.prototype.__defineSetter__("href",hrefSetter);
                           HTMLAreaElement.prototype.__defineSetter__("href", hrefSetter);
                           HTMLAnchorElement.prototype.__defineSetter__("href",hrefSetter );

                         */
                   
                           for(var i=0;i<HtmlProtos.length;i++)
                              HtmlProtos[i].setAttribute= (function (r,tags){ return  function (att,val){

                            try{
     //                       alert( tags[this.tagName]+" "+att+" "+att.tainted+" val "+val+" "+val.tainted+' '+(tags["*"].test(att))+' '+((tags[this.tagName]  )+' '+(tags[this.tagName].indexOf(att.toLowerCase()))))
                            // dump("\n"+String.unTaint(val.toString())+"SETTTO SOURCEEEEEEEEEEEEEEEEEEEEEEEEEEEEE\n")
                             if(  typeof att=="string"  && att.tainted)
                                __domIntruderObj.__domIntruderui.log("Sink",this.tagName+".setAttribute(Tainted,*)",att , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                                
                             if( (tags["*"].test(att) || (tags[this.tagName]!=undefined && tags[this.tagName].indexOf(att.toLowerCase())>-1)) && typeof val=="string"  && val.tainted)
                                __domIntruderObj.__domIntruderui.log("Sink",this.tagName+".setAttribute('"+att+"',Tainted)",val, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                             return r.apply(this,[att,val]);
                             }catch(e){alert(e+" "+e.lineNumber+" "+this+" "+att+" "+val)}
                           }} )( HtmlProtos[i].setAttribute,tags) ;
                           
                           
                           function cssSetter(val){
                              
                             if(typeof val=="string"  && val.tainted)
                                __domIntruderObj.__domIntruderui.log("Sink",this+".cssText",val, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                            
                             this.length;
                             Components.lookupMethod(this,"cssText")(val);
                             return val;
                           }
                           CSSStyleDeclaration.prototype.__defineSetter__("cssText",cssSetter );
                           
 
		},
 

        FF: function (){
               // Setting fake name to find it on logs
               //if(!window.name||window.name=="")window.name="aName|%&%/()=)|"+location.href;
               // Function Stuff
               this._Function=Function;
               Function=function Function(){
                          try{
                           var haveTaintArgs=false;
                           var args=[arguments.length]
                           for(var i=0;i<arguments.length;i++)
                             if(typeof arguments[i] == "string" && arguments[i].tainted===true) {
                               haveTaintArgs=i+1;
                               args.push(i+" "+arguments[i]);
                             }
                           if(haveTaintArgs && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                              __domIntruderObj.__domIntruderui.log("Sink","Function "+args.toString(), arguments[haveTaintArgs-1]  , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                           if(arguments.length == 1)
                            return __domIntruderObj._domIntruderDebugDom._Function(arguments[0]);
                           else
                            return __domIntruderObj._domIntruderDebugDom._Function.apply(this, arguments)
                            }catch(ex){alert(ex+" "+ex.lineNumber)}
                     }
               Function.prototype=this._Function.prototype

               //               this.htmlPrototypes_setters();


                __domIntruderObj.match=String.prototype.match;
               JSON.parse=(function(r){return function(a1,b1,c1){
                  if(a1.toString().tainted){
                       __domIntruderObj.__domIntruderui.log("Getter","JSON.parse()", a1.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));

                   }
                 var obj=r.apply(this,[a1,b1]);
                 if(a1.toString().tainted){
                 var obj1={};
                 for(var i in obj){
                  var i1=String.newTainted(i,"JSON.Parse");
                  obj1[i1]=String.newTainted(obj[i],"JSON.Parse");
                 }
                 obj=obj1;
                 }
                  return obj;
               }})(JSON.parse)
               /*JSON.stringify=(function(r){return function(a1,b1,c1){
                  if(a1.toString().tainted){
                       __domIntruderObj.__domIntruderui.log("Getter","JSON.stringify()", a1.toSource() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));

                   }

                 var obj=r.apply(this,[a1,b1]);
                 if(a1.toString().tainted){
                 var obj1={};
                 for(var i in obj){
                  var i1=String.newTainted(i,"JSON.Parse");
                  obj1[i1]=String.newTainted(obj[i],"JSON.Parse");
                 }
                 obj=obj1;
                 }
                  return obj;
               }})(JSON.stringify)
               */
               Object.prototype.hasOwnProperty=(function(r){
                 return function(a){

                     if(a.toString().tainted){
                       __domIntruderObj.__domIntruderui.log("Getter","hasOwnProperty("+String.unTaint(a)+")", a.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                       console.log("Get hasOwnProperty from: "+String.unTaint(a.toString()));
                       console.dir(this);
                     }
                     var oo=this;
                     var ret = r.apply(oo, [a]);
                     return ret
                 }
               })(Object.prototype.hasOwnProperty)

                String.prototype.match=function(a ){
                    var istainted=false;
                       if(this.toString().tainted){
                        istainted=true;
                       __domIntruderObj.__domIntruderui.log("Getter","match("+a+")"+(a.global?"Global":"No global"), this , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                   }
                    var oo=this;
                     var ret= __domIntruderObj.match.call(oo,a);
                    if(istainted && !this.toString().tainted){
                      this.tainted=istainted;
                      alert("match not tainted");
                    }
                   return ret;
                 }
               String.replace = (function(r){
                return function(str,find, replace, replaceOnce) {
                    var istainted=false;

                    if( str.toString().tainted){
                        istainted=true;
                       __domIntruderObj.__domIntruderui.log("Getter","String.replace("+String.unTaint(str)+","+find+","+replace+")"+(find.global?"Global":"No global"), str , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }
                     var oo=this;
                    var ret = r.apply(oo, [str,find,replace, replaceOnce?replaceOnce:""]);

                    if(istainted && !str.toString().tainted){
                     str.tainted=istainted; 
                    }
                    return ret;
                }
               })(String.replace);
               /*encodeURI = (function(r){
                return function(str) {
                    var istainted=false;

                    if( str.toString().tainted){
                        istainted=true;
                       __domIntruderObj.__domIntruderui.log("Getter","encodeURI("+str+")", str , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }
                    var oo=this;
                    var ret = r.apply(oo, [str]);

               //     if(istainted && !str.toString().tainted){
               //      str.tainted=istainted;
                   //alert("String.replace  not tainted");
               //     }
                    return ret;
                }
               })(encodeURI);
               */
               String.prototype.replace = (function(r){
                return function(find, replace, replaceOnce) {

                    var istainted=false;
                    if(this.toString().tainted){
                        istainted=true;
                       __domIntruderObj.__domIntruderui.log("Getter","replace("+String.unTaint(find)+","+replace+(replaceOnce?','+replaceOnce:"")+")"+(find.global?"Global":"No global"), this.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                     }
                     var oo=this;
                     var ret = r.apply(oo, [find,replace, replaceOnce?replaceOnce:""]);

                    if(istainted && !this.toString().tainted){
                     alert("'"+this+"' replace not tainted "+ ret.toSource() +"\n");
                    // this.tainted=istainted;
                    }
                     return ret;
                }
               })(String.prototype.replace);

               String.prototype.search = (function(r){
                return function(find) {
               //    dump(" PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP "+find.toString()+" "+this+"\n");
                    var istainted=false;
                    if(this.toString().tainted){
                        istainted=true;
                       __domIntruderObj.__domIntruderui.log("Getter","search("+String.unTaint(find)+")"+(find.global?"Global":"No global"), this.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                     }
                     var oo=this;
                     var ret = r.apply(oo, [find ]);

                    if(istainted && !this.toString().tainted){
                     alert("'"+this+"' search not tainted "+ ret.toSource() +"\n");
                     this.tainted=istainted;
                    }
                     return ret;
                }
               })(String.prototype.search);

               String.prototype.charAt = (function(r){
                return function(n ) {
               //    dump(" PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP "+find.toString()+" "+this+"\n");
                    var istainted=false;
                    if(this.toString().tainted){
                        istainted=true;
                       //__domIntruderObj.__domIntruderui.log("Getter","charAt("+n+")", this , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                     }
                     var oo=this;
                     var ret = r.apply(oo, [n]);

                    if(istainted && !this.toString().tainted){
                     ret=String.newTainted(ret,"charAt");
                      //  dump("'"+this+"' charAt not tainted \n");
                    }
                     return ret;
                }
               })(String.prototype.charAt);

               String.prototype.localeCompare = (function(r){
                return function(n ) {
               //    dump(" PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP "+find.toString()+" "+this+"\n");
                    var istainted=false;
                    if(this.toString().tainted ){
                        istainted=true;
                        __domIntruderObj.__domIntruderui.log("Getter","localeCompare("+n+")", this.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                     }
                    if(n.toString().tainted ){
                        istainted=true;
                        __domIntruderObj.__domIntruderui.log("Getter","this.localeCompare(*tainted*)", n , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                     }
                     var oo=this;
                     var ret = r.apply(oo, [n]);
                     return ret;
                }
               })(String.prototype.localeCompare);
               String.prototype.lastIndexOf = (function(r){
                return function(s,start) {
                     var istainted=false;
                  // var aaa=this;

                    if(this.toString().tainted){
                       istainted=true;
                   //    var dd=__domIntruderObj._domIntruderUtil.getCallStack(arguments);
                      __domIntruderObj.__domIntruderui.log("Getter","lastIndexOf("+s+(start>0?","+start:"")+")", this.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }
                     var oo=this;
                    var ret=  r.apply( oo, [s,start]);
                     if(istainted && !this.toString().tainted){

                     alert("indexOf   not tainted"+this.tainted);
                    }
                    return ret;

                }
               })(String.prototype.lastIndexOf);
               String.prototype.indexOf = (function(r){
                return function(s,start) {
                     var istainted=false;
                  // var aaa=this;

                    if(this.toString().tainted){
                       istainted=true;
                   //    var dd=__domIntruderObj._domIntruderUtil.getCallStack(arguments);
                      __domIntruderObj.__domIntruderui.log("Getter","indexOf("+s+(start>0?","+start:"")+")", this.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }
                     var oo=this;
                    var ret=  r.apply( oo, [s,start]);
                     if(istainted && !this.toString().tainted){

                     alert("indexOf   not tainted"+this.tainted);
                    }
                    return ret;

                }
               })(String.prototype.indexOf);
               //eval=function(c){console.dir(window);return alert(c)}
               String.prototype.split = (function(r){
                return function(s,l) {
                     var istainted=false;
                     var d=new Array();
                     if(this.toString().tainted){
                        istainted=true;
                        __domIntruderObj.__domIntruderui.log("Getter","split("+s+")", this.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                     }
                     var oo=this;
                    var ret=  r.apply(oo, [s,l]); 

                    if(istainted && ret[0].tainted==false){alert(111) 
                       for(var i=0;i<ret.length;i++){
                         console.log("split   not tainted"+s+" "+ret[i]);
                         d[i]=String.newTainted(ret[i],"split");

                      }
                       ret=d;  
                     }
                    if(istainted && !this.toString().tainted){
                   //  this.tainted=istainted;

                     console.log("split   not tainted "+s+" ");

                    }
                    return ret;

                }
               })(String.prototype.split);
               window.setTimeout=(function(r){return function(s,l){
                     if(typeof s=="string" && s.tainted){
                       
                       __domIntruderObj.__domIntruderui.log("Sink","setTimeout("+String.unTaint(s)+","+l+")", s , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }
                    var ret=  r.apply(this, [s,l]); 
                    return ret;
               }})(window.setTimeout);
               window.setInterval=(function(r){return function(s,l){
                     if(typeof s=="string" && s.tainted){ 
                       __domIntruderObj.__domIntruderui.log("Sink","setInterval("+String.unTaint(s)+","+l+")", s , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }
                    var ret=  r.apply(this, [s,l]); 
                    return ret;
               }})(window.setInterval);
               
               window.open=(function(r){return function(url,n,opt){
                     if(url.toString().tainted){
                         
                       __domIntruderObj.__domIntruderui.log("Sink","window.open("+String.unTaint(url)+")", url.toString() , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }
                    var ret=  r.apply(this, [url,n,opt]); 
                    return ret;
               }})(window.open);
                              // InnerHtml Stuff
               this.htmlPrototypes_setters();
               
             __domIntruderObj._jq=0
/*               window.jQuery='';
                watch("jQuery",function(p,o,n){ if(__domIntruderObj._jq==0){__domIntruderObj._jq=1; setTimeout(function(){
                if(!jQuery.fn) return;
                 jQuery.fn._init_=jQuery.fn.init;
                  jQuery.fn.init=function(a,b){
                   if(a&&a.toString().tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                       __domIntruderObj.__domIntruderui.log("Sink","jQuery",a.toString(),__domIntruderObj._domIntruderUtil.getCallStack(arguments)); 
                           
                  return new jQuery.fn._init_(a,b)
                  }
                },10);} return n;})
      
              window.jQuery setter=function(val,f){alert(val+' '+f)
                          __domIntruderObj._jq=function(a,b){alert(2); if(a && a.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments)) { 
                       
                       	    __domIntruderObj.__domIntruderui.log("Sink","jQuery",arguments[0],__domIntruderObj._domIntruderUtil.getCallStack(arguments)); 
                            return val(a,b)};
                          }
              window.jQuery getter= function(a,b){return __domIntruderObj._jq};
                           
                         return  __domIntruderObj._jq; 
                       };  
                
          */
               // Source Getter & Setter Stuff
               this.wantCookies= ____DI____.wantCookies;
               this.logGetters=false;
               this.debug=true;
               document.cookie getter= function(){
                    var s=Components.lookupMethod(document, "cookie")();
                     if( __domIntruderObj._domIntruderDebugDom.wantCookies){
                      s=String.newTainted(s,"cookie");
                      if(__domIntruderObj._domIntruderDebugDom.logGetters )
                       if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                         __domIntruderObj.__domIntruderui.log("Getter","cookie",s, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                   }
                   return s; 
                  };
                  
               document.cookie setter= function(newv){
                    if(newv.tainted)
                      __domIntruderObj.__domIntruderui.log("Setter","cookie",newv, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    
                   if(!__domIntruderObj._domIntruderDebugDom.wantCookies){
                      newv.tainted=false;
                    }
                    Components.lookupMethod(document, "cookie")(newv);
                  };
               document.documentURI getter= function(){
                   var s=Components.lookupMethod(document, "documentURI")();
                   s=String.newTainted( (s),"documentURI");
                   if(__domIntruderObj._domIntruderDebugDom.logGetters )
                     if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                       __domIntruderObj.__domIntruderui.log("Getter","documentURI",s , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                   return s; 
                  };
               document.URL getter= function(){
                     var s=(Components.lookupMethod(document, "URL")());
                     s=String.newTainted((s),"URL");
                     if(__domIntruderObj._domIntruderDebugDom.logGetters )
                      if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                         __domIntruderObj.__domIntruderui.log("Getter","document.URL",s , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                     return s; 
                  };
               document.URL setter= function(newv){
                    if(newv.tainted)
                      __domIntruderObj.__domIntruderui.log("Setter","document.URL",newv, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    Components.lookupMethod(document, "URL")(newv);
                  };
                  
        //Referrer
               document.referrer getter= function(){
                   var s=Components.lookupMethod(document, "referrer")();
                   s=String.newTainted(/*s*/"http://vvva.example.com/uuid=aui\">aa?p=aaa","referrer");
                   if(__domIntruderObj._domIntruderDebugDom.logGetters )
                     if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                        __domIntruderObj.__domIntruderui.log("Getter","document.referrer",s ,__domIntruderObj._domIntruderUtil.getCallStack(arguments));
                   return s; 
                  };
               document.referrer setter= function(newv){
                   if(newv.tainted)
                     __domIntruderObj.__domIntruderui.log("Setter","document.referrer",newv, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                   Components.lookupMethod(document, "referrer")(newv); 
                  };

        //name               
               window.name getter = function (){
                   var s=Components.lookupMethod(window, "name")();
                   s=String.newTainted(s/*+"{\"cc\":alert(1)}"*/,"name");
                   if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                      __domIntruderObj.__domIntruderui.log("Getter","window.name",s ,  __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                   return s;
               }
               name getter = function (){ 
                   var s=Components.lookupMethod(window, "name")();
                   s=String.newTainted(s,"name");
                   if(__domIntruderObj._domIntruderDebugDom.logGetters )
                    if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                     __domIntruderObj.__domIntruderui.log("Getter","window.name",s , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                   return s;
                };
               window.name setter = function (newv){
                    if(newv!=undefined && newv.tainted)
                      __domIntruderObj.__domIntruderui.log("Setter","window.name",newv, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    Components.lookupMethod(window, "name")(newv);
                    return newv;
               }
               name setter = function (newv){ 
                    if(newv!=undefined && newv.tainted)
                      __domIntruderObj.__domIntruderui.log("Setter","window.name",newv, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    Components.lookupMethod(window, "name")(newv);
                    return newv;
                }
               var a=Components.lookupMethod(window,"location")();
               function locGetter(){
                   if(typeof this.____obj=="undefined"){
                     this.____obj={ 
                       // FixMe find another way. this add ____obj to window.document
                     
                        toString: function(){
                           var hr=String.newTainted(   unescape(Components.lookupMethod(Components.lookupMethod(window,"location")(),"href")()),"location.toString");
                           if(__domIntruderObj._domIntruderDebugDom.logGetters )
                             if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                                 __domIntruderObj.__domIntruderui.log("Getter","location.toString", hr, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                           return hr;
                        },
                       get href(){
                        try{
                            var hr=String.newTainted(  unescape(a.href),"location.href");
                            if(__domIntruderObj._domIntruderDebugDom.logGetters )
                             if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                               __domIntruderObj.__domIntruderui.log("Getter","location.href", hr, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                            return hr; 
                          }catch(e){
                            alert("Exception on get href "+e);
                            return Components.lookupMethod(Components.lookupMethod(window,"location")(),"href")();
                          } 
                       }, 
                       set href(newval){ 
                               if(newval.tainted)
                                 __domIntruderObj.__domIntruderui.log("Setter","location.href", newval, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               a.href=newval;
                          },
                       get hash(){
                               var aa=a.hash;
                               if(true){
                                   aa=aa?aa:"#zzzzzz=yyyyy";
                               }
                               var hr=String.newTainted(  unescape(aa),"location.hash");
                               if(__domIntruderObj._domIntruderDebugDom.logGetters )
                                 if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                                    __domIntruderObj.__domIntruderui.log("Getter","location.hash",hr, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               return hr;
                          },
                       set hash(newval){
                               if(newval.tainted)
                                   __domIntruderObj.__domIntruderui.log("Setter","location.hash",newval, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               a.hash=newval;
                          },
                       get host(){
                               var hr=String.newTainted(a.host,"location.host");// this is probably useless  
                               if(__domIntruderObj._domIntruderDebugDom.logGetters )
                                 if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                                    __domIntruderObj.__domIntruderui.log("Getter","location.host",hr,__domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               return hr;
                          },
                       set host(newval){
                               if(newval.tainted)
                                  __domIntruderObj.__domIntruderui.log("Setter","location.host",newval, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               a.host=newval;
                           },
                       get hostname(){var hr=String.newTainted(a.hostname ,"location.hostname");// this is probably useless  
                               if(__domIntruderObj._domIntruderDebugDom.logGetters )
                                  if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                                     __domIntruderObj.__domIntruderui.log("Getter","location.hostname",hr, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               return hr;
                           },
                       set hostname(newval){
                               if(newval.tainted)
                                   __domIntruderObj.__domIntruderui.log("Setter","location.hostname", newval,  __domIntruderObj._domIntruderUtil.getCallStack(arguments) );
                               a.hostname=newval;
                           },
                       get pathname(){
                               var hr=String.newTainted(a.pathname,"location.pathname");
                               if(__domIntruderObj._domIntruderDebugDom.logGetters )
                                 if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                                     __domIntruderObj.__domIntruderui.log("Getter","location.pathname",hr, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               return hr;
                           },
                       set pathname(newval){
                               if(newval.tainted)
                                 __domIntruderObj.__domIntruderui.log("Setter","location.pathname", newval,  __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               a.pathname=newval;
                           },
                       get protocol() {
                               var hr=String.newTainted( a.protocol,"location.protocol");
                               return hr;
                           }, 
                       set protocol(newval){
                               if(newval.tainted)
                                   __domIntruderObj.__domIntruderui.log("Setter","location.protocol",newval, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               a.protocol=newval;
                           },
                       get search(){
                               var aa=a.search; 
                               var hr=String.newTainted(unescape(aa?aa:"?aaaa=bbbb\">ss&ccc=dddd&11111=22222"),"location.search");

                               if(__domIntruderObj._domIntruderDebugDom.logGetters )
                                 if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                                    __domIntruderObj.__domIntruderui.log("Getter","location.search",hr, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               return hr;
                           }, 
                       set search(newval){
                               if(newval.tainted)
                                 __domIntruderObj.__domIntruderui.log("Setter","location.search",newval, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                               a.search=newval;
                          },           
                       port:a.port, 
                       assign: function(str){
                              if(str.tainted) 
		   	        __domIntruderObj.__domIntruderui.log("Sink","location.assign",(str==''?"(data is empty)":str),__domIntruderObj._domIntruderUtil.getCallStack(arguments)); 
                              return a.assign(str);
                         },
                       replace: function(str){ 
                             if(str.tainted )
			        __domIntruderObj.__domIntruderui.log("Sink","location.replace",(str==''?"(data is empty)":str),__domIntruderObj._domIntruderUtil.getCallStack(arguments)); 
                             return a.replace(str);
                         },
                        reload: function(e){ a.reload(e);}
                     }
                  }
                  return  this.____obj;
               }
               
               window.location getter=locGetter;
               location getter=locGetter;
               document.location getter=locGetter;
               function locSetter(newval){
                  if(newval.tainted)
                     __domIntruderObj.__domIntruderui.log("Sink","location", newval, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                  location setter=locSetter;
                  location getter=locGetter;
                  Components.lookupMethod(Components.lookupMethod(window,"location")(),"href")(newval)
               };
               window.location setter=locSetter
               location setter=locSetter 
               document.location setter= locSetter
               
 

                 // window references
               if(0)
                window.parent getter= function(){
                   if( __domIntruderObj._domIntruderUtil.isToBeLogged(arguments)){
                     __domIntruderObj.__domIntruderui.log("Getter","window.parent", "- window- ", __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }
                    return  Components.lookupMethod(window, "parent")( ); 
                  }
               if(0) 
                window.parent setter= function(newv){
                   if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                    __domIntruderObj.__domIntruderui.log("Setter","window.parent", newv, __domIntruderObj._domIntruderUtil.getCallStack(arguments));

                    Components.lookupMethod(window, "parent")(newv); 
                  }
                
               // Opener  
               window.opener getter= function(){
                       
                   if(  __domIntruderObj._domIntruderUtil.isToBeLogged(arguments)){
                     __domIntruderObj.__domIntruderui.log("Getter","window.opener", "- window- ", __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    }                    
                    return Components.lookupMethod(window, "opener")(); 
                  }
               window.opener setter= function(newv){
                   if(__domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                     __domIntruderObj.__domIntruderui.log("Setter","window.opener", newv, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                    
                    Components.lookupMethod(window, "opener")(newv); 
                  }
	    },


};

(function () {

	// Save reference to earlier defined object implementation (if any)
	var oXMLHttpRequest = window.XMLHttpRequest;

	// Define on browser type
	var bGecko	= !!window.controllers,
		bIE		= window.document.all && !window.opera,
		bIE7	= bIE && window.navigator.userAgent.match(/MSIE 7.0/);

	// Enables "XMLHttpRequest()" call next to "new XMLHttpReques()"
	function fXMLHttpRequest() {
		this._object	= oXMLHttpRequest && !bIE7 ? new oXMLHttpRequest : new window.ActiveXObject("Microsoft.XMLHTTP");
		this._listeners	= [];
	};

	// Constructor
	function cXMLHttpRequest() {
		return new fXMLHttpRequest;
	};
	cXMLHttpRequest.prototype	= fXMLHttpRequest.prototype;

	// BUGFIX: Firefox with Firebug installed would break pages if not executed
	if (bGecko && oXMLHttpRequest.wrapped)
		cXMLHttpRequest.wrapped	= oXMLHttpRequest.wrapped;

	// Constants
	cXMLHttpRequest.UNSENT				= 0;
	cXMLHttpRequest.OPENED				= 1;
	cXMLHttpRequest.HEADERS_RECEIVED	= 2;
	cXMLHttpRequest.LOADING				= 3;
	cXMLHttpRequest.DONE				= 4;

	// Public Properties
	cXMLHttpRequest.prototype.readyState	= cXMLHttpRequest.UNSENT;
	cXMLHttpRequest.prototype.responseText	= '';
	cXMLHttpRequest.prototype.responseXML	= null;
	cXMLHttpRequest.prototype.status		= 0;
	cXMLHttpRequest.prototype.statusText	= '';

	// Priority proposal
	cXMLHttpRequest.prototype.priority		= "NORMAL";

	// Instance-level Events Handlers
	cXMLHttpRequest.prototype.onreadystatechange	= null;

	// Class-level Events Handlers
	cXMLHttpRequest.onreadystatechange	= null;
	cXMLHttpRequest.onopen				= null;
	cXMLHttpRequest.onsend				= null;
	cXMLHttpRequest.onabort				= null;

	// Public Methods
	cXMLHttpRequest.prototype.open	= function(sMethod, sUrl, bAsync, sUser, sPassword) {
                if( sMethod.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                   __domIntruderObj.__domIntruderui.log("Setter","XMLHR.open(Taint,*,*,*,*)", sMethod, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
 
                if(typeof sUrl!="string")
                  sUrl=sUrl.toString();
                if( sUrl.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                   __domIntruderObj.__domIntruderui.log("Setter","XMLHR.open(*,Taint,*,*,*)", sUrl , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                if(arguments.length>2)
                if(  bAsync.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                   __domIntruderObj.__domIntruderui.log("Setter","XMLHR.open(*,*,Taint,*,*)", bAsync , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                if(arguments.length>3)
                if( sUser!=undefined && sUser.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                   __domIntruderObj.__domIntruderui.log("Setter","XMLHR.open(*,*,*,Taint,*)", sUser, __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                if(arguments.length>4)
                if( sPassword !=undefined && sPassword.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                   __domIntruderObj.__domIntruderui.log("Setter","XMLHR.open(*,*,*,*,Taint)", sPassword , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
		// Delete headers, required when object is reused
		delete this._headers;
                
		// When bAsync parameter value is omitted, use true as default
		if (arguments.length < 3)
			bAsync	= true;

		// Save async parameter for fixing Gecko bug with missing readystatechange in synchronous requests
		this._async		= bAsync;

		// Set the onreadystatechange handler
		var oRequest	= this,
			nState		= this.readyState,
			fOnUnload;

		// BUGFIX: IE - memory leak on page unload (inter-page leak)
		if (bIE && bAsync) {
			fOnUnload = function() {
				if (nState != cXMLHttpRequest.DONE) {
					fCleanTransport(oRequest);
					// Safe to abort here since onreadystatechange handler removed
					oRequest.abort();
				}
			};
			window.attachEvent("onunload", fOnUnload);
		}

		// Add method sniffer
		if (cXMLHttpRequest.onopen)
			cXMLHttpRequest.onopen.apply(this, arguments);

		if (arguments.length > 4)
			this._object.open(sMethod, sUrl, bAsync, sUser, sPassword);
		else
		if (arguments.length > 3)
			this._object.open(sMethod, sUrl, bAsync, sUser);
		else
			this._object.open(sMethod, sUrl, bAsync);

		if (!bGecko && !bIE) {
			this.readyState	= cXMLHttpRequest.OPENED;
			fReadyStateChange(this);
		}

		this._object.onreadystatechange	= function() {
			if (bGecko && !bAsync)
				return;

			// Synchronize state
			oRequest.readyState		= oRequest._object.readyState;

			//
			fSynchronizeValues(oRequest);

			// BUGFIX: Firefox fires unnecessary DONE when aborting
			if (oRequest._aborted) {
				// Reset readyState to UNSENT
				oRequest.readyState	= cXMLHttpRequest.UNSENT;

				// Return now
				return;
			}

			if (oRequest.readyState == cXMLHttpRequest.DONE) {
				// Free up queue
				delete oRequest._data;
				if (bAsync)
					fQueue_remove(oRequest);
				//
				fCleanTransport(oRequest);
 
				// BUGFIX: IE - memory leak in interrupted
				if (bIE && bAsync)
					window.detachEvent("onunload", fOnUnload);
			}

			// BUGFIX: Some browsers (Internet Explorer, Gecko) fire OPEN readystate twice
			if (nState != oRequest.readyState)
				fReadyStateChange(oRequest);

			nState	= oRequest.readyState;
		}
	};
	function fXMLHttpRequest_send(oRequest) {
                if(!oRequest)
                   alert("oRequest is Null!");
                try{
    		  oRequest._object.send(oRequest._data);
                } catch(e){alert(e+' '+e.lineNumber)}
		// BUGFIX: Gecko - missing readystatechange calls in synchronous requests
		if (bGecko && !oRequest._async) {
			oRequest.readyState	= cXMLHttpRequest.OPENED;

			// Synchronize state
			fSynchronizeValues(oRequest);

			// Simulate missing states
			while (oRequest.readyState < cXMLHttpRequest.DONE) {
				oRequest.readyState++;
				fReadyStateChange(oRequest);
				// Check if we are aborted
				if (oRequest._aborted)
					return;
			}
		}
	};
	cXMLHttpRequest.prototype.send	= function(vData) {
               if(vData!=null && typeof vData == "string"){
                if(vData.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                   __domIntruderObj.__domIntruderui.log("Setter","XMLHR.send",vData  , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                try{
                dump("??????????????????????????????????????????????????????Send "+String.unTaint(vData)+" "+vData.tainted+"\n");
		  }catch(f){}
                }else if(vData!=null &&  typeof vData != "string"){
                  alert("vData not a String FixMe!!"+(typeof vData)+" "+vData.toSource());
                }
		// Add method sniffer
		if (cXMLHttpRequest.onsend)
			cXMLHttpRequest.onsend.apply(this, arguments);

		if (!arguments.length)
			vData	= null;

		// BUGFIX: Safari - fails sending documents created/modified dynamically, so an explicit serialization required
		// BUGFIX: IE - rewrites any custom mime-type to "text/xml" in case an XMLNode is sent
		// BUGFIX: Gecko - fails sending Element (this is up to the implementation either to standard)
		if (vData && vData.nodeType) {
			vData	= window.XMLSerializer ? new window.XMLSerializer().serializeToString(vData) : vData.xml;
			if (!oRequest._headers["Content-Type"])
				oRequest._object.setRequestHeader("Content-Type", "application/xml");
		}

		this._data	= vData;

		// Add to queue
		if (this._async)
			fQueue_add(this);
		else
			fXMLHttpRequest_send(this);
	};
	cXMLHttpRequest.prototype.abort	= function() {
		// Add method sniffer
		if (cXMLHttpRequest.onabort)
			cXMLHttpRequest.onabort.apply(this, arguments);

		// BUGFIX: Gecko - unnecessary DONE when aborting
		if (this.readyState > cXMLHttpRequest.UNSENT)
			this._aborted	= true;

		this._object.abort();

		// BUGFIX: IE - memory leak
		fCleanTransport(this);

		delete this._data;
		if (this._async)
			fQueue_remove(this);
	};
	cXMLHttpRequest.prototype.getAllResponseHeaders	= function() {
		return this._object.getAllResponseHeaders();
	};
	cXMLHttpRequest.prototype.getResponseHeader	= function(sName) {
		return this._object.getResponseHeader(sName);
	};
	cXMLHttpRequest.prototype.setRequestHeader	= function(sName, sValue) {
                if(sName.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                   __domIntruderObj.__domIntruderui.log("Setter","XMLHR.setReqHeader(Taint,*)",sName  , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                if(sValue.tainted && __domIntruderObj._domIntruderUtil.isToBeLogged(arguments))
                   __domIntruderObj.__domIntruderui.log("Setter","XMLHR.setReqHeader(*,Taint)", sValue  , __domIntruderObj._domIntruderUtil.getCallStack(arguments));
                
		// BUGFIX: IE - cache issue
		if (!this._headers)
			this._headers	= {};
		this._headers[sName]	= sValue;

		return this._object.setRequestHeader(sName, sValue);
	};

	// EventTarget interface implementation
	cXMLHttpRequest.prototype.addEventListener	= function(sName, fHandler, bUseCapture) {
		for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
			if (oListener[0] == sName && oListener[1] == fHandler && oListener[2] == bUseCapture)
				return;
		// Add listener
		this._listeners.push([sName, fHandler, bUseCapture]);
	};

	cXMLHttpRequest.prototype.removeEventListener	= function(sName, fHandler, bUseCapture) {
		for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
			if (oListener[0] == sName && oListener[1] == fHandler && oListener[2] == bUseCapture)
				break;
		// Remove listener
		if (oListener)
			this._listeners.splice(nIndex, 1);
	};

	cXMLHttpRequest.prototype.dispatchEvent	= function(oEvent) {
		var oEventPseudo	= {
			'type':			oEvent.type,
			'target':		this,
			'currentTarget':this,
			'eventPhase':	2,
			'bubbles':		oEvent.bubbles,
			'cancelable':	oEvent.cancelable,
			'timeStamp':	oEvent.timeStamp,
			'stopPropagation':	function() {},	// There is no flow
			'preventDefault':	function() {},	// There is no default action
			'initEvent':		function() {}	// Original event object should be initialized
		};

		// Execute onreadystatechange
		if (oEventPseudo.type == "readystatechange" && this.onreadystatechange)
			(this.onreadystatechange.handleEvent || this.onreadystatechange).apply(this, [oEventPseudo]);

		// Execute listeners
		for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
			if (oListener[0] == oEventPseudo.type && !oListener[2])
				(oListener[1].handleEvent || oListener[1]).apply(this, [oEventPseudo]);
	};

	//
	cXMLHttpRequest.prototype.toString	= function() {
		return '[' + "object" + ' ' + "XMLHttpRequest" + ']';
	};

	cXMLHttpRequest.toString	= function() {
		return '[' + "XMLHttpRequest" + ']';
	};

	// Helper function
	function fReadyStateChange(oRequest) {
		// Sniffing code
		if (cXMLHttpRequest.onreadystatechange)
			cXMLHttpRequest.onreadystatechange.apply(oRequest);

		// Fake event
		oRequest.dispatchEvent({
			'type':			"readystatechange",
			'bubbles':		false,
			'cancelable':	false,
			'timeStamp':	new Date + 0
		});
	};

	function fGetDocument(oRequest) {
		var oDocument	= oRequest.responseXML,
			sResponse	= oRequest.responseText;
		// Try parsing responseText
		if (bIE && sResponse && oDocument && !oDocument.documentElement && oRequest.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/)) {
			oDocument	= new window.ActiveXObject("Microsoft.XMLDOM");
			oDocument.async				= false;
			oDocument.validateOnParse	= false;
			oDocument.loadXML(sResponse);
		}
		// Check if there is no error in document
		if (oDocument)
			if ((bIE && oDocument.parseError != 0) || !oDocument.documentElement || (oDocument.documentElement && oDocument.documentElement.tagName == "parsererror"))
				return null;
		return oDocument;
	};

	function fSynchronizeValues(oRequest) {
		try {   oRequest.responseText = (false?String.newTainted(oRequest._object.responseText,"responseTxt"):oRequest._object.responseText);	} catch (e) {alert(e+' '+e.lineNumber)}
		//try {	oRequest.responseText	= oRequest._object.responseText;	} catch (e) {}
		try {	oRequest.responseXML	= fGetDocument(oRequest._object);	} catch (e) {}
		try {	oRequest.status			= oRequest._object.status;			} catch (e) {}
		try {	oRequest.statusText		= oRequest._object.statusText;		} catch (e) {}
	};

	function fCleanTransport(oRequest) {
		// BUGFIX: IE - memory leak (on-page leak)
		oRequest._object.onreadystatechange	= new window.Function;
	};

	// Queue manager
	var oQueuePending	= {"CRITICAL":[],"HIGH":[],"NORMAL":[],"LOW":[],"LOWEST":[]},
		aQueueRunning	= [];
	function fQueue_add(oRequest) {
		oQueuePending[oRequest.priority in oQueuePending ? oRequest.priority : "NORMAL"].push(oRequest);
		//
		setTimeout(fQueue_process);
	};

	function fQueue_remove(oRequest) {
		for (var nIndex = 0, bFound	= false; nIndex < aQueueRunning.length; nIndex++)
			if (bFound)
				aQueueRunning[nIndex - 1]	= aQueueRunning[nIndex];
			else
			if (aQueueRunning[nIndex] == oRequest)
				bFound	= true;
		if (bFound)
			aQueueRunning.length--;
		//
		setTimeout(fQueue_process);
	};

	function fQueue_process() {
		if (aQueueRunning.length < 6) {
			for (var sPriority in oQueuePending) {
				if (oQueuePending[sPriority].length) {
					var oRequest	= oQueuePending[sPriority][0];
					oQueuePending[sPriority]	= oQueuePending[sPriority].slice(1);
					//
					aQueueRunning.push(oRequest);
					// Send request
					fXMLHttpRequest_send(oRequest);
					break;
				}
			}
		}
	};

 

	// Register new object with window
	window.XMLHttpRequest	= cXMLHttpRequest;
})();
 
//Utils
__domIntruderObj._domIntruderUtil={ 
  time: function  (){
	    	    var d=new Date();
	    	    return d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"."+d.getMilliseconds();
	    },
  isToBeLogged: function  (arg){// added to check if is a call by Firebug DOMpanel
                    try{
                        return true; 
                        if(arg.callee.caller!=null && (arg.callee.caller.toSource().indexOf("function getSource(obj, str) {")>-1 || 
                        arg.callee.caller.toSource().indexOf("window.console.notifyFirebug")>-1||
                        arg.callee.caller.toSource().indexOf("function () {if (arguments.length == 1)")==0  || 
                        //arg.callee.caller.toSource().indexOf("__domIntruderObj._domIntruderUtil")>-1  || 
                        arg.callee.caller.toSource().indexOf("function () {return \"\" + this;}")==0))
                        return false;
                    }catch(exc){
                     return true;
                    }
	    	    return true;
	    },
  getCallStack: function(args){

    var MAX_NESTSTACK=5; 
   if(!____DI____.wantStackTrace){
     
      return [args?args.callee.caller:function(){}];
    }
    debugger;
//    dump("Debugger getCallStack: "+(new Error()).stack+' '+callstackArr+"\n");
    if(typeof callstackArr!="undefined")
     return callstackArr;

    var s=[]
    try{
    s=[args.callee.caller];return s;
    var i=0;//s[0]==w.callee.caller
    if(s[0]===null)
     return s;
    for(var stack=s[0].arguments.callee.caller;stack!=null;stack=stack.arguments.callee.caller){
      if(i==MAX_NESTSTACK){break;}
      s.push(stack);
      i++;
     }
     }catch(e){}
    return s;
  }
}
 
__domIntruderObj.domILog=function (a,b,c,d){
//d!=null && d.callee!=null &&   d.callee.caller!=null && dump(d.callee.caller.toSource());
//  console.log(d.callee.caller.toSource(2));
//  if( __domIntruderObj._domIntruderUtil.isToBeLogged(d ))
  __domIntruderObj.__domIntruderui.log(a,b,c,__domIntruderObj._domIntruderUtil.getCallStack(d));
  
}
if(!__domIntruderObj._domIntruderDebugDom.debug)
 dump=function(){}
__domIntruderObj._domIntruderDebugDom.FF()
 
//window.addEventListener("error",__domIntruderObj.__errorManager,true);
//window.onerror=__domIntruderObj.__errorManager;
