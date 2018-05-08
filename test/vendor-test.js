/*
 * This is a hacked version of vendor.js for unit testing purposes which
 * - removes a number of libraries (e.g. D3, jQuery, PIXI)
 * - defines require_brunch
 */
(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require_brunch = globals.require = require;
})();

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20150312
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

// Full polyfill for browsers with no classList support
if (!("classList" in document.createElement("_"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (index !== -1) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	testElement = null;
}());

}

}


;!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.iframePhone=e():"undefined"!=typeof global?global.iframePhone=e():"undefined"!=typeof self&&(self.iframePhone=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var structuredClone = require('./structured-clone');
var HELLO_INTERVAL_LENGTH = 200;
var HELLO_TIMEOUT_LENGTH = 60000;

function IFrameEndpoint() {
  var parentOrigin;
  var listeners = {};
  var isInitialized = false;
  var connected = false;
  var postMessageQueue = [];
  var helloInterval;

  function postToTarget(message, target) {
    // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
    //     https://github.com/Modernizr/Modernizr/issues/388
    //     http://jsfiddle.net/ryanseddon/uZTgD/2/
    if (structuredClone.supported()) {
      window.parent.postMessage(message, target);
    } else {
      window.parent.postMessage(JSON.stringify(message), target);
    }
  }

  function post(type, content) {
    var message;
    // Message object can be constructed from 'type' and 'content' arguments or it can be passed
    // as the first argument.
    if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
      message = type;
    } else {
      message = {
        type: type,
        content: content
      };
    }
    if (connected) {
      postToTarget(message, parentOrigin);
    } else {
      postMessageQueue.push(message);
    }
  }

  // Only the initial 'hello' message goes permissively to a '*' target (because due to cross origin
  // restrictions we can't find out our parent's origin until they voluntarily send us a message
  // with it.)
  function postHello() {
    postToTarget({
      type: 'hello',
      origin: document.location.href.match(/(.*?\/\/.*?)\//)[1]
    }, '*');
  }

  function addListener(type, fn) {
    listeners[type] = fn;
  }

  function removeAllListeners() {
    listeners = {};
  }

  function getListenerNames() {
    return Object.keys(listeners);
  }

  function messageListener(message) {
      // Anyone can send us a message. Only pay attention to messages from parent.
      if (message.source !== window.parent) return;

      var messageData = message.data;

      if (typeof messageData === 'string') messageData = JSON.parse(messageData);

      // We don't know origin property of parent window until it tells us.
      if (!connected && messageData.type === 'hello') {
        // This is the return handshake from the embedding window.
        parentOrigin = messageData.origin;
        connected = true;
        stopPostingHello();
        while(postMessageQueue.length > 0) {
          post(postMessageQueue.shift());
        }
      }

      // Perhaps-redundantly insist on checking origin as well as source window of message.
      if (message.origin === parentOrigin) {
        if (listeners[messageData.type]) listeners[messageData.type](messageData.content);
      }
   }

   function disconnect() {
     connected = false;
     stopPostingHello();
     window.removeEventListener('message', messsageListener);
   }

  /**
    Initialize communication with the parent frame. This should not be called until the app's custom
    listeners are registered (via our 'addListener' public method) because, once we open the
    communication, the parent window may send any messages it may have queued. Messages for which
    we don't have handlers will be silently ignored.
  */
  function initialize() {
    if (isInitialized) {
      return;
    }
    isInitialized = true;
    if (window.parent === window) return;

    // We kick off communication with the parent window by sending a "hello" message. Then we wait
    // for a handshake (another "hello" message) from the parent window.
    postHello();
    startPostingHello();
    window.addEventListener('message', messageListener, false);
  }

  function startPostingHello() {
    if (helloInterval) {
      stopPostingHello();
    }
    helloInterval = window.setInterval(postHello, HELLO_INTERVAL_LENGTH);
    window.setTimeout(stopPostingHello, HELLO_TIMEOUT_LENGTH);
  }

  function stopPostingHello() {
    window.clearInterval(helloInterval);
    helloInterval = null;
  }

  // Public API.
  return {
    initialize        : initialize,
    getListenerNames  : getListenerNames,
    addListener       : addListener,
    removeAllListeners: removeAllListeners,
    disconnect        : disconnect,
    post              : post
  };
}

var instance = null;

// IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
module.exports = function getIFrameEndpoint() {
  if (!instance) {
    instance = new IFrameEndpoint();
  }
  return instance;
};
},{"./structured-clone":4}],2:[function(require,module,exports){
"use strict";

var ParentEndpoint = require('./parent-endpoint');
var getIFrameEndpoint = require('./iframe-endpoint');

// Not a real UUID as there's an RFC for that (needed for proper distributed computing).
// But in this fairly parochial situation, we just need to be fairly sure to avoid repeats.
function getPseudoUUID() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var len = chars.length;
    var ret = [];

    for (var i = 0; i < 10; i++) {
        ret.push(chars[Math.floor(Math.random() * len)]);
    }
    return ret.join('');
}

module.exports = function IframePhoneRpcEndpoint(handler, namespace, targetWindow, targetOrigin, phone) {
    var pendingCallbacks = Object.create({});

    // if it's a non-null object, rather than a function, 'handler' is really an options object
    if (handler && typeof handler === 'object') {
        namespace = handler.namespace;
        targetWindow = handler.targetWindow;
        targetOrigin = handler.targetOrigin;
        phone = handler.phone;
        handler = handler.handler;
    }

    if ( ! phone ) {
        if (targetWindow === window.parent) {
            phone = getIFrameEndpoint();
            phone.initialize();
        } else {
            phone = new ParentEndpoint(targetWindow, targetOrigin);
        }
    }

    phone.addListener(namespace, function(message) {
        var callbackObj;

        if (message.messageType === 'call' && typeof this.handler === 'function') {
            this.handler.call(undefined, message.value, function(returnValue) {
                phone.post(namespace, {
                    messageType: 'returnValue',
                    uuid: message.uuid,
                    value: returnValue
                });
            });
        } else if (message.messageType === 'returnValue') {
            callbackObj = pendingCallbacks[message.uuid];

            if (callbackObj) {
                window.clearTimeout(callbackObj.timeout);
                if (callbackObj.callback) {
                    callbackObj.callback.call(undefined, message.value);
                }
                pendingCallbacks[message.uuid] = null;
            }
        }
    }.bind(this));

    function call(message, callback) {
        var uuid = getPseudoUUID();

        pendingCallbacks[uuid] = {
            callback: callback,
            timeout: window.setTimeout(function() {
                if (callback) {
                    callback(undefined, new Error("IframePhone timed out waiting for reply"));
                }
            }, 2000)
        };

        phone.post(namespace, {
            messageType: 'call',
            uuid: uuid,
            value: message
        });
    }

    function disconnect() {
        phone.disconnect();
    }

    this.handler = handler;
    this.call = call.bind(this);
    this.disconnect = disconnect.bind(this);
};

},{"./iframe-endpoint":1,"./parent-endpoint":3}],3:[function(require,module,exports){
var structuredClone = require('./structured-clone');

/**
  Call as:
    new ParentEndpoint(targetWindow, targetOrigin, afterConnectedCallback)
      targetWindow is a WindowProxy object. (Messages will be sent to it)

      targetOrigin is the origin of the targetWindow. (Messages will be restricted to this origin)

      afterConnectedCallback is an optional callback function to be called when the connection is
        established.

  OR (less secure):
    new ParentEndpoint(targetIframe, afterConnectedCallback)

      targetIframe is a DOM object (HTMLIframeElement); messages will be sent to its contentWindow.

      afterConnectedCallback is an optional callback function

    In this latter case, targetOrigin will be inferred from the value of the src attribute of the
    provided DOM object at the time of the constructor invocation. This is less secure because the
    iframe might have been navigated to an unexpected domain before constructor invocation.

  Note that it is important to specify the expected origin of the iframe's content to safeguard
  against sending messages to an unexpected domain. This might happen if our iframe is navigated to
  a third-party URL unexpectedly. Furthermore, having a reference to Window object (as in the first
  form of the constructor) does not protect against sending a message to the wrong domain. The
  window object is actualy a WindowProxy which transparently proxies the Window object of the
  underlying iframe, so that when the iframe is navigated, the "same" WindowProxy now references a
  completely differeent Window object, possibly controlled by a hostile domain.

  See http://www.esdiscuss.org/topic/a-dom-use-case-that-can-t-be-emulated-with-direct-proxies for
  more about this weird behavior of WindowProxies (the type returned by <iframe>.contentWindow).
*/

module.exports = function ParentEndpoint(targetWindowOrIframeEl, targetOrigin, afterConnectedCallback) {
  var selfOrigin = window.location.href.match(/(.*?\/\/.*?)\//)[1];
  var postMessageQueue = [];
  var connected = false;
  var handlers = {};
  var targetWindowIsIframeElement;

  function getOrigin(iframe) {
    return iframe.src.match(/(.*?\/\/.*?)\//)[1];
  }

  function post(type, content) {
    var message;
    // Message object can be constructed from 'type' and 'content' arguments or it can be passed
    // as the first argument.
    if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
      message = type;
    } else {
      message = {
        type: type,
        content: content
      };
    }
    if (connected) {
      var tWindow = getTargetWindow();
      // if we are laready connected ... send the message
      message.origin = selfOrigin;
      // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
      //     https://github.com/Modernizr/Modernizr/issues/388
      //     http://jsfiddle.net/ryanseddon/uZTgD/2/
      if (structuredClone.supported()) {
        tWindow.postMessage(message, targetOrigin);
      } else {
        tWindow.postMessage(JSON.stringify(message), targetOrigin);
      }
    } else {
      // else queue up the messages to send after connection complete.
      postMessageQueue.push(message);
    }
  }

  function addListener(messageName, func) {
    handlers[messageName] = func;
  }

  function removeListener(messageName) {
    handlers[messageName] = null;
  }

  // Note that this function can't be used when IFrame element hasn't been added to DOM yet
  // (.contentWindow would be null). At the moment risk is purely theoretical, as the parent endpoint
  // only listens for an incoming 'hello' message and the first time we call this function
  // is in #receiveMessage handler (so iframe had to be initialized before, as it could send 'hello').
  // It would become important when we decide to refactor the way how communication is initialized.
  function getTargetWindow() {
    if (targetWindowIsIframeElement) {
      var tWindow = targetWindowOrIframeEl.contentWindow;
      if (!tWindow) {
        throw "IFrame element needs to be added to DOM before communication " +
              "can be started (.contentWindow is not available)";
      }
      return tWindow;
    }
    return targetWindowOrIframeEl;
  }

  function receiveMessage(message) {
    var messageData;
    if (message.source === getTargetWindow() && message.origin === targetOrigin) {
      messageData = message.data;
      if (typeof messageData === 'string') {
        messageData = JSON.parse(messageData);
      }
      if (handlers[messageData.type]) {
        handlers[messageData.type](messageData.content);
      } else {
        console.log("cant handle type: " + messageData.type);
      }
    }
  }

  function disconnect() {
    connected = false;
    window.removeEventListener('message', receiveMessage);
  }

  // handle the case that targetWindowOrIframeEl is actually an <iframe> rather than a Window(Proxy) object
  // Note that if it *is* a WindowProxy, this probe will throw a SecurityException, but in that case
  // we also don't need to do anything
  try {
    targetWindowIsIframeElement = targetWindowOrIframeEl.constructor === HTMLIFrameElement;
  } catch (e) {
    targetWindowIsIframeElement = false;
  }

  if (targetWindowIsIframeElement) {
    // Infer the origin ONLY if the user did not supply an explicit origin, i.e., if the second
    // argument is empty or is actually a callback (meaning it is supposed to be the
    // afterConnectionCallback)
    if (!targetOrigin || targetOrigin.constructor === Function) {
      afterConnectedCallback = targetOrigin;
      targetOrigin = getOrigin(targetWindowOrIframeEl);
    }
  }

  // when we receive 'hello':
  addListener('hello', function() {
    connected = true;

    // send hello response
    post('hello');

    // give the user a chance to do things now that we are connected
    // note that is will happen before any queued messages
    if (afterConnectedCallback && typeof afterConnectedCallback === "function") {
      afterConnectedCallback();
    }

    // Now send any messages that have been queued up ...
    while(postMessageQueue.length > 0) {
      post(postMessageQueue.shift());
    }
  });

  window.addEventListener('message', receiveMessage, false);

  // Public API.
  return {
    post: post,
    addListener: addListener,
    removeListener: removeListener,
    disconnect: disconnect,
    getTargetWindow: getTargetWindow,
    targetOrigin: targetOrigin
  };
};

},{"./structured-clone":4}],4:[function(require,module,exports){
var featureSupported = false;

(function () {
  var result = 0;

  if (!!window.postMessage) {
    try {
      // Safari 5.1 will sometimes throw an exception and sometimes won't, lolwut?
      // When it doesn't we capture the message event and check the
      // internal [[Class]] property of the message being passed through.
      // Safari will pass through DOM nodes as Null iOS safari on the other hand
      // passes it through as DOMWindow, gotcha.
      window.onmessage = function(e){
        var type = Object.prototype.toString.call(e.data);
        result = (type.indexOf("Null") != -1 || type.indexOf("DOMWindow") != -1) ? 1 : 0;
        featureSupported = {
          'structuredClones': result
        };
      };
      // Spec states you can't transmit DOM nodes and it will throw an error
      // postMessage implimentations that support cloned data will throw.
      window.postMessage(document.createElement("a"),"*");
    } catch(e) {
      // BBOS6 throws but doesn't pass through the correct exception
      // so check error message
      result = (e.DATA_CLONE_ERR || e.message == "Cannot post cyclic structures.") ? 1 : 0;
      featureSupported = {
        'structuredClones': result
      };
    }
  }
}());

exports.supported = function supported() {
  return featureSupported && featureSupported.structuredClones > 0;
};

},{}],5:[function(require,module,exports){
module.exports = {
  /**
   * Allows to communicate with an iframe.
   */
  ParentEndpoint:  require('./lib/parent-endpoint'),
  /**
   * Allows to communicate with a parent page.
   * IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
   */
  getIFrameEndpoint: require('./lib/iframe-endpoint'),
  structuredClone: require('./lib/structured-clone'),

  // TODO: May be misnamed
  IframePhoneRpcEndpoint: require('./lib/iframe-phone-rpc-endpoint')

};

},{"./lib/iframe-endpoint":1,"./lib/iframe-phone-rpc-endpoint":2,"./lib/parent-endpoint":3,"./lib/structured-clone":4}]},{},[5])
(5)
});
;
!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.LabGrapher=e():"undefined"!=typeof global?global.LabGrapher=e():"undefined"!=typeof self&&(self.LabGrapher=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){},{}],2:[function(require,module,exports){},{"./axis":1,"./i18n":3}],3:[function(require,module,exports){
var DEFAULT_LANG = 'en-US';

module.exports.translations = require('../locales/translations.json');

module.exports.lang = DEFAULT_LANG;
module.exports.fallback = DEFAULT_LANG;

module.exports.t = function(key) {
  var lang = module.exports.lang;
  return getTranslation(lang, key) ||
         getTranslation(lang.split("-")[0], key) ||
         getTranslation(lang.split("_")[0], key) ||
         getTranslation(module.exports.fallback, key) ||
         key;
};

function getTranslation(lang, key) {
  var translations = module.exports.translations;
  var keys = key.split(".");
  var t = translations[lang];
  var i = 0;
  var k = keys[i];
  while (k && typeof t === "object") {
    t = t[k];
    k = keys[++i];
  }
  return t;
}

},{"../locales/translations.json":4}],4:[function(require,module,exports){
module.exports={
  "en-US": {
    "tooltips": {
        "autoscale": "Show all data (autoscale)",
        "draw"     : "Draw new data points",
        "selection": "Select data for export",
        "legend"   : "Show/hide the legend"
    }
  },
  "pl": {
    "tooltips": {
        "autoscale": "Pokaż cały wykres (autoskalowanie)",
        "selection": "Zaznacz dane do wyeksportowania"
    }
  }
}

},{}],5:[function(require,module,exports){},{"./lib/graph":2,"./lib/i18n":3}]},{},[5])
(5)
});
;

