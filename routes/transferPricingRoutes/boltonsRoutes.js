var router = express.Router();
var errorHanlder = require('../errorHandler')

//Get Countries List for Boltons 
router.post('/RRIW/countriesList', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT A.TBCTY, B.CTRYNAM FROM SDTXSTG.LEGAL_ENTITY_DIM A, SDTXSTG.GEO_DIM B WHERE A.TBCTY= B.CTRYNUM ORDER BY 2 ASC", function(err, data){
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


//Get Entity Code for Boltons 
router.post('/RRIW/getBoltonsEntity', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT ENTITY_CODE, CURRENCY_TYPE, ENTITY_DESC FROM SDTXSTG.LEGAL_ENTITY_DIM WHERE TBCTY='" + request.body.params.TBCTY + "' AND LC_TYPE IN ('LGL') AND CURRENCY_TYPE NOT IN ('','NULL') ORDER BY ENTITY_CODE", function(err, data){
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

//Get Currency Types for Boltons 
router.post('/RRIW/getBoltonsCurrency', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT ENTITY_CODE, CURRENCY_TYPE FROM SDTXSTG.LEGAL_ENTITY_DIM WHERE LC_TYPE IN ('LGL') AND CURRENCY_TYPE NOT IN ('','NULL') ORDER BY ENTITY_CODE", function(err, data){
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

//Get Year Options for Boltons
router.post('/RRIW/getBoltonsYear', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT YR FROM SDTXSTG.LEGAL_ENTITY_DIM WHERE ENTITY_CODE='" + request.body.params.ENTITY_CODE + "' AND TBCTY='" + request.body.params.TBCTY + "' ORDER BY YR DESC", function(err, data){
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

//Get Entity Code Combinations 
router.post('/RRIW/getBoltonsEntityImport', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT DISTINCT TBCTY, ENTITY_CODE FROM SDTXSTG.LEGAL_ENTITY_DIM WHERE LC_TYPE IN ('LGL','ELM')", function(err, data){
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

//Get Boltons
router.post('/RRIW/getBoltons', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS WHERE " + request.body.params.query, function(err, data){
				if (err) {
					console.log(err);
				} else {
					for (let key in data) {
						data[key].STATUS = 'APPROVED';
					}

					if(request.body.params.type == 'Approved Records Only'){
						response.send(data);
					} else if(request.body.params.type == 'All Records') {
						conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE " + request.body.params.query, function(err, dataRequests){
							if (err) {
								console.log(err);
							} else {
								conn.query("SELECT KEYVALUE_INFO, STATUS_COMMENT FROM SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG WHERE TABNAME='Transfer Pricing-Boltons' ORDER BY APPROVED_TS", function(err, dataStatus){
									if (err) {
										console.log(err);
									} else {
										for (let key in dataRequests) {
											if (dataRequests[key].STATUS == 'REJECTED' || dataRequests[key].STATUS == 'R') {
												for (let keys in dataStatus) {
													let keyvalue = dataStatus[keys].KEYVALUE_INFO.split(': ')[1].split('}')[0];
													if (dataRequests[key].TP_SEQNO.substring(0, 9) == keyvalue) {
														dataRequests[key].COMMENT = dataStatus[keys].STATUS_COMMENT;
													}
												}
											}
	
											data.push(dataRequests[key])
										}
										response.send(data);
									}
								})
								conn.close();
							}
						});
					} else {
						if (request.body.params.query != '') {
							conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE STATUS IN ('Draft','Pending') AND " + request.body.params.query, function(err, dataRequests){
								if (err) {
									console.log(err);
								} else {
									for (let key in dataRequests) {
										data.push(dataRequests[key])
										}
									response.send(data);
								}
							})
						} else {
							conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE STATUS IN ('Draft','Pending')", function(err, dataRequests){
								if (err) {
									console.log(err);
								} else {
									for (let key in dataRequests) {
										data.push(dataRequests[key])
										}
									response.send(data);
								}
							})
						}
					}
				};
			});
		}
	});
});

