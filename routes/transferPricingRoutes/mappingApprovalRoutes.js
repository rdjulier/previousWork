var router = express.Router();
var errorHanlder = require('../errorHandler')

//Get Revenue Account Pending Requests
router.post('/RRIW/getRevenueAccountPendingRequests', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT ttrscds.*, trs.TP_REV_PARENT1 AS OLD_TP_REV_PARENT1, trs.TP_REV_PARENT2 AS OLD_TP_REV_PARENT2, trs.TP_REV_PARENT3 AS OLD_TP_REV_PARENT3, trs.TP_REV_PARENT4 AS OLD_TP_REV_PARENT4, trs.TP_REV_PARENT5 AS OLD_TP_REV_PARENT5 FROM SDTXSTG.TXPT_TP_REV_SGMT_CHANGE_DATA_SHADOW ttrscds, SDTXSTG.TP_REV_SGMT trs WHERE ttrscds.YEAR = trs.YEAR AND ttrscds.ACCT_CD = trs.ACCT_CD", function(err, data){
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

//Update Revenue Mapping
router.post('/RRIW/updateRevenueMapping', function(request, response) {
	let record = request.body.params.record;
	
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			record.forEach(function (item, index){
				conn.query("UPDATE SDTXSTG.TP_REV_SGMT SET TP_REV_PARENT1=?, TP_REV_PARENT2=?, TP_REV_PARENT3=?, TP_REV_PARENT4=?, TP_REV_PARENT5=? WHERE YEAR=? AND ACCT_CD=?", 
					[item.TP_REV_PARENT1, item.TP_REV_PARENT2, item.TP_REV_PARENT3, item.TP_REV_PARENT4, item.TP_REV_PARENT5, item.YEAR, item.ACCT_CD], function(err,data){
					if (err) {
						console.log(err);
						if (parseInt(index) == record.length - 1) response.send(errorHanlder(err.message))
					} else {
						console.log("Success");
						if (parseInt(index) == record.length - 1) response.send("Success")
					};
					conn.close()
				});
			})		
		}
	});
});

//Add Mapping Log
router.post('/RRIW/updateMappingLog', function(request, response) {
	let record = request.body.params.record;
	let type = request.body.params.type

	let tableName = '', tabName = ''

	switch(type){
		case 'Revenue':
			tableName = 'TXPT_TP_REV_SGMT_CHANGE_DATA_SHADOW';
			tabName = 'Transfer Pricing-Revenue Mapping'
			break;

		case 'Brand':
			tableName = 'TXPT_TP_BRAND_SGMT_CHANGE_DATA_SHADOW';
			tabName = 'Transfer Pricing-Brand Mapping'
			break;

		case 'Expense':
			tableName = 'TXPT_TP_EXP_SGMT_CHANGE_DATA_SHADOW';
			tabName = 'Transfer Pricing-Expense Mapping'
			break;
	}


	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			record.forEach(function (item, index){
				conn.query("SELECT REQUEST_ID FROM SDTXSTG." + tableName + " WHERE ACCT_CD=" + item.ACCT_CD, function (err, data) {
                    if(err) {
                        console.error("error: ", err.message);
                    } else {
						let REQUEST_ID = data[0].REQUEST_ID;

						let query = "INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES ";
                        query += "('" + tabName + "', '" + item.KEYVALUE_INFO + "', '" + REQUEST_ID + "', '" + item.STATUS_CD + "', '" + item.REQUEST_BY  + "', '" + item.REQUEST_TS  + "', '"  + item.APPROVE_BY + "', CURRENT TIMESTAMP, '" + item.COMMENT + "')";

                        conn.query(query, function (err, queryGLmapping) {
							if (err) {
								console.log(err);
				                response.send(errorHanlder(err.message))
							} else {
								conn.query("DELETE FROM SDTXSTG." + tableName + " WHERE ACCT_CD=" + item.ACCT_CD, function(err, data){
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log('Success');
                                        response.send("Success")
									};
									conn.close();
                                });
                            }
                        })
					}
				})
			})
		}
	})
})