/*** Shutterbug begin ***/
/*global $ */
(function(){
  var $ = window.$;

  var getBaseUrl = function() {
    var base = window.location.href;
    return base;
  };

  var cloneDomItem =function(elem, elemTag) {
    var width   = elem.width();
    var height  = elem.height();
    var returnElm = $(elemTag);

    returnElm.addClass($(elem).attr("class"));
    returnElm.attr("style", $(elem).attr("style"));
    returnElm.css('background', $(elem).css("background"));
    returnElm.attr('width', width);
    returnElm.attr('height', height);
    return returnElm;
  };

  var getHtmlFragment = function() {
    var $element = $(this.element);

    $element.trigger('shutterbug-saycheese');

    var css     = $('<div>').append($('link[rel="stylesheet"]').clone()).append($('style').clone()).html();
    var width   = $element.width();
    var height  = $element.height();
    var element = null;
    var html_content;

    var replacementImgs = $element.find('canvas').map( function(count,elem) {
        var dataUrl = elem.toDataURL('image/png');
        var img = cloneDomItem($(elem),"<img>");
        img.attr('src', dataUrl);
        return img;
    });

    element = $element.clone();
    element.find('canvas').each(function(i,elm) {
      var backgroundDiv = cloneDomItem($(elm),"<div>");
      // Add a backing (background) dom element for BG canvas property
      $(elm).replaceWith(replacementImgs[i]);
      backgroundDiv.insertBefore($(elm));
    });

    element.css({
      'top':0,
      'left':0,
      'margin':0,
      'width':width,
      'height':height
    });

    html_content = {
      content: $('<div>').append(element).html(),
      css: css,
      width: width,
      height: height,
      base_url: getBaseUrl()
    };

    $element.trigger('shutterbug-asyouwere');

    return html_content;
  };

  var getPng = function(html) {
    if(typeof html === 'undefined') {
      if($(this.element)[0] && $(this.element)[0].contentWindow) {
        this.requestHtmlFrag();
        return;
      }
      else {
        html = this.getHtmlFragment();
      }
    }
    var self = this;
    var time = 0;
    var counter = $("<span>");
    counter.html(time);

    $(self.imgDst).html("creating snapshot: ").append(counter);
    var timer = setInterval(function(t) {
      time = time + 1;
      counter.html(time);
    }, 1000);

    $.ajax({
      url: "CONVERT_PATH",
      type: "POST",
      data: html
    }).success(function(msg) {
      if(self.imgDst) {
        $(self.imgDst).html(msg);
      }
      if (self.callback) {
        self.callback(msg);
      }
      clearInterval(timer);
    }).fail(function(e) {
      $(self.imgDst).html("snapshot failed");
      clearInterval(timer);
    });
  };

  var requestHtmlFrag = function() {
    var destination = $(this.element)[0].contentWindow;
    var message  = {
      type: 'htmlFragRequest',
      id: this.id
    };
    destination.postMessage(JSON.stringify(message),"*");
  };

  window.Shutterbug = function(selector,imgDst,callback,id,jQuery) {
    if (typeof(jQuery) != "undefined" && jQuery != null) {
      $ = jQuery;
    }
    // If we still don't have a valid jQuery, try setting it from the global jQuery default.
    // This can happen if shutterbug.js is included before jquery.js
    if ((typeof($) == "undefined" || $ == null) && typeof(window.$) != "undefined" && window.$ != null) {
      $ = window.$;
    }

    var shutterbugInstance = {
      element: selector,
      imgDst: imgDst,
      callback: callback,
      id: id,
      getDomSnapshot: getPng,
      getPng: getPng,
      getHtmlFragment: getHtmlFragment,
      requestHtmlFrag: requestHtmlFrag
    };

    var handleMessage = function(message, signature, func) {
      var data = message.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
          if (data.type === signature) {
            func(data);
          }
        } catch(e) {
          // Not a json message. Ignore it. We only speak json.
        }
      }
    };

    var htmlFragRequestListen = function(message) {
      var send_response = function(data) {
        var response = {
          type: 'htmlFragResponse',
          value: shutterbugInstance.getHtmlFragment(),
          id:    data.id // return to sender only...
        };
        message.source.postMessage(JSON.stringify(response),"*");
      };
      handleMessage(message, 'htmlFragRequest', send_response);
    };

    var htmlFragResponseListen = function(message) {
      var send_response = function(data) {
        var html = null;
        if(data.id === shutterbugInstance.id) {
          html = data.value;
          shutterbugInstance.getPng(data.value);
        }
      };
      handleMessage(message, 'htmlFragResponse', send_response);
    };

    $(document).ready(function () {
      window.addEventListener('message', htmlFragRequestListen, false);
      window.addEventListener('message', htmlFragResponseListen, false);
    });
    return shutterbugInstance;
  };
})();
/*** Shutterbug end ***/

(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part === '..') {
          results.pop();
        } else if (part !== '.' && part !== '') {
          results.push(part);
        }
      }
      return results.join('/');
    };
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require_brunch = globals.require = require;
})();
require.register("animated-sprite", function(exports, require, module) {});

;require.register("events", function(exports, require, module) {
/*
  This is a simple helper library for dispatching custom events.
  While not strictly necessary, it also includes a polyfill for supporting
  event dispatching on browsers that don't have CustomEvent support.
*/

var Events;

module.exports = Events = (function() {
  function Events() {}

  Events.dispatchEvent = function(type, data) {
    var evt;
    if (document.dispatchEvent != null) {
      evt = new CustomEvent(type, {
        detail: data
      });
      return document.dispatchEvent(evt);
    } else {
      return console.warn("document doesn't support dispatchEvent!");
    }
  };

  Events.addEventListener = function(type, callback) {
    if (document.addEventListener != null) {
      return document.addEventListener(type, callback);
    } else {
      return console.warn("document doesn't support addEventListener!");
    }
  };

  return Events;

})();

(function() {
  var CustomEvent;
  if (!(window.CustomEvent && typeof window.CustomEvent === 'function')) {
    CustomEvent = function(type, eventInitDict) {
      var newEvent;
      newEvent = document.createEvent('CustomEvent');
      newEvent.initCustomEvent(type, !!(eventInitDict && eventInitDict.bubbles), !!(eventInitDict && eventInitDict.cancelable), (eventInitDict ? eventInitDict.detail : null));
      return newEvent;
    };
    return window.CustomEvent = CustomEvent;
  }
})();

(function() {
  var TouchEvent;
  if (window.TouchEvent == null) {
    console.log("Shimming TouchEvent...");
    return window.TouchEvent = TouchEvent = (function() {
      function TouchEvent() {}

      return TouchEvent;

    })();
  }
})();
});

/*** helpers begin ***/
;require.register("helpers", function(exports, require, module) {
var __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Array.prototype.remove = function(from, to) {
  var rest;
  rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Array.prototype.removeObj = function(obj) {
  var i;
  i = this.indexOf(obj);
  if (~i) {
    this.remove(i);
    return true;
  } else {
    return false;
  }
};

Array.prototype.replaceFirst = function(obj, replacement) {
  return this[this.indexOf(obj)] = replacement;
};

Array.prototype.shuffle = function() {
  var current, tmp, top;
  top = this.length;
  if (top) {
    while (--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = this[current];
      this[current] = this[top];
      this[top] = tmp;
    }
  }
  return this;
};

Array.prototype.randomElement = function() {
  return this[Math.floor(Math.random() * this.length)];
};

window.ExtMath = {};

ExtMath.randomInt = function(max) {
  return Math.floor(Math.random() * max);
};

ExtMath.randomFloat = function(max) {
  if (max == null) {
    max = 1;
  }
  return Math.random() * max;
};

ExtMath.randomValue = function(a, b) {
  var max, min;
  if (a <= b) {
    min = a;
    max = b;
  } else {
    min = b;
    max = a;
  }
  return min + Math.random() * (max - min);
};

ExtMath.randomGaussianIrwinHall = function(opts) {
  var i, v, _i;
  if (opts == null) {
    opts = {};
  }
  if (opts.mean == null) {
    opts.mean = 0;
  }
  if (opts.deviation == null) {
    opts.deviation = 1;
  }
  v = 0;
  for (i = _i = 1; _i <= 12; i = ++_i) {
    v += Math.random() - 0.5;
  }
  return v * opts.deviation + opts.mean;
};

ExtMath._haveNextNextGuassian = false;

ExtMath._nextNextGuassian = 0;

ExtMath.randomGaussianJava = function(opts) {
  var multiplier, s, v1, v2;
  if (opts == null) {
    opts = {};
  }
  if (ExtMath._haveNextNextGaussian) {
    ExtMath._haveNextNextGaussian = false;
    return ExtMath._nextNextGaussian;
  } else {
    s = 0;
    while (s >= 1 || s === 0) {
      v1 = 2 * Math.random() - 1;
      v2 = 2 * Math.random() - 1;
      s = v1 * v1 + v2 * v2;
    }
    multiplier = Math.sqrt(-2 * Math.log(s) / s);
    ExtMath._nextNextGaussian = v2 * multiplier;
    ExtMath._haveNextNextGaussian = true;
    return v1 * multiplier;
  }
};

ExtMath.randomGaussian = function(opts) {
  if (opts == null) {
    opts = {};
  }
  return ExtMath.randomGaussianJava(opts);
};

ExtMath.flip = function() {
  return ExtMath.randomInt(2);
};

ExtMath.HALF_PI = Math.PI / 2;

ExtMath.TWO_PI = Math.PI * 2;

ExtMath.normalizeRads = function(t) {
  return t - ExtMath.TWO_PI * Math.floor((t + Math.PI) / ExtMath.TWO_PI);
};

ExtMath.distanceSquared = function(p1, p2) {
  var dx, dy;
  dx = p1.x - p2.x;
  dy = p1.y - p2.y;
  return dx * dx + dy * dy;
};

module.exports = {
  /*
    Given an object of default values:
    defaultOptions = {
      a: "a",
      b: "b",
      c: {
        d: "d",
        e: "e"
      }
    }

    and an object of options
    options = {
      a: "A",
      c: {
        d: "D"
        f: "F"
      }
    }

    this will set defaults for any undefined values, included those
    in nested objects:

    setDefaults(options, defaultOptions) = {
      a: "A",
      b: "b",
      c: {
        d: "D",
        e: "e",
        f: "F"
      }
    }
  */

  setDefaults: function(opts, defaults) {
    var p;
    for (p in defaults) {
      if (opts[p] === void 0) {
        opts[p] = defaults[p];
      } else if (typeof opts[p] === "object") {
        opts[p] = this.setDefaults(opts[p], defaults[p]);
      }
    }
    return opts;
  },
  /*
    Deep-copy an object
  */

  clone: function(obj) {
    var cloneObj, key;
    if ((obj == null) || typeof obj !== 'object') {
      return obj;
    }
    cloneObj = new obj.constructor();
    for (key in obj) {
      cloneObj[key] = this.clone(obj[key]);
    }
    return cloneObj;
  },
  showMessage: function(message, element, callback) {
    var box, button, left, oldBox, top, width, _i, _len, _ref;
    _ref = document.getElementsByClassName("message-box");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      oldBox = _ref[_i];
      oldBox.remove();
    }
    top = element.offsetTop + 50;
    width = 280;
    left = element.offsetLeft + (element.offsetWidth / 2) - (width / 2);
    box = document.createElement('div');
    box.classList.add('message-box');
    box.setAttribute("style", "top: " + top + "px;\nleft: " + left + "px;\nwidth: " + width + "px;");
    box.innerHTML = message;
    button = document.createElement('div');
    button.classList.add('button');
    button.innerHTML = "Ok";
    button.addEventListener('click', function() {
      element.removeChild(box);
      if (callback) {
        return callback();
      }
    });
    box.appendChild(button);
    return element.appendChild(box);
  },
  stringify: function(obj) {
    var key, str;
    if ((obj == null) || typeof obj !== 'object') {
      return String(obj);
    }
    str = "{ ";
    for (key in obj) {
      str += String(key) + ": " + this.stringify(obj[key] + ", ");
    }
    return str.slice(0, str.length - 2) + " }";
  },
  preload: function(sources, callback) {
    var asset, assets, loader, numImages, source, statusContainer, statusDom, _i, _j, _len, _len1, _ref;
    statusContainer = document.createElement('div');
    statusContainer.classList.add('preload-message');
    statusDom = document.createElement('div');
    statusDom.classList.add('text');
    statusDom.innerHTML = "Loading... 0% complete.";
    statusContainer.appendChild(statusDom);
    document.body.appendChild(statusContainer);
    assets = [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      if (source.preload == null) {
        continue;
      }
      _ref = source.preload;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        asset = _ref[_j];
        assets.push(asset);
      }
    }
    numImages = null;
    loader = new PIXI.AssetLoader(assets);
    loader.onProgress = function() {
      if (!numImages) {
        numImages = loader.loadCount + 1;
      }
      return statusDom.innerHTML = "Loading... " + Math.floor((numImages - loader.loadCount) / numImages * 100) + "%";
    };
    loader.onComplete = function() {
      statusDom.innerHTML = "Loading complete!";
      return setTimeout(function() {
        callback();
        return document.body.removeChild(statusContainer);
      }, 10);
    };
    return loader.load();
  },
  mixOf: function() {
    var Mixed, base, method, mixin, mixins, name, _i, _ref, _ref1;
    base = arguments[0], mixins = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    Mixed = (function(_super) {
      __extends(Mixed, _super);

      function Mixed() {
        _ref = Mixed.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return Mixed;

    })(base);
    for (_i = mixins.length - 1; _i >= 0; _i += -1) {
      mixin = mixins[_i];
      _ref1 = mixin.prototype;
      for (name in _ref1) {
        method = _ref1[name];
        Mixed.prototype[name] = method;
      }
    }
    return Mixed;
  }
};
});
/*** helpers end ***/

