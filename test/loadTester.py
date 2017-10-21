from Queue import Queue
import logging
from threading import Thread
import random, time, json

import argparse

logger = logging.getLogger(__name__)

class Parallel(object):
    def __init__(self, thread_num=10):
        # create queues
        self.tasks_queue = Queue()
        self.results_queue = Queue()

        # create a threading pool
        self.pool = []
        for i in range(thread_num):
            worker = Worker(i, self.tasks_queue, self.results_queue)
            self.pool.append(worker)
            worker.start()

        logger.debug('Created %s workers',thread_num)

    def add_task(self, task_id, func, *args, **kwargs):
        """
        Add task to queue, they will be started as soon as added
        :param func: function to execute
        :param args: args to transmit
        :param kwargs: kwargs to transmit
        """

        logger.debug('Adding one task to queue (%s)', func.__name__)
        # add task to queue
        self.tasks_queue.put_nowait((task_id, func, args, kwargs))
        pass

    def get_results(self):
        logger.debug('Waiting for processes to ends')
        self.tasks_queue.join()
        logger.debug('Processes terminated, fetching results')

        results = []
        while not self.results_queue.empty():
            print 'getting result ..'
            obj = self.results_queue.get()
            print obj
            results.append( (obj[0], obj[1].text) )

        logger.debug('Results fetched, returning data')
        return dict(results)

class Worker(Thread):
    def __init__(self, thread_id, tasks, results):
        super(Worker, self).__init__()

        self.id = thread_id
        self.tasks = tasks
        self.results = results
        self.daemon = True

    def run(self):
        logger.debug('Worker %s launched', self.id)
        while True:
            task_id, func, args, kwargs = self.tasks.get()
            logger.debug('Worker %s start to work on %s', self.id, func.__name__)
            try:
                self.results.put_nowait((task_id, func(*args, **kwargs)))
            except Exception as err:
                logger.debug('Thread(%s): error with task %s\n%s', self.id, repr(func.__name__), err)
            finally:
                logger.debug('Worker %s finished work on %s', self.id, func.__name__)
                self.tasks.task_done()


import requests
# create parallel instance with 4 workers
parallel = Parallel(4)

#url = 'http://c1.staticflickr.com/4/3939/15717056471_e25211f4d1_b.jpg'
baseurl = 'http://localhost:3000'



parser = argparse.ArgumentParser(description = 'Process display arguments')
parser.add_argument('--rps', nargs = '?', default = '3')
parser.add_argument('--secs', nargs = '?', default = '5')
args = parser.parse_args()


users = 100
objects = 50
requestsPerSecond = int(args.rps)
secs = int(args.secs)
total = secs * requestsPerSecond

log = []
logf  = open('demolog.txt','w')

# launch jobs
for i in range(total/requestsPerSecond):

    for i in range(requestsPerSecond):

        print 'adding task %d...' % i

        obj = { "price" : str(200.0 + random.random()*100) }
        uid = random.randint(0,users-1)
        eid = random.randint(0,objects-1)

        data = {
                "uid": str(uid),
                "eid": str(eid),
                "jsonObject": obj
            }

        url = baseurl + '/api/log'
        print 'requesting POST ' + url + ' ' + str(data)

        parallel.add_task(i, requests.post, url, data = json.dumps(obj) )

        log.append( (uid,eid,obj) )
        logf.write('%s,%s,%s\n' % (str(uid),str(eid),json.dumps(obj)))
        time.sleep( 1.0 / requestsPerSecond )

    # wait for all jobs to return data
    print parallel.get_results()

# launch jobs
count = 0
for uid,eid,obj in log:

    print 'adding task %d...' % i

    data = {
            "uid": str(uid),
            "eid": str(eid),
            "jsonObject": obj
        }

    url = baseurl + '/api/audit'
    print 'requesting POST ' + url + ' ' + str(data)

    parallel.add_task(i, requests.post, url, data = json.dumps(obj) )

    log.append( (uid,eid,obj) )
    logf.write('%s,%s,%s\n' % (str(uid),str(eid),json.dumps(obj)))
    
    time.sleep( 1.0 / requestsPerSecond )

    count += 1
    if count % requestsPerSecond == 0: 
	    # wait for all jobs to return data
   		print parallel.get_results()


