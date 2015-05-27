/*
     Copyright (C) 2015 Careerbuilder, LLC

     This program is free software: you can redistribute it and/or modify
     it under the terms of the GNU General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.

     This program is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU General Public License for more details.

     You should have received a copy of the GNU General Public License
     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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