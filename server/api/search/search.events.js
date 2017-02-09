/**
 * Search model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _search = require('./search.model');

var _search2 = _interopRequireDefault(_search);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
SearchEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _search2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    SearchEvents.emit(event + ':' + doc._id, doc);
    SearchEvents.emit(event, doc);
  };
}

exports.default = SearchEvents;
//# sourceMappingURL=search.events.js.map