/*** populations.js begin ***/
;require.register("models/agent", function(exports, require, module) {
var Agent, AgentView, defaultProperties, helpers,
  __hasProp = {}.hasOwnProperty;

AgentView = require('views/agent-view');

helpers = require('helpers');

defaultProperties = {
  'min offspring': 1,
  'max offspring': 3,
  'min offspring distance': 10,
  'max offspring distance': 40,
  'health': 1,
  'is immortal': false,
  'resource deficit': 0,
  'resource consumption rate': 1
};

/*
  The base agent class
*/


module.exports = Agent = (function() {
  Agent.prototype.label = "organism";

  Agent.prototype.bred = false;

  Agent.prototype._viewLayer = 1;

  function Agent(_arg) {
    var additionalDefaults, x, y, _ref;
    this.name = _arg.name, this.environment = _arg.environment, this.species = _arg.species, x = _arg.x, y = _arg.y, additionalDefaults = _arg.additionalDefaults;
    this._props = helpers.clone(defaultProperties);
    if (additionalDefaults != null) {
      this._props = helpers.setDefaults(this._props, additionalDefaults);
    }
    this._view = new AgentView({
      agent: this
    });
    if (((_ref = this.species) != null ? _ref.viewLayer : void 0) != null) {
      this._viewLayer = this.species.viewLayer;
    }
    if ((x != null) && (y != null)) {
      this.setLocation({
        x: x,
        y: y
      });
    }
    this.alleles = {};
    this.makeNewborn();
  }

  Agent.prototype.getView = function() {
    return this._view;
  };

  Agent.prototype.setLocation = function(_arg) {
    var x, y, _ref;
    x = _arg.x, y = _arg.y;
    if (this.environment) {
      _ref = this.environment.ensureValidLocation({
        x: x,
        y: y
      }), x = _ref.x, y = _ref.y;
    }
    this._x = x;
    return this._y = y;
  };

  Agent.prototype.getLocation = function() {
    return {
      x: this._x,
      y: this._y
    };
  };

  Agent.prototype.set = function(prop, value) {
    return this._props[prop] = value;
  };

  Agent.prototype.get = function(prop) {
    var val;
    if (this.hasProp(prop)) {
      val = this._props[prop];
    } else {
      val = this.getEnvironmentProperty(prop);
    }
    if (val == null) {
      throw new Error("Cannot find property " + prop);
    }
    return val;
  };

  Agent.prototype.hasProp = function(prop) {
    return this._props[prop] != null;
  };

  Agent.prototype.getAllProperties = function() {
    return this._props;
  };

  Agent.prototype.getEnvironmentProperty = function(prop) {
    if (this.environment == null) {
      return null;
    }
    return this.environment.getAt(this._x, this._y, prop);
  };

  Agent.prototype.setEnvironmentProperty = function(prop, val) {
    if (this.environment == null) {
      return;
    }
    return this.environment.setAt(this._x, this._y, prop, val);
  };

  Agent.prototype.getImages = function(opts) {
    if (opts == null) {
      opts = {};
    }
    return this.species.getImages(this, opts);
  };

  Agent.prototype.getSize = function() {
    var maturity;
    if (this.species.defs.MATURITY_AGE) {
      maturity = this.get('age') / this.species.defs.MATURITY_AGE;
      return Math.min(maturity, 1);
    } else {
      return 1;
    }
  };

  Agent.prototype.isDead = false;

  Agent.prototype.die = function() {
    return this.isDead = true;
  };

  Agent.prototype.step = function() {
    this._incrementAge();
    return this._checkSurvival();
  };

  Agent.prototype.makeNewborn = function() {
    return this.set('age', 0);
  };

  /*
    Creates one or more offspring, depending on the min- and max- offspring
    properties, and places them in the environment.

    Returns the array of offspring.

    Only asexual for now
  */


  Agent.prototype.reproduce = function(mate) {
    var i, maxOffspring, minOffspring, numOffspring, _i, _results;
    minOffspring = this.get('min offspring');
    maxOffspring = this.get('max offspring');
    numOffspring = minOffspring + ExtMath.randomInt(1 + maxOffspring - minOffspring);
    _results = [];
    for (i = _i = 0; 0 <= numOffspring ? _i < numOffspring : _i > numOffspring; i = 0 <= numOffspring ? ++_i : --_i) {
      _results.push(this.createOffspring(mate));
    }
    return _results;
  };

  /*
    Returns an offspring and places it in the environment
  */


  Agent.prototype.createOffspring = function(mate) {
    var offspring;
    offspring = this._breed(mate);
    offspring._mutate(offspring.organism != null);
    offspring.makeNewborn();
    offspring.resetGeneticTraits(offspring.organism == null);
    offspring.bred = true;
    if (this.environment) {
      offspring.setLocation(this._findOffspringLocation());
      this.environment.addAgent(offspring);
    }
    return offspring;
  };

  Agent.prototype.resetGeneticTraits = function(createOrganism) {
    var allele, allele_set, characteristic, desired_sex, trait, _i, _len, _ref, _ref1, _results;
    if (createOrganism == null) {
      createOrganism = true;
    }
    if (this.species.geneticSpecies != null) {
      if (createOrganism) {
        desired_sex = (this.hasProp('sex') && this.get('sex') === 'male' ? BioLogica.MALE : BioLogica.FEMALE);
        allele_set = [];
        _ref = this.alleles;
        for (trait in _ref) {
          if (!__hasProp.call(_ref, trait)) continue;
          allele = _ref[trait];
          allele_set.push(allele);
        }
        this.organism = new BioLogica.Organism(this.species.geneticSpecies, allele_set.join(), desired_sex);
      }
      _ref1 = this.species.traits;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        trait = _ref1[_i];
        if (trait.isGenetic) {
          characteristic = this.organism.getCharacteristic(trait.name);
          if (trait.isNumeric) {
            _results.push(this.set(trait.name, (trait.float ? parseFloat(characteristic) : parseInt(characteristic))));
          } else {
            _results.push(this.set(trait.name, characteristic));
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  Agent.prototype.canShowInfo = function() {
    return true;
  };

  Agent.prototype.zIndex = function(val) {
    if (val != null) {
      this._zIndex = val;
      return;
    }
    if (this._zIndex != null) {
      return this._zIndex;
    } else {
      return this._y;
    }
  };

  Agent.prototype._clone = function() {
    var allele, clone, prop, trait, _ref;
    clone = this.species.createAgent();
    for (prop in this._props) {
      clone.set(prop, this._props[prop]);
    }
    _ref = this.alleles;
    for (trait in _ref) {
      allele = _ref[trait];
      clone.alleles[trait] = allele;
    }
    return clone;
  };

  Agent.prototype._breed = function(mate) {
    var alleleStr, child, father, mother, trait, _i, _len, _ref;
    child = this._clone();
    if ((this.species.geneticSpecies != null) && (this.organism != null) && ((mate != null ? mate.organism : void 0) != null)) {
      if (this.hasProp('sex') && this.get('sex') === 'male') {
        mother = mate.organism;
        father = this.organism;
      } else {
        mother = this.organism;
        father = mate.organism;
      }
      child.organism = BioLogica.breed(mother, father, false);
      if (child.hasProp('sex')) {
        child.set('sex', child.organism.sex === BioLogica.FEMALE ? 'female' : 'male');
      }
      _ref = this.species.traits;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        trait = _ref[_i];
        if (trait.isGenetic) {
          alleleStr = child.organism.getAlleleStringForTrait(trait.name);
          child.alleles[trait.name] = alleleStr;
        }
      }
    }
    return child;
  };

  Agent.prototype._mutate = function(skipGenetic) {
    var currentVal, mutatedVal, trait, _i, _len, _ref, _results;
    if (skipGenetic == null) {
      skipGenetic = false;
    }
    _ref = this.species.traits;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      trait = _ref[_i];
      if (trait.mutatable && Math.random() < this.species.defs.CHANCE_OF_MUTATION) {
        if (trait.isGenetic) {
          if (skipGenetic) {
            continue;
          }
          currentVal = this.alleles[trait.name];
          mutatedVal = trait.mutate(currentVal);
          _results.push(this.alleles[trait.name] = mutatedVal);
        } else {
          currentVal = this.get(trait.name);
          mutatedVal = trait.mutate(currentVal);
          _results.push(this.set(trait.name, mutatedVal));
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Agent.prototype._findOffspringLocation = function() {
    var angle, distance, loc, maxD, minD, xStep, yStep;
    loc = this.getLocation();
    minD = this.get('min offspring distance');
    maxD = this.get('max offspring distance');
    distance = ExtMath.randomValue(minD, maxD);
    angle = Math.random() * 2 * Math.PI;
    xStep = Math.floor(distance * Math.sin(angle));
    yStep = Math.floor(distance * Math.cos(angle));
    return {
      x: loc.x + xStep,
      y: loc.y + yStep
    };
  };

  Agent.prototype._incrementAge = function() {
    return this.set('age', this.get('age') + 1);
  };

  Agent.prototype._consumeResources = function() {
    var consumption, currDeficit, food, underfed;
    food = this.getEnvironmentProperty('food');
    consumption = this.get('resource consumption rate');
    if (food >= consumption) {
      this.setEnvironmentProperty('food', food - consumption);
      return this.set('resource deficit', 0);
    } else {
      underfed = consumption - food;
      currDeficit = this.get('resource deficit');
      this.set('resource deficit', currDeficit + underfed);
      return this.setEnvironmentProperty('food', 0);
    }
  };

  Agent.prototype._checkSurvival = function() {
    var chance;
    chance = this.hasProp('chance of survival') ? this.get('chance of survival') : this._getSurvivalChances();
    if (Math.random() > chance) {
      return this.die();
    }
  };

  Agent.prototype._getSurvivalChances = function() {
    var age, ageMax, agePct, healthPct, hunger, hungerPct;
    if (this.get('is immortal')) {
      return 1.0;
    }
    age = this.get('age');
    ageMax = this.species.defs.MAX_AGE || 2000;
    agePct = 1 - (age / ageMax);
    hunger = this.get('resource deficit');
    hungerPct = 1 - Math.pow(hunger / 100, 2);
    healthPct = this.get('health') / this.species.defs.MAX_HEALTH;
    return agePct * hungerPct * healthPct;
  };

  return Agent;

})();
});

;require.register("models/agents/animated-agent", function(exports, require, module) {
var AnimatedAgent;

module.exports = AnimatedAgent = (function() {
  function AnimatedAgent() {}

  AnimatedAgent.MOVEMENTS = {
    STOPPED: "stop",
    MOVESTEP: "move-step"
  };

  AnimatedAgent.prototype.currentMovement = AnimatedAgent.MOVEMENTS.STOPPED;

  AnimatedAgent.prototype.setMovement = function(currentMovement) {
    this.currentMovement = currentMovement;
    return void 0;
  };

  AnimatedAgent.prototype.getMovement = function() {
    return this.currentMovement;
  };

  return AnimatedAgent;

})();
});

;require.register("models/agents/basic-animal", function(exports, require, module) {
var Agent, AgentDistance, BasicAnimal, Environment, Events, Trait, defaultProperties, helpers,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Agent = require('models/agent');

Events = require('events');

Environment = require('models/environment');

Trait = require('models/trait');

helpers = require('helpers');

defaultProperties = {
  'direction': 0,
  'speed': 1,
  'default speed': 10,
  'sex': 'female',
  'prey': [],
  'predator': [],
  'hiding place': [],
  'chance of being seen': 1.0,
  'max energy': 100,
  'energy': 100,
  'metabolism': 3,
  'vision distance': 300,
  'eating distance': 50,
  'mating distance': 50,
  'current behavior': 'wandering',
  'calculate drives': true,
  'hunger bonus': 0,
  'mating desire bonus': 0,
  'fear bonus': 0,
  'wandering threshold': 5,
  'bubble showing': 'none'
};

/*
  The base class of a simple animal
*/


module.exports = BasicAnimal = (function(_super) {
  __extends(BasicAnimal, _super);

  BasicAnimal.prototype.label = 'animal';

  BasicAnimal.prototype._viewLayer = 2;

  BasicAnimal.prototype._hasEatenOnce = false;

  BasicAnimal.prototype._timeLastMated = -20;

  BasicAnimal.BEHAVIOR = {
    EATING: 'eating',
    MATING: 'mating',
    FLEEING: 'fleeing',
    HIDING: 'hiding',
    WANDERING: 'wandering'
  };

  function BasicAnimal(args) {
    var defaults;
    if (args.additionalDefaults != null) {
      defaults = helpers.setDefaults(helpers.clone(defaultProperties), args.additionalDefaults);
    } else {
      defaults = helpers.clone(defaultProperties);
    }
    args.additionalDefaults = defaults;
    BasicAnimal.__super__.constructor.call(this, args);
  }

  BasicAnimal.prototype.makeNewborn = function() {
    BasicAnimal.__super__.makeNewborn.call(this);
    this.set('sex', (ExtMath.flip() === 0 ? 'female' : 'male'));
    this.set('energy', this.get('max energy'));
    this.set('direction', ExtMath.randomFloat(2 * Math.PI));
    return this.set('speed', this.get('default speed'));
  };

  BasicAnimal.prototype.step = function() {
    this._closestAgents = null;
    this._setSpeedAppropriateForAge();
    this._depleteEnergy();
    if (this.get('calculate drives')) {
      this.set('current behavior', this._determineBehavior());
    }
    switch (this.get('current behavior')) {
      case BasicAnimal.BEHAVIOR.EATING:
        this.eat();
        break;
      case BasicAnimal.BEHAVIOR.FLEEING:
        this.flee();
        break;
      case BasicAnimal.BEHAVIOR.MATING:
        this.mate();
        break;
      case BasicAnimal.BEHAVIOR.WANDERING:
        this.wander();
        break;
    }
    this._incrementAge();
    return this._checkSurvival();
  };

  BasicAnimal.prototype.eat = function() {
    var eatingDist, nearest;
    nearest = this._nearestPrey();
    if (nearest != null) {
      eatingDist = this.get('eating distance');
      if (nearest.distanceSq < Math.pow(eatingDist, 2)) {
        return this._eatPrey(nearest.agent);
      } else {
        return this.chase(nearest);
      }
    } else {
      return this.wander(this.get('speed') * 0.75);
    }
  };

  BasicAnimal.prototype.flee = function() {
    var hidingPlace, nearest, speed;
    nearest = this._nearestPredator();
    if (nearest != null) {
      hidingPlace = this._nearestHidingPlace();
      if (hidingPlace != null) {
        speed = this.get('speed');
        this.set('speed', speed * 6);
        this.chase(hidingPlace);
        this.set('speed', speed);
        if (hidingPlace.distanceSq < Math.pow(this.get('speed'), 2)) {
          return this.set('current behavior', BasicAnimal.BEHAVIOR.HIDING);
        }
      } else {
        return this.runFrom(nearest);
      }
    } else {
      return this.wander();
    }
  };

  BasicAnimal.prototype.mate = function() {
    var max, nearest;
    nearest = this._nearestMate();
    if (nearest != null) {
      this.chase(nearest);
      if (nearest.distanceSq < Math.pow(this.get('mating distance'), 2) && ((this.species.defs.CHANCE_OF_MATING == null) || Math.random() < this.species.defs.CHANCE_OF_MATING)) {
        max = this.get('max offspring');
        this.set('max offspring', Math.max(max / 2, 1));
        this.reproduce(nearest);
        this.set('max offspring', max);
        return this._timeLastMated = this.environment.date;
      }
    } else {
      return this.wander(this.get('speed') * Math.random() * 0.75);
    }
  };

  BasicAnimal.prototype.wander = function(speed) {
    var maxSpeed;
    if (speed == null) {
      maxSpeed = this.get('speed');
      speed = (maxSpeed / 2) + ExtMath.randomGaussian() * (maxSpeed / 6);
    }
    this.set('direction', this.get('direction') + ExtMath.randomGaussian() / 10);
    return this.move(speed);
  };

  BasicAnimal.prototype.chase = function(agentDistance) {
    var directionRelativeToMe, directionToAgent, directionToMove, speed;
    directionToAgent = this._direction(this.getLocation(), agentDistance.agent.getLocation());
    directionRelativeToMe = ExtMath.normalizeRads(directionToAgent - this.get('direction'));
    directionToMove = this.get('direction') + directionRelativeToMe / 10;
    this.set('direction', directionToMove);
    speed = Math.min(this.get('speed'), Math.sqrt(agentDistance.distanceSq));
    return this.move(speed);
  };

  BasicAnimal.prototype.runFrom = function(agentDistance) {
    var directionToMove, directionToRunTo;
    directionToRunTo = this._direction(this.getLocation(), agentDistance.agent.getLocation()) + Math.PI + (ExtMath.randomGaussian() / 3);
    directionToMove = (this.get('direction') * 19 + directionToRunTo) / 20;
    this.set('direction', directionToMove);
    return this.move(this.get('speed'));
  };

  BasicAnimal.prototype.move = function(speed) {
    var dir, dx, dy, loc, newLoc;
    dir = this.get('direction');
    if (speed === 0) {
      return;
    }
    if (typeof speed !== 'number') {
      throw new Error('invalid speed');
    }
    if (typeof dir !== 'number') {
      throw new Error('invalid direction');
    }
    loc = this.getLocation();
    dx = speed * Math.cos(dir);
    dy = speed * Math.sin(dir);
    newLoc = {
      x: loc.x + dx,
      y: loc.y + dy
    };
    if (this.environment.crossesBarrier(loc, newLoc)) {
      return this.set('direction', dir + Math.PI);
    } else {
      return this.setLocation(newLoc);
    }
  };

  BasicAnimal.prototype._direction = function(from, to) {
    var dx, dy;
    dx = to.x - from.x;
    dy = to.y - from.y;
    return ExtMath.normalizeRads(Math.atan2(dy, dx));
  };

  BasicAnimal.prototype._eatPrey = function(agent) {
    var currEnergy, food;
    food = agent.get('food');
    currEnergy = this.get('energy');
    this.set('energy', Math.min(this.get('max energy'), currEnergy + food));
    agent.die();
    this._hasEatenOnce = true;
    return Events.dispatchEvent(Environment.EVENTS.AGENT_EATEN, {
      predator: this,
      prey: agent
    });
  };

  BasicAnimal.prototype._setSpeedAppropriateForAge = function() {
    var age, speed;
    age = this.get('age');
    speed = this.get('default speed');
    if (age < 5) {
      speed = 2;
    } else if (age < 10) {
      speed = 5;
    }
    return this.set('speed', speed);
  };

  BasicAnimal.prototype._depleteEnergy = function() {
    var behavior, currEnergy, rate;
    currEnergy = this.get('energy');
    rate = this.get('metabolism');
    behavior = this.get('current behavior');
    if (behavior === BasicAnimal.BEHAVIOR.HIDING) {
      rate = rate / 2;
    }
    return this.set('energy', Math.max(0, currEnergy - rate));
  };

  BasicAnimal.prototype._hunger = function() {
    var percentEnergy, range;
    percentEnergy = this.get('energy') / this.get('max energy');
    range = 100 - this.get('hunger bonus');
    return 100 - (range * percentEnergy);
  };

  BasicAnimal.prototype._fear = function() {
    var nearest, percentCloseness, vision;
    if (!this.get('predator') instanceof String) {
      nearest = this._nearestPredator();
      if (nearest != null) {
        vision = this.get('vision distance');
        percentCloseness = (vision - Math.sqrt(nearest.distanceSq)) / vision;
        return Math.pow(10 * percentCloseness, 2);
      }
    }
    return 0;
  };

  BasicAnimal.prototype._desireToMate = function() {
    var age, matingBonus, proximityDesire, reciprocationFactor;
    age = this.get('age');
    if ((this.species.defs.MATURITY_AGE != null) && age < this.species.defs.MATURITY_AGE) {
      return 0;
    }
    if (this.get('max offspring') < 1) {
      return 0;
    }
    if (!this._hasEatenOnce) {
      return 0;
    }
    if ((this.environment.date - this._timeLastMated) < 20) {
      return 0;
    }
    proximityDesire = this._nearestMate() != null ? 30 : 15;
    reciprocationFactor = this._nearestMatingMate() != null ? 15 : 0;
    matingBonus = this.get('mating desire bonus');
    return proximityDesire + reciprocationFactor + matingBonus;
  };

  BasicAnimal.prototype._determineBehavior = function() {
    var desire, fear, hunger, max, wanderThreshold;
    hunger = this._hunger();
    fear = this._fear();
    desire = this._desireToMate();
    wanderThreshold = this.get('wandering threshold');
    if (hunger < wanderThreshold && fear < wanderThreshold && desire < wanderThreshold) {
      return BasicAnimal.BEHAVIOR.WANDERING;
    }
    max = Math.max(Math.max(hunger, fear), desire);
    if (max === fear) {
      return BasicAnimal.BEHAVIOR.FLEEING;
    } else if (max === hunger) {
      return BasicAnimal.BEHAVIOR.EATING;
    } else {
      return BasicAnimal.BEHAVIOR.MATING;
    }
  };

  BasicAnimal.prototype._nearestPredator = function() {
    var nearest, predator;
    predator = this.get('predator');
    if ((predator != null) && (predator.length != null) && predator.length > 0) {
      nearest = this._nearestAgentsMatching({
        types: predator,
        quantity: 1
      });
      return nearest[0] || null;
    }
    return null;
  };

  BasicAnimal.prototype._nearestPrey = function() {
    var nearest, prey;
    prey = this.get('prey');
    if ((prey != null) && (prey.length != null) && prey.length > 0) {
      nearest = this._nearestAgentsMatching({
        types: prey
      });
      return nearest[ExtMath.randomInt(nearest.length)];
    }
    return null;
  };

  BasicAnimal.prototype._nearestHidingPlace = function() {
    var hidingPlace, nearest;
    hidingPlace = this.get('hiding place');
    if ((hidingPlace != null) && (hidingPlace.length != null) && hidingPlace.length > 0) {
      nearest = this._nearestAgentsMatching({
        types: hidingPlace,
        quantity: 1
      });
      return nearest[0] || null;
    }
    return null;
  };

  BasicAnimal.prototype._nearestMate = function() {
    var desiredSex, nearest, trait;
    desiredSex = this.get('sex') === 'male' ? 'female' : 'male';
    trait = new Trait({
      name: 'sex',
      possibleValues: [desiredSex]
    });
    nearest = this._nearestAgentsMatching({
      types: [
        {
          name: this.species.speciesName,
          traits: [trait]
        }
      ],
      quantity: 1,
      mating: true
    });
    return nearest[0] || null;
  };

  BasicAnimal.prototype._nearestMatingMate = function() {
    var desiredSex, nearest, trait, trait2;
    desiredSex = this.get('sex') === 'male' ? 'female' : 'male';
    trait = new Trait({
      name: 'sex',
      possibleValues: [desiredSex]
    });
    trait2 = new Trait({
      name: 'current behavior',
      possibleValues: [BasicAnimal.BEHAVIOR.MATING]
    });
    nearest = this._nearestAgentsMatching({
      types: [
        {
          name: this.species.speciesName,
          traits: [trait, trait2]
        }
      ],
      quantity: 1,
      mating: true
    });
    return nearest[0] || null;
  };

  BasicAnimal.prototype._nearestAgents = function() {
    var a, closest, loc, visibleAgents, visibleArea, vision, _i, _len;
    if (this._closestAgents != null) {
      return this._closestAgents;
    }
    loc = this.getLocation();
    vision = this.get('vision distance');
    if (vision == null) {
      vision = this.get('speed') * 15;
    }
    visibleArea = {
      x: loc.x - vision,
      y: loc.y - vision,
      width: vision * 2,
      height: vision * 2
    };
    visibleAgents = this.environment.agentsWithin(visibleArea);
    closest = [];
    for (_i = 0, _len = visibleAgents.length; _i < _len; _i++) {
      a = visibleAgents[_i];
      closest.push(new AgentDistance(a, this._distanceSquared(loc, a.getLocation())));
    }
    this._closestAgents = closest.sort(function(a, b) {
      return a.distanceSq - b.distanceSq;
    });
    return this._closestAgents;
  };

  BasicAnimal.prototype._nearestAgentsMatching = function(options) {
    var agent, agentDistance, nearest, nextType, opts, returnedAgents, trait, type, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    opts = helpers.setDefaults(options, {
      camo: true,
      mating: false,
      quantity: 3,
      crossBarriers: false
    });
    if (!((opts.types != null) || typeof opts.types !== 'object' || (opts.types.length == null))) {
      throw new Error("Must pass agent types array");
    }
    nearest = this._nearestAgents();
    returnedAgents = [];
    for (_i = 0, _len = nearest.length; _i < _len; _i++) {
      agentDistance = nearest[_i];
      agent = agentDistance.agent;
      _ref = opts.types;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        type = _ref[_j];
        if (typeof type !== 'object' || (type.name == null)) {
          throw new Error("types array must be an array of objects in format {name: 'foo', traits: []}");
        }
        if (type.name !== agent.species.speciesName) {
          continue;
        }
        if (agent === this) {
          continue;
        }
        if (opts.camo && !opts.mating && agent instanceof BasicAnimal && ExtMath.randomFloat() > agent.get('chance of being seen')) {
          continue;
        }
        if (agent.hasProp('current behavior') && agent.get('current behavior') === BasicAnimal.BEHAVIOR.HIDING) {
          continue;
        }
        if (!opts.crossBarriers && this.environment.crossesBarrier(this.getLocation(), agent.getLocation())) {
          continue;
        }
        if ((type.traits != null) && type.traits.length > 0) {
          nextType = false;
          _ref1 = type.traits;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            trait = _ref1[_k];
            if (!trait.isPossibleValue(agent.get(trait.name))) {
              nextType = true;
            }
          }
          if (nextType) {
            continue;
          }
        }
        returnedAgents.push(agentDistance);
        if (returnedAgents.length >= opts.quantity) {
          return returnedAgents;
        }
      }
    }
    return returnedAgents;
  };

  BasicAnimal.prototype._distanceSquared = function(p1, p2) {
    var dx, dy;
    dx = p1.x - p2.x;
    dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  };

  BasicAnimal.prototype._getSurvivalChances = function() {
    var basicPct, energy, energyPct;
    if (this.get('is immortal')) {
      return 1.0;
    }
    basicPct = BasicAnimal.__super__._getSurvivalChances.call(this);
    energy = this.get('energy');
    energyPct = 1 - Math.pow(1 - (energy / 100), 8);
    return basicPct * energyPct;
  };

  return BasicAnimal;

})(Agent);

AgentDistance = (function() {
  function AgentDistance(agent, distanceSq) {
    this.agent = agent;
    this.distanceSq = distanceSq;
    void 0;
  }

  return AgentDistance;

})();
});

;require.register("models/agents/basic-plant", function(exports, require, module) {
var Agent, BasicPlant, defaultProperties, helpers,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Agent = require('models/agent');

helpers = require('helpers');

defaultProperties = {
  'is seed': true,
  'can seed': true,
  'has flowers': false,
  'chance of flowering': 1
};

/*
	The base class of a simple plant
*/


module.exports = BasicPlant = (function(_super) {
  __extends(BasicPlant, _super);

  BasicPlant.prototype.label = 'plant';

  BasicPlant.prototype._hasSeeded = false;

  function BasicPlant(args) {
    BasicPlant.__super__.constructor.call(this, args);
    this._props = helpers.setDefaults(this._props, defaultProperties);
  }

  BasicPlant.prototype.getSize = function() {
    var age, maturity;
    age = this.get('age');
    if (this.species.defs.SPROUT_AGE && age < this.species.defs.SPROUT_AGE) {
      return 1;
    } else if (this.species.defs.MATURITY_AGE) {
      maturity = this.get('age') / this.species.defs.MATURITY_AGE;
      return Math.min(maturity, 1);
    } else {
      return 1;
    }
  };

  BasicPlant.prototype.makeNewborn = function() {
    BasicPlant.__super__.makeNewborn.call(this);
    return this.set('has flowers', false);
  };

  BasicPlant.prototype.createSeeds = function() {
    if (this.get('num agents') > 2) {
      return;
    }
    this.reproduce();
    this._hasSeeded = true;
    return this.set('has flowers', false);
  };

  BasicPlant.prototype.step = function() {
    var age, health, season;
    age = this.get('age');
    season = this.get('season');
    if (age === 0 && season !== "spring") {
      return;
    }
    this._incrementAge();
    if (this.get('is seed')) {
      if (age < this.species.defs.SPROUT_AGE) {
        return;
      } else {
        this.set('is seed', false);
      }
    }
    if ((!this._hasSeeded) && this.species.defs.CAN_SEED) {
      if (!this.get('has flowers') && age > this.species.defs.MATURITY_AGE && ((!this.species.defs.IS_ANNUAL) || season !== "fall")) {
        if (Math.random() < this.get('chance of flowering')) {
          this.set('has flowers', true);
        }
      }
      if (this.get('has flowers')) {
        if (this.species.defs.IS_ANNUAL) {
          if (season === "fall" && Math.random() < this.species.defs.CHANCE_OF_SEEDING) {
            this.createSeeds();
          }
        } else {
          if (Math.random() < this.species.defs.CHANCE_OF_SEEDING) {
            this.createSeeds();
          }
        }
      }
    }
    if (season === 'winter' && !this.get('is immortal')) {
      health = this.get('health');
      this.set('health', health * 0.5);
    }
    return this._checkSurvival();
  };

  return BasicPlant;

})(Agent);
});

;require.register("models/agents/fast-plant", function(exports, require, module) {
var Agent, FastPlant, defaultProperties, helpers,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Agent = require('models/agent');

helpers = require('helpers');

defaultProperties = {
  'growth rate': 0.5,
  'min offspring': 1,
  'max offspring': 2,
  'max offspring distance': 150,
  'food quantity': 20
};

/*
  The base class of a simple plant
*/


module.exports = FastPlant = (function(_super) {
  __extends(FastPlant, _super);

  FastPlant.prototype.label = 'plant';

  FastPlant.prototype._hasSeeded = false;

  function FastPlant(args) {
    FastPlant.__super__.constructor.call(this, args);
    this._props = helpers.setDefaults(helpers.clone(defaultProperties), this._props);
  }

  FastPlant.prototype.getSize = function() {
    return 1;
  };

  FastPlant.prototype.makeNewborn = function() {
    this.set('age', 10);
    this.set('chance of survival', 1.0);
    return this.set('resource deficit', 0);
  };

  FastPlant.prototype.step = function() {
    var food;
    food = this.getEnvironmentProperty('food');
    if (food > 0) {
      if (ExtMath.randomFloat(1) < this.get('growth rate')) {
        this.reproduce();
      }
    }
    return this._checkSurvival();
  };

  FastPlant.prototype._checkSurvival = function() {
    var chance;
    chance = this.get('chance of survival');
    if (ExtMath.randomFloat(1) > chance) {
      return this.die();
    }
  };

  return FastPlant;

})(Agent);
});

;require.register("models/environment", function(exports, require, module) {
var AddAgentsState, Barrier, EmptyState, Environment, EnvironmentView, Events, SEASONS, StateMachine, cellDefaults, defaultOptions, helpers,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EnvironmentView = require('views/environment-view');

StateMachine = require('state-machine');

helpers = require("helpers");

Events = require('events');

SEASONS = ["spring", "summer", "fall", "winter"];

defaultOptions = {
  imgPath: "",
  winterImgPath: null,
  barriers: [],
  wrapEastWest: false,
  wrapNorthSouth: false,
  seasonLengths: [],
  depthPerception: false
};

cellDefaults = {
  'food': 100,
  'food animals': 100,
  'food full': 100,
  'food low': 30,
  'food regrowth rate': 3
};

module.exports = Environment = (function(_super) {
  __extends(Environment, _super);

  Environment.DEFAULT_RUN_LOOP_DELAY = 54.5;

  function Environment(opts) {
    var col, prop, _i, _ref;
    opts = helpers.setDefaults(opts, defaultOptions);
    for (prop in opts) {
      this[prop] = opts[prop];
    }
    this.preload = [];
    if (this.imgPath != null) {
      this.preload.push(this.imgPath);
    }
    if (this.winterImgPath) {
      this.preload.push(this.winterImgPath);
    }
    if (this.columns && this.width) {
      throw new Error("You can set columns and rows, or width and height, but not both");
    }
    if (this.columns) {
      this.width = this.columns * this._columnWidth;
      this.height = this.rows * this._rowHeight;
    }
    if (this.width) {
      if (!(this.width % this._columnWidth === 0)) {
        throw new Error("Width " + this.width + " is not evenly divisible by the column width " + this._columnWidth);
      }
      if (!(this.height % this._rowHeight === 0)) {
        throw new Error("Height " + this.height + " is not evenly divisible by the row height " + this._rowHeight);
      }
      this.columns = this.width / this._columnWidth;
      this.rows = this.height / this._rowHeight;
    }
    this.cells = [];
    for (col = _i = 0, _ref = this.columns; 0 <= _ref ? _i <= _ref : _i >= _ref; col = 0 <= _ref ? ++_i : --_i) {
      this.cells[col] = [];
    }
    this._setCellDefaults();
    this._runLoopDelay = Environment.DEFAULT_RUN_LOOP_DELAY;
    this.setBarriers(this.barriers);
    this.agents = [];
    this._rules = [];
    this.carriedAgent = null;
    this._remapSeasonLengths();
    this.season = SEASONS[0];
    this.date = 0;
    this.addState(this.UI_STATE.NONE, EmptyState);
    this.addState(this.UI_STATE.ADD_AGENTS, AddAgentsState);
    this._view = new EnvironmentView({
      environment: this
    });
    this.setState(this.UI_STATE.NONE);
  }

  /* Public API*/


  Environment.prototype.addAgent = function(agent) {
    var agents, col, loc, row;
    agent.environment = this;
    loc = this.ensureValidLocation(agent.getLocation());
    agent.setLocation(loc);
    if (this.isInBarrier(loc.x, loc.y)) {
      return false;
    }
    col = Math.floor(loc.x / this._columnWidth);
    row = Math.floor(loc.y / this._rowHeight);
    agents = this.get(col, row, "num agents");
    if (agents == null) {
      this.set(col, row, "num agents", 1);
    } else {
      this.set(col, row, "num agents", agents + 1);
    }
    if (this.agents.indexOf(agent) === -1) {
      this.agents.push(agent);
      Events.dispatchEvent(Environment.EVENTS.AGENT_ADDED, {
        agent: agent
      });
      return true;
    }
    return false;
  };

  Environment.prototype.removeAgent = function(agent) {
    var agents, col, loc, row;
    loc = agent.getLocation();
    col = Math.floor(loc.x / this._columnWidth);
    row = Math.floor(loc.y / this._rowHeight);
    agents = this.get(col, row, "num agents");
    if (agents == null) {
      this.set(col, row, "num agents", 0);
    } else {
      this.set(col, row, "num agents", agents - 1);
    }
    if (this.agents.removeObj(agent)) {
      return this.getView().removeAgent(agent);
    }
  };

  Environment.prototype.removeDeadAgents = function() {
    var a, i, _results;
    i = 0;
    _results = [];
    while (i < this.agents.length) {
      a = this.agents[i];
      if (a.isDead) {
        _results.push(this.removeAgent(a));
      } else {
        _results.push(i++);
      }
    }
    return _results;
  };

  Environment.prototype.agentsWithin = function(_arg) {
    var agent, area, found, height, loc, width, x, y, _i, _len, _ref;
    x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height;
    if (!((x != null) && (y != null) && (width != null) && (height != null))) {
      throw new Error("Invalid rectangle definition!");
    }
    area = new Barrier(x, y, width, height);
    found = [];
    _ref = this.agents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      agent = _ref[_i];
      loc = agent.getLocation();
      if (area.contains(loc.x, loc.y)) {
        found.push(agent);
      }
    }
    return found;
  };

  Environment.prototype.ensureValidLocation = function(_arg) {
    var x, y;
    x = _arg.x, y = _arg.y;
    x = this.wrapEastWest ? this._wrapSingleDimension(x, this.width) : this._bounceSingleDimension(x, this.width);
    y = this.wrapNorthSouth ? this._wrapSingleDimension(y, this.height) : this._bounceSingleDimension(y, this.height);
    return {
      x: x,
      y: y
    };
  };

  Environment.prototype.randomLocation = function() {
    return this.randomLocationWithin(0, 0, this.width, this.height);
  };

  Environment.prototype.randomLocationWithin = function(left, top, width, height, avoidBarriers) {
    var point;
    if (avoidBarriers == null) {
      avoidBarriers = false;
    }
    point = {
      x: ExtMath.randomInt(width) + left,
      y: ExtMath.randomInt(height) + top
    };
    while (avoidBarriers && this.isInBarrier(point.x, point.y)) {
      point = {
        x: ExtMath.randomInt(width) + left,
        y: ExtMath.randomInt(height) + top
      };
    }
    return point;
  };

  Environment.prototype.set = function(col, row, prop, val) {
    if (!this.cells[col][row]) {
      this.cells[col][row] = {};
    }
    return this.cells[col][row][prop] = val;
  };

  Environment.prototype.get = function(col, row, prop) {
    if (this[prop] != null) {
      return this[prop];
    }
    if (!this.cells[col][row]) {
      return null;
    }
    return this.cells[col][row][prop];
  };

  Environment.prototype.getAt = function(x, y, prop) {
    var col, row;
    col = Math.floor(x / this._columnWidth);
    row = Math.floor(y / this._rowHeight);
    return this.get(col, row, prop);
  };

  Environment.prototype.setAt = function(x, y, prop, val) {
    var col, row;
    col = Math.floor(x / this._columnWidth);
    row = Math.floor(y / this._rowHeight);
    return this.set(col, row, prop, val);
  };

  Environment.prototype.getAgentsAt = function(x, y) {
    var agent, agents, _i, _len, _ref;
    agents = [];
    _ref = this.agents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      agent = _ref[_i];
      if (agent.getView().contains(x, y)) {
        agents.push(agent);
      }
    }
    return agents;
  };

  Environment.prototype.getAgentAt = function(x, y) {
    var agent, _i, _len, _ref;
    _ref = this.agents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      agent = _ref[_i];
      if (agent.getView().contains(x, y)) {
        return agent;
      }
    }
    return null;
  };

  Environment.prototype.getAgentsCloseTo = function(x, y, maxDistance, speciesName) {
    var agent, agents, area, _agents, _i, _len;
    if (maxDistance == null) {
      maxDistance = 10;
    }
    area = {
      x: x - maxDistance,
      y: y - maxDistance,
      width: maxDistance * 2,
      height: maxDistance * 2
    };
    agents = this.agentsWithin(area);
    if (!agents.length) {
      return [];
    }
    if (speciesName) {
      _agents = [];
      for (_i = 0, _len = agents.length; _i < _len; _i++) {
        agent = agents[_i];
        if (agent.species.speciesName === speciesName) {
          _agents.push(agent);
        }
      }
      agents = _agents;
    }
    return agents;
  };

  Environment.prototype.getAgentCloseTo = function(x, y, maxDistance, speciesName) {
    var agent, agents, _i, _len;
    if (maxDistance == null) {
      maxDistance = 10;
    }
    agents = this.getAgentsCloseTo(x, y, maxDistance, speciesName);
    if (!agents.length) {
      return null;
    }
    for (_i = 0, _len = agents.length; _i < _len; _i++) {
      agent = agents[_i];
      agent.__distance = ExtMath.distanceSquared(agent.getLocation(), {
        x: x,
        y: y
      });
    }
    agents = agents.sort(function(a, b) {
      return a.__distance - b.__distance;
    });
    return agents[0];
  };

  Environment.prototype.setBarriers = function(bars) {
    var barrier, barriers, _i, _len, _ref;
    barriers = bars.slice();
    this.barriers = [];
    _ref = barriers || [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      barrier = _ref[_i];
      this.addBarrier.apply(this, barrier);
    }
    if (this._view && (this._view.barrierGraphics != null)) {
      return this._view.rerenderBarriers();
    }
  };

  Environment.prototype.addBarrier = function(x, y, width, height) {
    return this.barriers.push(new Barrier(x, y, width, height));
  };

  Environment.prototype.crossesBarrier = function(start, finish) {
    var barrier, dx, dy, line, m, _i, _len, _ref;
    if ((!this.wrapEastWest && (0 > finish.x || finish.x > this.width)) || (!this.wrapNorthSouth && (0 > finish.y || finish.y > this.height))) {
      return true;
    }
    dx = finish.x - start.x;
    dy = finish.y - start.y;
    if (dx !== 0) {
      m = dy / dx;
      line = function(x, y) {
        return m * (x - start.x) + start.y - y;
      };
    } else {
      line = function(x, y) {
        return x - start.x;
      };
    }
    _ref = this.barriers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      barrier = _ref[_i];
      if (barrier.contains(finish.x, finish.y)) {
        return true;
      }
      if ((start.x > barrier.x2 && finish.x > barrier.x2) || (start.x < barrier.x1 && finish.x < barrier.x1) || (start.y > barrier.y2 && finish.y > barrier.y2) || (start.y < barrier.y1 && finish.y < barrier.y1)) {
        continue;
      }
      if (barrier.intersectsLine(line)) {
        return true;
      }
    }
    return false;
  };

  Environment.prototype.setSeasonLength = function(season, length) {
    var idx;
    idx = -1;
    switch (season) {
      case "spring":
      case 0:
        idx = 0;
        break;
      case "summer":
      case 1:
        idx = 1;
        break;
      case "fall":
      case 2:
        idx = 2;
        break;
      case "winter":
      case 3:
        idx = 3;
        break;
      default:
        throw new Error("Invalid season '" + season + "'");
    }
    this.seasonLengths[idx] = length;
    return this._remapSeasonLengths();
  };

  Environment.prototype.isInBarrier = function(x, y) {
    var barrier, _i, _len, _ref;
    _ref = this.barriers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      barrier = _ref[_i];
      if (barrier.contains(x, y)) {
        return true;
      }
    }
    return false;
  };

  Environment.prototype.pickUpAgent = function(agent) {
    this.removeAgent(agent);
    return this.carriedAgent = agent;
  };

  Environment.prototype.dropCarriedAgent = function() {
    if (!this.addAgent(this.carriedAgent)) {
      this.carriedAgent.setLocation(this._agentOrigin);
      this.addAgent(this.carriedAgent);
    }
    this.getView().removeCarriedAgent(this.carriedAgent);
    return this.carriedAgent = null;
  };

  Environment.prototype.setDefaultAgentCreator = function(defaultSpecies, defaultTraits, agentAdderCallback) {
    this.defaultSpecies = defaultSpecies;
    this.defaultTraits = defaultTraits;
    this.agentAdderCallback = agentAdderCallback;
    return void 0;
  };

  Environment.prototype.addDefaultAgent = function(x, y) {
    var agent, success;
    if (this.defaultSpecies == null) {
      return;
    }
    agent = this.defaultSpecies.createAgent(this.defaultTraits);
    agent.environment = this;
    agent.setLocation({
      x: x,
      y: y
    });
    success = this.addAgent(agent);
    if (success && this.agentAdderCallback) {
      return this.agentAdderCallback();
    }
  };

  /* Run Loop*/


  Environment.prototype.setSpeed = function(speed) {
    var delay, fps;
    this._speed = speed;
    fps = (-1 / ((speed - 141) / 4000)) - 27.3;
    delay = 1000 / fps;
    return this._runLoopDelay = delay;
  };

  Environment.prototype.start = function() {
    var runloop,
      _this = this;
    this._isRunning = true;
    runloop = function() {
      return setTimeout(function() {
        _this.step();
        if (_this._isRunning) {
          return runloop();
        }
      }, _this._runLoopDelay);
    };
    runloop();
    return Events.dispatchEvent(Environment.EVENTS.START, {});
  };

  Environment.prototype.stop = function() {
    this._isRunning = false;
    return Events.dispatchEvent(Environment.EVENTS.STOP, {});
  };

  Environment.prototype.step = function() {
    var a, r, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    this._incrementDate();
    _ref = this._rules;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      r = _ref[_i];
      _ref1 = this.agents;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        a = _ref1[_j];
        r.execute(a);
      }
    }
    _ref2 = this.agents;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      a = _ref2[_k];
      if (a._consumeResources != null) {
        a._consumeResources();
      }
      a.step();
    }
    this._replenishResources();
    this.removeDeadAgents();
    return Events.dispatchEvent(Environment.EVENTS.STEP, {});
  };

  Environment.prototype.reset = function() {
    var i;
    this.stop();
    i = this.agents.length;
    while (i) {
      this.removeAgent(this.agents[--i]);
    }
    this.date = 0;
    return Events.dispatchEvent(Environment.EVENTS.RESET, {});
  };

  /* Default properties*/


  Environment.prototype._columnWidth = 10;

  Environment.prototype._rowHeight = 10;

  Environment.prototype._rules = null;

  Environment.prototype._speed = 50;

  Environment.prototype._runLoopDelay = 54.5;

  Environment.prototype._isRunning = false;

  /* Getters and Setters*/


  Environment.prototype.getView = function() {
    return this._view;
  };

  Environment.prototype.addRule = function(rule) {
    this._rules || (this._rules = []);
    if (this._rules.indexOf(rule) === -1) {
      return this._rules.push(rule);
    }
  };

  Environment.prototype.removeRule = function(rule) {
    this._rules || (this._rules = []);
    return this._rules.removeObj(rule);
  };

  Environment.prototype.clearRules = function() {
    return this._rules = [];
  };

  Environment.prototype.setBackground = function(path) {
    this.imgPath = path;
    return this._view.updateBackground();
  };

  Environment.prototype._incrementDate = function() {
    var i, length, yearDate, _i, _len, _ref;
    this.date++;
    if (this.usingSeasons && this._totalSeasonLengths.length === 4) {
      yearDate = this.date % this.yearLength;
      _ref = this._totalSeasonLengths;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        length = _ref[i];
        if (yearDate < length) {
          if (this.season !== SEASONS[i]) {
            this.season = SEASONS[i];
            Events.dispatchEvent(Environment.EVENTS.SEASON_CHANGED, {
              season: this.season
            });
          }
          break;
        }
      }
      if (yearDate === this._totalSeasonLengths[2]) {
        return this._view.addWinterImage();
      } else if (yearDate === this._totalSeasonLengths[3] - 1) {
        return this._view.removeWinterImage();
      }
    }
  };

  Environment.prototype._replenishResources = function() {
    var cell, food, growthRate, max, x, y, _i, _ref, _results;
    _results = [];
    for (x = _i = 0, _ref = this.columns; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (y = _j = 0, _ref1 = this.rows; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
          cell = this.cells[x][y];
          growthRate = cell['food regrowth rate'];
          max = cell['food full'];
          food = cell['food'];
          if (food < max) {
            cell['food'] = Math.min(max, food + growthRate);
          }
          food = cell['food animals'];
          if (food < max) {
            _results1.push(cell['food animals'] = Math.min(max, food + growthRate));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Environment.prototype._wrapSingleDimension = function(p, max) {
    if (p < 0) {
      p = max + p;
    } else if (p >= max) {
      p = p - max;
    }
    return p;
  };

  Environment.prototype._bounceSingleDimension = function(p, max) {
    if (p < 0) {
      p = p * -1;
    } else if (p >= max) {
      p = max - (p - max) - 1;
    }
    return p;
  };

  Environment.prototype._remapSeasonLengths = function() {
    var i, length, _i, _len, _ref;
    this._totalSeasonLengths = [];
    _ref = this.seasonLengths;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      length = _ref[i];
      this._totalSeasonLengths[i] = length + (this._totalSeasonLengths[i - 1] || 0);
    }
    this.usingSeasons = this._totalSeasonLengths.length > 0;
    return this.yearLength = this._totalSeasonLengths[3] || 0;
  };

  Environment.prototype._setCellDefaults = function() {
    var x, y, _i, _ref, _results;
    _results = [];
    for (x = _i = 0, _ref = this.columns; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (y = _j = 0, _ref1 = this.rows; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
          _results1.push(this.cells[x][y] = helpers.clone(cellDefaults));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  /* Events*/


  Environment.EVENTS = {
    START: "environment-start",
    STOP: "environment-stop",
    STEP: "environment-step",
    RESET: "environment-reset",
    AGENT_ADDED: "agent-added",
    AGENT_EATEN: "agent-eaten",
    SEASON_CHANGED: "season-changed",
    USER_REMOVED_AGENTS: 'user-removed-agents'
  };

  /* UI States*/


  Environment.prototype.UI_STATE = {
    NONE: "None",
    ADD_AGENTS: "Add Agents"
  };

  return Environment;

})(StateMachine);

Barrier = (function() {
  function Barrier(x1, y1, width, height) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = this.x1 + width;
    this.y2 = this.y1 + height;
    this.corners = [];
    this.corners.push({
      x: this.x1,
      y: this.y1
    });
    this.corners.push({
      x: this.x1,
      y: this.y2
    });
    this.corners.push({
      x: this.x2,
      y: this.y1
    });
    this.corners.push({
      x: this.x2,
      y: this.y2
    });
  }

  Barrier.prototype.contains = function(x, y) {
    return (this.x2 >= x && x >= this.x1) && (this.y2 >= y && y >= this.y1);
  };

  Barrier.prototype.intersectsLine = function(lineFunc) {
    var corner, number, previousSign, sign, _i, _len, _ref;
    previousSign = null;
    _ref = this.corners;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      corner = _ref[_i];
      number = lineFunc(corner.x, corner.y);
      if (number === 0) {
        return true;
      }
      sign = number < 0 ? -1 : 1;
      if (previousSign == null) {
        previousSign = sign;
      } else if (sign !== previousSign) {
        return true;
      }
    }
    return false;
  };

  return Barrier;

})();

/*
      *** User Interaction States ***
*/


EmptyState = {
  enter: function() {
    return this._view.setCursor("default-cursor");
  }
};

AddAgentsState = {
  enter: function() {
    return this._view.setCursor("add-agents");
  },
  click: function(evt) {
    return this.addDefaultAgent(evt.envX, evt.envY);
  }
};
});

