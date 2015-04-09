## How to install DOMinator ##

**WARNING:** This is a beta release. Don't install if you don't know what you're doing! If you really want to install it read all the instruction below!

**UPDATE:** there's an open [issue](http://code.google.com/p/dominator/issues/detail?id=4) about using DOMinator under Win 64Bit. If you have windows 64bit it's suggested to use the Linux version in a VM environment.

  1. DOMinator is not just an extension, **it is a modified version of Firefox 3.6.13**, so be sure to download [Windows](http://code.google.com/p/dominator/downloads/detail?name=DOMinator_firefox_3.6.13_Windows_32Bit.zip&can=2&q=) and/or [Linux](http://code.google.com/p/dominator/downloads/detail?name=DOMinator_firefox_3.6.13_Linux_32Bit.tgz&can=2&q=) version of DOMinator. If you have a **MacOSX** there no version yet, sorry. If you still want to try it you can still [[download](http://code.google.com/p/dominator/wiki/DOMinatorVirtualAppliance) the [Virtualbox](https://www.virtualbox.org/) image.
  1. unzip the compressed file
  1. Read the README.txt file.
```
  a If linux: Enter in the DOMinator directory and launch:
      ./firefox -P DOMinatorProfile -NO-REMOTE 
      this will create a new profile.
  b. if Windows create a link named DOMinator containing 
       ./firefox -P  DOMinatorProfile -NO-REMOTE 
      and double click it.
```
  1. install at least [Firebug](https://addons.mozilla.org/en-us/firefox/addon/firebug/versions/?page=1#version-1.6.2) (v 1.6.2) (I use also web developer and Firecookie).
  1. Install the DOMinator [Extension](http://code.google.com/p/dominator/downloads/detail?name=dominator-0.9.0.1.xpi&can=2&q=) (already shipped with the package).
  1. open Firebug and set it "On" on any page.
  1. set Enable all Panels on Firebug (or at least the script panel). This is needed for stack trace feature to work.
  1. Watch the [video](http://www.youtube.com/watch?v=f_It469LUFM) to understand how it works.
  1. go for example to http://www.aol.com or http://www.leboncoin.fr/  and see what it says.
  1. Remember that since Firefox sets the default profile as the last one, the default one will always be launched using (**all the previous Firefox links must be updated with the -P profile arguments**):
```
firefox -P default -NO-REMOTE
```
  1. Read the [pdf](http://code.google.com/p/dominator/downloads/detail?name=DOMinator_Control_Flow.pdf&can=2&q=) document for architecture description.
  1. See the issues page for minimal recovering if you did some error.
  1. Subscribe to DOMinator Mailing [List](https://groups.google.com/forum/#!forum/dominator-ml)
As a side note consider that there are still some issues I hope to fix,
like doing some kind of rebranding to solve those -P issues on original
firefox.


If you are curious about the implementation have a look at the diff file.