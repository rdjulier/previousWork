var sortBy = require('sort-by'), resultSet = [];
var router = express.Router();
var errorHanlder = require('../errorHandler')

function getMilliseconds(time){
	for (var i=0; i<time.length; i++){
		time[i].UPDATED_TS = new Date(time[i].UPDATED_TS).getTime();
	}
	return time;
}

//Get Bolt-ons Pending Requests
router.post('/RRIW/getRequestDataBoltons', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
		    console.log(err);
			response.send(errorHanlder(err.message))
		} else {
			let countryID = request.body.params.countryID;
			conn.query("SELECT bcds.TP_ACCT_PARENT1 AS NEW_TP_ACCT_PARENT1, bcds.MONTH as NEW_MONTH, bcds.ATTACHMENT as NEW_ATTACHMENT, bcds.BMDIV AS NEW_BMDIV, bcds.TP_GRP_NM1 AS NEW_TP_GRP_NM1, bcds.TP_DESCR_SHORT AS NEW_TP_DESCR_SHORT, bcds.TP_DESCR_LONG AS NEW_TP_DESCR_LONG, bcds.TP_CALC_TYPE AS NEW_TP_CALC_TYPE, bcds.TP_INCEXC_TYPE AS NEW_TP_INCEXC_TYPE, bcds.TP_INCEXC_TYPE AS NEW_TP_INCEXC_TYPE, bcds.TP_CURR_TYP AS NEW_TP_CURR_TYP, bcds.TP_AMT AS NEW_TP_AMT, bcds.REQUEST_TS, bcds.REQUEST_ID, bcds.REQUEST_BY, b.* FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW bcds, SDTXSTG.TP_BOLTONS b WHERE bcds.TP_SEQNO = b.TP_SEQNO", function(err, data){
				if (err) {
					console.log(err);
				} else {
					resultSet = data;
					getMilliseconds(resultSet);
					resultSet.sort(sortBy('-UPDATED_TS'));
					conn.query("SELECT * FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW", function (err, data) {
						for (let key in data) {
							if (data[key].TP_SEQNO.substring(9, 10) == 'I') {
								data[key].TYPE = 'INSERT';
								resultSet.push(data[key])
							}

							if (data[key].TP_SEQNO.substring(9, 10) == 'D') {
								data[key].TYPE = 'DELETE';
								resultSet.push(data[key])
							}
						}
						response.send(resultSet);
					})
				}

				conn.close();
			});
		}
	});
});