//Get Group Names for Boltons
router.post('/RRIW/getBoltonsGroup', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("WITH TEMP (KEY,PARENT, LVL) AS (SELECT TP_GRP_NM, TP_PARENT_KEY, 1 AS LVL FROM SDTXSTG.TP_BRAND_HIERARCHY WHERE TRIM(TP_PARENT_KEY) = '' UNION ALL SELECT B.TP_GRP_NM, B.TP_PARENT_KEY, TEMP.LVL+1 AS LVL FROM SDTXSTG.TP_BRAND_HIERARCHY B, TEMP WHERE TEMP.KEY = B.TP_PARENT_KEY AND TEMP.LVL < 10000) SELECT KEY, PARENT, LVL FROM TEMP ORDER BY LVL", function(err, data){
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

//Get Parent1 Options for Boltons
router.post('/RRIW/getParent1Boltons', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("WITH TEMP (KEY,PARENT, LVL) AS (SELECT TP_EXP_PARENT1, TP_PARENT_KEY, 1 AS LVL FROM SDTXSTG.TP_EXP_HIERARCHY WHERE TRIM(TP_PARENT_KEY) = '' UNION ALL SELECT B.TP_EXP_PARENT1, B.TP_PARENT_KEY, TEMP.LVL+1 AS LVL FROM SDTXSTG.TP_EXP_HIERARCHY B, TEMP WHERE TEMP.KEY = B.TP_PARENT_KEY AND TEMP.LVL < 10000) SELECT KEY,PARENT, LVL FROM TEMP ORDER BY LVL", function(err, dataExp){
				if (err) {
					console.log(err);
				} else {
					conn.query("WITH TEMP (KEY,PARENT, LVL) AS (SELECT TP_REV_PARENT1, TP_PARENT_KEY, 1 AS LVL FROM SDTXSTG.TP_REV_HIERARCHY WHERE TRIM(TP_PARENT_KEY) = '' UNION ALL SELECT B.TP_REV_PARENT1, B.TP_PARENT_KEY, TEMP.LVL+1 AS LVL FROM SDTXSTG.TP_REV_HIERARCHY B, TEMP WHERE TEMP.KEY = B.TP_PARENT_KEY AND TEMP.LVL < 10000) SELECT KEY, PARENT, LVL FROM TEMP ORDER BY LVL", function(err, dataRev){
						if (err) {
							console.log(err);
						} else {
							let data = [];

							for (let key in dataExp) {
								if (dataExp[key]) {
									data.push(dataExp[key].KEY)
								}
							}

							for (let key in dataRev) {
								if (dataRev[key]) {
									data.push(dataRev[key].KEY)
								}
							}

							data = [...new Set(data)];		

							for (let key in data) {
								if (data[key] == '') {
									data.splice(key, 1)
								}
							}

							for (let key in data) {
								for (let keyExp in dataExp) {
									if (data[key] == dataExp[keyExp].KEY) {
										data[key] = {PARENT: dataExp[keyExp].KEY, TYPE: 'E'}
									}
								}

								for (let keyRev in dataRev) {
									if (data[key] == dataRev[keyRev].KEY) {
										data[key] = {PARENT: dataRev[keyRev].KEY, TYPE: 'R'}
									}
								}
							}

							response.send(data);
						};
					});
					
					conn.close();
				}
			});
		}}
	)}
);