;require.register("models/inanimate", function(exports, require, module) {
var Agent, Inanimate, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Agent = require('models/agent');

/*
  The base class of an inanimate object
*/


module.exports = Inanimate = (function(_super) {
  __extends(Inanimate, _super);

  function Inanimate() {
    _ref = Inanimate.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Inanimate.prototype.label = "inanimate";

  Inanimate.prototype._viewLayer = 0;

  Inanimate.prototype.step = function() {
    return void 0;
  };

  Inanimate.prototype._consumeResources = null;

  return Inanimate;

})(Agent);
});

;require.register("models/rule", function(exports, require, module) {
var Rule;

module.exports = Rule = (function() {
  function Rule(_arg) {
    var action, test;
    test = _arg.test, action = _arg.action;
    if (!((action != null) && typeof action === 'function')) {
      throw new Error("action is not a function!");
    }
    this._test = test;
    this._action = action;
  }

  Rule.prototype.execute = function(agent) {
    var e;
    try {
      if ((this._test == null) || this._test(agent)) {
        return this._action(agent);
      }
    } catch (_error) {
      e = _error;
      return console.log("Error executing rule!" + e);
    }
  };

  return Rule;

})();
});

;require.register("models/species", function(exports, require, module) {
var Species, defaultDefs, helpers;

helpers = require('helpers');

defaultDefs = {
  MAX_AGE: 1000,
  MAX_HEALTH: 1,
  CHANCE_OF_MUTATION: 0.2
};

module.exports = Species = (function() {
  function Species(_arg) {
    this.speciesName = _arg.speciesName, this.individualName = _arg.individualName, this.agentClass = _arg.agentClass, this.traits = _arg.traits, this.viewLayer = _arg.viewLayer, this.imageProperties = _arg.imageProperties, this.imageRules = _arg.imageRules, this.defs = _arg.defs, this.reproductiveStrategy = _arg.reproductiveStrategy, this.geneticSpecies = _arg.geneticSpecies, this.mutationChance = _arg.mutationChance;
    this.defs = helpers.setDefaults(this.defs || {}, defaultDefs);
    this._parsePreloads();
  }

  /*
    Create an agent of this species, with the traits defined in
    the species. Optionally, add a second set of trait definitions.
  */


  Species.prototype.createAgent = function(extraTraits) {
    var agent, trait, _i, _j, _len, _len1, _ref;
    if (extraTraits == null) {
      extraTraits = [];
    }
    agent = new this.agentClass({
      species: this
    });
    _ref = this.traits;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      trait = _ref[_i];
      if (trait.isGenetic) {
        agent.alleles[trait.name] = trait.getDefaultValue();
      } else {
        agent.set(trait.name, trait.getDefaultValue());
      }
    }
    for (_j = 0, _len1 = extraTraits.length; _j < _len1; _j++) {
      trait = extraTraits[_j];
      if (trait.isGenetic) {
        agent.alleles[trait.name] = trait.getDefaultValue();
      } else {
        agent.set(trait.name, trait.getDefaultValue());
      }
    }
    agent.resetGeneticTraits();
    return agent;
  };

  /*
    opts.buttonImage (default = false)
  */


  Species.prototype.getImages = function(agent, opts) {
    var imageRule, images, layer, _i, _j, _len, _len1, _ref, _ref1;
    if (opts == null) {
      opts = {};
    }
    images = [];
    _ref = this.imageRules;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      if (!this._contextMatches(opts.context, layer.contexts)) {
        continue;
      }
      layer.selectedImage = null;
      _ref1 = layer.rules;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        imageRule = _ref1[_j];
        if ((imageRule.useIf == null) || imageRule.useIf.call(this, agent)) {
          layer.selectedImage = imageRule.image;
          break;
        }
      }
      if (layer.selectedImage != null) {
        images.push(layer);
      }
    }
    return images;
  };

  Species.prototype.getTrait = function(traitName) {
    var trait, _i, _len, _ref;
    _ref = this.traits;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      trait = _ref[_i];
      if (trait.name === traitName) {
        return trait;
      }
    }
    return null;
  };

  Species.prototype.addTrait = function(trait) {
    return this.traits.push(trait);
  };

  Species.prototype.setMutatable = function(traitName, mutatable) {
    var trait;
    trait = this.getTrait(traitName);
    if (trait != null) {
      return trait.mutatable = mutatable;
    }
  };

  Species.prototype._contextMatches = function(context, validContexts) {
    if (context == null) {
      return true;
    }
    if (!((validContexts != null) && validContexts.length > 0)) {
      return true;
    }
    return validContexts.indexOf(context) !== -1;
  };

  Species.prototype._parsePreloads = function() {
    var animation, imageRule, layer, _i, _len, _ref, _results;
    this.preload = [];
    if (this.imageRules == null) {
      return;
    }
    _ref = this.imageRules;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      if (layer.rules == null) {
        continue;
      }
      _results.push((function() {
        var _j, _len1, _ref1, _ref2, _ref3, _results1;
        _ref1 = layer.rules;
        _results1 = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          imageRule = _ref1[_j];
          if (((_ref2 = imageRule.image) != null ? _ref2.path : void 0) != null) {
            this.preload.push(imageRule.image.path);
          }
          if (((_ref3 = imageRule.image) != null ? _ref3.animations : void 0) == null) {
            continue;
          }
          _results1.push((function() {
            var _k, _len2, _ref4, _results2;
            _ref4 = imageRule.image.animations;
            _results2 = [];
            for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
              animation = _ref4[_k];
              if (animation.path != null) {
                _results2.push(this.preload.push(animation.path));
              } else {
                _results2.push(void 0);
              }
            }
            return _results2;
          }).call(this));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  return Species;

})();
});

