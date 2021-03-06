var dupertest = require('../lib/dupertest'),
  request = dupertest.request,
  entities = require('./entitiesController'),
  Entity = require('./entityModel'),

  // could be mockgoose in a real app
  db = require('./mockDb');

describe('mockController', function() {
  var entity;

  beforeEach(function() {
    entity = {
      id: 5,
      name: 'New Cool Entity'
    };

    // clear database before tests
    db.entities = [];

    // create new entity to test against
    db.entities.push(entity);
  });

  describe('Basic examples using expect', function() {
    it('should return an error if the entity does not exist', function(done) {
      request(entities.show)
        .params({id: 1000})
        .expect(404, done);
    });

    it('should return an entity if one exists', function(done) {
      request(entities.show)
        .params({id: 5})
        .expect(entity, done);
    });
  });

  describe('Basic examples using end', function() {
    it('should return an error if the entity does not exist', function(done) {
      request(entities.show)
        .params({id: 1000})
        .end(function(response) {
          expect(response).toBe(404);
          done();
        });
    });

    it('should return an entity if one exists', function(done) {
      request(entities.show)
        .params({id: 5})
        .end(function(response) {
          expect(response).toEqual(entity);
          done();
        });
    });
  });

  describe('More complex example building up the request object', function() {
    it('should return an entity with the original request url', function(done) {
      var url = 'http://localhost:3000/entities';
      entities.urlForSomeReason = url;

      request(entities.somethingMoreComplex)
        .body({entity: entity})
        .extendReq({
          protocol: 'http',
          originalUrl: '/entities',

          // super mocked out
          // we know it will only be used in the context of req.get('host')
          get: function() {
            return 'localhost:3000';
          }
        })
        .extendRes({
          set: function() {}
        })
        .end(function(response) {
          expect(response).toEqual(entity);
          done();
        });
    });
  });

  describe('Same complex example sample using dupertest defaults', function() {
    var defaults = {
      req: {
        protocol: 'http',
        originalUrl: '/entities',
        get: function() {
          return 'localhost:3000';
        }
      },
      res: {
        set: function() {}
      }
    };

    // this does not necessarily need to be in any sort of beforeEach statement
    // infact, the best place to set these defaults is probably the top of the specs
    // once the default are set they will stay set until cleared or the tests are over
    dupertest.setDefaults(defaults);

    it('should return an entity with the original request url', function(done) {
      request(entities.somethingMoreComplex)
        .body({entity: entity})
        .expect(entity, done);
    });
  });
});
