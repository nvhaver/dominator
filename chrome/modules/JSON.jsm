EXPORTED_SYMBOLS = ["JSON"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

// Iceweasel 3.0 has a bug where it reports its platform version as 1.9 instead
// of 1.9.0.n; we work around the bug by checking for 1.9 in addition to 1.9.0.n
// and wrapping the JSON API in both cases.
if (appInfo.platformVersion.indexOf("1.9.0") == 0 ||
    appInfo.platformVersion == "1.9") {
  // Declare JSON with |var| so it'll be defined outside the enclosing
  // conditional block.
  var JSON = {
      JSON: null,
      parse: function(jsonString) { return this.JSON.fromString(jsonString) },
      stringify: function(jsObject) { return this.JSON.toString(jsObject) }
  }
  Cu.import("resource://gre/modules/JSON.jsm", JSON);
}