;require.register("models/trait", function(exports, require, module) {
/*
  A Trait is a property of a species, and all traits have a set of possible values.
  Each agent in a species has a specific value for each of these traits. This set
  is the agent's properties.

  For example, the species Plant might have the traits
    "health": 0-1
    "number of leaves": 0, 2, 4
    "leaf color": ["green", "red"]

  and an individual plant agent might have the properties
    "health": 0.9
    "number of leaves": 2
    "leaf color": "green"

  The Trait class defines the allowed values for each trait and has helper methods for
  picking random values and mutating a value.
*/

var Trait;

require('helpers');

module.exports = Trait = (function() {
  function Trait(_arg) {
    this.name = _arg.name, this.possibleValues = _arg.possibleValues, this.min = _arg.min, this.max = _arg.max, this["default"] = _arg["default"], this.float = _arg.float, this.mutatable = _arg.mutatable, this.isGenetic = _arg.isGenetic, this.isNumeric = _arg.isNumeric;
    void 0;
  }

  Trait.prototype.getDefaultValue = function() {
    if (this["default"] != null) {
      return this["default"];
    } else {
      return this.getRandomValue();
    }
  };

  Trait.prototype.getRandomValue = function() {
    if (this.possibleValues) {
      return this.possibleValues.randomElement();
    } else {
      if (this.float) {
        return ExtMath.randomValue(this.min, this.max);
      } else {
        return Math.floor(ExtMath.randomValue(this.min, this.max + 1));
      }
    }
  };

  Trait.prototype.mutate = function(val) {
    var newVal;
    if (!this.mutatable) {
      return val;
    }
    if (this.possibleValues && this.possibleValues.length > 1) {
      while (true) {
        newVal = this.getRandomValue();
        if (newVal !== val) {
          break;
        }
      }
      return newVal;
    } else if (this.max) {
      return this._mutateValueFromRange(val);
    } else {
      return val;
    }
  };

  Trait.prototype.isPossibleValue = function(val) {
    return this.possibleValues.indexOf(val) !== -1;
  };

  Trait.prototype.inherit = function(motherVal, fatherVal) {
    var inheritedVal;
    inheritedVal = null;
    if (!this.isGenetic) {
      if (this.possibleValues != null) {
        inheritedVal = (ExtMath.flip() === 0 ? motherVal : fatherVal);
      } else {
        if (this.float) {
          inheritedVal = ExtMath.randomValue(motherVal, fatherVal);
        } else {
          if (motherVal > fatherVal) {
            motherVal += 1;
          } else {
            fatherVal += 1;
          }
          inheritedVal = Math.floor(ExtMath.randomValue(motherVal, fatherVal));
        }
      }
    }
    return inheritedVal;
  };

  Trait.prototype._mutateValueFromRange = function(val) {
    var diff, sign;
    sign = ExtMath.flip() ? 1 : -1;
    diff = this.float ? 0.1 : 1;
    val += diff * sign;
    val = Math.max(val, this.min);
    val = Math.min(val, this.max);
    return val;
  };

  return Trait;

})();
});

