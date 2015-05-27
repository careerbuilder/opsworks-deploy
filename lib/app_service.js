var revision = require('git-rev');
module.exports = function AppServiceModule(opsWorks) {
    function AppService(revision) {
      this.revision = revision;
    }

    AppService.prototype.updateApp = function(appId, cb) {
      var self = this;
      revision.long(function revResponse(rev) {
        if(self.revision){
          rev = self.revision;
        }
        console.log('Setting revision to', rev);
        var params = {
            AppId: appId,
            AppSource: {
                Revision: rev
            }
        };
        opsWorks.updateApp(params, function updateAppResponse(err, data) {
            if(err) {
                throw err;
            }
            else {
                console.log('App revision success');
                cb();
            }
        });
      });
    };
    return AppService;
};