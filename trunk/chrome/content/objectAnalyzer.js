// This code is part of DOMinator extension                                                                                            
// DOMinator script
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//
var EXPORTED_SYMBOLS=["getObjFlow"]


function getSpan(val,color){
 
return '<span style="color:'+color+'">'+val+"</span>"
}
function createSubS(str,s,e){
 var _str=str.replace(/</g,"\x01");
 var sub=_str.substr(s,e);
  
 return _str.split(sub).join(getSpan(sub.replace(/</g,"&lt;"),"red")).replace(/\x01/g,"&lt;"); 
}
function getOp(f,s){
 try{
  if(f.source)
   s+='<hr/>'
  s+=getSpan(f.source?f.source:f.op,"blue")+'<br>' ;
  if(f.op.match(/CONCAT/)){
  var cs=createSubS(f.val,f.dep[0].startPos,(f.dep[0].endPos)); 
  s+=cs+'<br>' ;
  }else{
   s+=getSpan(f.val.replace(/</g,"&lt;"),"green")+"<br>"
  }
  if(f._pobj)
    s=getOp(f._pobj,s);
 }catch(e){s=null}
return s;
}

function getObjFlow(s,str){
  str+="<div style='color:black'>"
  for each(var d in s){
    var rs=getOp(d,'');
    if(rs!=null)
     str+= rs ;
    else{
     str+='Not a traceable Object'
     break;
    }
   }
  return str+'</div>';
}
