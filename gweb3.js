/**
 * Dummy base object
 */
var gweb3 = {
  /**
   * Adds the given object to gweb3 under the `name` key.
   *
   * @param {string} name The name of the key
   * @param {Object} o The object to add
   */
  extend: function (name, o) { gweb3[name] = o },
};


/* ------------------------------- PolyFills -------------------------------- */
(function () {

  if (typeof Object.entries != "function") {
    Object.defineProperty(Object, "entries", {
      value: function (target) {
        'use strict';
        var props = Object.keys(target);
        var i = props.length;
        var entries = new Array(i);
        while (i--) {
          entries[i] = [props[i], target[props[i]]];
        }
        return entries;
      },
      writable: true,
      configurable: true
    });
  }

  if (typeof Object.values != "function") {
    Object.defineProperty(Object, "values", {
      value: function (target) {
        'use strict';
        var props = Object.keys(target);
        var i = props.length;
        var values = new Array(i);
        while (i--) {
          values[i] = target[props[i]];
        }
        return values;
      },
      writable: true,
      configurable: true
    });
  }

  if (typeof Object.assign != "function") {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function (target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
          throw new TypeError("Cannot convert undefined or null to object");
        }

        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }


  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, "find", {
      value: function (predicate) {
       // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== "function") {
          throw new TypeError("predicate must be a function");
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        var thisArg = arguments[1];

        // 5. Let k be 0.
        var k = 0;

        // 6. Repeat, while k < len
        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
          // d. If testResult is true, return kValue.
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
          }
          // e. Increase k by 1.
          k++;
        }

        // 7. Return undefined.
        return undefined;
      },
      configurable: true,
      writable: true
    });
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  if (!Array.prototype.filter){
    Array.prototype.filter = function(func, thisArg) {
      'use strict';
      if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
          throw new TypeError();

      var len = this.length >>> 0,
          res = new Array(len), // preallocate array
          t = this, c = 0, i = -1;
      if (thisArg === undefined){
        while (++i !== len){
          // checks to see if the key was set
          if (i in this){
            if (func(t[i], i, t)){
              res[c++] = t[i];
            }
          }
        }
      }
      else{
        while (++i !== len){
          // checks to see if the key was set
          if (i in this){
            if (func.call(thisArg, t[i], i, t)){
              res[c++] = t[i];
            }
          }
        }
      }

      res.length = c; // shrink down array to proper size
      return res;
    };
  }

  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, "startsWith", {
      value: function (value, start) {
        'use strict';
        start = start ? start : 0;
        if (value.length + start > this.length) {
          return false;
        }
        return this.slice(start, start + value.length) === value;
      },
      writable: true,
      configurable: true
    });
  }

  /**
   * Returns a formatted string
   *  eg.
   *
   *    "My name is {0}.".format("Earl");
   *    "99 {0} coins on the wall, 99 {0} coins. Take {1} down...".format("Raven", 1);
   *
   * @param {string] The format of the string
   * @param {...Object} Variable length objects used in the format
   * @return {string} The formatted string
   */
  Object.defineProperty(String.prototype, "format", {
    value: function () {
      'use strict';
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== "undefined"
          ? args[number]
          : match;
      });
    },
    writable: true,
    configurable: true
  });


  /**
   * Returns a formatted, colored string
   *  eg.
   *
   *    "{ALERT}{0}{RESET} during self destruct".cformat("FAILURE");
   *
   * @param {string] The format of the string
   * @param {...Object} Variable length objects used in the format
   * @return {string} The formatted string
   */
  Object.defineProperty(String.prototype, "cformat", {
    value: function () {
      'use strict';
      var args = arguments;
      var formatted = this.format.apply(this, args);
      return formatted.replace(/{([A-Z]+)}/g, function (match, color) {
        return color in gweb3.color
          ? gweb3.color[color]
          : match;
      });
    },
    writable: true,
    configurable: true
  });

})();

/* --------------------------------- Colors --------------------------------- */
(function ($) {
  $.extend("color", {
    RESET: '\033[0m',
    ALERT: '\033[31m',
     WARN: '\033[33m',
     INFO: '\033[32m',
       OK: '\033[37m',
     GOOD: '\033[32m',
    MUTED: '\033[1;30m'
  });
})(gweb3);

