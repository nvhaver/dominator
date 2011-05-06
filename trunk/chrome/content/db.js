// This code is part of DOMinator extension                                                                                            
// DOMinator script
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//
var EXPORTED_SYMBOLS=["DB" ,"initializeDB"  ]
DB=function DB(){
 
  this.singletonInstance = null;
  var getInstance = function() {
     if (!this.singletonInstance) {
      this.singletonInstance = createInstance();
    }

    return this.singletonInstance;
  }
  
  var createInstance = function() {
    var conn={}
    try{
    // Here, you return all public methods and variables
    var file = Components.classes["@mozilla.org/file/directory_service;1"]
                        .getService(Components.interfaces.nsIProperties)
                        .get("ProfD", Components.interfaces.nsIFile);
    file.append("DOMLog.sqlite"); 
    var storageService = Components.classes["@mozilla.org/storage/service;1"]
                           .getService(Components.interfaces.mozIStorageService);

//    conn.mDBConn = storageService.openDatabase(file); // Will also create the file if it does not exist
    conn.mDBConn = storageService.openDatabase(null); // IN-Memory
    conn.wrappedJSObject=conn;
    conn.addRow = function (obj){
      try{

      var objData=obj.logObj;
      var statement=this.mDBConn.createStatement("insert into  DomLog ( logId,contextId ,  time, type,value,loc,target,callstack,sources) values (:mLogId,:cId, :mTime,:mType,:mValue,:mLoc,:mTarget,:mCallStack,:mSources)");
                                  statement.params.mLogId  =     objData.n;
                                  statement.params.cId  =        obj.cid;
                                  statement.params.mTime   =     objData.time ;
                                  statement.params.mType   =     objData.type; 
                                  statement.params.mValue  =     objData.value; 
                                  statement.params.mLoc    =     objData.loc; 
                                  statement.params.mTarget =     objData.target;
                                  statement.params.mCallStack=   JSON.stringify(objData.callstack);
                                  statement.params.mSources = (obj.obj?obj.obj.toSource():"null");
                                  statement.executeAsync();


      }catch(e){
       dump(e+" "+e.lineNumber+"\n");
      }finally{

      statement.reset();
      }
//      Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService).notifyObservers( null,'dominator-logtogui',obj)

     }
    conn.addRowComputedObj = function (obj){
      try{ 
      var objData=obj.logObj;
      var statement=this.mDBConn.createStatement("insert into  DomLog ( logId,contextId , time, type,value,loc,target,callstack,sources) values (:mLogId,:cId,:mTime,:mType,:mValue,:mLoc,:mTarget,:mCallStack)");
                                  statement.params.mLogId  =     objData.n;
                                  statement.params.cId  =     objData.cid;
                                  statement.params.mTime   =     objData.time ;
                                  statement.params.mType   =     objData.type; 
                                  statement.params.mValue  =     objData.value; 
                                  statement.params.mLoc    =     objData.loc; 
                                  statement.params.mTarget =     objData.target;
                                  statement.params.mCallStack=   JSON.stringify(objData.callstack);
                                  statement.params.mSources = JSON.stringify(obj.obj);
                                  
                                  statement.execute();


      }catch(e){
       dump(e+"\n");
      }finally{

      statement.reset();
      }
//      Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService).notifyObservers( null,'dominator-logtogui',obj)
//      dump(obj.toSource(2)+"\n");
     } 
     conn.deleteByContext = function (ctxId) {
        try {
            var statement=this.mDBConn.createStatement("delete from DomLog where contextId=:mCid");
            statement.params.mCid  = ctxId; 
            statement.execute();
         }catch(e){
            dump(e+"Likely SQL syntax error: "+conn.lastErrorString+"\n");
         } finally {
        statement.reset();
      }

//      dump(obj.toSource(2)+"\n");
     }
 
     conn.getSourcesRow = function (obj){
      try{
      var statement=this.mDBConn.createStatement("select sources from  DomLog where logId=:mLogId and contextId=:mCId and time=:mTime and loc=:mLoc");
                                  statement.params.mLogId  = obj.n;
                                  statement.params.mCId  = obj.ctxid;
                                  statement.params.mLoc  = obj.loc;
                                  statement.params.mTime  = obj.time;
                                  
      var rc =  statement.executeStep();
      var  myRows;
        // if you use statement.columnCount in the for loops, it looks like it 
        // goes over to C   land to get this already known value 
        var cols = statement.columnCount; 
         
        var retSource = eval("("+statement.getString(0)+")");
        

      }catch(e){dump(e+"Likely SQL syntax error: "+conn.lastErrorString+"\n");}finally{
      statement.reset();
      }
      return retSource;
//      dump(obj.toSource(2)+"\n");
     }
    }catch(exc){ dump("[Exception]\n"+exc);}
    return conn;
  }
  return getInstance();
}
DB.getConnection =function (){ 
  return (new DB()).mDBConn;
}



function initializeDB(){
  try{
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
  var str= getContents( "chrome://domintruder/content/DOMLog.db.sqlite");
   
  var db=new DB();
  db.mDBConn.executeSimpleSQL(str);
}catch(exc){ dump("[Exception] "+exc+"\n");}
}