;require.register("state-machine", function(exports, require, module) {
/*
  This is a simple implementation of a state machine, which allows
  transitioning to named states and delegation of events to the
  current state.
*/

var StateMachine;

module.exports = StateMachine = (function() {
  function StateMachine() {}

  StateMachine.prototype._states = null;

  /*
    Add a named state with a set of event handlers.

    e.g.
      addState "addingAgents",
        enter: ->
          console.log "We are now in 'Adding Agents' mode!"
        click: (evt) ->
          addAgentAt evt.x, evt.y
        rightClick: (evt) ->
          removeAgent evt.x, evt.y
  */


  StateMachine.prototype.addState = function(name, state) {
    if (this._states == null) {
      this._states = [];
    }
    return this._states[name] = state;
  };

  StateMachine.prototype.setState = function(currentState) {
    if (this._states[currentState] == null) {
      throw new Error("No such state: " + currentState);
    }
    this.currentState = currentState;
    if (this._states[this.currentState].enter != null) {
      return this._states[this.currentState].enter.apply(this);
    }
  };

  StateMachine.prototype.send = function(evtName, evt) {
    if (this.currentState == null) {
      throw new Error("No current state exists to handle '" + evtName + "'");
    }
    if (this._states[this.currentState][evtName] != null) {
      return this._states[this.currentState][evtName].apply(this, [evt]);
    } else if (evtName === "touchstart" && (this._states[this.currentState]['click'] != null)) {
      evt.preventDefault();
      return this._states[this.currentState]['click'].apply(this, [evt]);
    }
  };

  return StateMachine;

})();
});

;require.register("ui/add-organism-button", function(exports, require, module) {
var AddOrganismButton;

module.exports = AddOrganismButton = (function() {
  function AddOrganismButton(environment, toolbar, _arg) {
    this.environment = environment;
    this.toolbar = toolbar;
    this.species = _arg.species, this.traits = _arg.traits, this.scatter = _arg.scatter, this.limit = _arg.limit, this.imagePath = _arg.imagePath, this.showRemoveButton = _arg.showRemoveButton;
    if (!this.scatter) {
      this.toolbar.registerModalButton(this);
    }
  }

  AddOrganismButton.prototype.render = function() {
    var image,
      _this = this;
    this.button = document.createElement('div');
    this.button.classList.add('button');
    if (this.showRemoveButton) {
      this.button.classList.add('has-no-button');
    }
    this.button.addEventListener('click', function() {
      return _this.action();
    });
    if (!this.scatter) {
      this.button.classList.add('modal');
    }
    image = document.createElement('img');
    image.setAttribute('src', this.imagePath);
    this.button.appendChild(image);
    return this.button;
  };

  AddOrganismButton.prototype.getView = function() {
    return this.button;
  };

  AddOrganismButton.prototype._count = 0;

  AddOrganismButton.prototype._disabled = false;

  AddOrganismButton.prototype.disable = function() {
    this._disabled = true;
    return this.button.classList.add('disabled');
  };

  AddOrganismButton.prototype.reset = function() {
    this._count = 0;
    this._disabled = false;
    return this.button.classList.remove('disabled');
  };

  AddOrganismButton.prototype.action = function() {
    if (this._disabled) {
      return;
    }
    if (this.scatter) {
      return this.scatterOrganisms();
    } else {
      return this.enterAddOrganismsMode();
    }
  };

  AddOrganismButton.prototype.scatterOrganisms = function() {
    var agent, i, _i, _ref;
    for (i = _i = 0, _ref = this.scatter; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (this.limit && ++this._count >= this.limit) {
        this.disable();
        if (this._count > this.limit) {
          return;
        }
      }
      agent = this.species.createAgent(this.traits);
      agent.environment = this.environment;
      agent.setLocation(this.environment.randomLocation());
      while (!this.environment.addAgent(agent)) {
        agent.setLocation(this.environment.randomLocation());
      }
    }
  };

  AddOrganismButton.prototype.enterAddOrganismsMode = function() {
    var _this = this;
    this.toolbar.activateModalButton(this);
    this.environment.setDefaultAgentCreator(this.species, this.traits, function() {
      if (_this.limit && ++_this._count >= _this.limit) {
        _this.environment.setDefaultAgentCreator(null);
        _this.environment.setState(_this.environment.UI_STATE.NONE);
        return _this.disable();
      }
    });
    return this.environment.setState(this.environment.UI_STATE.ADD_AGENTS);
  };

  return AddOrganismButton;

})();
});

;require.register("ui/info-view", function(exports, require, module) {
var InfoView;

module.exports = InfoView = (function() {
  InfoView._instances = [];

  InfoView.instances = function() {
    return InfoView._instances;
  };

  function InfoView(_arg) {
    this.agent = _arg.agent;
    InfoView._instances.push(this);
  }

  InfoView.prototype.view = null;

  InfoView.prototype.setAgent = function(agent) {
    this.agent = agent;
    while (this._container.children.length > 0) {
      this._container.removeChild(this._container.children[0]);
    }
    this.agent.getView().render(this._container, 'info-tool');
    this._repositionAgent();
    this._rescaleAgent();
    if (this._details.firstChild != null) {
      this._details.replaceChild(this.agent.getView().textView(), this._details.firstChild);
    } else {
      this._details.appendChild(this.agent.getView().textView());
    }
    return this.title.innerHTML = this.agent.label.charAt(0).toUpperCase() + this.agent.label.slice(1);
  };

  InfoView.prototype._repositionAgent = function() {
    this._container.children[0].position = {
      x: 0,
      y: 0
    };
    return this._container.position = {
      x: 52,
      y: 70
    };
  };

  InfoView.prototype._rescaleAgent = function() {
    if (this.agent.species.defs.INFO_VIEW_SCALE != null) {
      this._container.scale.x = this.agent.species.defs.INFO_VIEW_SCALE;
      return this._container.scale.y = this.agent.species.defs.INFO_VIEW_SCALE;
    } else {
      this._container.scale.x = 1.25;
      return this._container.scale.y = 1.25;
    }
  };

  InfoView.prototype._redraw = function() {
    var _this = this;
    if (this._showing) {
      requestAnimFrame(function() {
        return _this._redraw();
      });
    }
    return this._renderer.render(this._stage);
  };

  InfoView.prototype.render = function() {
    var agentView, closeButton, content, titleBar,
      _this = this;
    this.view = document.createElement('div');
    this.view.classList.add('bubble');
    if (this.agent._x < this.agent.environment.width / 2) {
      this.view.classList.add('left');
    } else {
      this.view.classList.add('right');
    }
    if (this.agent._y < this.agent.environment.height / 2) {
      this.view.classList.add('top');
    } else {
      this.view.classList.add('bottom');
    }
    titleBar = document.createElement('div');
    titleBar.classList.add('title-bar');
    this.title = document.createElement('span');
    this.title.classList.add('title');
    this.title.innerHTML = this.agent.label.charAt(0).toUpperCase() + this.agent.label.slice(1);
    closeButton = document.createElement('span');
    closeButton.classList.add('close');
    closeButton.innerHTML = "<i class='fa fa-times-circle-o'></i>";
    closeButton.addEventListener('click', function() {
      return _this.hide();
    });
    content = document.createElement('div');
    content.classList.add('content');
    this._details = document.createElement('div');
    this._details.classList.add('details');
    agentView = document.createElement('div');
    agentView.classList.add('agent');
    this._stage = new PIXI.Stage(0xFFFFFF, true);
    this._renderer = new PIXI.CanvasRenderer(125, 160, {
      transparent: true
    });
    this._container = new PIXI.DisplayObjectContainer();
    this._stage.addChild(this._container);
    this.setAgent(this.agent);
    this._redraw();
    agentView.appendChild(this._renderer.view);
    titleBar.appendChild(this.title);
    titleBar.appendChild(closeButton);
    content.appendChild(agentView);
    content.appendChild(this._details);
    this.view.appendChild(titleBar);
    this.view.appendChild(content);
    return this.view;
  };

  InfoView.prototype.hide = function() {
    if (!this.view.classList.contains('hidden')) {
      this.view.classList.add('hidden');
    }
    return this._showing = false;
  };

  InfoView.prototype.show = function() {
    this.view.classList.remove('hidden');
    this._showing = true;
    return this._redraw();
  };

  InfoView.prototype.repaint = function() {
    return this._renderer.render(this._stage);
  };

  return InfoView;

})();
});

;require.register("ui/interactive", function(exports, require, module) {
var Environment, Events, InfoView, Interactive, SpeedSlider, Toolbar, defaultOptions, helpers;

helpers = require("helpers");

Toolbar = require("ui/toolbar");

InfoView = require("ui/info-view");

SpeedSlider = require("ui/speed-slider");

Events = require('events');

Environment = require('models/environment');

defaultOptions = {
  environment: null,
  playButton: true,
  resetButton: true,
  speedSlider: false,
  addOrganismButtons: [],
  toolButtons: []
};

module.exports = Interactive = (function() {
  function Interactive(options) {
    var ignoreEvent, phone,
      _this = this;
    this._opts = helpers.setDefaults(options, defaultOptions);
    this.environment = this._opts.environment;
    this.addOrganismButtons = this._opts.addOrganismButtons;
    this.toolButtons = this._opts.toolButtons;
    if (typeof Shutterbug !== "undefined" && Shutterbug !== null) {
      window.shutterbug = new Shutterbug("body");
      $(window).on('shutterbug-saycheese', function() {
        return _this.repaint();
      });
    }
    if (typeof iframePhone !== "undefined" && iframePhone !== null) {
      phone = iframePhone.getIFrameEndpoint();
      ignoreEvent = false;
      phone.addListener('stop', function() {
        ignoreEvent = true;
        _this.stop();
        return ignoreEvent = false;
      });
      phone.addListener('play', function() {
        ignoreEvent = true;
        _this.play();
        return ignoreEvent = false;
      });
      phone.addListener('reset', function() {
        ignoreEvent = true;
        _this.reset();
        return ignoreEvent = false;
      });
      Events.addEventListener(Environment.EVENTS.START, function() {
        if (!ignoreEvent) {
          return phone.post({
            type: 'play'
          });
        }
      });
      Events.addEventListener(Environment.EVENTS.STOP, function() {
        if (!ignoreEvent) {
          return phone.post({
            type: 'stop'
          });
        }
      });
      Events.addEventListener(Environment.EVENTS.RESET, function() {
        if (!ignoreEvent) {
          return phone.post({
            type: 'reset'
          });
        }
      });
      phone.initialize();
    }
  }

  Interactive.prototype.getEnvironmentPane = function() {
    var speedSlider;
    this.view = document.createElement('div');
    this.view.setAttribute("style", "height: " + this.environment.height + "px;");
    if (this._opts.speedSlider) {
      speedSlider = new SpeedSlider(this.environment);
      this.view.appendChild(speedSlider.getView());
    }
    this.view.appendChild(this.environment.getView().render());
    this.toolbar = new Toolbar(this);
    this.view.appendChild(this.toolbar.getView());
    return this.view;
  };

  Interactive.prototype.showPlayButton = function() {
    return this._opts.playButton;
  };

  Interactive.prototype.showResetButton = function() {
    return this._opts.resetButton;
  };

  Interactive.prototype.repaint = function() {
    var view, _i, _len, _ref;
    _ref = InfoView.instances();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      view.repaint();
    }
    return this.environment.getView().repaint();
  };

  Interactive.prototype.play = function() {
    if (!this.environment._isRunning) {
      return this.toolbar.toggleButtons['play'].click();
    }
  };

  Interactive.prototype.stop = function() {
    if (this.environment._isRunning) {
      return this.toolbar.toggleButtons['pause'].click();
    }
  };

  Interactive.prototype.reset = function() {
    return this.toolbar.toggleButtons['reset'].click();
  };

  return Interactive;

})();

window.onerror = function(msg, url, line) {
  var message;
  message = "<div>There was an error in the model!<br/><pre>" + msg + "</pre></div>";
  message += "<div>source: " + url + ", line: " + line + "</div>";
  return helpers.showMessage(message, document.body);
};
});

