var router = express.Router();
var errorHanlder = require('../errorHandler')

//Get Year Options for Expense Mapping
router.post('/RRIW/getExpenseMappingYears', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT YEAR FROM SDTXSTG.TP_EXP_SGMT ORDER BY YEAR DESC", function(err, data){
				if (err) {
					console.log(err);
				} else {
					response.send(data);
				};

				conn.close();
			});
		}
	});
});

//Get Division Options for Expense Mapping
router.post('/RRIW/getExpenseDivisions', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT BMDIV FROM SDTXSTG.TP_EXP_SGMT", function(err, data){
				if (err) {
					console.log(err);
				} else {
					response.send(data);
				};

				conn.close();
			});
		}
	});
});

//Get Parent1 Options for Expense Mapping
router.post('/RRIW/getExpenseParent1', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT TP_EXP_PARENT1 FROM SDTXSTG.TP_EXP_SGMT WHERE YEAR = '"+ request.body.params.year +"'", function(err, data){
				if (err) {
					console.log(err);
				} else {
					response.send(data);
				};

				conn.close();
			});
		}
	});
});

//Get Parent Values for Expense Mapping
router.post('/RRIW/getExpenseParentValues', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT * FROM SDTXSTG.TP_EXP_HIERARCHY", function(err, data){
				if (err) {
					console.log(err);
				} else {
					response.send(data);
				};

				conn.close();
			});
		}
	});
});

//Get Account Options for Expense Mapping
router.post('/RRIW/getExpenseCodes', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT ACCT_CD, LEFT(ACCT_DESC, 15) AS ACCT_DESC FROM SDTXSTG.TP_EXP_SGMT WHERE YEAR = '"+ request.body.params.year +"' AND TP_EXP_PARENT1 = '"+ request.body.params.parent +"'", function(err, data){
				if (err) {
					console.log(err);
				} else {
					response.send(data);
				};

				conn.close();
			});
		}
	});
});

//Get Account Class Options for Expense Mapping
router.post('/RRIW/getAccountClassExpense', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT ACCT_CLASS_CD FROM SDTXSTG.TP_EXP_SGMT WHERE YEAR = '"+ request.body.params.year +"' AND TP_EXP_PARENT1 = '" + request.body.params.parent + "'", function(err, data){
				if (err) {
					console.log(err);
				} else {
					response.send(data);
				};

				conn.close();
			});
		}
	});
});

//Get Expense Mapping
router.post('/RRIW/getExpenseMapping', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT A.*, B.AMT_USD FROM SDTXSTG.TP_EXP_SGMT A LEFT JOIN SDTXSTG.TP_BRAND_SUMMARY B ON (A.ACCOUNT_KEY = B.ACCOUNT_KEY AND A.BMDIV_KEY = B.BMDIV_KEY AND A.YEAR = B.YEAR_NM) WHERE" + request.body.params.record, function(err, data){
				if (err) {
					console.log(err);
				} else {
					response.send(data);
				};

				conn.close();
			});
		}
	});
});

//Update Expense Mapping Approval
router.post('/RRIW/updateExpenseMappingApproval', function(request, response) {
	let record = request.body.params.record;
	let query = 'INSERT INTO SDTXSTG.TXPT_TP_EXP_SGMT_CHANGE_DATA_SHADOW (YEAR, ACCT_CD, ACCT_CLASS_CD, COA_LVL1_CD, ACCT_DESC, BMDIV_CD, TP_EXP_PARENT1, TP_EXP_PARENT2, TP_EXP_PARENT3, TP_EXP_PARENT4, TP_EXP_PARENT5, TP_EXP_PARENT6, TP_EXP_PARENT7, REQUEST_ID, REQUEST_BY, REQUEST_TS) VALUES '
	let logQuery = "INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, STATUS_COMMENT) VALUES "

	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT SDTXSTG.TXPT_TP_EXP_APPROVAL_REQ() FROM SYSIBM.SYSDUMMY1", function (err, data) {
				if (err) {
					console.log(err);
				} else {
					let REQUEST_ID = data[0]['1'].trim();

					for(let key in request.body.params.entries){
						query += "('" + request.body.params.entries[key].YEAR + "', '" + request.body.params.entries[key].ACCT_CD + "', '" + request.body.params.entries[key].ACCT_CLASS_CD + "', '" + request.body.params.entries[key].COA_LVL1_CD + "', '" + request.body.params.entries[key].ACCT_DESC + "', '" + request.body.params.entries[key].BMDIV + "', '" + record.TP_EXP_PARENT1 + "', '" + record.TP_EXP_PARENT2 + "', '" + record.TP_EXP_PARENT3 + "', '" + record.TP_EXP_PARENT4 + "', '" + record.TP_EXP_PARENT5 + "', '" + record.TP_EXP_PARENT6 + "', '" + record.TP_EXP_PARENT7 + "', '" + REQUEST_ID + "', '" + record.REQUEST_BY + "', CURRENT TIMESTAMP),"
						logQuery += "('Transfer Pricing-Expense Mapping', '" + request.body.params.entries[key].KEYVALUE_INFO + "','" + REQUEST_ID + "', 'P', '"+ record.REQUEST_BY +"', CURRENT TIMESTAMP, ''),"
					}

					conn.query(query.slice(0, -1), function(err,data){
						if (err) {
							console.log(err);
							response.send(errorHanlder(err.message))
						} else {
							conn.query(logQuery.slice(0, -1), function (err, data){
								if (err) {
									console.log(err);
									response.send(errorHanlder(err.message))
								} else {
									console.log('Success');
									response.send('Success');
								}
								conn.close();
							})	
						};
					});
				}
			})
		}
	});
});

function getRequestId(value){
	return value[0].REQUEST_ID;
}

//Cancel Expense Mapping Request
router.post('/RRIW/cancelExpenseMappingApproval', function(request, response) {
	let record = request.body.params.record;

	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT REQUEST_ID FROM SDTXSTG.TXPT_TP_EXP_SGMT_CHANGE_DATA_SHADOW WHERE YEAR=? AND ACCT_CD=? AND BMDIV_CD=?", [record.YEAR, record.ACCT_CD, record.BMDIV], function (err, data){
				if(err) {
					console.error("error: ", err.message);
				} else {
					let ID = getRequestId(data)
					conn.query("DELETE FROM SDTXSTG.TXPT_TP_EXP_SGMT_CHANGE_DATA_SHADOW WHERE REQUEST_ID = '" + ID + "'", function (err, deleteData) {
						if(err) {
							console.error("error: ", err.message);
						} else {
							conn.query("SELECT * FROM SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG WHERE REQUEST_ID = '" + ID + "'", function (err, requestData) { 
								if(err) {
									console.error("error: ", err.message);
								} else {
									for (let key in requestData){
										let query = "INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES ";
									
										query += "('" + 'Transfer Pricing-Expense Mapping' + "', '" + requestData[key].KEYVALUE_INFO + "', '" + requestData[key].REQUEST_ID + "', 'C', '" + requestData[key].REQUESTED_BY  + "', CURRENT TIMESTAMP, '"  + requestData[key].REQUESTED_TS + "', CURRENT TIMESTAMP, '')";

										conn.query(query, function (err, glMappingApproval) {
											if (err) {
												console.log(err);
												if (parseInt(key) == requestData.length - 1) response.send(errorHanlder(err.message))
											} else {
												if (parseInt(key) == requestData.length - 1) response.send("Success");
											}
										})
									}
								}
							})
						}
					})
				}
			})
		}
	})
})

module.exports = router;