//Get Brand Pending Requests
router.post('/RRIW/getBrandPendingRequests', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT ttbscds.*, tbs.BMDIV, RTRIM(tbs.TP_GRP_NM) AS OLD_TP_GRP_NM, RTRIM(tbs.TP_GRP_PARENT1 )AS OLD_TP_GRP_PARENT1, RTRIM(tbs.TP_GRP_PARENT2) AS OLD_TP_GRP_PARENT2, RTRIM(tbs.TP_GRP_PARENT3) AS OLD_TP_GRP_PARENT3, RTRIM(tbs.TP_GRP_PARENT4) AS OLD_TP_GRP_PARENT4 FROM SDTXSTG.TXPT_TP_BRAND_SGMT_CHANGE_DATA_SHADOW ttbscds, SDTXSTG.TP_BRAND_SGMT tbs WHERE ttbscds.YEAR = tbs.YEAR AND ttbscds.UNIQUE_CD = tbs.UNIQUE_CD", function(err, data){
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

//Update Brand Mapping
router.post('/RRIW/updateBrandMapping', function(request, response) {
	let record = request.body.params.record;
	
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			record.forEach(function (item, index){
				conn.query("UPDATE SDTXSTG.TP_BRAND_SGMT SET TP_GRP_NM=?, TP_GRP_PARENT1=?, TP_GRP_PARENT2=?, TP_GRP_PARENT3=?, TP_GRP_PARENT4=? WHERE YEAR=? AND UNIQUE_CD=?", 
					[item.TP_GRP_NM, item.TP_GRP_PARENT1, item.TP_GRP_PARENT2, item.TP_GRP_PARENT3, item.TP_GRP_PARENT4, item.YEAR, item.UNIQUE_CD], function(err,data){
					if (err) {
						console.log(err);
						if (parseInt(index) == record.length - 1) response.send(errorHanlder(err.message))
					} else {
						console.log("Success");
						if (parseInt(index) == record.length - 1) response.send("Success")
					};
					conn.close();
				});
			})		
		}
	});
});

//Get Expense Account Pending Requests
router.post('/RRIW/getExpenseAccountPendingRequests', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT ttescds.*, tes.BMDIV, tes.TP_EXP_PARENT1 AS OLD_TP_EXP_PARENT1, tes.TP_EXP_PARENT2 AS OLD_TP_EXP_PARENT2, tes.TP_EXP_PARENT3 AS OLD_TP_EXP_PARENT3, tes.TP_EXP_PARENT4 AS OLD_TP_EXP_PARENT4, tes.TP_EXP_PARENT5 AS OLD_TP_EXP_PARENT5, tes.TP_EXP_PARENT6 AS OLD_TP_EXP_PARENT6, tes.TP_EXP_PARENT7 AS OLD_TP_EXP_PARENT7 FROM SDTXSTG.TXPT_TP_EXP_SGMT_CHANGE_DATA_SHADOW ttescds, SDTXSTG.TP_EXP_SGMT tes WHERE ttescds.YEAR = tes.YEAR AND ttescds.ACCT_CD = tes.ACCT_CD AND ttescds.BMDIV_CD = tes.BMDIV", function(err, data){
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

//Update Expense Mapping
router.post('/RRIW/updateExpenseMapping', function(request, response) {
	let record = request.body.params.record;
	
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			record.forEach(function (item, index){
				conn.query("UPDATE SDTXSTG.TP_EXP_SGMT SET TP_EXP_PARENT1=?, TP_EXP_PARENT2=?, TP_EXP_PARENT3=?, TP_EXP_PARENT4=?, TP_EXP_PARENT5=?, TP_EXP_PARENT6=?, TP_EXP_PARENT7=? WHERE YEAR=? AND ACCT_CD=? AND BMDIV=?", 
					[item.TP_EXP_PARENT1, item.TP_EXP_PARENT2, item.TP_EXP_PARENT3, item.TP_EXP_PARENT4, item.TP_EXP_PARENT5, item.TP_EXP_PARENT6, item.TP_EXP_PARENT7, item.YEAR, item.ACCT_CD, item.BMDIV], function(err,data){
					if (err) {
						console.log(err);
						if (parseInt(index) == record.length - 1) response.send(errorHanlder(err.message))
					} else {
						console.log("Success");
						if (parseInt(index) == record.length - 1) response.send("Success")
					};
					conn.close();
				});
			})		
		}
	});
});

module.exports = router;