/* -------------------------------- Generic --------------------------------- */
(function ($) {

  var NodeType = Object.freeze({ "UNKNOWN": 0, "GETH": 1, "GANACHE": 2 });

  function nodeType() {
    var s = web3.version.node;

    if (s.startsWith("Geth")) {
      return NodeType.GETH;
    } else if (s.startsWith("EthereumJS")) {
      return NodeType.GANACHE;
    }
    return NodeType.UNKNOWN;
  }

  $.extend("node", {
    type: NodeType,
    getType: nodeType
  });

})(gweb3);

/* -------------------------------- Contract -------------------------------- */

(function ($) {

  /**
   * Contract object
   *
   * @param {json} abi The contract JSON ABI
   * @param {string} bytecode The contract binary
   * @return {Contract} New Contract instance
   */
  function Contract(abi, bytecode) {
    if (!abi) {
      throw new Error("Contract requires 'abi' and 'bytecode'");
    }

    this.abi = [...abi];
    // Lame hack to set the property: "constant" of view functions to avoid calls 
    // from generating a transaction and returning the hash, as opposed
    // to the returned value.
    //
    // (didn't need this within older Geth versions)
    for (var i = 0; i < this.abi.length; i++) {
      if ("stateMutability" in this.abi[i] && this.abi[i].stateMutability == "view") {
        this.abi[i]["constant"] = true;
      }
    }
    bytecode = bytecode || "0x0"
    this.bytecode = bytecode.startsWith("0x")
      ? bytecode
      : "0x" + bytecode;
  }

  /**
   * Returns the gas estimate of the invocation of the given method, args, and sender.
   *
   * @param {string} method The method of the contract
   * @param {Array} args Arguments of the method
   * @param {string} from The address of the sender
   * @return {number} The gas estimate
   */
  Contract.prototype.estimateGas = function (method, args, from) {
    // Verify the method/signature exists, throwing away the match.
    getMethodABI(this.abi, method, args);

    return this.instance[method].estimateGas.apply(null, args.concat([{from: from}]));
  };

  /**
   * Calls the matching function of the contract, with the given args, from the sender.
   *
   * @param {string} method The method of the contract
   * @param {Array} args Arguments of the method
   * @param {string} from The address of the sender
   * @return {Object} The return value of the function, when it's a constant, or the transaction receipt.
   */
  Contract.prototype.call = function (method, args, from, gas) {
    var abi = getMethodABI(this.abi, method, args);
    var transactionHash;

    if (abi.constant) {
      var o = methodAndArgs(method);
      if (o.args) {
        return this.instance[o.name][o.args].apply(null, args.concat([{from: from}]));
      }
      return this.instance[o.name].apply(null, args.concat([{from: from}]));
    }

    transactionHash = sendTransaction(this.instance, method, args, from, gas);
    return getTransactionReceipt(transactionHash);
  };

  /**
   * Clones the contract, but doesn't deploy it
   *
   * @return {Contract} The cloned contract
   */
  Contract.prototype.clone = function () {
    return new Contract(this.abi, this.bytecode);
  };

  /**
   * Returns if the given method of the contract is a constant.
   *
   * @param {string} method The method of the contract
   * @return {boolan} Whether the method is constant
   */
  Contract.prototype.isConstant = function (method, args) {
    return getMethodABI(this.abi, method, args).constant;
  };

  /**
   * Deploys the contract, using the given account as the sender.
   *
   * @param {string} from The account used to deploy the contract
   * @return {Object} The receipt of the transaction
   */
  Contract.prototype.deploy = function (args, from) {
    args = args || [];
    if (args.length > 0) {
      var constructor = this.abi.find(function (o) { return o.type == 'constructor' });
      var expected = constructor ? constructor.inputs.length : 0;
      if (args.length != expected) {
        throw new Error("Invalid number of arguments for constructor, expected {0} but received {1} - {2}".format(expected, args.length, JSON.stringify(args)));
      }
    }

    var contract = web3.eth.contract(this.abi);
    var contractData = contract.new.getData.apply(contract, args.concat({data: this.bytecode.substr(2)}));
    var gas = web3.eth.estimateGas({data: '0x' + contractData});
    var tx = contract.new.apply(contract, args.concat({data: this.bytecode, from: from, gas: gas}));
    var receipt = web3.eth.getTransactionReceipt(tx.transactionHash);

    while (!receipt) {
      // We should be able to wait for blocks to be mined, but Geth returns the below while in `dev` mode:
      //
      //   WARN [08-23|11:13:41.648] Block sealing failed                     err="waiting for transactions"
      //
      //admin.sleepBlocks(1);  // This isn't working as expected
      admin.sleep(0.25);
      receipt = web3.eth.getTransactionReceipt(tx.transactionHash);
    }
    this.address = receipt.contractAddress;
    this.instance = contract.at(receipt.contractAddress);
    return receipt;
  };

  Contract.prototype.at = function (address) {
    var contract = web3.eth.contract(this.abi);

    this.address = address;
    this.instance = contract.at(address);

    return this;
  };

  /**
   * Generates all method signatures for the given eth.contract instance
   *
   * @param {eth.contract} The contract instance
   * @return {json} The signatures of the given contract instance
   */
  function signatures(instance) {
    var sig = {};
    instance.abi.filter(function (o) { return o.type == 'function' }).forEach(function(f) {
      var method = f.name + '(' + f.inputs.map(function (i) { return i.type }).join(',') + ')';
      sig[method] = web3.sha3(method).substring(2, 10);
    });
    return sig;
  };

  /**
   * Returns an object containing the method name and arguments.
   *   eg.
   *     test                   => {name: "test", args: ''}
   *     test(address)          => {name: "test", args: 'address'}
   *     test(address[])        => {name: "test", args: 'address[]'}
   *     test(address,uint256)  => {name: "test", args: 'address,uint256'}
   *
   * @param {string} The function of the contract
   * @return {Object} The function name and arguments
   */
  function methodAndArgs(method) {
    var i = method.indexOf('(');
    var o = {
      name: method,
      args: ''
    };

    if (i > 0) {
      o.name = method.slice(0, i);
      o.args = method.slice(i+1, method.length-1);
    }
    return o;
  }

  /**
   * Return the type of the input
   *
   * @param {Object} The abi input object
   * @return {string} The type of the input
   */
  function methodInputArgs(input) {
    return input.type;
  }

  /**
   * Gets the ABI of the given function.
   * Throws when the given `method` doesn't exist within the abi.
   * Throws when `args` is present, and the matching method ars don't match the length of the given args.
   *
   * @param {json} abi The abi containing the method
   * @param {string} method The name of the method
   * @param {Array} args (optional) The args of the method
   * @return {json} The matching ABI
   */
  function getMethodABI(abi, method, args) {
    var match;
    var hasMethod;
    var x = methodAndArgs(method);

    args = args || [];
    for (var i = 0; i < abi.length; i++) {
      var y = abi[i];
      if (x.name != y.name)
        continue;

      hasMethod = true;
      if (x.args == y.inputs.map(methodInputArgs).join(',')) {
        // signatures match (overrides an argument length match)
        match = y
      } else if (!match && args.length == y.inputs.length) {
        // argument lengths match (only when a signature match hasn't been found)
        match = y
      }
    }

    if (!match) {
      if (!hasMethod) {
        throw new Error("Contract doesn't have method '{0}'".format(method || 'undefined'));
      }
      throw new Error("Contract doesn't have method '{0}' matching the given signature".format(method));
    }

    return match;
  }

  /**
   * Invokes the method of the contract, with the args, from the given sender.
   *
   * @param {Contract} contract The contract to send the transaction to
   * @param {string} method The method name
   * @param {Array} args The method arguments
   * @param {string} from The sender of the transaction
   * @return {Object} The transaction hash
   */
  function sendTransaction(contract, method, args, from, gas) {
    gas = gas || contract[method].estimateGas.apply(null, args.concat([{from: from}]));
    var data = contract[method].getData.apply(null, args);
    var transData = {to: contract.address, from: from, gas: gas, data: data};

    return web3.eth.sendTransaction(transData);
  }

  /**
   * Returns the receipt of the given transaction.
   * Loop until the transaction has been mined.
   *
   * @param {string} transactionHash The transaction to retrieve the receipt for
   */
  function getTransactionReceipt(transactionHash) {
    var receipt = null;

    if (transactionHash) {
      while(!(receipt = web3.eth.getTransactionReceipt(transactionHash))) {
        // We should be able to wait for blocks to be mined, but Geth returns the below while in `dev` mode:
        //
        //   WARN [08-23|11:13:41.648] Block sealing failed                     err="waiting for transactions"
        //
        //admin.sleepBlocks(1);
        admin.sleep(0.25);
      }
    }

    return receipt;
  }

  // Add Contract constructor to top level
  Contract.signatures = signatures;
  $["Contract"] = Contract;

})(gweb3);

