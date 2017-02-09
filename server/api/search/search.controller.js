/**
 * Using Rails-like standard naming convention for endpoints.
 * POST    /api/search              ->  create
 * GET     /api/search/:id          ->  show
 * DELETE  /api/search/:id          ->  destroy
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.show = show;
exports.index = index;
exports.create = create;
exports.upsert = upsert;
exports.patch = patch;
exports.destroy = destroy;

var _fastJsonPatch = require('fast-json-patch');

var _fastJsonPatch2 = _interopRequireDefault(_fastJsonPatch);

var _search = require('./search.model');

var _search2 = _interopRequireDefault(_search);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Yelp = require('yelp');

var consumerSecret = process.env.ConsumerSecret,
    tokenSecret = process.env.TokenSecret,
    oauth_consumer_key = process.env.ConsumerKey,
    oauth_token = process.env.Token;

/* Retrieves data from Yelp + MongoDB */
function show(req, res) {
  var yelp = new Yelp({
    consumer_key: oauth_consumer_key,
    consumer_secret: consumerSecret,
    token: oauth_token,
    token_secret: tokenSecret
  });

  // Call YELP API
  yelp.search({
    location: req.params.id,
    sort: 2, // Highest Rated
    limit: 40,
    term: 'nightlife'
  }, function (err, data) {
    if (err) {
      console.log("Error while getting Yelp results");
      console.log(err);
      return res.status(500).send(err);
    }
    var venuesList = [];
    for (var i = 0; i < data.total; i++) {
      venuesList.push({
        yelpId: data.businesses[i].id,
        name: data.businesses[i].name,
        rating: data.businesses[i].rating,
        url: data.businesses[i].url,
        imageUrl: data.businesses[i].image_url,
        location: data.businesses[i].location.city,
        description: data.businesses[i].snippet_text
      });
    }
    _search2.default.find({}, function (err, resFind) {
      var result = mergeLists(venuesList, resFind);
      //console.log(result);
      console.log("Returning result of size: " + result.length);
      return res.status(200).send(result);
    });
  });
}

/* Returns merged list of Yelp locations and users atending */
function mergeLists(yelp, venues) {
  var result = [];
  for (var i = 0; i < yelp.length; i++) {
    var count_users = 0;
    var all_users = [];
    for (var j = 0; j < venues.length; j++) {
      if (yelp[i].yelpId === venues[j].yelpId) {
        count_users++;
        all_users.push({
          _id: venues[j]._id,
          userId: venues[j].userId,
          userName: venues[j].userName
        });
      }
    }
    result.push(yelp[i]);
    result[i].countUsers = count_users;
    result[i].allUsers = all_users;
  }
  return result;
}

/*
SAMPLE API RESPONSE:
{
    "businesses": [
        {
            "categories": [
                [
                    "Local Flavor",
                    "localflavor"
                ],
                [
                    "Mass Media",
                    "massmedia"
                ]
            ],
            "display_phone": "+1-415-908-3801",
            "id": "yelp-san-francisco",
            "image_url": "http://s3-media3.fl.yelpcdn.com/bphoto/nQK-6_vZMt5n88zsAS94ew/ms.jpg",
            "is_claimed": true,
            "is_closed": false,
            "location": {
                "address": [
                    "140 New Montgomery St"
                ],
                "city": "San Francisco",
                "coordinate": {
                    "latitude": 37.7867703362929,
                    "longitude": -122.399958372115
                },
                "country_code": "US",
                "cross_streets": "Natoma St & Minna St",
                "display_address": [
                    "140 New Montgomery St",
                    "Financial District",
                    "San Francisco, CA 94105"
                ],
                "geo_accuracy": 9.5,
                "neighborhoods": [
                    "Financial District",
                    "SoMa"
                ],
                "postal_code": "94105",
                "state_code": "CA"
            },
            "mobile_url": "http://m.yelp.com/biz/yelp-san-francisco",
            "name": "Yelp",
            "phone": "4159083801",
            "rating": 2.5,
            "rating_img_url": "http://s3-media4.fl.yelpcdn.com/assets/2/www/img/c7fb9aff59f9/ico/stars/v1/stars_2_half.png",
            "rating_img_url_large": "http://s3-media2.fl.yelpcdn.com/assets/2/www/img/d63e3add9901/ico/stars/v1/stars_large_2_half.png",
            "rating_img_url_small": "http://s3-media4.fl.yelpcdn.com/assets/2/www/img/8e8633e5f8f0/ico/stars/v1/stars_small_2_half.png",
            "review_count": 7140,
            "snippet_image_url": "http://s3-media4.fl.yelpcdn.com/photo/YcjPScwVxF05kj6zt10Fxw/ms.jpg",
            "snippet_text": "What would I do without Yelp?\n\nI wouldn't be HALF the foodie I've become it weren't for this business.    \n\nYelp makes it virtually effortless to discover new...",
            "url": "http://www.yelp.com/biz/yelp-san-francisco"
        }
    ],
    "total": 2316
}~
*/

////////////////////////////////////////////////////////////////


function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      _fastJsonPatch2.default.apply(entity, patches, /*validate*/true);
    } catch (err) {
      return _promise2.default.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove().then(function () {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Searchs
function index(req, res) {
  return _search2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new Search in the DB
function create(req, res) {
  return _search2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Upserts the given Search in the DB at the specified ID
function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _search2.default.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec().then(respondWithResult(res)).catch(handleError(res));
}

// Updates an existing Search in the DB
function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _search2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(patchUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a Search from the DB
function destroy(req, res) {
  return _search2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}
//# sourceMappingURL=search.controller.js.map