//Add Boltons to Requests Table
router.post('/RRIW/addBoltonsRequests', function(request, response) {
	let record = request.body.params.record;

	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE TP_SEQNO LIKE '" + record.TP_SEQNO.substring(0, 9) + "%'", function (err, data){
				if (err) {
					console.log(err);
					response.send(errorHanlder(err.message))
				} else {
					if(data.length > 0){
						conn.query("UPDATE SDTXSTG.TP_BOLTONS_REQUESTS SET YEAR=?, MONTH=?, LCTRYNUM=?, ENTITY_CODE=?, TP_ACCT_PARENT1=?, TP_GRP_NM1=?, TP_DESCR_SHORT=?, TP_DESCR_LONG=?, TP_CALC_TYPE=?, TP_INCEXC_TYPE=?, TP_CURR_TYP=?, TP_CURR=?, TP_AMT=?, ATTACHMENT=?, ATTACHMENT_DESCRIPTION=?, BMDIV=?, CREATED_BY=?, CREATED_TS=?, UPDATED_BY=?, UPDATED_TS=CURRENT TIMESTAMP, TP_ACCT_TYPE=?, STATUS=? WHERE TP_SEQNO LIKE '" + record.TP_SEQNO.substring(0, 9) + "%'"
							,[data[0].YEAR, data[0].MONTH, data[0].LCTRYNUM, data[0].ENTITY_CODE, data[0].TP_ACCT_PARENT1, data[0].TP_GRP_NM1, data[0].TP_DESCR_SHORT, data[0].TP_DESCR_LONG, data[0].TP_CALC_TYPE, data[0].TP_INCEXC_TYPE, data[0].TP_CURR_TYP, data[0].TP_CURR, data[0].TP_AMT, '', '', 'NO_BMDIV', data[0].CREATED_BY, data[0].CREATED_TS, data[0].UPDATED_BY, data[0].TP_ACCT_TYPE, 'DRAFT'], function(err,data){
							if (err) {
								console.log(err);
								response.send(errorHanlder(err.message))
							} else {
								response.send('Success');
							};
						})
						conn.close();
					} else {
						conn.query("INSERT INTO SDTXSTG.TP_BOLTONS_REQUESTS (TP_SEQNO, YEAR, MONTH, LCTRYNUM, ENTITY_CODE, TP_ACCT_PARENT1, TP_GRP_NM1, TP_DESCR_SHORT, TP_DESCR_LONG, TP_CALC_TYPE, TP_INCEXC_TYPE, TP_CURR_TYP, TP_CURR, TP_AMT, ATTACHMENT, ATTACHMENT_DESCRIPTION, BMDIV, CREATED_BY, CREATED_TS, UPDATED_BY, UPDATED_TS, TP_ACCT_TYPE, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT TIMESTAMP, '', CURRENT TIMESTAMP, ?, ?) "
							,[record.TP_SEQNO, record.YEAR, record.MONTH, record.LCTRYNUM, record.ENTITY_CODE, record.TP_ACCT_PARENT1, record.TP_GRP_NM1, record.TP_DESCR_SHORT, record.TP_DESCR_LONG, record.TP_CALC_TYPE, record.TP_INCEXC_TYPE, record.TP_CURR_TYP, record.TP_CURR, record.TP_AMT, '', '', 'NO_BMDIV', record.UPDATED_BY, record.TP_ACCT_TYPE, 'DRAFT'], function(err,data){
							if (err) {
								console.log(err);
								response.send(errorHanlder(err.message))
							} else {
								response.send('Success');
							};
						})
						conn.close();
					}
				}
			})
		}
	})
});