/* -------------------------------- Account --------------------------------- */

(function ($) {

  // TODO: finish implementing this for signing...
  /*function Account(password, privateKey) {
    var account;

    this.key = null;
    this.password = password;

    if (privateKey) {
      this.key = web3.personal.importRawKey(privateKey, password);
      // ---= web3js-1.0 =---
      //account = web3.eth.accounts.privateKeyToAccount(privateKey);
    } else {
      this.key = web3.personal.newAccount(password);
      // ---= web3js-1.0 =---
      //account = web3.eth.accounts.create();
    }

    // ---= web3js-1.0 =---
    //this.key = account.address;
    //this.encrypt = account.encrypt;
    //this.sign = account.sign;
    //this.signTransaction = account.signTransaction;
  }

  Account.prototype.unlock = function (duration) {
    duration = duration ? duration : 0;
    web3.personal.unlockAccount(this.key, this.password, duration);
  };*/

  /**
   * Creates, or imports, an account.
   * When only the password is provided, a new account is created.
   * When the privateKey is provided, it is imported.
   *
   * @param {string} password The password of the account
   * @param {string} privateKey The private key of the account
   * @return {string} The public key of the account
   */
  function createAccount(password, privateKey) {
    return privateKey
      ? web3.personal.importRawKey(privateKey, password)
      : web3.personal.newAccount(password);
  }

  /**
   * Checks if the given account exists.
   *
   * @param {string} key The public key
   * @return {boolean} Whether the account exists
   */
  function accountExists(key) {
    return web3.eth.accounts.indexOf(key.toLowerCase()) >= 0;
  }

  /**
   * Checks if the given account is locked.
   *
   * @param {string} key The public key
   * @return {boolean} Whether the account is currently locked
   */
  function isAccountUnlocked(key) {
    var address = key.toLowerCase();
    var wallet = web3.personal.listWallets.find(function (wallet) {
      return wallet.accounts.find(function (account) { return account.address == address });
    });

    if (!wallet) {
      throw new Error("No account exists for key: '{0}'".format(key));
    }
    return wallet.status == "Unlocked";
  }

  /**
   * Unlocks the given account for a duration, or indefinately when duration is `0`.
   *
   * @param {string} key The public key
   * @param {string} password The password
   * @param {number} duration The duration of time to unlock the account for
   */
  function unlockAccount(key, password, duration) {
    duration = duration ? duration : 0;
    web3.personal.unlockAccount(key, password, duration);
  }

  /**
   * Transfers Ether between accounts
   *
   * @param {string} from The sender address
   * @param {string} to The receivers address
   * @param {number} ether The amount of ether to transfer
   * @return {Object} The transaction
   */
  function sendEther(from, to, ether) {
    var data = {
      from: from,
      to: to,
      value: web3.toWei(ether, "ether")
    };
    return web3.eth.sendTransaction(data);
  }

  // TODO: finish implementing this for signing...
  // Add Account constructor to top level
  //$["Account"] = Account;

  // Add account helper functions
  $.extend("accounts", {
    create: createAccount,
    exists: accountExists,
    isUnlocked: isAccountUnlocked,
    unlock: unlockAccount,
    sendEther: sendEther
  });

})(gweb3);

