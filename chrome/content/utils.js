//                                                                                             
// This code is part of DOMinator extension
// @Copyright Stefano.dipaola@mindedsecurity.com
// This code is copyrighted
//

EXPORTED_SYMBOLS=["INCLUDE"];
const CI = Components.interfaces;
const CC = Components.classes;
const LOADER = CC["@mozilla.org/moz/jssubscript-loader;1"].getService(CI.mozIJSSubScriptLoader);
const _INCLUDED = {};
const INCLUDE = function(name) {
  if (arguments.length > 1)
    for (var j = 0, len = arguments.length; j < len; j++)
      arguments.callee(arguments[j]);
  else if (!_INCLUDED[name]) {
    try {
      LOADER.loadSubScript("chrome://domintruder/content/"+ name + ".js");
      dump("Includo "+"chrome://domintruder/content/"+ name + ".js");
      _INCLUDED[name] = true;
    } catch(e) {
      dump("INCLUDE " + name + ": " + e + "\n");
    }
  }
}
