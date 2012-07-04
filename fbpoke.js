var system = require('system');

// CONFIGURATION
var fbemail = system.args[1] || "email";
var fbpass = system.args[2] || "pass";
var delay = 5000;
// CONFIGURATION

var page = require('webpage').create();
var testindex = 0, loadInProgress = false;

function evaluate(page, func) {
  var args = [].slice.call(arguments, 2);
  var str = 'function() { return (' + func.toString() + ')(';
  for (var i = 0, l = args.length; i < l; i++) {
    var arg = args[i];
    if (/object|string/.test(typeof arg)) {
      str += 'JSON.parse(\'' + JSON.stringify(arg) + '\'),';
    } else {
      str += arg + ',';
    }
  }
  str = str.replace(/,$/, '); }');
  return page.evaluate(str);
}

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.onLoadStarted = function() {
  loadInProgress = true;
};

page.onLoadFinished = function() {
  loadInProgress = false;
};

var steps = [
  function() {
    console.log("Loading facebook.com...");
    page.open("http://facebook.com");
  }, function() {
    console.log("Logging in...");
    document.test = "hey"
    evaluate(page, function(fbemail, fbpass) {
      document.querySelector('input[name=email]').value = fbemail;
      document.querySelector('input[name=pass]').value = fbpass;
      document.querySelector('form').submit();
    }, fbemail, fbpass);
  }, function() {
    if (!page.evaluate(function(phantom) {
      if (document.querySelector('input[name=email]')) {
        console.log("Login failed. Check your credentials.");
        return false;
      }
      return true;
    })) { phantom.exit(); }

    console.log("Checking for pokes...");
    setInterval(function() {
      page.open("http://www.facebook.com/pokes", function(status) {
        page.evaluate(function() {
          var pokes = document.querySelector("#contentArea").querySelector('a.uiIconText');
          if (pokes != undefined && pokes != null) {
            var targets = [pokes]; //document.querySelectorAll(selector),
            var evt = document.createEvent('MouseEvents');
            var i, len;
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            for (i = 0, len = targets.length; i < len; ++i) {
              console.log("Found poke from \""+ document.querySelector('.pokeHeader a').innerHTML + "\". clicked");
              targets[i].dispatchEvent(evt);
            }
          }
        });
      });
    }, 5000);
  }
];

interval = setInterval(function() {
  if (!loadInProgress && typeof steps[testindex] == "function") {
    steps[testindex]();
    //page.render("images/step" + (testindex + 1) + ".png");
    testindex++;
  }
  if (typeof steps[testindex] != "function") {
    clearInterval(interval);
    // phantom.exit();
  }
}, 50);