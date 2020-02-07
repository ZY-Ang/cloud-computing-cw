import termplotlib as apl
import ibm_db
import os
import json

db2 = None
hasDB = False
if os.environ.get('VCAP_SERVICES') is not None:
    env = json.loads(os.environ.get('VCAP_SERVICES'))
    if 'dashDB For Transactions' in env:
        hasDB = True
        db2 = env['dashDB For Transactions'][0]['credentials']

if (not hasDB) and (os.environ.get('db2') is not None):
    db2 = json.loads(os.environ.get('db2'))

connString = "DRIVER={DB2};DATABASE=" + db2['db'] + ";UID=" + db2['username'] + ";PWD=" + db2[
    'password'] + ";HOSTNAME=" + db2['hostname'] + ";port=" + str(db2['port'])

conn = ibm_db.connect(connString, "", "")
stmt = ibm_db.exec_immediate(conn, 'SELECT "Class", COUNT(*) AS "Count" FROM HJS20180.TESTDB GROUP BY "Class"')
labels = []
counts = []
result = ibm_db.fetch_tuple(stmt)
while result:
    labels.append(str(result[0]))
    counts.append(int(result[1]))
    result = ibm_db.fetch_tuple(stmt)

fig = apl.figure()
fig.hist(counts, labels, force_ascii=True)
fig.show()

print("===================")
print("Or, using horizontal bars (with labels):")
print("===================")
fig._content = []
fig.barh(counts, labels, force_ascii=True)
fig.show()
