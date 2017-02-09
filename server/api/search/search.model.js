'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchSchema = new _mongoose2.default.Schema({
  yelpId: String,
  userId: String,
  userName: String
});

exports.default = _mongoose2.default.model('Venues', SearchSchema);
//# sourceMappingURL=search.model.js.map
