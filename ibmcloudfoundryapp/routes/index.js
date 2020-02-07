module.exports.default = (req, res) => res.render('index');

module.exports.listSysTables = (ibmdb, connString) => (req, res) => ibmdb.open(connString, (err, conn) => {
	if (err) {
		res.status(500).render('output', {data: "Error occurred: " + err.message});
	} else {
		conn.query('SELECT STATS."Country_Code",STATS."Short_Name",STATS."Table_Name" FROM HJS20180.STATS FETCH FIRST 10 ROWS ONLY', (err, tables, moreResultSets) => {
			/*
                Close the connection to the database
                param 1: The callback function to execute on completion of close function.
            */
			conn.close(() => {
				console.log("IBM DB Connection Closed");
			});
			if (!err) {
				res.render('tablelist', {
					"tablelist" : tables,
					"tableName" : "10 rows from the STATS table",
					"message": "Q5) First 3 fields"
				});

			} else {
				res.status(500).render('output', {data: "Error occurred: " + err.message});
			}
		});
	}
});

module.exports.watsonForm = (req, res) => res.render('watsonform');

module.exports.watsonResponse = watsonapi => (req, res) => {
	const txtFile = req.file.buffer.toString();
	watsonapi.profile({
		content: txtFile,
		contentType: 'text/plain'
	})
		.then(({result, status}) => {
			res.status(status).render('output', {
				data: JSON.stringify({word_count: result.word_count || 0}, null, 2)
			});
		})
		.catch(error => {
			console.error(error);
			res.status(500).render('output', {data: error.message});
		});
};

module.exports.listTestTable = (ibmdb, connString) => (req, res) => ibmdb.open(connString, (err, conn) => {
	if (err) {
		res.status(500).send(err.message);
	} else {
		conn.query('SELECT * FROM HJS20180.TESTDB', (err, tables, moreResultSets) => {
			if (!err) {
				res.render('tablelist', {
					"tablelist" : tables,
					"tableName" : "All rows from the TESTDB table",
					"message": "Q7) Load new Table"
				});

			} else {
				res.status(500).render('output', {data: "Error occurred: " + err.message});
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

module.exports.pythonTest = (PythonShell, pythonOptions) => (req, res) => {
	console.log(pythonOptions);
	PythonShell.runString('x=1+1;print(x);print("hello world")', pythonOptions, (err, results) => {
		if (err) {
			console.error(err.message);
			res.status(500).render('output', {data: "Failed to run python script"});
		} else {
			console.log(results);
			res.render('output', {data: results.join('\n')});
		}
	})
};
