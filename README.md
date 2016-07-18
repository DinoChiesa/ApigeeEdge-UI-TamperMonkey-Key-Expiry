# Apigee Edge UI Tampermonkey script to display Key Expiry

This is a [Tampermonkey](https://tampermonkey.net/) script that tweaks
the [Apigee Edge](https://edge.apigee.com) UI to display expiry information for a Developer App Key in the browser
page.  It also displays the status of the developer app itself.


## Background

Apigee Edge has a concept of Developer App. Each developer app has:

* a name
* a creation date
* a status (approved or revoked)
* a list of zero or more credentials

Each credential has:

* a consumer key and secret
* an approved/revoked status
* an issued-at time
* optionally, an expiry
* a list of zero or more API products for which the credential is valid

Taking flexibility to the extreme, each API Product on a credential can have a approved/revoked status as well.

If the developer app is marked "revoked", then the status of descendant entities is ignored.
If the credential is marked "revoked", then the status of API Products within the credential is ignored.

This tampermonkey script shows the expiry of each credential, and the status of the developer app as a whole. 

![screengrab](img/tampermonkey-key-expiry-example-1.png)


## What is Tampermonkey?

Tampermonkey is a browser extension, that works on Firefox, Chrome, Safari, etc. It is a pre-requisite to get this tweak of the Edge UI. 

Tampermonkey allows the running of "user scripts" on webpages from particular domains. It's a way of augmenting or modifying the behavior of a webpage, using code provided by or approved by the user. The modification could be as simple as changing the color or styling of a webpage; or it could be as complex as adding new behavior or UI elements on a web page, or even adding new pages.

The user must install the custom script, and associate it to a particular domain or set of domains. Thereafter, all pages loaded from those domains will run that script. 


## OK, How does this Tweak work?

The script registers for edge.apigee.com and enterprise.apigee.com, and looks for web pages that show developer apps. When it finds that the current page displays a developer app, the script
inserts a few UI elements to display the relevant information: expiry information and approval status.

The script is set to run after a brief delay after initial page load, maybe around ~3.5s.
Thereafter, it runs every 1.8s and re-checks to see if the page being viewed  has changed. This userscript runs only on edge.apigee.com or enterprise.apigee.com . 


## Installing the script

If you don't have Tampermonkey loaded for your browser, you must first visit  [tampermonkey.net](https://tampermonkey.net/) and install it.

Then, 

1 Use the tampermonkey menu to add a new script.
  <img src="img/tm-add-new-script.png" width='308px'>

2. copy-paste the [key-expiry.user.js](lib/key-expiry.user.js) script into place.

3. Reload the browser tab that is displaying the Developer app.

4. Done.


## The Versions

There are two versions of the code - one is modular and depends on external libraries for the dateFormat and durationHumanizer functions. The other is not modular, and includes those pieces directly.  Which one you prefer to use is up to you.

Either one will work; you need just one of them, not both. 

The modular version is simpler to manage. The full version has fewer dependencies. 


## License

This user script is licensed under the [Apache 2.0 license](LICENSE).


## Compatibility

This user script works with Firefox, and Chrome on MacOS X. 
It *ought to* work just fine on other combinations of browsers. 


## Bugs

* There's no guarantee that the 2.2s delay before this script starts working, is
  long enough for the page to be loaded. On a slow connection, the script may fail. 

* This script doesn't properly handle the edit event.  
  The screen will become garbled. To correct that, reload the page after editing a developer app. Pull requests welcome.

* This script will break if/when Apigee changes the layout of the UI.
  It does screen-scraping to figure out where/how to add UI elements. 