//Mass Update Boltons
router.post('/RRIW/updateBoltons', function (request, response) {
	let record = request.body.params.record
	let massUpdate = request.body.params.massUpdate;
	let approvalType = request.body.params.approvalType;
	let approver = request.body.params.approver;

	if (approvalType == 'APPROVE') {
		for (let key in massUpdate) {
			let query = '';

			bludb.open(connectionRRIW, function (err, conn) {
				if (err) {
					console.error("Connection error: ", err.message);
				} else {
					conn.query("SELECT * FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE REQUEST_ID = '" + massUpdate[key].REQUEST_ID + "'", function(err,data){
						if (err) {
							console.error("Connection error: ", err.message);
						} else {
							record = data[0];
							record.REQUEST_ID = record.REQUEST_ID.trim();
							record.APPROVE_BY = approver;

							if (massUpdate[key].TYPE == 'DELETE') {

								conn.query("DELETE FROM SDTXSTG.TP_BOLTONS WHERE TP_SEQNO LIKE '" + massUpdate[key].TP_SEQNO.substring(0, 9) + "%'", function(err,data){
									if (err) {
										console.log(err);
								        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
									} else {
										conn.query("DELETE FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE TP_SEQNO LIKE '" + massUpdate[key].TP_SEQNO.substring(0, 9) + "%'", function(err,data){
											if (err) {
												console.log(err);
										        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
											} else {
												conn.query("DELETE FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE TP_SEQNO LIKE '" + massUpdate[key].TP_SEQNO.substring(0, 9) + "%'", function(err,data){
													if (err) {
														console.log(err);
												        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
													} else {
														conn.query("INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES (?, ?, ?, ?, ?, CURRENT TIMESTAMP, ?, CURRENT TIMESTAMP, ?)",
															['Transfer Pricing-Boltons', '{TP_SEQNO: ' + massUpdate[key].TP_SEQNO.substring(0, 9) + '}', record.REQUEST_ID, 'A', record.REQUEST_BY, record.APPROVE_BY, ''], function(err,data){
															if (err) {
																console.log(err);
														        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
															} else {
																console.log("Success");
																if (parseInt(key) == massUpdate.length - 1) response.send('Success')
															}
														})
														conn.close();
													}
												})
											}
										});
									}
								})
							}

							if (massUpdate[key].TYPE == 'INSERT') {
								massUpdate[key].TP_SEQNO += 'I';

								query += 'INSERT INTO SDTXSTG.TP_BOLTONS (TP_SEQNO, MONTH, TP_ACCT_TYPE, YEAR, LCTRYNUM, ENTITY_CODE, TP_ACCT_PARENT1, TP_GRP_NM1, TP_DESCR_SHORT, TP_DESCR_LONG, TP_CALC_TYPE, TP_INCEXC_TYPE, TP_CURR_TYP, TP_CURR, TP_AMT, ATTACHMENT, ATTACHMENT_DESCRIPTION, BMDIV, CREATED_BY, CREATED_TS, UPDATED_BY, UPDATED_TS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT TIMESTAMP, ?, CURRENT TIMESTAMP)';
								
								conn.query(query, [record.TP_SEQNO.substring(0, 9), record.MONTH.substring(0, 2), record.MONTH.substring(2, 3), record.YEAR, record.LCTRYNUM, record.ENTITY_CODE, record.TP_ACCT_PARENT1, record.TP_GRP_NM1, record.TP_DESCR_SHORT, record.TP_DESCR_LONG, record.TP_CALC_TYPE, record.TP_INCEXC_TYPE, record.TP_CURR_TYP, record.TP_CURR, record.TP_AMT, record.ATTACHMENT, '', 'NO_BMDIV', record.REQUEST_BY, record.REQUEST_BY], function(err,data){
									if (err) {
										console.log(err);
								        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
									} else {
										conn.query("DELETE FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE TP_SEQNO LIKE '" + massUpdate[key].TP_SEQNO.substring(0, 9) + "%'", function(err,data){
											if (err) {
												console.log(err);
										        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
											} else {
												conn.query("DELETE FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE TP_SEQNO LIKE '" + massUpdate[key].TP_SEQNO.substring(0, 9) + "%'", function(err,data){
													if (err) {
														console.log(err);
												        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
													} else {
														conn.query("INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES (?, ?, ?, ?, ?, CURRENT TIMESTAMP, ?, CURRENT TIMESTAMP, ?)",
															['Transfer Pricing-Boltons', '{TP_SEQNO: ' + massUpdate[key].TP_SEQNO.substring(0, 9) + '}', record.REQUEST_ID, 'A', record.REQUEST_BY, record.APPROVE_BY, ''], function(err,data){
															if (err) {
																console.log(err);
														        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
															} else {
																console.log("Success");
																if (parseInt(key) == massUpdate.length - 1) response.send('Success')
															}
														})
														conn.close();
													}
												})
											}
										})
									}
								})
							}

							if (massUpdate[key].TYPE == 'UPDATE') {
								query += 'UPDATE SDTXSTG.TP_BOLTONS SET TP_ACCT_PARENT1=?, MONTH=?, TP_ACCT_TYPE=?, TP_GRP_NM1=?, TP_DESCR_SHORT=?, TP_DESCR_LONG=?, TP_CALC_TYPE=?, TP_INCEXC_TYPE=?, TP_CURR_TYP=?, TP_CURR=?, TP_AMT=?, ATTACHMENT=?, BMDIV=?, UPDATED_BY=?, UPDATED_TS=CURRENT TIMESTAMP WHERE TP_SEQNO=?';
								
								conn.query(query, [record.TP_ACCT_PARENT1, record.MONTH.substring(0, 2), record.MONTH.substring(2, 3), record.TP_GRP_NM1, record.TP_DESCR_SHORT, record.TP_DESCR_LONG, record.TP_CALC_TYPE, record.TP_INCEXC_TYPE, record.TP_CURR_TYP, record.TP_CURR, record.TP_AMT, record.ATTACHMENT, 'NO_BMDIV', approver, record.TP_SEQNO], function(err,data){
									if (err) {
										console.log(err);
								        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
									} else {
										conn.query("DELETE FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE TP_SEQNO LIKE '" + massUpdate[key].TP_SEQNO.substring(0, 9) + "%'", function(err,data){
											if (err) {
												console.log(err);
										        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
											} else {
												conn.query("DELETE FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE TP_SEQNO LIKE '" + massUpdate[key].TP_SEQNO.substring(0, 9) + "%'", function(err,data){
													if (err) {
														console.log(err);
												        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
													} else {
														conn.query("INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES (?, ?, ?, ?, ?, CURRENT TIMESTAMP, ?, CURRENT TIMESTAMP, ?)",
															['Transfer Pricing-Boltons', '{TP_SEQNO: ' + massUpdate[key].TP_SEQNO.substring(0, 9) + '}', record.REQUEST_ID, 'A', record.REQUEST_BY, record.APPROVE_BY, ''], function(err,data){
															if (err) {
																console.log(err);
														        if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
															} else {
																console.log("Success");
																if (parseInt(key) == massUpdate.length - 1) response.send('Success')
															}
														})
														conn.close();
													}
												})
											}
										})
									}
								})
							}
						}
					}
				)};
			})
		}
	}

	if (approvalType == 'REJECT') {
		for (let key in massUpdate) {
			bludb.open(connectionRRIW, function (err, conn) {
				if (err) {
					console.error("Connection error: ", err.message);
				} else {
					if (massUpdate[key].TYPE == 'DELETE') {
						massUpdate[key].TP_SEQNO += 'D';
					}

					if (massUpdate[key].TYPE == 'INSERT') {
						massUpdate[key].TP_SEQNO += 'I';
					}

					conn.query("SELECT * FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE REQUEST_ID = '" + massUpdate[key].REQUEST_ID + "'", function(err,data){
						if (err) {
							console.log(err);
							if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
						} else {
							record = data[0];
							conn.query("DELETE FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE TP_SEQNO='" + massUpdate[key].TP_SEQNO + "'", function(err,data){
								if (err) {
									console.log(err);
									if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
								} else {
									conn.query("UPDATE SDTXSTG.TP_BOLTONS_REQUESTS SET STATUS='REJECTED', UPDATED_TS=CURRENT TIMESTAMP WHERE TP_SEQNO LIKE '" + massUpdate[key].TP_SEQNO.substring(0, 9) + "%'", function(err,data){
										if (err) {
											console.log(err);
											if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
										} else {
											conn.query("INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES (?, ?, ?, ?, ?, CURRENT TIMESTAMP, ?, CURRENT TIMESTAMP, ?)",
												['Transfer Pricing-Boltons', '{TP_SEQNO: ' + massUpdate[key].TP_SEQNO.substring(0, 9) + '}', record.REQUEST_ID, 'R', record.REQUEST_BY, approver, request.body.params.record.STATUS_COMMENT], function(err,data){
												if (err) {
													console.log(err);
													if (parseInt(key) == massUpdate.length - 1) response.send(errorHanlder(err.message))
												} else {
													console.log("Success");
													if (parseInt(key) == massUpdate.length - 1) response.send('Success')
												}
											})
											conn.close();
										}
									})
								}
							});
						}
					});
				}
			})
		}
	}
});

module.exports = router;