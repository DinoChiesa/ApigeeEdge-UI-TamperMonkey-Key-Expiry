// ==UserScript==
// @namespace   Apigee
// @name        Display Edge key expiry
// @description Display expiry of keys on Developer Apps in the Apigee Edge Administrative UI
// @match       https://edge.apigee.com/platform/*
// @match       https://enterprise.apigee.com/platform/*
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant       none
// @copyright   2016 Apigee Corporation
// @version     0.2.1
// @run-at      document-end
// @license     Apache 2.0
// ==/UserScript==

(function (globalScope){
  var appsdiv;
  var appdetails;
  var delayAfterPageLoad = 2200;
  var dateFormatString = "M d, Y h:i:s A";
  var prettySoonThreshold = 86400 * 1000 * 90;
  var re0 = new RegExp('^https://edge.apigee.com/platform/([^/]+)/apps/([^/]+)$');

  if (re0.exec(window.location.href)) {
    setTimeout(function() {
      waitForKeyElements ("#apps form.form-horizontal tbody.ng-hide", myFixup );
    }, delayAfterPageLoad);
  }
  else {
    mylog('not an app page: ' + window.location.href);
  }

  function mylog(){
    Function.prototype.apply.apply(console.log, [console, arguments]);
  }

  var replaceChars = {
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        // Day
        d: function() {
          return (this.getDate() < 10 ? '0' : '') + this.getDate();
        },
        D: function() {
          return replaceChars.shortDays[this.getDay()];
        },
        j: function() {
          return this.getDate();
        },
        l: function() {
          return replaceChars.longDays[this.getDay()];
        },
        N: function() {
          return this.getDay() + 1;
        },
        S: function() {
          return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));
        },
        w: function() {
          return this.getDay();
        },
        z: function() {
          var d = new Date(this.getFullYear(), 0, 1);
          return Math.ceil((this - d) / 86400000);
        },

        // Fixed now
        // Week
        W: function() {
          var d = new Date(this.getFullYear(), 0, 1);
          return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7);
        },
        // Fixed now
        // Month
        F: function() {
          return replaceChars.longMonths[this.getMonth()];
        },
        m: function() {
          return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
        },
        M: function() {
          return replaceChars.shortMonths[this.getMonth()];
        },
        n: function() {
          return this.getMonth() + 1;
        },
        t: function() {
          var d = new Date();
          return new Date(d.getFullYear(), d.getMonth(), 0).getDate();
        },
        // Fixed now, gets #days of date

        // Year
        L: function() {
          var year = this.getFullYear();
          return (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0));
        },
        // Fixed now

        o: function() {
          var d = new Date(this.valueOf());
          d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
          return d.getFullYear();
        },

        //Fixed now
        Y: function() {
          return this.getFullYear();
        },
        y: function() {
          return ('' + this.getFullYear()).substr(2);
        },
        // Time
        a: function() {
          return this.getHours() < 12 ? 'am' : 'pm';
        },
        A: function() {
          return this.getHours() < 12 ? 'AM' : 'PM';
        },
        B: function() {
          return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
        },

        // Fixed now
        g: function() {
          return this.getHours() % 12 || 12;
        },
        G: function() {
          return this.getHours();
        },
        h: function() {
          return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
        },
        H: function() {
          return (this.getHours() < 10 ? '0' : '') + this.getHours();
        },
        i: function() {
          return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
        },
        s: function() {
          return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
        },
        u: function() {
          var m = this.getMilliseconds();
          return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
        },
        // Timezone
        e: function() {
          return "Not Yet Supported";
        },
        I: function() {
          return "Not Yet Supported";
        },
        O: function() {
          return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00';
        },
        P: function() {
          return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00';
        },
        // Fixed now
        T: function() {
          var m = this.getMonth();
          this.setMonth(0);
          var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
          this.setMonth(m);
          return result;
        },
        Z: function() {
          return -this.getTimezoneOffset() * 60;
        },
        // Full Date/Time
        c: function() {
          return this.format("Y-m-d\\TH:i:sP");
        },
        // Fixed now
        r: function() {
          return this.toString();
        },
        U: function() {
          return this.getTime() / 1000;
        }
      };


  // Simulates PHP's date function
  function dateFormat(date, format) {
    var returnStr = '';

    for (var i = 0; i < format.length; i++) {
      var curChar = format.charAt(i);
      if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
        returnStr += curChar;
      } else if (replaceChars[curChar]) {
        returnStr += replaceChars[curChar].call(date);
      } else if (curChar != "\\") {
        returnStr += curChar;
      }
    }
    return returnStr;
  }


  // ====================================================================
  // humanize Duration - from https://github.com/EvanHahn/HumanizeDuration.js

  var dictionary = {
        y: function (c) { return 'year' + (c !== 1 ? 's' : ''); },
        mo: function (c) { return 'month' + (c !== 1 ? 's' : ''); },
        w: function (c) { return 'week' + (c !== 1 ? 's' : ''); },
        d: function (c) { return 'day' + (c !== 1 ? 's' : ''); },
        h: function (c) { return 'hour' + (c !== 1 ? 's' : ''); },
        m: function (c) { return 'minute' + (c !== 1 ? 's' : ''); },
        s: function (c) { return 'second' + (c !== 1 ? 's' : ''); },
        ms: function (c) { return 'millisecond' + (c !== 1 ? 's' : ''); },
      decimal: '.'
      };

  // You can create a humanizer, which returns a function with default
  // parameters.
  function humanizer (passedOptions) {
    var result = function humanizer (ms, humanizerOptions) {
          var options = extend({}, result, humanizerOptions || {});
          return doHumanization(ms, options);
        };

    return extend(result, {
      language: 'en',
      delimiter: ', ',
      spacer: ' ',
      conjunction: '',
      serialComma: true,
      units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'],
      languages: {},
      round: false,
      unitMeasures: {
        y: 31557600000,
        mo: 2629800000,
        w: 604800000,
        d: 86400000,
        h: 3600000,
        m: 60000,
        s: 1000,
        ms: 1
      }
    }, passedOptions);
  }

  // doHumanization does the bulk of the work.
  function doHumanization (ms, options) {
    var i, len, piece;

    // Make sure we have a positive number.
    // Has the nice sideffect of turning Number objects into primitives.
    ms = Math.abs(ms);
    var pieces = [];

    // Start at the top and keep removing units, bit by bit.
    var unitName, unitMS, unitCount;
    for (i = 0, len = options.units.length; i < len; i++) {
      unitName = options.units[i];
      unitMS = options.unitMeasures[unitName];

      // What's the number of full units we can fit?
      if (i + 1 === len) {
        unitCount = ms / unitMS;
      } else {
        unitCount = Math.floor(ms / unitMS);
      }

      // Add the string.
      pieces.push({
        unitCount: unitCount,
        unitName: unitName
      });

      // Remove what we just figured out.
      ms -= unitCount * unitMS;
    }

    var firstOccupiedUnitIndex = 0;
    for (i = 0; i < pieces.length; i++) {
      if (pieces[i].unitCount) {
        firstOccupiedUnitIndex = i;
        break;
      }
    }

    if (options.round) {
      var ratioToLargerUnit, previousPiece;
      for (i = pieces.length - 1; i >= 0; i--) {
        piece = pieces[i];
        piece.unitCount = Math.round(piece.unitCount);

        if (i === 0) { break; }

        previousPiece = pieces[i - 1];

        ratioToLargerUnit = options.unitMeasures[previousPiece.unitName] / options.unitMeasures[piece.unitName];
        if ((piece.unitCount % ratioToLargerUnit) === 0 || (options.largest && ((options.largest - 1) < (i - firstOccupiedUnitIndex)))) {
          previousPiece.unitCount += piece.unitCount / ratioToLargerUnit;
          piece.unitCount = 0;
        }
      }
    }

    var result = [];
    for (i = 0, pieces.length; i < len; i++) {
      piece = pieces[i];
      if (piece.unitCount) {
        result.push(render(piece.unitCount, piece.unitName, dictionary, options));
      }

      if (result.length === options.largest) { break; }
    }

    if (result.length) {
      if (!options.conjunction || result.length === 1) {
        return result.join(options.delimiter);
      } else if (result.length === 2) {
        return result.join(options.conjunction);
      } else if (result.length > 2) {
        return result.slice(0, -1).join(options.delimiter) + (options.serialComma ? ',' : '') + options.conjunction + result.slice(-1);
      }
    } else {
      return render(0, options.units[options.units.length - 1], dictionary, options);
    }
  }

  function render (count, type, dictionary, options) {
    var decimal;
    if (options.decimal === void 0) {
      decimal = dictionary.decimal;
    } else {
      decimal = options.decimal;
    }

    var countStr = count.toString().replace('.', decimal);

    var dictionaryValue = dictionary[type];
    var word;
    if (typeof dictionaryValue === 'function') {
      word = dictionaryValue(count);
    } else {
      word = dictionaryValue;
    }

    return countStr + options.spacer + word;
  }

  function extend (destination) {
    var source;
    for (var i = 1; i < arguments.length; i++) {
      source = arguments[i];
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          destination[prop] = source[prop];
        }
      }
    }
    return destination;
  }

  // ====================================================================

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
    if ( ! appdetails) {
      //
      // page: https://edge.apigee.com/platform/ecerruti/apps/2dea6330-fbea-497a-b949-184038313dc1
      // app: https://edge.apigee.com/ws/proxy/organizations/ecerruti/apps/2dea6330-fbea-497a-b949-184038313dc1
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

  function addNewAppDetailsLineItem(form, callbackUrlDiv, appdetails) {
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
    form.insertBefore(newDiv, callbackUrlDiv.nextElementSibling.nextElementSibling);
  }

  function myFixup() {
    mylog('fixup running - this is an app page: ' + window.location.href);

    getAppDetails(function(appdetails){

      getDetailsForm( function(form) {
        var items = getChildrenByTagName(form, 'div');
        var done = false;
        if (items) {
          items.forEach(function(item, ix){
            if ( ! done) {
              var label = item.firstElementChild;
              if (label && label.firstChild && label.firstChild.nodeValue == 'Callback URL') {
                addNewAppDetailsLineItem(form, item, appdetails);
                done = true;
              }
            }
          });
        }
      }, myFixup);

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
              var newHead = document.createElement("th");
              newHead.appendChild(document.createTextNode("Expiry"));

              // Now add an element to each row in the first tbody there-after
              // There are 2 tbody elements.  Angular injects a second one.
              // There's a race condition between this tweak and the angular script, both
              // modifying the DOM.  This one ought to wait for the tbody with ng-hide before
              // running.
              items = table.getElementsByTagName('tbody');
              mylog('tbody.length = ' + items.length);
              forEachNode(items, function(tbody, ix){
                mylog('tbody ' + ix);
                if ( newHead) {
                  headerRow.insertBefore(newHead, heads[2]);
                  newHead = null;
                }
                //rows = items[0].getElementsByTagName('tr');
                rows = getChildrenByTagName(tbody, 'tr');
                if (rows) {
                  forEachNode(rows, function(row, ix){
                    mylog('row ' + ix);
                    //var cells = jQuery(row).find('>td');
                    var cells = getChildrenByTagName(row, 'td');
                    if (cells) {
                      var clzz = cells[0].getAttribute('class');
                      mylog('cell[0].class: ' + clzz);
                      if (clzz == 'productName') {
                        var newCell = document.createElement("td");
                        var span = document.createElement("span");
                        span.setAttribute("class", "ng-binding");

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
                              var humanizeDuration = humanizer({ round:true, units: ['d', 'h']});
                              span.appendChild(document.createTextNode("in about " + humanizeDuration(appdetails.credentials[0].expiresAt - now)));
                              span.setAttribute("style", "color:#9e239c;");
                            }
                          }
                          else {
                            mylog('credential never expires');
                            span.appendChild(document.createTextNode("-never-"));
                          }
                          newCell.appendChild(span);

                          mylog('typeof row: ' + typeof row);

                          if (cells[2]) {
                            mylog('row.insertBefore');
                            row.insertBefore(newCell, cells[2]);

                            //cells[2].parentNode.insertBefore(newCell, cells[2]);
                            //jQuery(row).append(newCell);
                            // setTimeout(function() {
                            // }, 800);

                            //jQuery(cells[2]).before(newCell);
                            //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

                            // mylog('row = ' + row);
                            // mylog('cells[2] = ' + cells[2]);
                            // mylog('newCell = ' + newCell);
                          }
                          else {
                            row.appendChild(newCell);
                          }
                        }
                      }
                    }
                  });
                }
              });
            }
          }
        } // thead
      });
    });
  }


}(this));