;require.register("ui/ppslider", function(exports, require, module) {

var PPSliderClass;
(function ($) {

  PPSliderClass = function (el, opts) {
    var startMouse, lastElemPos;

    if (typeof($) == 'undefined' || $ == null) {
      console.warn('jQuery not loaded! PPSlider is not supported');
      return;
    }
    var element = $(el);
    var options = opts;
    var isMouseDown = false;
    var currentVal = 0;

    element.wrap('<div/>')
    var container = $(el).parent();

    container.addClass('pp-slider');
    if (opts.vertical) {
      container.addClass('vertical');
    }
    container.addClass('clearfix');
    var minLabel = '<div class="pp-slider-min">' + opts.minLabel + '</div>';
    var maxLabel = '<div class="pp-slider-max">' + opts.maxLabel + '</div>';
    var content = '';
    if (opts.vertical) {
      content  += maxLabel;
    } else {
      content  += minLabel;
    }
    content    += '<div class="pp-slider-scale">';
    content    += '<div class="pp-slider-button';
    if (options.moveable) {
      content  += ' moveable';
    }
    content    += '"><div class="pp-slider-divies"></div></div>';
    content    += '<div class="pp-slider-tooltip"></div>';
    content    += '</div>';
    if (opts.vertical) {
      content  += minLabel;
    } else {
      content  += maxLabel;
    }
    container.append(content);

    if (typeof(options) != 'undefined' && typeof(options.hideTooltip) != 'undefined' && options.hideTooltip == true)
    {
      container.find('.pp-slider-tooltip').hide();
      container.addClass('noTooltip');
    }

    if (typeof(options.width) != 'undefined')
    {
      container.css('width',(options.width+'px'));
    }
    if (typeof(options.height) != 'undefined')
    {
      container.css('height',(options.height+'px'));
    }
    if (opts.vertical) {
      container.find('.pp-slider-scale').css('height',(container.height()-30)+'px');
    } else {
      container.find('.pp-slider-scale').css('width',(container.width()-30)+'px');
    }

    var startSlide = function (e) {
      if (!options.moveable) {
        return true;
      }
      if (e.originalEvent && e.originalEvent instanceof TouchEvent) {
        e.preventDefault();
      }
      isMouseDown = true;
      var pos = getMousePosition(e);
      if (options.vertical) {
        startMouse = pos.y;
        lastElemPos = ($(this).offset().top - $(this).parent().offset().top);
      } else {
        startMouse = pos.x;
        lastElemPos = ($(this).offset().left - $(this).parent().offset().left);
      }

      updatePosition(e);

      return false;
    };

    var getMousePosition = function (e) {
      var posx = 0;
      var posy = 0;

      if (!e) var e = window.event;

      if (e.originalEvent && e.originalEvent  instanceof TouchEvent) {
        posx = e.originalEvent.changedTouches[0].pageX;
        posy = e.originalEvent.changedTouches[0].pageY;
      }
      else if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
      }
      else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop  + document.documentElement.scrollTop;
      }

      return { 'x': posx, 'y': posy };
    };

    var positionSlider = function(newPos, currentVal) {
      if (options.vertical) {
        container.find('.pp-slider-button').css("top", newPos);
        container.find('.pp-slider-tooltip').html(currentVal+'%');
        container.find('.pp-slider-tooltip').css('top', newPos-6);
      } else {
        container.find('.pp-slider-button').css("left", newPos);
        container.find('.pp-slider-tooltip').html(currentVal+'%');
        container.find('.pp-slider-tooltip').css('left', newPos-6);
      }
    };

    var updatePosition = function (e) {
      var pos = getMousePosition(e);
      var newPos, upperBound;
      if (options.vertical) {
        var spanY = (pos.y - startMouse);
        newPos = (lastElemPos + spanY)
        upperBound = (container.find('.pp-slider-scale').height()-container.find('.pp-slider-button').height());
      } else {
        var spanX = (pos.x - startMouse);
        newPos = (lastElemPos + spanX)
        upperBound = (container.find('.pp-slider-scale').width()-container.find('.pp-slider-button').width());
      }
      newPos = Math.max(0,newPos);
      newPos = Math.min(newPos,upperBound);
      currentVal = Math.round((newPos/upperBound)*100,0);
      if (options.vertical) {
        // inverted when vertical
        currentVal = 100 - currentVal;
      }

      positionSlider(newPos, currentVal);
    };

    var updatePositionByValue = function (val) {
      currentVal = val;
      var upperBound, newPos;
      if (options.vertical) {
        upperBound = (container.find('.pp-slider-scale').height()-container.find('.pp-slider-button').height());
        newPos = ((100-val)/100)*upperBound;
      } else {
        upperBound = (container.find('.pp-slider-scale').width()-container.find('.pp-slider-button').width());
        newPos = (val/100)*upperBound;
      }

      positionSlider(newPos, val);
    };

    var moving = function (e) {
      if(isMouseDown){
        if (e.originalEvent && e.originalEvent instanceof TouchEvent) {
          e.preventDefault();
        }
        updatePosition(e);
        return false;
      }
    };

    var dropCallback = function (e) {
      if (isMouseDown) {
        if (e.originalEvent && e.originalEvent instanceof TouchEvent) {
          e.preventDefault();
        }
        isMouseDown = false;
        element.val(currentVal);
        element.trigger("change");
      }

    };

    updatePositionByValue(element.val());

    container.find('.pp-slider-button').bind('mousedown',startSlide);
    container.find('.pp-slider-button').bind('touchstart',startSlide);

    $(document).mousemove(function(e) { moving(e); });
    $(document).on('touchmove', function(e) { moving(e); });

    $(document).mouseup(function(e){ dropCallback(e); });
    $(document).on('touchend', function(e){ dropCallback(e); });

    return {
      updatePositionByValue: updatePositionByValue
    }

  };

  /*******************************************************************************************************/

  if (typeof($) == 'undefined' || $ == null) {
    console.warn('jQuery not loaded! PPSlider is not supported');
    return;
  }

  $.fn.PPSlider = function (options) {
    var opts = $.extend({}, $.fn.PPSlider.defaults, options);

    var ret;
    this.each(function () {
        ret = new PPSliderClass($(this), opts);
    });
    return ret;
  }

  $.fn.PPSlider.defaults = {
    minLabel: '-',
    maxLabel: '+',
    moveable: true,
    vertical: false,
    hideTooltip: true
  };


})(jQuery);
;
module.exports = PPSliderClass;
});

;require.register("ui/remove-organism-button", function(exports, require, module) {
var Environment, Events, RemoveOrganismButton;

Events = require('events');

Environment = require('models/environment');

module.exports = RemoveOrganismButton = (function() {
  function RemoveOrganismButton(environment, toolbar, _arg) {
    this.environment = environment;
    this.toolbar = toolbar;
    this.species = _arg.species, this.imagePath = _arg.imagePath;
    void 0;
  }

  RemoveOrganismButton.prototype.render = function() {
    var image, noImage,
      _this = this;
    this.button = document.createElement('div');
    this.button.classList.add('button');
    this.button.classList.add('no-button');
    this.button.addEventListener('click', function() {
      return _this.action();
    });
    image = document.createElement('img');
    image.setAttribute('src', this.imagePath);
    this.button.appendChild(image);
    noImage = document.createElement('div');
    noImage.classList.add('no-sign');
    this.button.appendChild(noImage);
    return this.button;
  };

  RemoveOrganismButton.prototype.getView = function() {
    return this.button;
  };

  RemoveOrganismButton.prototype._disabled = false;

  RemoveOrganismButton.prototype.disable = function() {
    this._disabled = true;
    return this.button.classList.add('disabled');
  };

  RemoveOrganismButton.prototype.reset = function() {
    this._disabled = false;
    return this.button.classList.remove('disabled');
  };

  RemoveOrganismButton.prototype.action = function() {
    if (this._disabled) {
      return;
    }
    this.removeOrganisms();
    return Events.dispatchEvent(Environment.EVENTS.USER_REMOVED_AGENTS, {
      species: this.species
    });
  };

  RemoveOrganismButton.prototype.removeOrganisms = function() {
    var agent, _i, _len, _ref;
    _ref = this.environment.agents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      agent = _ref[_i];
      if (agent.species === this.species) {
        agent.die();
      }
    }
    return this.environment.removeDeadAgents();
  };

  return RemoveOrganismButton;

})();
});

;require.register("ui/speed-slider", function(exports, require, module) {
var PPSlider, SpeedSlider;

PPSlider = require('ui/ppslider');

module.exports = SpeedSlider = (function() {
  function SpeedSlider(env) {
    var input;
    this.view = document.createElement('div');
    this.view.setAttribute("style", "height: 20px;");
    input = document.createElement('input');
    input.setAttribute("id", "speed-slider");
    input.setAttribute("type", 'hidden');
    input.setAttribute("value", 50);
    this.view.appendChild(input);
    $(document).ready(function() {
      $(input).change(function() {
        return env.setSpeed(parseInt($(this).val()));
      });
      return $(input).PPSlider({
        width: env.width
      });
    });
  }

  SpeedSlider.prototype.getView = function() {
    return this.view;
  };

  return SpeedSlider;

})();
});

;require.register("ui/tool-button", function(exports, require, module) {
var InfoView, ToolButton;

InfoView = require('ui/info-view');

module.exports = ToolButton = (function() {
  ToolButton.INFO_TOOL = 'info-tool';

  ToolButton.CARRY_TOOL = 'carry-tool';

  ToolButton.prototype.state = null;

  function ToolButton(environment, toolbar, _arg) {
    this.environment = environment;
    this.toolbar = toolbar;
    this.type = _arg.type;
    this.toolbar.registerModalButton(this);
    this.state = this._getState();
    this.environment.addState(this.type, this.state);
  }

  ToolButton.prototype.render = function() {
    var image,
      _this = this;
    this.button = document.createElement('div');
    this.button.classList.add('button');
    this.button.addEventListener('click', function() {
      return _this.action();
    });
    this.button.classList.add('modal');
    image = document.createElement('div');
    image.classList.add(this.type);
    this.button.appendChild(image);
    return this.button;
  };

  ToolButton.prototype.getView = function() {
    return this.button;
  };

  ToolButton.prototype.action = function() {
    this.toolbar.activateModalButton(this);
    return this.environment.setState(this.type);
  };

  ToolButton.prototype._getState = function() {
    return this._states[this.type];
  };

  ToolButton.prototype._states = {
    'info-tool': {
      enter: function() {
        return this._view.setCursor("info-tool");
      },
      click: function(evt) {
        var agent, agents, style, _i, _len, _ref;
        agents = this.getAgentsAt(evt.envX, evt.envY).filter(function(a) {
          return a.canShowInfo();
        });
        if (!(agents.length > 0)) {
          return;
        }
        agent = agents[0];
        if (this.infoPopup != null) {
          this.infoPopup.setAgent(agent);
        } else {
          this.infoPopup = new InfoView({
            agent: agent
          });
          document.getElementById('environment').appendChild(this.infoPopup.render());
        }
        _ref = ['top', 'left', 'bottom', 'right'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          style = _ref[_i];
          this.infoPopup.view.classList.remove(style);
        }
        if (evt.envX > this.width / 2) {
          this.infoPopup.view.classList.add('right');
          this.infoPopup.view.style.left = (evt.envX - 225) + "px";
        } else {
          this.infoPopup.view.classList.add('left');
          this.infoPopup.view.style.left = (evt.envX + 35) + "px";
        }
        if (evt.envY > this.height / 2) {
          this.infoPopup.view.classList.add('bottom');
          this.infoPopup.view.style.top = (evt.envY - 162) + "px";
        } else {
          this.infoPopup.view.classList.add('top');
          this.infoPopup.view.style.top = (evt.envY - 25) + "px";
        }
        return this.infoPopup.show();
      }
    },
    'carry-tool': {
      _agent: null,
      _origin: null,
      _agentOrigin: null,
      enter: function() {
        return this._view.setCursor("carry-tool");
      },
      mousedown: function(evt) {
        var agent;
        agent = this.getAgentAt(evt.envX, evt.envY);
        if (agent == null) {
          return;
        }
        this.pickUpAgent(agent);
        this._agent = agent;
        this._origin = {
          x: evt.envX,
          y: evt.envY
        };
        return this._agentOrigin = agent.getLocation();
      },
      mousemove: function(evt) {
        var dX, dY;
        if (this._agent == null) {
          return;
        }
        dX = evt.envX - this._origin.x;
        dY = evt.envY - this._origin.y;
        return this._agent.setLocation({
          x: this._agentOrigin.x + dX,
          y: this._agentOrigin.y + dY
        });
      },
      mouseup: function(evt) {
        if (this._agent == null) {
          return;
        }
        this.dropCarriedAgent();
        return this._agent = null;
      },
      touchstart: function(evt) {
        evt.preventDefault();
        return this.send('mousedown', evt);
      },
      touchmove: function(evt) {
        evt.preventDefault();
        return this.send('mousemove', evt);
      },
      touchend: function(evt) {
        evt.preventDefault();
        return this.send('mouseup', evt);
      }
    }
  };

  return ToolButton;

})();
});

;require.register("ui/toolbar", function(exports, require, module) {
var AddOrganismButton, Environment, Events, RemoveOrganismButton, ToolButton, Toolbar;

AddOrganismButton = require("ui/add-organism-button");

RemoveOrganismButton = require("ui/remove-organism-button");

ToolButton = require('ui/tool-button');

Events = require('events');

Environment = require('models/environment');

module.exports = Toolbar = (function() {
  function Toolbar(interactive) {
    var button, env, opts, removeButton, _i, _j, _len, _len1, _ref, _ref1,
      _this = this;
    this.interactive = interactive;
    env = this.interactive.environment;
    this.modalButtons = [];
    this.toggleButtons = [];
    this.organismButtons = [];
    this.view = document.createElement('div');
    this.view.classList.add("toolbar");
    this.view.setAttribute("style", "height: " + env.height + "px;");
    if (this.interactive.showPlayButton()) {
      this.addToggleButton("play", (function() {
        return env.start();
      }), "pause", (function() {
        return env.stop();
      }));
      Events.addEventListener(Environment.EVENTS.PLAY, function() {
        _this.toggleButtons['play'].style.display = "none";
        return _this.toggleButtons['pause'].style.display = "";
      });
      Events.addEventListener(Environment.EVENTS.STOP, function() {
        _this.toggleButtons['play'].style.display = "";
        return _this.toggleButtons['pause'].style.display = "none";
      });
    }
    _ref = this.interactive.addOrganismButtons;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      opts = _ref[_i];
      button = new AddOrganismButton(env, this, opts);
      this.view.appendChild(button.render());
      this.organismButtons.push(button);
      if (opts.showRemoveButton) {
        removeButton = new RemoveOrganismButton(env, this, opts);
        this.view.appendChild(removeButton.render());
        this.organismButtons.push(removeButton);
      }
    }
    _ref1 = this.interactive.toolButtons;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      opts = _ref1[_j];
      button = new ToolButton(env, this, opts);
      this.view.appendChild(button.render());
    }
    if (this.interactive.showResetButton()) {
      this.addButton("reset", function() {
        _this.reset();
        return env.reset();
      });
    }
  }

  Toolbar.prototype.addButton = function(type, action) {
    var button, innerButton;
    button = document.createElement('div');
    button.classList.add('button');
    innerButton = document.createElement('div');
    innerButton.classList.add(type);
    button.appendChild(innerButton);
    button.addEventListener('click', action);
    this.toggleButtons[type] = button;
    return this.view.appendChild(button);
  };

  Toolbar.prototype.addToggleButton = function(type1, action1, type2, action2) {
    var button1, button2;
    button1 = this.addButton(type1, action1);
    button2 = this.addButton(type2, action2);
    button2.style.display = "none";
    button1.addEventListener('click', function() {
      button1.style.display = "none";
      return button2.style.display = "";
    });
    return button2.addEventListener('click', function() {
      button1.style.display = "";
      return button2.style.display = "none";
    });
  };

  Toolbar.prototype.registerModalButton = function(btn) {
    return this.modalButtons.push(btn);
  };

  Toolbar.prototype.activateModalButton = function(btn) {
    var button, _i, _len, _ref, _results;
    btn.getView().classList.add('modal-active');
    _ref = this.modalButtons;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      button = _ref[_i];
      if (button !== btn) {
        _results.push(button.getView().classList.remove('modal-active'));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Toolbar.prototype.reset = function() {
    var button, env, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.modalButtons;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      button = _ref[_i];
      button.getView().classList.remove('modal-active');
    }
    _ref1 = this.organismButtons;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      button = _ref1[_j];
      button.reset();
    }
    env = this.interactive.environment;
    return env.setState(env.UI_STATE.NONE);
  };

  Toolbar.prototype.getView = function() {
    return this.view;
  };

  return Toolbar;

})();
});

