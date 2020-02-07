module.exports.default = (req, res) => res.render('index');

module.exports.listSysTables = (ibmdb,connString) => (req, res) => ibmdb.open(connString, (err, conn) => {
	if (err) {
		res.status(500).send("error occurred " + err.message);
	} else {
		conn.query('SELECT STATS."Country_Code",STATS."Short_Name",STATS."Table_Name" FROM HJS20180.STATS FETCH FIRST 10 ROWS ONLY', (err, tables, moreResultSets) => {
			if (!err) {
				res.render('tablelist', {
					"tablelist" : tables,
					"tableName" : "10 rows from the STATS table",
					"message": "Db2 Connection Success"
				});

			} else {
				res.send("error occurred " + err.message);
			}

			/*
                Close the connection to the database
                param 1: The callback function to execute on completion of close function.
            */
			conn.close(() => {
				console.log("IBM DB Connection Closed");
			});
		});
	}
});

module.exports.watsonForm = (req, res) => res.render('watsonform');
