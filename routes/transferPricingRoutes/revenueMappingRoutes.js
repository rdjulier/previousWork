var router = express.Router();
var errorHanlder = require('../errorHandler')

//Get Year Options for Revenue Mapping
router.post('/RRIW/getRevenueMappingYears', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT YEAR FROM SDTXSTG.TP_REV_SGMT ORDER BY YEAR DESC", function(err, data){
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

//Get Parent1 Options for Revenue Mapping
router.post('/RRIW/getParent1', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT TP_REV_PARENT1 FROM SDTXSTG.TP_REV_SGMT WHERE YEAR = '"+ request.body.params.year +"'", function(err, data){
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

//Get Account Class Options for Revenue Mapping
router.post('/RRIW/getAccountClass', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT ACCT_CLASS_CD FROM SDTXSTG.TP_REV_SGMT WHERE YEAR = '"+ request.body.params.year +"' AND TP_REV_PARENT1 = '" + request.body.params.parent + "'", function(err, data){
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

//Get Account Options for Revenue Mapping
router.post('/RRIW/getAccountCodes', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT ACCT_CD, LEFT(ACCT_DESC, 15) AS ACCT_DESC FROM SDTXSTG.TP_REV_SGMT WHERE YEAR = '"+ request.body.params.year +"' AND TP_REV_PARENT1 = '"+ request.body.params.parent +"'", function(err, data){
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

//Get Parent Values for Revenue Mapping
router.post('/RRIW/getParentValues', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT * FROM SDTXSTG.TP_REV_HIERARCHY", function(err, data){
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

//Get Revenue Mapping
router.post('/RRIW/getRevenueMapping', function (request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT A.*, B.AMT_USD, D.BMDIV_CODE FROM SDTXSTG.TP_REV_SGMT A LEFT JOIN SDTXSTG.TP_REV_SUMMARY B ON (A.ACCOUNT_KEY = B.ACCOUNT_KEY AND A.YEAR = B.YEAR_NM) LEFT JOIN SDTXSTG.TP_BRAND_SUMMARY C ON (A.ACCOUNT_KEY = C.ACCOUNT_KEY AND A.YEAR = C.YEAR_NM) LEFT JOIN SDTXSTG.BMDIV_DIM D ON (C.BMDIV_KEY = D.BMDIV_KEY) WHERE " + request.body.params.query, function(err,data){								
				if (err) {
					console.log(err);
				} else {
					response.send(data);
				}

				conn.close();
			});
		}
	});
});

//Update Revenue Mapping Approval
router.post('/RRIW/updateRevenueMappingApproval', function(request, response) {
	let record = request.body.params.record;
	let query = "INSERT INTO SDTXSTG.TXPT_TP_REV_SGMT_CHANGE_DATA_SHADOW (ACCT_CD, ACCT_CLASS_CD, ACCT_DESC, COA_LVL1_CD, YEAR, TP_REV_PARENT1, TP_REV_PARENT2, TP_REV_PARENT3, TP_REV_PARENT4, TP_REV_PARENT5, REQUEST_ID, REQUEST_BY, REQUEST_TS) VALUES "
	let logQuery = "INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, STATUS_COMMENT) VALUES "

	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT SDTXSTG.TXPT_TP_REV_APPROVAL_REQ() FROM SYSIBM.SYSDUMMY1", function (err, data) {
				if (err) {
					console.log(err);
				} else {
					let REQUEST_ID = data[0]['1'].trim();
					
					for(let key in request.body.params.entries){
						query += "('" + request.body.params.entries[key].ACCT_CD + "', '" + request.body.params.entries[key].ACCT_CLASS_CD + "', '" + request.body.params.entries[key].ACCT_DESC + "', '" + request.body.params.entries[key].COA_LVL1_CD + "', '" + record.YEAR + "', '" + record.TP_REV_PARENT1 + "', '" + record.TP_REV_PARENT2 + "', '" + record.TP_REV_PARENT3 + "', '" + record.TP_REV_PARENT4 + "', '" + record.TP_REV_PARENT5 + "', '" + REQUEST_ID + "', '" + record.REQUEST_BY + "', CURRENT TIMESTAMP),"
						logQuery += "('Transfer Pricing-Reveune Mapping', '" + request.body.params.entries[key].KEYVALUE_INFO + "','" + REQUEST_ID + "', 'P', '"+ record.REQUEST_BY +"', CURRENT TIMESTAMP, ''),"
					}

					conn.query(query.slice(0, -1), function(err,data){
						if (err) {
							console.log(err);
							response.send(errorHanlder(err.message))
						} else {
							conn.query(logQuery.slice(0, -1),function (err, data){
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

//Cancel Revenue Mapping Request
router.post('/RRIW/cancelRevenueMappingApproval', function(request, response) {
	let record = request.body.params.record;

	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT REQUEST_ID FROM SDTXSTG.TXPT_TP_REV_SGMT_CHANGE_DATA_SHADOW WHERE YEAR=? AND ACCT_CD=?", [record.YEAR, record.ACCT_CD], function (err, data){
				if(err) {
					console.error("error: ", err.message);
				} else {
					let ID = getRequestId(data)
					conn.query("DELETE FROM SDTXSTG.TXPT_TP_REV_SGMT_CHANGE_DATA_SHADOW WHERE REQUEST_ID = '" + ID + "'", function (err, deleteData) {
						if(err) {
							console.error("error: ", err.message);
						} else {
							conn.query("SELECT * FROM SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG WHERE REQUEST_ID = '" + ID + "'", function (err, requestData) { 
								if(err) {
									console.error("error: ", err.message);
								} else {
									for (let key in requestData){
										let query = "INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES ";
									
										query += "('" + 'Transfer Pricing-Reveune Mapping' + "', '" + requestData[key].KEYVALUE_INFO + "', '" + requestData[key].REQUEST_ID + "', 'C', '" + requestData[key].REQUESTED_BY  + "', '" + requestData[key].REQUESTED_TS  + "', '"  + requestData[key].REQUESTED_BY + "', CURRENT TIMESTAMP, '')";

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