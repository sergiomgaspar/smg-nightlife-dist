'use strict';

var express = require('express');
var controller = require('./search.controller');

var router = express.Router();

router.get('/:id', controller.show);
router.post('/', controller.create);
router.delete('/:id', controller.destroy);

module.exports = router;
//# sourceMappingURL=index.js.map