//Get Audit Log Comment 
router.post('/RRIW/getBoltonsComment', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT ", function(err, data){
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

//Add Boltons to Approval Table
router.post('/RRIW/addBoltonsApproval', function(request, response) {
	let record = request.body.params.record;
	let seqno = '';

	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			for (let key in record) {
				conn.query("SELECT SDTXSTG.TXPT_TP_BOLTONS_APPROVAL_REQ() FROM SYSIBM.SYSDUMMY1", function(err, reqno){
					if (err) {
						console.log(err);
					} else {
						conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE TP_SEQNO LIKE '" + record[key] + "%'", function(err, data){
							if (err) {
								console.log(err);
							} else {
								seqno = data[0].TP_SEQNO;
								let accountType = true;

								if (data[0].MONTH.indexOf('E') < 0 && data[0].MONTH.indexOf('R') < 0) {
									accountType = false;
								}

								conn.query("INSERT INTO SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW (TP_SEQNO, YEAR, MONTH, LCTRYNUM, ENTITY_CODE, TP_ACCT_PARENT1, TP_GRP_NM1, TP_DESCR_SHORT, TP_DESCR_LONG, TP_CALC_TYPE, TP_INCEXC_TYPE, TP_CURR_TYP, TP_CURR, TP_AMT, ATTACHMENT, ATTACHMENT_DESCRIPTION, BMDIV, REQUEST_ID, REQUEST_BY, REQUEST_TS, APPROVE_BY, APPROVE_TS, COMMENT) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT TIMESTAMP, '', CURRENT TIMESTAMP, ?) "
									,[seqno, data[0].YEAR, (accountType == true ? data[0].MONTH : data[0].MONTH + data[0].TP_ACCT_TYPE), data[0].LCTRYNUM, data[0].ENTITY_CODE, data[0].TP_ACCT_PARENT1, data[0].TP_GRP_NM1, data[0].TP_DESCR_SHORT, data[0].TP_DESCR_LONG, data[0].TP_CALC_TYPE, data[0].TP_INCEXC_TYPE, data[0].TP_CURR_TYP, data[0].TP_CURR, data[0].TP_AMT, (data[0].ATTACHMENT ? data[0].ATTACHMENT : ''), '', 'NO_BMDIV', reqno[0]['1'], data[0].CREATED_BY, ''], function(err,dataAdd){
									if (err) {
				                        console.log(err);
				                        if (key == record.length - 1) response.send(errorHanlder(err.message))
									} else {
										conn.query("UPDATE SDTXSTG.TP_BOLTONS_REQUESTS SET STATUS='PENDING', UPDATED_TS=CURRENT TIMESTAMP WHERE TP_SEQNO LIKE '" + seqno.substring(0, 9) + "%'", function(err, dataRequests){
										if (err) {
							                console.log(err);
							                if (key == record.length - 1) response.send(errorHanlder(err.message))
										} else {
											conn.query("INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES (?, ?, ?, ?, ?, CURRENT TIMESTAMP, ?, CURRENT TIMESTAMP, ?)",
													['Transfer Pricing-Boltons', '{TP_SEQNO: ' + seqno.substring(0, 9) + '}', reqno[0]['1'], 'P', data[0].CREATED_BY, data[0].CREATED_BY, 'None'], function(err,data){
													if (err) {
										         	            console.log(err);
										         	            if (key == record.length - 1) response.send(errorHanlder(err.message))
													} else {
														console.log("Insert Success");
														if (key == record.length - 1) response.send('Success');
													}
												})
											}
										})
									}
								})
							}
						})
					}
				})
			}
		}
	})
});

//Get Boltons Seqno
router.post('/RRIW/getBoltonsSeqno', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT SDTXSTG.TXPT_TP_BOLTONS_REQ() FROM SYSIBM.SYSDUMMY1", function(err, data){
				if (err) {
					console.log(err);
				} else {
					response.send(data[0]['1']);
				};
			
				conn.close();
			}
		)}
	});
})

