/// <reference path='../../freedom/typings/freedom.d.ts' />
/// <reference path='../../third_party/typings/jasmine/jasmine.d.ts' />

// Integration test for the whole proxying system.
// The real work is done in the Freedom module which starts an echo test
// when we call "run".
describe('proxy integration tests', function() {
  var testModule :any;
  beforeEach(function(done) {
    freedom('scripts/build/integration-tests/socks-echo/integration.json', { 'debug': 'log' })
        .then((interface:any) => {
          testModule = interface();
          done();
        });
  });

  it('run a simple echo test', (done) => {
    testModule.run().then(done, (e:Error) => { throw e; });
  });
});
