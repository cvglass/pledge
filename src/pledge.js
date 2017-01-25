'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

var $Promise = function(){
	this._state = 'pending',
	this._value = null,
	this._handlerGroups = []
};

$Promise.prototype.then = function(success, error){
	var handlerGroup = {
		successCb : null,
		errorCb : null,
    downstream: defer()
	};

	 if (this._state === 'fulfilled') {
		if(typeof success === 'function'){
			handlerGroup.successCb = success(this._value)
		}
		if(typeof error === 'function'){
			handlerGroup.errorCb = error
		}
	} else if (this._state === 'rejected') {
		if(typeof success === 'function') {
			handlerGroup.successCb = success
		}
		if(typeof error === 'function'){
			handlerGroup.errorCb = error(this._value)
		}
	} else if (this._state === 'pending') {
		if (typeof success === 'function') {
			handlerGroup.successCb = success
		}
		if(typeof error === 'function'){
			handlerGroup.errorCb = error
		}
	}

	this._handlerGroups.push(handlerGroup);
  // if (!handlerGroup.successCb) {
  //   resolve
  // }
  return handlerGroup.downstream.$promise;

}

$Promise.prototype.catch = function(func) {
  return this.then(null, func);
}

var Deferral = function(){
	this.$promise = new $Promise()
};

Deferral.prototype.resolve = function(data){
	if (this.$promise._state === 'pending') {
		this.$promise._state = 'fulfilled';
    this.$promise._value = data;
  }
  console.log(this.$promise._handlerGroups)

  while (this.$promise._handlerGroups.length > 0) {
    if (!this.$promise._handlerGroups[0].successCb) {
      this.$promise._handlerGroups.shift()
    }
    if (!data) {
        this.$promise._handlerGroups[0].successCb()
        this.$promise._handlerGroups.shift()
    } else {
        this.$promise._handlerGroups[0].successCb(data)
        this.$promise._handlerGroups.shift()
    }

  }


}

Deferral.prototype.reject = function(reason){
	if(this.$promise._state === 'pending'){
		this.$promise._state = 'rejected';
		this.$promise._value = reason;
	}
  while (this.$promise._handlerGroups.length > 0) {
    if (!reason) {
        this.$promise._handlerGroups[0].errorCb()
        this.$promise._handlerGroups.shift()
    } else {
        this.$promise._handlerGroups[0].errorCb(reason)
        this.$promise._handlerGroups.shift()
    }
  }
}


var defer = function(){
	return new Deferral();
}



/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