//Cancel Boltons Request
router.post('/RRIW/cancelBoltonsRequest', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE TP_SEQNO LIKE '" + request.body.params.TP_SEQNO.substring(0, 9) + "%'", function(err, data){
				if (err) {
					console.log(err);
				} else {
					conn.query("SELECT * FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE TP_SEQNO LIKE '" + request.body.params.TP_SEQNO + "%'", function(err, reqno){
						if (err) {
							console.log(err);
						} else {
							conn.query("DELETE FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE TP_SEQNO LIKE '" + request.body.params.TP_SEQNO + "%'", function(err, dataSeqno){
								if (err) {
									console.log(err);
								} else {
									conn.query("DELETE FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE TP_SEQNO LIKE '" + request.body.params.TP_SEQNO.substring(0, 9) + "%'", function(err, dataSeqno){
										if (err) {
											console.log(err);
										} else {
											conn.query("INSERT INTO SDTXSTG.TXPT_AUDIT_CHANGE_DATA_APPROVAL_LOG (TABNAME, KEYVALUE_INFO, REQUEST_ID, STATUS_CD, REQUESTED_BY, REQUESTED_TS, APPROVED_BY, APPROVED_TS, STATUS_COMMENT) VALUES (?, ?, ?, ?, ?, CURRENT TIMESTAMP, ?, CURRENT TIMESTAMP, ?)",
												['Transfer Pricing-Boltons', '{TP_SEQNO: ' + request.body.params.TP_SEQNO.substring(0, 9) + '}', (reqno.length > 0 ? reqno[0].REQUEST_ID : 'None'), 'C', data[0].CREATED_BY, data[0].CREATED_BY, 'None'], function(err,data){
													if (err) {
														console.log(err);
														response.send(errorHanlder(err.message))
													} else {
														response.send('Success');
													};
											})
											conn.close();
										};

									})
								}
							})
						}
					})
				}
			})
		}
	})
});

//Cancel Boltons Request - To Draft
router.post('/RRIW/cancelBoltonsRequestDraft', function(request, response) {
	bludb.open(connectionRRIW, function (err, conn){
		if(err) {
			console.error("error: ", err.message);
		} else {
			conn.query("DELETE FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE TP_SEQNO LIKE '" + request.body.params.TP_SEQNO + "%'", function(err, data){
				if (err) {
					console.log(err);
				} else {
					conn.query("UPDATE SDTXSTG.TP_BOLTONS_REQUESTS SET STATUS='DRAFT', UPDATED_TS=CURRENT TIMESTAMP WHERE TP_SEQNO LIKE '" + request.body.params.TP_SEQNO.substring(0, 9) + "%'", function(err, data){
						if (err) {
							console.log(err);
						} else {
							response.send('Success');
						};

						conn.close();
					})
				}
			})
		}
	})
});

//Get Attachments Boltons
router.post('/getAttachmentsBoltons', function (request, response) {
	nano.db.use('tip').get('boltons', {attachments: true}, function(err, data) {
		if (err) {
			console.log(err);
			response.send(errorHanlder(err.message))
		} else {
			response.send(data);
		}
	})
})

