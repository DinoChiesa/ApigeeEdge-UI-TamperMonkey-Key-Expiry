// ==UserScript==
// @namespace   Apigee
// @name        Display Edge key expiry
// @description Display expiry of keys on Developer Apps in the Apigee Edge Administrative UI
// @match       https://edge.apigee.com/platform/*
// @match       https://enterprise.apigee.com/platform/*
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require     https://gist.githubusercontent.com/DinoChiesa/8352d4b48c8925cee544f45068701e12/raw/7e578afbbc4bec65c9c4bca7745309520ece13ec/humanizeDuration.js
// @require     https://gist.githubusercontent.com/DinoChiesa/8dbda7de34572386cdbe0c2163468a6b/raw/51e21ce0c7e8ccab191009f43a5751085c87cd40/dateFormat.js
// @grant       none
// @copyright   2016 Apigee Corporation
// @version     0.2.5
// @run-at      document-end
// @license     Apache 2.0
// ==/UserScript==

;(function (){
  var appsdiv;
  var wantDebug = false;
  var stage = 'kickoff';
  var hrefForTweakedPage;
  var appdetails;
  var delayAfterPageLoad = 1800;
  var refreshCheckInterval = 1800;
  var dateFormatString = "M d, Y h:i:s A";
  var prettySoonThreshold = 86400 * 1000 * 90;
  var re0 = new RegExp('^https://(enterprise|edge)\\.apigee\\.com/platform/([^/]+)/apps/([^/]+)$');

  function checkForRefresh() {
    appsdiv = null;
    appdetails = null;
    mylog(stage + ': ' + window.location.href);
    if (window.location.href != hrefForTweakedPage) {
      if(re0.exec(window.location.href)){
        setTimeout(function() {
          waitForKeyElements ("#apps form.form-horizontal tbody.ng-hide", function() {
            waitForKeyElements ("#apps form.form-horizontal tbody.ng-scope", function() {
              setTimeout(myFixup, delayAfterPageLoad);
            });
          });
        }, delayAfterPageLoad);
      }
      else {
        mylog('not an app page');
        setTimeout(checkForRefresh, refreshCheckInterval);
      }
    }
    else {
      mylog('page unchanged');
      setTimeout(checkForRefresh, refreshCheckInterval);
    }
    stage = 'refresh';
  }

  // This kicks off the page fixup logic
  checkForRefresh();

  function mylog() {
    if (wantDebug) {
      Function.prototype.apply.apply(console.log, [console, arguments]);
    }
  }

  function getElementsByTagAndClass(root, tag, clazz) {
    var nodes = root.getElementsByClassName(clazz);
    if (tag) {
      var tagUpper = tag.toUpperCase();
      nodes = Array.prototype.filter.call(nodes, function(testElement){
        return testElement.nodeName.toUpperCase() === tagUpper;
      });
    }
    return nodes;
  }

  function forEachNode (nodelist, fn, scope) {
    for (var i = 0, L = nodelist.length; i<L; i++) {
      fn.call(scope, nodelist[i], i);
    }
  }

  function getAppDetails(cb) {
    if (! appdetails) {
      // Example URLs:
      // web page: https://edge.apigee.com/platform/ecerruti/apps/2dea6330-fbea-497a-b949-184038313dc1
      // api: https://edge.apigee.com/ws/proxy/organizations/ecerruti/apps/2dea6330-fbea-497a-b949-184038313dc1
      //
      var re1 = new RegExp('/platform/');
      jQuery.ajax ( {
        type:       'GET',
        url:        window.location.href.replace(re1, '/ws/proxy/organizations/'),
        dataType:   'JSON',
        success:    function (body) {
          appdetails = body;
          cb(appdetails);
        }
      });
    }
    else {
      cb(appdetails);
    }
  }

  function getAppsDiv(){
    if ( ! appsdiv) {
      appsdiv = document.getElementById('apps');
    }
    return appsdiv;
  }

  function getDetailsForm(cb, retry) {
    var items, appsdiv = getAppsDiv();
    if (appsdiv) {
      items = getElementsByTagAndClass(appsdiv, 'form', 'form-horizontal');
      if (items && items[0]) {
        cb(items[0]);
      }
      else if (retry) {
        setTimeout(retry, 1000);
      }
    }
  }

  function getProductsTable(cb) {
    var items, appsdiv = getAppsDiv();
    if (appsdiv) {
      // table.products-table > thead > tr[0]  - append child
      items = getElementsByTagAndClass(appsdiv, 'table', 'products-table');
      if (items && items[0]) {
        cb(items[0]);
      }
    }
  }

  function getChildrenByTagName(parent, tagname) {
    var elem = parent.firstElementChild;
    tagname = tagname.toLowerCase();
    var result = [];
    while (elem !== null) {
      if (elem.tagName.toLowerCase() == tagname) {
        result.push(elem);
      }
      elem = elem.nextElementSibling;
    }
    return result;
  }

  function maybeAddNewAppDetailsLineItem(form, callbackUrlDiv, appdetails) {
    // Insert the line item if and only if the line item is not already present.
    //
    // The div following the callbackUrlDiv has a "helpful note" about the
    // callback URL.
    var helpfulNoteDiv = callbackUrlDiv.nextElementSibling;
    if (helpfulNoteDiv && helpfulNoteDiv.nodeName.toUpperCase() == 'DIV') {
      var followingDiv = helpfulNoteDiv.nextElementSibling;
      if (followingDiv && followingDiv.nodeName.toUpperCase() == 'DIV') {
        var label = followingDiv.firstElementChild;
        if (label && label.firstChild && label.firstChild.nodeValue != 'Status') {
          var newDiv = document.createElement("div");
          newDiv.setAttribute("class", "control-group");
          var newLabel = document.createElement("label");
          newLabel.setAttribute("class", "control-label");
          newLabel.appendChild(document.createTextNode("Status"));
          newDiv.appendChild(newLabel);
          var childDiv = document.createElement("div");
          childDiv.setAttribute("class", "controls");
          newDiv.appendChild(childDiv);
          var span = document.createElement("span");
          span.setAttribute("class", "static-value");
          //span.setAttribute("id", "app-status-span");
          var status = (appdetails && appdetails.status)? appdetails.status : "-unknown-";
          span.appendChild(document.createTextNode(status));
          childDiv.appendChild(span);

          // insert after the div element, that is after the callback URL div
          form.insertBefore(newDiv, followingDiv);
        }
      }
    }
  }

  function myFixup() {
    mylog('fixup running - this is an app page: ' + window.location.href);

    getAppDetails(function(appdetails){

      getDetailsForm(function(form) {
        var items = getChildrenByTagName(form, 'div');
        var done = false;
        hrefForTweakedPage = null;
        if (items) {
          items.forEach(function(item, ix){
            if ( ! done) {
              var label = item.firstElementChild;
              if (label && label.firstChild && label.firstChild.nodeValue == 'Callback URL') {
                maybeAddNewAppDetailsLineItem(form, item, appdetails);
                done = true;
              }
            }
          });
        }

        getProductsTable( function(table) {
          // replace 'Products' with 'Credentials'
          var items = table.parentNode.getElementsByTagName('h2');
          if (items && items[0]) {
            items[0].firstChild.nodeValue = 'Credentials';
          }
          // modify the table itself
          items = table.getElementsByTagName('thead');
          if (items && items[0]) {
            var thead = items[0];
            var rows = items[0].getElementsByTagName('tr');
            if (rows && rows[0]) {
              var headerRow = rows[0];
              var heads = rows[0].getElementsByTagName('th');
              if (heads && heads[2]) {
                var newHead = null;
                if (heads[2].firstChild && heads[2].firstChild.nodeValue != 'Expiry') {
                  newHead = document.createElement("th");
                  newHead.appendChild(document.createTextNode("Expiry"));
                }

                // Now add an element to each row in the first tbody there-after. There
                // are 2 tbody elements. Angular injects a second one.  There's a race
                // condition between this tweak and the angular script, both modifying
                // the DOM. This one ought to wait for the tbody with ng-hide before
                // running. I don't have a closed-loop way to do that, but a sufficient
                // delay usually handles it.
                items = table.getElementsByTagName('tbody');
                mylog('tbody.length = ' + items.length);
                forEachNode(items, function(tbody, ix){
                  mylog('tbody ' + ix);

                  if (newHead) {
                    // do this just once
                    headerRow.insertBefore(newHead, heads[2]);
                    newHead = null;
                  }

                  rows = getChildrenByTagName(tbody, 'tr');
                  if (rows) {
                    forEachNode(rows, function(row, ix){
                      mylog('row ' + ix);
                      var cells = getChildrenByTagName(row, 'td');
                      if (cells) {
                        var clzz = cells[0].getAttribute('class');
                        mylog('cell[0].class: ' + clzz);
                        if (clzz == 'productName') {
                          var newCell = document.createElement("td");
                          var span = document.createElement("span");
                          span.setAttribute("class", "ng-binding monkey-injected");

                          if (appdetails && appdetails.credentials && appdetails.credentials[0]) {
                            mylog('we have credentials');
                            if (appdetails.credentials[0].expiresAt) {
                              mylog('credentials expire');
                              var d = new Date(appdetails.credentials[0].expiresAt);
                              span.appendChild(document.createTextNode(dateFormat(d, dateFormatString)));
                              var now = (new Date()).valueOf();
                              if (now > appdetails.credentials[0].expiresAt) {
                                span.appendChild(document.createElement("br"));
                                span.appendChild(document.createTextNode("-expired-"));
                                span.setAttribute("style", "color:Red;");
                              }
                              else if (now > appdetails.credentials[0].expiresAt - prettySoonThreshold) {
                                span.appendChild(document.createElement("br"));
                                // configure the humanizer
                                var humanizeDuration = durationHumanizer({ round:true, units: ['d', 'h']});
                                span.appendChild(document.createTextNode("in about " + humanizeDuration(appdetails.credentials[0].expiresAt - now)));
                                span.setAttribute("style", "color:#9e239c;");
                              }
                            }
                            else {
                              mylog('credential never expires');
                              span.appendChild(document.createTextNode("-never-"));
                            }
                            newCell.appendChild(span);

                            mylog('appending a cell to the table');
                            if (cells[2]) {
                              row.insertBefore(newCell, cells[2]);
                            }
                            else {
                              row.appendChild(newCell);
                            }

                            hrefForTweakedPage = window.location.href;
                          }
                        }
                      }
                    });
                  }
                });
              }
            }
          }
          setTimeout(checkForRefresh, refreshCheckInterval);
        });
      }, myFixup);

    });
  }

}());