;require.register("views/agent-view", function(exports, require, module) {
var AgentView, AnimatedAgent, helpers,
  __hasProp = {}.hasOwnProperty;

require('animated-sprite');

helpers = require('helpers');

AnimatedAgent = require('models/agents/animated-agent');

module.exports = AgentView = (function() {
  function AgentView(_arg) {
    var _ref;
    this.agent = _arg.agent;
    this.imageProperties = ((_ref = this.agent.species) != null ? _ref.imageProperties : void 0) || {};
  }

  AgentView.prototype._images = null;

  AgentView.prototype._sprites = null;

  AgentView.prototype._container = null;

  AgentView.prototype.render = function(stage, context) {
    var container, images, layer, sprite, sprites, _i, _len;
    if (context == null) {
      context = 'environment';
    }
    container = new PIXI.DisplayObjectContainer;
    sprites = {};
    images = this.agent.getImages({
      context: context
    });
    for (_i = 0, _len = images.length; _i < _len; _i++) {
      layer = images[_i];
      sprite = this._createOrUpdateSprite(layer.selectedImage);
      sprites[layer.name] = sprite;
      container.addChild(sprite);
    }
    container.position.x = this.agent._x;
    container.position.y = this.agent._y;
    container.agent = this.agent;
    stage.addChild(container);
    if (context === 'environment' || context === 'carry-tool') {
      this._rendered = true;
      this._container = container;
      this._sprites = sprites;
      return this._images = images;
    }
  };

  AgentView.prototype.rerender = function(stage, context) {
    var animation, currentMovement, i, layer, name, names, newImages, sequence, sprite, _animation, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    if (context == null) {
      context = 'environment';
    }
    if (!this._rendered) {
      this.render(stage, context);
      return;
    }
    newImages = this.agent.getImages({
      context: context
    });
    names = [];
    for (i = _i = 0, _len = newImages.length; _i < _len; i = ++_i) {
      layer = newImages[i];
      names.push(layer.name);
      if (this._sprites[layer.name] == null) {
        sprite = this._createOrUpdateSprite(layer.selectedImage);
        this._sprites[layer.name] = sprite;
        this._container.addChildAt(sprite, i);
      } else if ((layer.selectedImage.path != null) && layer.selectedImage.path !== this._sprites[layer.name].texture.baseTexture.source.src) {
        this._createOrUpdateSprite(layer.selectedImage, this._sprites[layer.name]);
      } else if (this._sprites[layer.name] instanceof PIXI.AnimatedSprite) {
        currentMovement = this.agent.getMovement();
        _ref = layer.selectedImage.animations;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          _animation = _ref[_j];
          if (_animation.movement === currentMovement) {
            animation = _animation;
          }
        }
        if (animation && animation.path !== this._sprites[layer.name].sequences[animation.movement].path) {
          sprite = this._sprites[layer.name];
          this._createOrUpdateSprite(layer.selectedImage, sprite);
        } else {
          this._setSpriteProperties(this._sprites[layer.name], layer.selectedImage);
        }
      } else {
        this._setSpriteProperties(this._sprites[layer.name], layer.selectedImage);
      }
    }
    _ref1 = this._sprites;
    for (name in _ref1) {
      if (!__hasProp.call(_ref1, name)) continue;
      sprite = _ref1[name];
      if (names.indexOf(name) === -1) {
        this._container.removeChild(sprite);
        delete this._sprites[name];
      }
    }
    this._container.position.x = this.agent._x;
    this._container.position.y = this.agent._y;
    for (i = _k = 0, _len2 = newImages.length; _k < _len2; i = ++_k) {
      layer = newImages[i];
      if (((sprite = this._sprites[layer.name]) != null) && sprite instanceof PIXI.AnimatedSprite) {
        sequence = this.agent.environment._isRunning ? this.agent.getMovement() : AnimatedAgent.MOVEMENTS.STOPPED;
        if (!(sequence && (sprite.sequences[sequence] != null))) {
          return;
        }
        if (sequence !== sprite.currentSequence) {
          if (!sprite.playing) {
            sprite.gotoAndPlay(sequence);
          } else {
            if ((_ref2 = sprite.sequences[sprite.currentSequence]) != null ? _ref2.interruptible : void 0) {
              sprite.gotoAndPlay(sequence);
            } else {
              sprite.nextSequence = sequence;
            }
          }
        }
        sprite.advanceTime();
      }
    }
  };

  AgentView.prototype.remove = function(stage) {
    var e;
    try {
      if (this._rendered) {
        if (stage != null) {
          stage.removeChild(this._container);
        }
      }
    } catch (_error) {
      e = _error;
      console.error("Tried to remove an agent from a stage it wasn't rendered within.");
    }
    return this._rendered = false;
  };

  AgentView.prototype.contains = function(x, y) {
    var intManager;
    intManager = new PIXI.InteractionManager();
    return intManager.hitTest(this._container, {
      global: {
        x: x,
        y: y
      }
    });
  };

  AgentView.prototype.defaultTextViewOptions = {
    leaves: true,
    roots: true
  };

  AgentView.prototype.textView = function(options) {
    var content, k, opts, v, _ref;
    if (options == null) {
      options = {};
    }
    opts = helpers.setDefaults(options, this.defaultTextViewOptions);
    content = document.createElement('div');
    if (this.agent.species.defs.INFO_VIEW_PROPERTIES != null) {
      _ref = this.agent.species.defs.INFO_VIEW_PROPERTIES;
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        v = _ref[k];
        this._appendPropVals(content, k, v);
      }
    }
    return content;
  };

  AgentView.prototype._appendPropVals = function(container, propLabel, propKey) {
    var prop, val;
    prop = document.createElement('div');
    prop.classList.add('agent-property');
    prop.innerHTML = propLabel;
    val = document.createElement('div');
    val.classList.add('agent-property-value');
    val.innerHTML = this.agent.get(propKey);
    container.appendChild(prop);
    container.appendChild(val);
    return container;
  };

  AgentView.prototype._createOrUpdateSprite = function(image, sprite) {
    var graphics, setupAnimatedSprite, texture,
      _this = this;
    if (!image.animations) {
      if (image.path) {
        texture = PIXI.Texture.fromImage(image.path);
      } else if (image.render) {
        graphics = new PIXI.Graphics();
        image.render(graphics);
        texture = graphics.generateTexture();
      }
      if (!sprite) {
        sprite = new PIXI.Sprite(texture);
      } else {
        sprite.setTexture(texture);
      }
      this._setSpriteProperties(sprite, image);
    } else {
      setupAnimatedSprite = function(image, sprite) {
        var animation, i, sequences, spriteTextures, _i, _j, _len, _ref, _ref1;
        _ref = image.animations;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          animation = _ref[_i];
          spriteTextures = [];
          for (i = _j = 0, _ref1 = animation.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            spriteTextures.push(PIXI.Texture.fromFrame(animation.animationName + "-" + i));
          }
          if (!sprite) {
            sequences = {};
            sequences[animation.movement] = {
              frames: spriteTextures
            };
            if (animation.frameRate) {
              sequences[animation.movement].frameRate = animation.frameRate;
            }
            if (animation.loop) {
              sequences[animation.movement].loop = animation.loop;
            }
            if (animation.onComplete) {
              sequences[animation.movement].onComplete = animation.onComplete;
            }
            sequences[animation.movement].interruptible = animation.interruptible;
            sequences[animation.movement].path = animation.path;
            sprite = new PIXI.AnimatedSprite(sequences);
          } else {
            sprite.sequences[animation.movement] = {
              frames: spriteTextures
            };
            if (animation.frameRate) {
              sprite.sequences[animation.movement].frameRate = animation.frameRate;
            }
            if (animation.loop) {
              sprite.sequences[animation.movement].loop = animation.loop;
            }
            if (animation.onComplete) {
              sprite.sequences[animation.movement].onComplete = animation.onComplete;
            }
            sprite.sequences[animation.movement].interruptible = animation.interruptible;
            sprite.sequences[animation.movement].path = animation.path;
          }
        }
        sprite.nextSequence = null;
        sprite.onComplete = function(sequence) {
          var func;
          if (func = sprite.sequences[sprite.currentSequence].onComplete) {
            _this.agent[func]();
          }
          if (sprite.nextSequence) {
            sprite.gotoAndPlay(sprite.nextSequence);
            sprite.nextSequence = null;
          } else {
            if (!sprite.sequences[sequence].loop) {
              sprite.currentSequence = null;
            }
          }
          if (sprite.nextImage != null) {
            setupAnimatedSprite(image, sprite);
            return sprite.nextImage = null;
          }
        };
        _this._setSpriteProperties(sprite, image);
        return sprite;
      };
      if (sprite && sprite.playing) {
        sprite.nextImage = image;
      } else {
        sprite = setupAnimatedSprite(image, sprite);
      }
    }
    return sprite;
  };

  AgentView.prototype._setSpriteProperties = function(sprite, image) {
    var d, dd, initialDirection, scale, _ref, _ref1, _ref2, _ref3;
    scale = image.scale || 1;
    scale *= this.agent.getSize();
    sprite.scale.x = scale;
    sprite.scale.y = scale;
    if (this.imageProperties.initialFlipDirection) {
      d = ExtMath.normalizeRads(this.agent.get('direction'));
      switch (this.imageProperties.initialFlipDirection) {
        case "left":
          if ((-ExtMath.HALF_PI < d && d < ExtMath.HALF_PI)) {
            sprite.scale.x *= -1;
          }
          break;
        case "right":
          if (-ExtMath.HALF_PI > d || d > ExtMath.HALF_PI) {
            sprite.scale.x *= -1;
          }
          break;
        case "up":
          if ((0 < d && d < Math.PI)) {
            sprite.scale.y *= -1;
          }
          break;
        case "down":
          if ((-Math.PI < d && d < 0)) {
            sprite.scale.y *= -1;
          }
      }
    }
    if (this.imageProperties.rotate) {
      initialDirection = this.imageProperties.initialRotationDirection || 0;
      d = ExtMath.normalizeRads(this.agent.get('direction'));
      dd = d - initialDirection;
      sprite.rotation = dd;
    }
    sprite.anchor.x = ((_ref = image.anchor) != null ? _ref.x : void 0) != null ? image.anchor.x : 0.5;
    sprite.anchor.y = ((_ref1 = image.anchor) != null ? _ref1.y : void 0) != null ? image.anchor.y : 0.5;
    sprite.position.x = ((_ref2 = image.position) != null ? _ref2.x : void 0) != null ? image.position.x : 0;
    sprite.position.y = ((_ref3 = image.position) != null ? _ref3.y : void 0) != null ? image.position.y : 0;
    return sprite;
  };

  return AgentView;

})();
});

;require.register("views/environment-view", function(exports, require, module) {
var EnvironmentView, cursorsClasses,
  __hasProp = {}.hasOwnProperty;

cursorsClasses = ["add-agents", "info-tool", "carry-tool"];

module.exports = EnvironmentView = (function() {
  EnvironmentView.prototype.showingBarriers = false;

  EnvironmentView.prototype._backgroundSprite = null;

  function EnvironmentView(_arg) {
    this.environment = _arg.environment;
    this.showingWinter = false;
    this._layers = [];
    if (this.environment.winterImgPath != null) {
      this.winterImgSprite = new PIXI.TilingSprite(PIXI.Texture.fromImage(this.environment.winterImgPath), this.environment.width, this.environment.height);
      this.winterImgSprite.anchor.x = 0;
      this.winterImgSprite.anchor.y = 0;
      this.winterImgSprite.position.x = 0;
      this.winterImgSprite.position.y = 0;
    }
  }

  EnvironmentView.prototype.render = function(el) {
    var animate, layer, texture,
      _this = this;
    if (this.stage == null) {
      this.stage = new PIXI.Stage(0xFFFFFF, true);
    }
    this.renderer = new PIXI.CanvasRenderer(this.environment.width, this.environment.height);
    texture = PIXI.Texture.fromImage(this.environment.imgPath);
    layer = this._getOrCreateLayer(0);
    this._backgroundSprite = new PIXI.Sprite(texture);
    this._backgroundSprite.anchor.x = 0;
    this._backgroundSprite.anchor.y = 0;
    this._backgroundSprite.position.x = 0;
    this._backgroundSprite.position.y = 0;
    this.scaleBackground();
    layer.addChild(this._backgroundSprite);
    this.renderBarriers(layer);
    this.renderAgents();
    this._sortStage();
    animate = function() {
      var agent, _i, _len, _ref;
      requestAnimFrame(animate);
      _ref = _this.environment.agents;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        agent = _ref[_i];
        agent.getView().rerender(_this._getOrCreateLayer(agent._viewLayer));
      }
      if (_this.environment.carriedAgent) {
        _this.environment.carriedAgent.getView().rerender(_this._getOrCreateLayer(100), 'carry-tool');
      }
      _this.barrierGraphics.visible = _this.showingBarriers;
      _this._sortStage();
      return _this.renderer.render(_this.stage);
    };
    requestAnimFrame(animate);
    this.view = this.renderer.view;
    this.addMouseHandlers();
    return this.view;
  };

  EnvironmentView.prototype.repaint = function() {
    return this.renderer.render(this.stage);
  };

  EnvironmentView.prototype.renderAgents = function(stage) {
    var agent, _i, _len, _ref, _results;
    _ref = this.environment.agents;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      agent = _ref[_i];
      _results.push(agent.getView().render(this._getOrCreateLayer(agent._viewLayer)));
    }
    return _results;
  };

  EnvironmentView.prototype.renderBarriers = function(stage) {
    this.barrierGraphics = new PIXI.Graphics();
    this.rerenderBarriers();
    return stage.addChild(this.barrierGraphics);
  };

  EnvironmentView.prototype.rerenderBarriers = function() {
    var b, i, text, _i, _len, _ref;
    while (this.barrierGraphics.children.length > 0) {
      this.barrierGraphics.removeChild(this.barrierGraphics.children[0]);
    }
    this.barrierGraphics.clear();
    this.barrierGraphics.beginFill(0xFF3300, 0.5);
    this.barrierGraphics.lineStyle(1, 0xffd900, 0.5);
    _ref = this.environment.barriers;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      b = _ref[i];
      this.barrierGraphics.drawRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1);
      text = new PIXI.Text("" + i);
      text.position = {
        x: b.x1 + 5,
        y: b.y1 + 5
      };
      this.barrierGraphics.addChild(text);
    }
    this.barrierGraphics.endFill();
    return this.barrierGraphics.visible = this.showingBarriers;
  };

  EnvironmentView.prototype.removeAgent = function(agent) {
    return agent.getView().remove(this._getOrCreateLayer(agent._viewLayer));
  };

  EnvironmentView.prototype.removeCarriedAgent = function(agent) {
    return agent.getView().remove(this._getOrCreateLayer(100));
  };

  EnvironmentView.prototype.setCursor = function(name) {
    var cursorClass, _i, _len;
    if (!this.view) {
      return;
    }
    for (_i = 0, _len = cursorsClasses.length; _i < _len; _i++) {
      cursorClass = cursorsClasses[_i];
      this.view.parentElement.classList.remove(cursorClass);
    }
    return this.view.parentElement.classList.add(name);
  };

  EnvironmentView.prototype.addWinterImage = function() {
    var layer;
    this.showingWinter = true;
    layer = this._getOrCreateLayer(101);
    if (!!this.winterImgSprite) {
      return layer.addChild(this.winterImgSprite);
    }
  };

  EnvironmentView.prototype.removeWinterImage = function() {
    var layer;
    this.showingWinter = false;
    layer = this._getOrCreateLayer(101);
    if (!!this.winterImgSprite) {
      return layer.removeChild(this.winterImgSprite);
    }
  };

  EnvironmentView.prototype.addMouseHandlers = function() {
    var eventName, _i, _len, _ref, _results,
      _this = this;
    _ref = ["click", "mousedown", "mouseup", "mousemove", "touchstart", "touchmove", "touchend"];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      eventName = _ref[_i];
      _results.push(this.view.addEventListener(eventName, function(evt) {
        if (evt instanceof TouchEvent) {
          evt.envX = evt.changedTouches[0].pageX - _this.view.offsetLeft;
          evt.envY = evt.changedTouches[0].pageY - _this.view.offsetTop;
        } else {
          evt.envX = evt.pageX - _this.view.offsetLeft;
          evt.envY = evt.pageY - _this.view.offsetTop;
        }
        return _this.environment.send(evt.type, evt);
      }));
    }
    return _results;
  };

  EnvironmentView.prototype.updateBackground = function() {
    var texture;
    texture = PIXI.Texture.fromImage(this.environment.imgPath);
    this._backgroundSprite.setTexture(texture);
    return this.scaleBackground();
  };

  EnvironmentView.prototype.scaleBackground = function() {
    var origHeight, origWidth, _ref;
    _ref = [this._backgroundSprite.width, this._backgroundSprite.height], origWidth = _ref[0], origHeight = _ref[1];
    if (this.environment.backgroundScaleX != null) {
      this._backgroundSprite.width = this.environment.width * this.environment.backgroundScaleX;
      if (this.environment.backgroundScaleY) {
        return this._backgroundSprite.height = this.environment.height * this.environment.backgroundScaleY;
      } else {
        return this._backgroundSprite.height *= this._backgroundSprite.width / origWidth;
      }
    } else if (this.environment.backgroundScaleY != null) {
      this._backgroundSprite.height = this.environment.height * this.environment.backgroundScaleY;
      return this._backgroundSprite.width *= this._backgroundSprite.height / origHeight;
    }
  };

  EnvironmentView.prototype._getOrCreateLayer = function(idx) {
    var key, layer, layerNo, _ref;
    if (this._layers[idx] == null) {
      layer = new PIXI.DisplayObjectContainer;
      this._layers[idx] = layer;
      if (this.stage != null) {
        try {
          layerNo = 0;
          _ref = this._layers;
          for (key in _ref) {
            if (!__hasProp.call(_ref, key)) continue;
            if (idx > key) {
              layerNo++;
            } else {
              break;
            }
          }
          this.stage.addChildAt(layer, layerNo);
        } catch (_error) {
          this.stage.addChild(layer);
        }
      }
    }
    return this._layers[idx];
  };

  EnvironmentView.prototype._sortStage = function() {
    var container, _i, _len, _ref, _results;
    if (!this.environment.depthPerception) {
      return;
    }
    _ref = this.stage.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      container = _ref[_i];
      _results.push(container.children.sort(function(a, b) {
        var aIdx, bIdx, _ref1, _ref2;
        aIdx = ((_ref1 = a.agent) != null ? _ref1.zIndex : void 0) != null ? a.agent.zIndex() : a.position.y * this.environment.width + a.position.x;
        bIdx = ((_ref2 = b.agent) != null ? _ref2.zIndex : void 0) != null ? b.agent.zIndex() : b.position.y * this.environment.width + b.position.x;
        return aIdx - bIdx;
      }));
    }
    return _results;
  };

  return EnvironmentView;

})();
});

;
//# sourceMappingURL=app.js.map

;(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return (Array.isArray(val) ? val.map(joinClasses) :
    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
    [val]).filter(nulls).join(' ');
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};


exports.style = function (val) {
  if (val && typeof val === 'object') {
    return Object.keys(val).map(function (style) {
      return style + ':' + val[style];
    }).join(';');
  } else {
    return val;
  }
};
/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if (key === 'style') {
    val = exports.style(val);
  }
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    if (JSON.stringify(val).indexOf('&') !== -1) {
      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
                   'will be escaped to `&amp;`');
    };
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will eliminate the double quotes around dates in ' +
                   'ISO form after 2.0.0');
    }
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var jade_encode_html_rules = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
var jade_match_html = /[&<>"]/g;

function jade_encode_char(c) {
  return jade_encode_html_rules[c] || c;
}

exports.escape = jade_escape;
function jade_escape(html){
  var result = String(html).replace(jade_match_html, jade_encode_char);
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

exports.DebugItem = function DebugItem(lineno, filename) {
  this.lineno = lineno;
  this.filename = filename;
}

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1])(1)
});

//# sourceMappingURL=vendor2.js.map