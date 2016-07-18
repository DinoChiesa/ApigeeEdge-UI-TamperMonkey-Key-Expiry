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


## Installing

Tampermonkey is a browser extension, that works on Firefox, Chrome, Safari, etc. It is a pre-requisite to get this tweak of the Edge UI. 

If you don't have this extension loaded for your browser, you must first visit  [tampermonkey.net](https://tampermonkey.net/) and install Tampermonkey

Then, 

1 Use the tampermonkey menu to add a new script.
  <img src="img/tm-add-new-script.png" width='308px'>

2. copy-paste the [key-expiry.user.js](lib/key-expiry.user.js) script into place.

3. Reload the browser tab that is displaying the Developer app.

4. Done.


## The Modular Version

There are two versions of the code - one is modular and depends on external libraries for the dateFormat and durationHumanizer functions. The other is not modular, and includes those pieces directly.  Which one you prefer to use is up to you.

Either one will work; you need just one of them, not both. 


## How does it work?

The script just inserts a few UI elements to display the relevant information. 
It is set to run after a brief delay, maybe around ~3.5s.



## License

This is licensed under the [Apache 2.0 license](LICENSE).


## Bugs

* There's no guarantee that the 2.2s delay before this script starts working, is
  long enough for the page to be loaded. On a slow connection, the script may fail. 

* This script doesn't properly handle the edit event.  
  The screen will become garbled. To correct that, reload the page after editing a developer app. Pull requests welcome.

* This script will break if/when Apigee changes the layout of the UI.
  It does screen-scraping to figure out where/how to add UI elements. 

