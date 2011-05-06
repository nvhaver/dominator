EXPORTED_SYMBOLS = ["DOMILogParser"];

Components.utils.import("resource://domintrudermodules/JSON.jsm");
var DEBUG = true; 
function dumpn(s) {
   if(DEBUG==true)
    dump(s + "\n");
}
DOMILogParser={
     theTag:null,
     loggerWindow: null,
     sinkWindow: null,
     hash: null,
     _md5: null,
     lastNode:null,
     historyId:0,
     toSourceRe:/^\((.*)\)$/,

     //test:function(event){dump("RICEVUTO!!!!!!!!!!!!!!!!!!!!!\n"+event.data);},
     load:function load(event){
     //Questo servirebbe per triggerare il DI 
  //    parent.addEventListener('DOMNodeInserted',this.fff, true, true);
      
      parent.addEventListener('DOMIEvent',this, true, true);
   //   parent.addEventListener( "message",this , true, true);
      try{
        //dump('test '+event.target+"\n");
        if(parent.window.opener!==null){
          this.loggerWindow= parent.window.opener.getElementById("logViewer");
          this.sinkWindow= parent.window.opener.getElementById("sinkViewer");
        } else{
         this.loggerWindow= document.getElementById("logViewer");
         this.sinkWindow= document.getElementById("sinkViewer");
        }
        this.loggerWindow.contentDocument.body.innerHTML="<style>body{font-size:small}#value{background-color: black;color: pink;}#Getter{background-color:  darkgreen;color: white;}#Flow{background-color: white;color: black;}#Setter{background-color: blue;color: white;}#Sink{ background-color: red;color: black}</style>"
        this.sinkWindow.contentDocument.body.innerHTML="<style>body{font-size:small}#value{background-color: black;color: pink;}#Getter{background-color:  darkgreen;color: white;}#Flow{background-color: white;color: black;}#Setter{background-color: blue;color: white;}#Sink{ background-color: red;color: black}</style>"
      }catch(ec){dump(ec)}

     },
     unload: function unload(event){

     },
     fff: function(e){
     
     
     dump("dddddddddddddddddddddddddddddddddddddddddccbnmkyyyioteyuuuuuuuuuuuuuuuuuuuuuuuuuuuuuueiouiyutryuheyueuyeruyurtghiortjhiojytohjtyo ")
     
     for(var i in e  )
     dump(i+' : '+e[i]+"\n");
     }
     ,
     dumpobj: function (ob){ 
            for(var i in ob){
              try{
              dump(i+' '+ob[i]+"\n");
              }catch(c){dump("Exception "+i+" "+c+"\n")}
            }
          },
     addHtmlToElement:function addHtmlToElement(data){
        if(typeof DOMILogParser.loggerWindow.contentDocument=="undefined")
            this.loggerWindow=this.getMainWindow().sidebar.DOMILogParser.loggerWindow//. parent.window.opener.getElementById("logViewer");
          
          DOMILogParser.loggerWindow.contentDocument.body.innerHTML+=data;
     }, 
     getMainWindow: function(){
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
                var enumerator = wm.getEnumerator(null);
                while(enumerator.hasMoreElements()) {
                 var win = enumerator.getNext();
             // win is [Object ChromeWindow] (just like window), do something with it
                  if(win.sidebar.DOMILogParser.loggerWindow.contentDocument!==null){
                    return win;             
                  }
                }
     },
     addNodeToElement:function addNodeToElement(data){
 
        if(typeof DOMILogParser.loggerWindow.contentDocument=="undefined")
            this.loggerWindow=this.getMainWindow().sidebar.DOMILogParser.loggerWindow//. parent.window.opener.getElementById("logViewer");
          
          var div=DOMILogParser.loggerWindow.contentDocument.createElement("div");
          //dump(data+"\n");
          div.style.border="1px solid darkgrey";
          div.innerHTML=data;
 
          
          this.lastNode=div;
          
          DOMILogParser.loggerWindow.contentDocument.body.appendChild(div);
     },
     addNodeToSinkElement:function addNodeToSinkElement(data){
 
        if(typeof DOMILogParser.sinkWindow.contentDocument=="undefined")
            this.sinkWindow=this.getMainWindow().sidebar.DOMILogParser.sinkWindow//. parent.window.opener.getElementById("logViewer");
          
          var div=DOMILogParser.sinkWindow.contentDocument.createElement("div");
          //dump(data+"\n");
          div.style.border="1px solid darkgrey";
          div.innerHTML=data;
 
          
          this.lastNode=div;
          
          DOMILogParser.sinkWindow.contentDocument.body.appendChild(div);
     },     
     deleteContent:function  deleteContent(){
          this.hash=null;
          this.lastNode=null;
          DOMILogParser.loggerWindow.contentDocument.body.innerHTML="<style>body{font-size:small}#value{background-color: black;color: pink;}#Getter{background-color:  darkgreen;color: white;}#Flow{background-color: white;color: black;}#Setter{background-color: blue;color: white;}#Sink{background-color: red;color: black}#callstack{border:1px solid}</style>";
          DOMILogParser.sinkWindow.contentDocument.body.innerHTML="<style>body{font-size:small}#value{background-color: black;color: pink;}#Getter{background-color:  darkgreen;color: white;}#Flow{background-color: white;color: black;}#Setter{background-color: blue;color: white;}#Sink{background-color: red;color: black}#callstack{border:1px solid}</style>";
     },
     updateCountElement:function updateCountElement(){
       //dump("aggiorno e basta\n"+this.lastNode+" ----------------- \n");
        
       var iternode= DOMILogParser.loggerWindow.contentDocument.evaluate("//span[@id='callcount']", this.lastNode,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
        //this.dumpobj(iternode);
        var node = iternode.snapshotItem( iternode.snapshotLength-1);
        
        if(node){
         node.textContent=parseInt(node.textContent)+1;
        }
     },
       setComp: function( calls){
         
         var outp=new XML();
         for(var i=0;i<calls.length;i++){
         
           outp+=<span><a href={"view-source:"+calls[i][0]} target="_new">{calls[i][0]}</a>{"Line:"+calls[i][2]+"\n"+calls[i][1]}</span>;
         }

         return outp;
       }
     ,
     dataToNode: function(data){
        if(data.b64){
          data.value=atob(data.value);
          data.loc=atob(data.loc);
          data.callstack=atob(data.callstack);
          
/*           if(data.callstack!="" )
          data.callstack = eval('('+data.callstack+")");
          if(data.target!="eval")
          for(var i=0;i<data.callstack.length;i++){
           dump("Callstack " +data.callstack[i][0]+" \n");
           if(data.callstack[i][0]!=undefined && data.callstack[i][0].indexOf("analytics")>-1){
            return null
           }
           } */
        }
//        dump("arrivato: "+data.loc+" "+data.target+" "+data.value.substr(0,50)+" .... \n");
           dump('ffff\n')
        dump(" ssss "+this.document+" ss")
        var xx=Firebug.DOMPanel.DirTable.tag.append({object: data.value*, toggles: {}},  panel.panelNode);
        
        var str=<span>{data.n} {data.time} :[
        <span style="text-decoration: underline">{data.loc}
        </span>] 
        <span id={data.type}><br/>Target: [
        {data.target} CallCount: <span id="callcount">1</span>
        ]</span><br/>
        Data:<div id='value'>
        {/*data.value*/xx }
        </div>
        <div id='callstack' > <span onclick="try{a=this.nextSibling.nextSibling.style;a.display=(a.display=='inline'?'none':'inline');}catch(f){alert(f)}">+</span>
        <div style='display:none'><pre style="margin-top:0px;">{/*data.target!="eval"?this.setComp(data.callstack):*/ data.callstack}</pre></div>
        </div></span>;
      /*  if(data.type=="Sink"){
          this.addNodeToSinkElement(str.toXMLString());
        }*/
        return str;
     },
     dataToString: function(data){
         var node=this.dataToNode(data);
        return node.toXMLString();
     },
     getMD5FromData: function getMD5FromData(str){
       try {
        if(this._md5===null)
          this._md5=Components.classes['@mozilla.org/security/hash;1'].createInstance( Components.interfaces.nsICryptoHash);

       }catch(err){ Components.utils.reportError(err);  }
        var arr = [];
	var ii = str.length;
	for (var i = 0; i < ii; ++i) {
		arr.push(str.charCodeAt(i));
	}
	this._md5.init( Components.interfaces.nsICryptoHash.MD5);
	this._md5.update(arr, arr.length);
	var hash = this._md5.finish(false);
        
        return hash;
     },
     isEqualToLast: function isEqualToLast(obj){
        var str=obj.type+obj.target+obj.value+obj.callstack;
        var newHash=this.getMD5FromData(str);
        if( this.hash!==newHash){
          this.hash=newHash
          return false;
        }
        return true;
     },
     getDOMISidebar: function(){
      return this.getMainWindow().sidebar.DOMISidebar;
     },
     parseData: function (data){
     try{
     // var mySandbox = new Components.utils.Sandbox("http://www.example.com/");
      //mySandbox.y = 5;  // insert property 'y' with value 5 into global scope.
//      var dataObj = Components.utils.evalInSandbox(unescape(data), mySandbox);

      var dataObj=JSON.parse(data );
      
      var xml=this.dataToNode(dataObj);
      return  xml.toXMLString();
      }catch(e){dump(e+unescape(data))}
      return "Errore";
     },
     handleEvent:function handleStorage(ev){
        try{
          var doc=null;//dump("reccccccccccccccccc\n"+ev.data)
         if(ev.target instanceof Window)
            var doc=ev.target.document;
         else if(ev.target instanceof HTMLDocument)
            var doc=ev.target; 
         else if(ev.target instanceof  HTMLBodyElement)
            var doc=ev.target.ownerDocument;
         else if(ev.target instanceof  HTMLBodyElement)
            var doc=ev.target.ownerDocument;
 
       //  dump("aaaaaaaaaaaaaaaassssssssssaa >"+this.getMainWindow().FirebugContext.getPanel("DomIntruder")+"\n")
      //  dump("---OOOOOOOOOOOOOOOOOO-------------"+doc+" "+DOMISidebar.theTag+"\n");
         // better using XPath with document.evaluate
         if(doc!==null)
         DOMISidebar.theTag=doc.getElementsByTagName('DOMIntruder')[0];
         else{
           if(ev.target instanceof HTMLUnknownElement){
             var DIS=this.getDOMISidebar();
             DIS.theTag=ev.target;
             
          } else
             return ;
        //   dump(DOMISidebar.theTag+" dddddddddddddddddddddddddd\n")
         }
       // dump("---OOOOOOOOOOOOOOOOOO-------------"+doc+" "+DOMISidebar.theTag+"\n");
         if(!DOMISidebar.theTag)
          return;
        var attrs_map = DOMISidebar.theTag.attributes;
        var attr_pair=[]
        for(var i=0;i<attrs_map.length;i++) {
             var item=attrs_map.item(i);
             var obj=[item.nodeName,item.nodeValue]
             //obj[item.nodeName]=item.nodeValue;
             attr_pair.push(obj);
        }

        for(var i=0;i<attr_pair.length;i++){
      //    dump("cancello"+attr_pair[i][0]+" "+attr_pair[i][1] +"\n");
          DOMISidebar.theTag.removeAttribute(attr_pair[i][0] );
          var dataObj=JSON.parse(unescape(attr_pair[i][1]));
          if(this.isEqualToLast(dataObj))
           this.updateCountElement();
          else{
            var xml=this.dataToNode(dataObj)
            if(xml!=null) {
           try{
             var start=new Date().getTime();
             this.addNodeToElement( xml.toXMLString());
             var stop = (new Date).getTime();
             dump("Tempo impiegato-1: "+(stop-start)+"\n");
             this.getMainWindow().FirebugContext.getPanel("DomIntruder").logIt( xml.toXMLString());
             var stop2 = (new Date).getTime();
             dump("Tempo impiegato-2: "+(stop2-stop)+"\n");
            }catch(e){dump('ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss '+e+"\n")}
            }
          }
         }
         this.lastElem;
       //alert(""+attr_pair.toSource(2));
       //filters = Components.classes["@mozilla.org/dom/json;1"].getService(Components.interfaces.nsIJSON)
        //                                                         .decode(prefService.getCharPref("extensions.jsdeobfuscator.filters"));

       // this.dumpobj(ev.target.ownerDocument.defaultView)
     //   dump("---------------------------------\n");
        //this.dumpobj(parent)
         ev.stopPropagation()
        }catch(sss){dump("Excepriont2!"+ sss+" "+sss.lineNumber+"\n");}
      }
} 
