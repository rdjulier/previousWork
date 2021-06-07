var router = express.Router();
var errorHanlder = require('../errorHandler')

//Get Year Options for Brand Mapping
router.post('/RRIW/getBrandMappingYears', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT YEAR FROM SDTXSTG.TP_BRAND_SGMT ORDER BY YEAR DESC", function(err, data){
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

//Get Account Options for Brand Mapping
router.post('/RRIW/getAccounts', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT ACCT_CD, LEFT(ACCT_DESC, 15) AS ACCT_DESC FROM SDTXSTG.TP_BRAND_SGMT WHERE YEAR = '"+ request.body.params.year +"'", function(err, data){
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

//Get Account Options for Brand Mapping Mass
router.post('/RRIW/getAccountsMass', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT ACCT_CD, LEFT(ACCT_DESC, 15) AS ACCT_DESC FROM SDTXSTG.TP_BRAND_SGMT WHERE YEAR = '"+ request.body.params.year +"' AND TP_GRP_NM = '" + request.body.params.groupName + "'", function(err, data){
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

//Get COA Level1 Options for Brand Mapping
router.post('/RRIW/getCoaLevel1', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT COA_LVL1_CD FROM SDTXSTG.TP_BRAND_SGMT WHERE YEAR = '"+ request.body.params.year +"' AND ACCT_CD = '"+ request.body.params.account +"'", function(err, data){
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

//Get COA Level1 Options for Brand Mapping Mass
router.post('/RRIW/getCoaLevel1Mass', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT COA_LVL1_CD FROM SDTXSTG.TP_BRAND_SGMT WHERE YEAR = '"+ request.body.params.year + "'", function(err, data){
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

//Get Brand Mapping Filter Options
router.post('/RRIW/getBrandMappingOptions', function (request, response) {
	bludb.open(connectionRRIW, function (err, conn) {
		if (err) {
			console.error("Connection error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT BMDIV, TP_GRP_NM FROM SDTXSTG.TP_BRAND_SGMT WHERE YEAR='"+ request.body.params.year +"' AND ACCT_CD='"+ request.body.params.account +"' AND COA_LVL1_CD = '"+ request.body.params.coaLevel1 +"'", function (err, data) {
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

//Get Brand Mapping Filter Options Mass
router.post('/RRIW/getBrandMappingOptionsMass', function (request, response) {
	bludb.open(connectionRRIW, function (err, conn) {
		// let brandOptions = [];

		if (err) {
			console.error("Connection error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT BMDIV, TP_GRP_NM FROM SDTXSTG.TP_BRAND_SGMT WHERE YEAR='"+ request.body.params.year +"'", function (err, data) {
				if (err) {
					console.log(err);
				} else {
					// brandOptions = data;
					// conn.query("SELECT * FROM SDTXSTG.TP_BRAND_HIERARCHY ORDER BY SEQNO", function(err,data){
					// 	for (let key in brandOptions) {
					// 		for (let keys in data) {
					// 			if(brandOptions[key].TP_GRP_NM != null){
					// 				if (data[keys].TP_GRP_NM.trim() == brandOptions[key].TP_GRP_NM.trim()) {
					// 					brandOptions[key].SEQNO = data[keys].SEQNO;
					// 				}
					// 			}
					// 		}
					// 	}

						response.send(data);
					// });
				}
				conn.close();
			});
		}
	});
});

//Get Brand Mapping
router.post('/RRIW/getBrandMapping', function (request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			// conn.query("SELECT A.*, B.AMT_USD FROM SDTXSTG.TP_BRAND_SGMT A LEFT JOIN SDTXSTG.TP_BRAND_SUMMARY B ON (A.ACCOUNT_KEY = B.ACCOUNT_KEY AND A.BMDIV_KEY = B.BMDIV_KEY AND A.YEAR = B.YEAR_NM) WHERE " + request.body.params.record, function(err,data){
			conn.query("SELECT A.*, B.AMT_USD FROM SDTXSTG.TP_BRAND_SGMT A LEFT JOIN SDTXSTG.TP_BRAND_SUMMARY B ON (A.YEAR = B.YEAR_NM AND A.ACCOUNT_KEY = B.ACCOUNT_KEY AND A.BMDIV_KEY = B.BMDIV_KEY) WHERE " + request.body.params.record, function(err,data){
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

//Get Parent Values for Brand Mapping
router.post('/RRIW/getBrandParentValues', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT * FROM SDTXSTG.TP_BRAND_HIERARCHY", function(err, data){
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

//Update Brand Mapping Approval
router.post('/RRIW/updateBrandMappingApproval', function(request, response) {
	let record = request.body.params.record;
	let query = "INSERT INTO SDTXSTG.TXPT_TP_BRAND_SGMT_CHANGE_DATA_SHADOW (YEAR, ACCT_CD, ACCT_CLASS_CD, COA_LVL1_CD, ACCT_DESC, TP_GRP_NM, TP_GRP_PARENT1, TP_GRP_PARENT2, TP_GRP_PARENT3, TP_GRP_PARENT4, UNIQUE_CD, REQUEST_ID, REQUEST_BY, REQUEST_TS) VALUES "
	let logQuery = "INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, STATUS_COMMENT) VALUES "

	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT SDTXSTG.TXPT_TP_BRAND_APPROVAL_REQ() FROM SYSIBM.SYSDUMMY1", function (err, data) {
				if (err) {
					console.log(err);
				} else {
					let REQUEST_ID = data[0]['1'].trim();

					for(let key in request.body.params.entries){
						query += "('" + request.body.params.entries[key].YEAR + "', '" + request.body.params.entries[key].ACCT_CD + "', '" + request.body.params.entries[key].ACCT_CLASS_CD + "', '" + request.body.params.entries[key].COA_LVL1_CD + "', '" + request.body.params.entries[key].ACCT_DESC + "', '" + record.TP_GRP_NM + "', '" + record.TP_GRP_PARENT1 + "', '" + record.TP_GRP_PARENT2 + "', '" + record.TP_GRP_PARENT3 + "', '" + record.TP_GRP_PARENT4 + "', '" + request.body.params.entries[key].BMDIV + request.body.params.entries[key].COA_LVL1_CD + request.body.params.entries[key].ACCT_CD + "', '" + REQUEST_ID + "', '" + record.REQUEST_BY + "', CURRENT TIMESTAMP),"
						logQuery += "('Transfer Pricing-Brand Mapping', '" + request.body.params.entries[key].KEYVALUE_INFO + "','" + REQUEST_ID + "', 'P', '"+ record.REQUEST_BY +"', CURRENT TIMESTAMP, ''),"
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

//Cancel Brand Mapping Request
router.post('/RRIW/cancelBrandMappingApproval', function(request, response) {
	let record = request.body.params.record;

	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT REQUEST_ID FROM SDTXSTG.TXPT_TP_BRAND_SGMT_CHANGE_DATA_SHADOW WHERE YEAR=? AND UNIQUE_CD=?", [record.YEAR, record.UNIQUE_CD], function (err, data){
				if(err) {
					console.error("error: ", err.message);
				} else {
					let ID = getRequestId(data)
					conn.query("DELETE FROM SDTXSTG.TXPT_TP_BRAND_SGMT_CHANGE_DATA_SHADOW WHERE REQUEST_ID = '" + ID + "'", function (err, deleteData) {
						if(err) {
							console.error("error: ", err.message);
						} else {
							conn.query("SELECT * FROM SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG WHERE REQUEST_ID = '" + ID + "'", function (err, requestData) { 
								if(err) {
									console.error("error: ", err.message);
								} else {
									for (let key in requestData){
										let query = "INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES ";
									
										query += "('" + 'Transfer Pricing-Brand Mapping' + "', '" + requestData[key].KEYVALUE_INFO + "', '" + requestData[key].REQUEST_ID + "', 'C', '" + requestData[key].REQUESTED_BY  + "', CURRENT TIMESTAMP, '"  + requestData[key].REQUESTED_TS + "', CURRENT TIMESTAMP, '')";

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