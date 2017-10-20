// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// configuration
var config = require('../core/util.js').getConfig();
var settings = config.percent20;

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
  this.name = 'percent20';

  this.state = {
    lastPrice: 0,
    currentPrice: 0,
    diff: 0,
    priceHistory: []
  }

  this.trend = {
    direction: '',
    duration: 0,
    advised: false,
    priceAtTrend: 0
  }
  this.requiredHistory = config.tradingAdvisor.historySize;

  // define the indicators we need
  this.addIndicator('dema', 'DEMA', settings);
}

// what happens on every new candle?
method.update = function(candle) {
  this.state.currentPrice = this.lastPrice
  this.state.priceHistory.push(this.state.currentPrice);
  if(this.state.priceHistory.length > settings.thresholds.duration) {
    this.state.lastPrice = this.state.priceHistory.shift();
    this.state.diff = this.state.currentPrice - this.state.lastPrice;
  }
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function() {
  var dema = this.indicators.dema;

  log.debug('20% calculated DEMA properties for candle:');
  log.debug('\t', 'long ema:', dema.long.result.toFixed(8));
  log.debug('\t', 'short ema:', dema.short.result.toFixed(8));
  log.debug('\t diff:', dema.result.toFixed(5));
  log.debug('\t DEMA age:', dema.short.age, 'candles');
  log.debug('\t trend duration:', this.trend.duration);
}

method.check = function() {
  var diff = this.state.diff;
  log.debug('diff: ', diff)
  if(this.state.diff > this.state.lastPrice * 0.5) {
    this.advice('long');
  } else if(this.state.diff < this.state.lastPrice * 0.5) {
    this.advice('short');
  } else {
    this.advice();
  }
  // var dema = this.indicators.dema;
  // var diff = dema.result;
  // var price = this.lastPrice;
  //
  // var message = '@ ' + price.toFixed(8) + ' (' + diff.toFixed(5) + ')';
  //
  // if(diff > settings.thresholds.up) {
  //   if(this.trend.direction !== 'up') {
  //     log.debug('we are currently in uptrend', message);
  //     this.trend = {
  //       direction: 'up',
  //       duration: 0,
  //       advised: false,
  //       priceAtTrend: price
  //     }
  //   }
  // } else if(diff < settings.thresholds.down) {
  //   if(this.trend.direction !== 'down') {
  //     log.debug('we are currently in a downtrend', message);
  //     this.trend = {
  //       direction: 'down',
  //       duration: 0,
  //       advised: false,
  //       priceAtTrend: price
  //     }
  //   }
  // } else {
  //   log.debug('we are currently not in an up or down trend', message);
  //   // this.advice();
  // }
  //
  // if(this.trend.duration > settings.thresholds.duration) {
  //   log.debug('we have a trend duration of ', this.trend.duration)
  //   if(!this.trend.advised) {
  //     log.debug('price difference ', Math.abs(price - this.trend.priceAtTrend).toFixed(8), ' while 20 percent is ', (this.trend.priceAtTrend * 0.2).toFixed(8))
  //     if(Math.abs(price - this.trend.priceAtTrend) >= this.trend.priceAtTrend * 0.2) {
  //       log.debug('20 percent price difference detected')
  //       if(this.trend.direction == 'up') {
  //         this.advice('long');
  //       } else {
  //         this.advice('short');
  //       }
  //       this.trend.advised = true;
  //     }
  //   }
  // } else {
  //   this.advice();
  // }
  // this.trend.duration++;
  
}

module.exports = method;