//Attach to Boltons
router.post('/attachBoltons', function (request, response) {
	nano.db.use('tip').get('boltons', {attachments: true}, function(err, data) {
		if (err) {
			console.log(err);
			response.send(errorHanlder(err.message))
		} else {
			let attach = '';

			for (let key in request.body.params.ATTACH_TO) {
				attach += request.body.params.ATTACH_TO[key] + ' ';
			}

			for (let key in request.body.params.ATTACH_TO) {
				bludb.open(connectionRRIW, function (err, conn){
					if(err) {
						console.error("error: ", err.message);
					} else {
						conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS WHERE TP_SEQNO = '" + request.body.params.ATTACH_TO[key] + "'", function(err,data){
							if (err) {
								console.log(err);
								response.send(errorHanlder(err.message))
							} else {
								let filenames = data[0].ATTACHMENT;

								for (let keys in request.body.params.FILE_NAME) {
									if (filenames.indexOf(request.body.params.FILE_NAME[keys]) < 0) {
										filenames += request.body.params.FILE_NAME[keys] + ' ';
									}
								}

								filenames = filenames.trim();

								conn.query("DELETE FROM SDTXSTG.TXPT_TP_BOLTONS_CHANGE_DATA_SHADOW WHERE TP_SEQNO LIKE '" + request.body.params.ATTACH_TO[key] + "%'", function(err,dataOther){
									if (err) {
										console.log(err);
										response.send(errorHanlder(err.message))
									} else {
										conn.query("SELECT * FROM SDTXSTG.TP_BOLTONS_REQUESTS WHERE TP_SEQNO LIKE '" + request.body.params.ATTACH_TO[key] + "%'", function(err,dataRequests){
											if (err) {
												console.log(err);
												response.send(errorHanlder(err.message))
											} else {
												if (dataRequests.length == 0) {
													conn.query("INSERT INTO SDTXSTG.TP_BOLTONS_REQUESTS (TP_SEQNO, YEAR, MONTH, LCTRYNUM, ENTITY_CODE, TP_ACCT_PARENT1, TP_GRP_NM1, TP_DESCR_SHORT, TP_DESCR_LONG, TP_CALC_TYPE, TP_INCEXC_TYPE, TP_CURR_TYP, TP_CURR, TP_AMT, ATTACHMENT, ATTACHMENT_DESCRIPTION, BMDIV, CREATED_BY, CREATED_TS, UPDATED_BY, UPDATED_TS, TP_ACCT_TYPE, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT TIMESTAMP, '', CURRENT TIMESTAMP, ?, ?) "
														,[data[0].TP_SEQNO, data[0].YEAR, data[0].MONTH, data[0].LCTRYNUM, data[0].ENTITY_CODE, data[0].TP_ACCT_PARENT1, data[0].TP_GRP_NM1, data[0].TP_DESCR_SHORT, data[0].TP_DESCR_LONG, data[0].TP_CALC_TYPE, data[0].TP_INCEXC_TYPE, data[0].TP_CURR_TYP, data[0].TP_CURR, data[0].TP_AMT, filenames, '', 'NO_BMDIV', request.body.params.UPDATED_BY, data[0].TP_ACCT_TYPE, 'DRAFT'], function(err,data){
														if (err) {
															console.log(err);
															if (key == request.body.params.ATTACH_TO.length - 1) response.send(errorHanlder(err.message))
														} else {
															console.log("Insert Success");
															if (key == request.body.params.ATTACH_TO.length - 1) response.send('Success');
														};
													})
												} else {
													conn.query("UPDATE SDTXSTG.TP_BOLTONS_REQUESTS SET STATUS='DRAFT', ATTACHMENT='" + filenames + "', UPDATED_BY='" + request.body.params.UPDATED_BY + "', UPDATED_TS=CURRENT TIMESTAMP WHERE TP_SEQNO LIKE '" + request.body.params.ATTACH_TO[key] + "%'", function(err,data){
														if (err) {
															console.log(err);
															if (key == request.body.params.ATTACH_TO.length - 1) response.send(errorHanlder(err.message))
														} else {
															console.log("Insert Success");
															if (key == request.body.params.ATTACH_TO.length - 1) response.send('Success');
														};
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
			}
		}
	})
})

//Add Attachments Boltons
router.post('/insertAttachmentsBoltons', function (request, response) {
	let filename = request.body.params.filenameUpload
	let datafile = request.body.params.datafile
	let description = request.body.params.description
	let createdBy = request.body.params.CREATED_BY
	let createdTs = request.body.params.CREATED_TS
	let updatedBy = request.body.params.UPDATED_BY
	let updatedTs = request.body.params.UPDATED_TS
	let datafileBuffer = Buffer.from(datafile, 'base64');

	let rev = '';
	let revattach = '';
	let previous = {};
	let temp = {};

	nano.db.use('tip').get('boltons', function(err, data) {
		if (err) {
			console.log(err);
			response.send(errorHanlder(err.message))
		} else {
			previous = data.records;
			rev = data._rev;

			if (data._attachments) {
				temp = {
					_id : 'boltons',
					_rev : rev,
					records : [{
						'FILE_NAME': filename,
						'ATTACHED_TO': [],
						'DESCRIPTION': description,
						'CREATED_BY': createdBy,
						'CREATED_TS': createdTs,
						'UPDATED_BY': updatedBy,
						'UPDATED_TS': updatedTs

					}],
					_attachments: data._attachments
				}
			} else {
				temp = {
					_id : 'boltons',
					_rev : rev,
					records : [{
						'FILE_NAME': filename,
						'ATTACHED_TO': [],
						'DESCRIPTION': description,
						'CREATED_BY': createdBy,
						'CREATED_TS': createdTs,
						'UPDATED_BY': updatedBy,
						'UPDATED_TS': updatedTs
					}]
				}
			}

			for (let key in previous) {
				temp.records.push(previous[key])
			}
		
			nano.db.use('tip').insert(temp, function(err, data){
				if (err) {
					console.log(err);
					response.send(errorHanlder(err.message))
				} else {
					console.log("Success");
					nano.db.use('tip').get('boltons', function(err, data) {
						if (!err) {
							revattach = data._rev;
							nano.db.use('tip').attachment.insert('boltons', filename, datafileBuffer, 'application/octet-stream', { rev: revattach }, function(err, data) {
								if (err) {
									console.log(err);
									response.send(errorHanlder(err.message))
								} else {
									console.log("Success");
									response.send("Success");
								}
							});
						} 
					})
				}
			})
		}
	})
})

//Add Boltons - File Import (CSV)
router.post('/RRIW/importBoltons', function (request, response) {
	let record = request.body.params.record
	let createdBy = request.body.params.CREATED_BY
	let updatedBy = request.body.params.UPDATED_BY

	for (let csv in record){
		let query = "INSERT INTO SDTXSTG.TP_BOLTONS_REQUESTS (TP_SEQNO, YEAR, MONTH, LCTRYNUM, ENTITY_CODE, TP_ACCT_PARENT1, TP_GRP_NM1, TP_DESCR_SHORT, TP_DESCR_LONG, TP_CALC_TYPE, TP_INCEXC_TYPE, TP_CURR_TYP, TP_CURR, TP_AMT, ATTACHMENT, ATTACHMENT_DESCRIPTION, BMDIV, CREATED_BY, CREATED_TS, UPDATED_BY, UPDATED_TS, TP_ACCT_TYPE, STATUS) VALUES"

		bludb.open(connectionRRIW, function (err, conn) {
			if (err) {
				console.error("error: ", err.message);
			} else {
				conn.query("SELECT SDTXSTG.TXPT_TP_BOLTONS_REQ() FROM SYSIBM.SYSDUMMY1", function(err, data){
					if (err) {
						console.log(err);
					} else {
						query += "('" + data[0]['1'].trim() + "I', '" + record[csv].YEAR + "', '"+ record[csv].MONTH + "', '" + record[csv].TBCTY + "', '" + record[csv].ENTITY_CODE + "', '" + record[csv].TP_ACCT_PARENT1 + "', '" + record[csv].TP_GRP_NM1 + "', '" + record[csv].TP_DESCR_SHORT + "', '" + record[csv].TP_DESCR_LONG + "', '" + record[csv].TP_CALC_TYPE + "', '" + record[csv].TP_INCEXC_TYPE + "', '" + record[csv].TP_CURR_TYP + "', '" + record[csv].TP_CURR + "', '" + record[csv].TP_AMT + "', '', '', 'NO_BMDIV', '" + createdBy + "', CURRENT TIMESTAMP, '" + updatedBy + "', CURRENT TIMESTAMP, '" + record[csv].TP_ACCT_TYPE + "', 'DRAFT')";

						conn.query(query, function (err, data) {
							if (err) {
		                        console.log(err);
		                        if (csv == record.length - 1) response.send(errorHanlder(err.message))
							} else {
								console.log("Insert Success");
								if (csv == record.length - 1) response.send(data);
							}

							conn.close();
						})
					}
				})
			}
		})
	}
});

module.exports = router;