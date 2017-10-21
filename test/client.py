#!/usr/bin/env python
from RestfulClient.api import ApiClient

import json


class AuditLogClientException(Exception):
    pass

class AuditLogClient(object):


        def __init__(self, url, key='', secret='', maxCacheSize=100000):
            self.url = url
            self.key = key
            self.secret = secret
            self.api = ApiClient(self.key, self.secret, self.url)
            self.cache = LRUCache(maxsize=maxCacheSize)


        def check(self,req):
            if req.ok():
                print 'Success!'
            else:
                print req.errors()


        def uniqueId(self, userid, eid):
            return str(userid)+'|'+str(eid)


        def log(self, userid, eid, jsonObject):
            req = self.api.post('/api/log', {'userid' : userid, 'eid' : eid, 'jsonObject' : json.dumps(jsonObject) } )
            self.check(req)
            # invalidate cache
            del self.objCache[ self.uniqueId(userid,eid) ]  


        def audit(self, userid, eid, jsonObject):
            ''' {"eid":"13123fsfdasfad2","userId":"131"},"matchVersion":4,"matches":true,"matchesWithLastVersion":true,"blockNo":-1}
            '''
            req = self.api.post('/api/audit', {'userid' : userid, 'eid' : eid, 'jsonObject' : json.dumps(jsonObject) } )
            self.check(req)

            return req.content


if __name__ == '__main__':

    pass