/* ----------------------------- Transactions ------------------------------- */
(function ($) {
  var ERROR_SIG = "08c379a0";  // bytes4(keccak256('Error(string)'))

  function hexToAscii(hex) {
    var result = [];
    for (var i = 0; i < hex.length; i += 2) {
      var b = hex.substr(i, 2);
      if (b == '00') continue;
      result.push(String.fromCharCode(parseInt(b, 16)));
    }
    return result.join('');
  }

  function requireMessage(tx) {
    var trace = debug.traceTransaction(tx);
    var retVal = (trace ? trace.returnValue : null);
    var msgLength;

    if (!retVal || retVal.substring(0, 8) != ERROR_SIG) return;
    len = parseInt('0x'+retVal.substr(0x8+0x40, 0x40));  //substr(sig + block, block)
    return hexToAscii(retVal.substr(0x8+0x40+0x40, len*2));
  }

  $.extend("trans", {
    hexToAscii: hexToAscii,
    requireMessage: requireMessage
  });

})(gweb3);

/* --------------------------------- Tests ---------------------------------- */

// TODO: Tests were kinda thrown together, feel free to make it pretty =)
(function ($) {

  var DEFAULT_ARGS = {expects: {success: true}, args: []};
  var MAX_GAS = eth.getBlock('').gasLimit;

  var tests = [];
  var testSetups = {};
  var getAccountsFn = $.noop;
  var getContractsFn = $.noop;

  /**
   * Appends the given test to the list of tests.
   * If the test already exists, it is replaced.
   *
   * @param {Object} test The test object to add/replace
   */
  function append(test) {
    var isNew = true;

    for(var i = 0; i < tests.length; i++) {
      var t = tests[i];
      if (t.name === test.name) {
        console.log("replacing test:", test.name);
        tests[i] = test;
        isNew = false;
      }
    }

    if (isNew) {
      console.log("adding test:", test.name);
      tests.push(test);
    }
  }

  function appendSetup(setup) {
    if (setup.name in testSetups) {
      console.log("replacing setup:", setup.name);
    } else {
      console.log("adding setup:", setup.name);
    }
    testSetups[setup.name] = setup.items;
  }

  /**
   * Clears all tests
   */
  function clear() {
    tests = [];
  }


  /**
   * Clears all test setups
   */
  function clearSetups() {
    testSetups = {};
  }

  /**
   * Removes a test by name
   *
   * @param {string} name The name of the test to remove
   */
  function remove(name) {
    for(var i = 0; i < tests.length; i++) {
      if (tests[i].name === name) {
        tests.splice(i, 1);
      }
    }
  }

  /**
   * Returns an array of all the tests, by name.
   *
   * @return {Array} An array of tests names
   */
  function list() {
    return tests.map(function (test) {
      return test.name;
    });
  }

  /**
   * Returns an array of all the test setups, by name.
   *
   * @return {Array} An array of test setup names
   */
  function listSetups() {
    return Object.keys(testSetups);
  }

  /**
   * Returns a cloned of args with any replacements
   * When a string value starts with an `*`, a contract address matching the value after the asterisk is used.
   *
   * @param {Array} args The function arguments
   * @param {Object} accounts The current node accounts
   * @param {Object} contracts The contract object
   * @return {Array} Function arguments where contract addresses replace placeholders
   */
  function funcArgs(args, accounts, contracts, isRecursive) {
    var newArgs = args.slice();
    for (var i = 0; i < args.length; i++) {
      if (Array.isArray(args[i]))
        newArgs[i] = funcArgs(args[i], accounts, contracts, true);
      if (typeof(args[i]) !== "string" || args[i].length < 1)
        continue;

      var arg = args[i];
      var marker = arg[0];

      if (marker == '*') {
        newArgs[i] = contracts[arg.slice(1)].address;
      } else if (marker == '@') {
        newArgs[i] = accounts[parseInt(arg.slice(1))].pub;
      } else if (marker == '#') {
        var operator = arg[1];
        var seconds = arg.substr(2);
        var now = Math.floor(new Date().getTime() / 1000);
        newArgs[i] = eval(now + operator + seconds);
      }
    }

    return newArgs;
  }

  function testSetup(setups, accounts, contracts) {
    for (var i = 0; i < setups.length; i++) {
      var setup = setups[i];

      if (typeof(setup) == "string") {
        if (!(setup in testSetups)) {
          throw("Init not registerred: '" + setup + "'");
        }
        testSetup(testSetups[setup], accounts, contracts);
      } else {
        testSteps(setup, accounts, contracts, true);
      }
    }
  }

  /**
   * Runs a test by name, or all tests when name isn't present.
   *
   * @param {string} name The name of the test to run
   * @return {Object} The accounts and contracts used during the test run.
   */
  function run(name) {
    var results = name
      ? runTest(name)
      : runAll();

    clearSetups()
    clear()

    console.log('');
    if (results.passing) {
      console.log("{OK}{0} passing tests{RESET}".cformat(results.passing));
    }
    if (results.failing) {
      console.log("{ALERT}{0} failing tests{RESET}".cformat(results.failing));
    }
    return results;
  }

  /**
   * Runs all tests, and returns an object containing accounts/contracts for each suite of tests
   */
  function runAll() {
    var results = {passing: 0, failing: 0};

    for(var i = 0; i < tests.length; i++) {
      var name = tests[i].name;
      var result = testSuites(tests[i]);
      results[name] = result.tests;
      results.failing += result.failing
      results.passing += result.passing
    }
    return results
  }

  function runTest(name) {
    var results = {passing: 0, failing: 0};
    var result;

    for(var i = 0; i < tests.length; i++) {
      if (tests[i].name != name) {
        continue;
      }
      result = testSuites(tests[i]);
      results[tests[i].name] = result.tests;
      results.failing += result.failing;
      results.passing += result.passing;
    }
    return results;
  }

  function testSuites(test) {
    var results = { tests: [], passing: 0, failing: 0 };
    var accounts;
    var contracts;
    var suite;
    var recycle;
    var failures;

    for (var i = 0; i < test.suites.length; i++) {
      var instances = {};

      suite = test.suites[i];
      recycle = suite.recycle && i > 0;
      // Generate accounts/contracts for suite if not recycling
      if (!recycle) {
        accounts = getAccountsFn();
        contracts = getContractsFn();
      }

      // Set the contract instances to the results, instead of the Contract object.
      Object.keys(contracts).forEach(function (name) {
        instances[name] = contracts[name].instance;
      });
      results.tests.push({accounts: accounts, contracts: instances});

      if (i == 0) console.log("{OK}{0}{RESET}:".cformat(test.name));
      if ("setups" in test && !recycle) {
        testSetup(test.setups, accounts, contracts);
      }
      failures = testSteps(suite, accounts, contracts);
      results.failing += failures;
      results.passing += suite.steps.length - failures;

      if (web3.debug && web3.debug.freeOSMemory) {
        web3.debug.freeOSMemory();
      }
    }

    return results;
  }

  function testSteps(suite, accounts, contracts, isSetup) {
    var defaults = suite.defaults || {};
    var failures = 0;

    if (!isSetup) {
      console.log("  - {OK}{0}{RESET}".cformat(suite.name));
    }
    for (var i = 0; i < suite.steps.length; i++) {
      if (!testStep(suite.steps[i], defaults, accounts, contracts, isSetup)) {
        failures++;
      }
    }
    return failures;
  }

  function testStep(step, defaults, accounts, contracts, isSetup) {
    var fullStep = Object.assign({}, DEFAULT_ARGS, defaults, step);
    var contract = contracts[fullStep.contract];
    var result;

    if (typeof(fullStep.expects.success) == 'undefined' || (step.expects && typeof(step.expects.success) == 'undefined')) {
      fullStep.expects.success = !('error' in fullStep.expects);
    }

    fullStep.args = funcArgs(fullStep.args, accounts, contracts);
    if (!contract) {
      throw("Contract not found: " + fullStep.contract);
    }

    result = contract.isConstant(fullStep.func, fullStep.args)
      ? testStepConstant(fullStep, accounts, contracts, isSetup)
      : testStepTransaction(fullStep, accounts, contracts, isSetup);

    if ("contract" in result) {
      contracts[result.contract.name] = new $.Contract(
        contracts[fullStep.expects.contract.abi].abi,
        contracts[fullStep.expects.contract.abi].bytecode
      ).at(result.contract.address);
    }

    if ("wait" in fullStep) {
      if (fullStep.wait.message) {
        console.log(fullStep.wait.message);
      }
      admin.sleep(fullStep.wait.seconds);
      // due to the wait, force a block to update latest block.timestamp
      web3.eth.sendTransaction({from: fullStep.from, to: fullStep.from, value: 0});
    }

    return result.success;
  }

  function testStepTransaction(step, accounts, contracts, isSetup) {
    var start, end;
    var tx = { receipt: null, error: null, require: null };
    var result = { success: false };
    var message = null;

    if ("returns" in step.expects) {
      throw new Error("'{0}.{1}()' is not a constant function, can only get return value from constant functions.".format(step.contract, step.func));
    }

    // Run test, and time the duration
    start = new Date().getTime();
    try { tx.receipt = contracts[step.contract].call(step.func, step.args, step.from, MAX_GAS); }
    catch(err) { tx.error = err; }
    end = new Date().getTime();

    // Exception
    if (tx.error != null) {
      result.success = false;
      message = "Unexpected exception: {0}".format(tx.error);
    }
    // Expected result
    else if (step.expects.success == (tx.receipt.status == '0x1')) {
      if (step.expects.error) {
        var error = $.trans.requireMessage(tx.receipt.transactionHash);
        result.success = error == step.expects.error;
        // Unexpected error
        if (!result.success) {
          message = error && error != step.expects.error
            ? "Expected 'require': {WARN}\"{0}\"{RESET}, but received: {WARN}\"{1}\"{RESET}".cformat(step.expects.error, error)
            : "Expected 'require': {WARN}\"{0}\"{RESET}, but received no require message{RESET}".cformat(step.expects.error);
        }
      } else {
        result.success = true;
        // If contract address is expected, add it to the result.
        if (step.expects.success && "contract" in step.expects) {
          result.contract = stepContract(step, tx, contracts);
        }
      }
    }
    // Failure when expectin success
    else if (step.expects.success) {
      var error = $.trans.requireMessage(tx.receipt.transactionHash);
      result.success = false;
      message = error
        ? "Reverted due to 'require': {WARN}\"{0}\"{RESET}".cformat(error)
        : "Failure when expecting success";
    }
    // Successful when expectin failure
    else {
      result.success = false;
      message = "Successful when expecting failure";
    }

    logStep(result.success, step.name, isSetup, message, end-start, tx.receipt);
    return result;
  }

  function testStepConstant(step, accounts, contracts, isSetup) {
    var contract = contracts[step.contract];
    var result = contract.call(step.func, step.args, step.from, MAX_GAS);
    var passed = resultEquals(result, step.expects.returns);
    var message = "'{0}' != '{1}'".format(step.expects.returns, result);

    logStep(passed, step.name, isSetup, message);
    return { success: passed };
  }

  function stepContract(step, tx, contracts) {
    var c = step.expects.contract;
    var address = "from" in c
      ? contracts[c.from.contract].call(c.from.func, c.from.args, step.from, MAX_GAS)  // invoke function that returns address
      : tx.receipt.contractAddress;                                                    // receipt address

    // TODO: The above doesn't perform any error handling on the invocation of `c.from.func`.
    //       This could cause issues with tests, and should be fixed.
    return { name: c.name, address: address };
  }

  function resultEquals(result, expected) {
    var passed = false;
    switch (result.constructor) {
      case Array:
        for (var i = 0; i < result.length; i++) {
          passed = resultEquals(result[i], expected[i]);
          if (!passed) break;
        }
        break;
      case BigNumber:
        passed = result.equals(expected);
        break;
      default:
        passed = result === expected;
    }
    return passed;
  }

  function logStep(passed, name, isSetup, message, duration, receipt) {
    if (isSetup) {
      if (!passed)  {
        console.log("       | {0}{1}{2}{RESET}".cformat(
          passed ? '' : "{ALERT}",
          name,
          receipt ? "{MUTED} " + receipt.transactionHash : '')
        );
      }
      return;
    }

    var status = passed
      ? "{GOOD}SUCCESS{RESET}"
      : "{ALERT}FAILURE{RESET}"

    var msg = ["      ", status, "{OK} ", name, "{RESET}"]
    if (duration) {
      msg.push(" - " + duration + "ms");
    }
    if (receipt) {
      msg.push(", {0}gwei {MUTED}{1}{RESET}".cformat(receipt.gasUsed, receipt.transactionHash));
    }
    console.log(msg.join('').cformat());

    if (!passed) {
      console.log("      " + message);
    }
  }

  function setAccountsFn(func) {
    getAccountsFn = func;
  }

  function setContractsFn(func) {
    getContractsFn = func;
  }

  $.extend("tests", {
    append: append,
    appendSetup: appendSetup,
    remove: remove,
    funcArgs: funcArgs,
    list: list,
    listSetups: listSetups,
    clear: clear,
    clearSetups: clearSetups,
    run: run,
    setAccountsFn: setAccountsFn,
    setContractsFn: setContractsFn
  });

})(gweb3);
