var sortBy = require('sort-by'), resultSet = [];
var router = express.Router();

function getMilliseconds(time){
	for (var i=0; i<time.length; i++){
		time[i].MODIFIED_TS = new Date(time[i].MODIFIED_TS).getTime();
	}
	return time;
}

//Get Activity Log
router.post('/DB2/getActivityLog', function (request, response) {
    bludb.open(connectionDB2, function (err, conn) {
        if (err) {
            console.error("Connection error: ", err.message);
        } else {
            conn.query("SELECT tabname,cog_id,keyvalue_info,colname,ACTION,old_val,new_val,MODIFIED_BY,MODIFIED_TS FROM DASH7090.TXPT_AUDIT_CHANGE_DATA WHERE MODIFIED_TS >= SYSDATE - " + request.body.params.numberOfDays + " AND IDGEO = " + parseInt(request.body.params.countryID) + " UNION ALL SELECT ' ',cog_id,keyvalue_info,colname,ACTION,old_val,new_val,MODIFIED_BY,MODIFIED_TS FROM DASH7090.TXPT_CLOUDANT_CHANGE_DATA WHERE MODIFIED_TS >= SYSDATE - " + request.body.params.numberOfDays + " AND IDGEO = " + parseInt(request.body.params.countryID) + " ORDER BY 2,1;", 
                function (err, data) {
                    if (err) {
                        console.log("Query Error: " + err);
                    } else {
                        resultSet = data
                        getMilliseconds(resultSet);
                        resultSet.sort(sortBy('-MODIFIED_TS'));
                        response.send(resultSet);
                    }
                conn.close();
            });
        }
    });
});
    
//Get Subscription Mapping
router.post('/DB2/getSubscriptionMapping', function (request, response) {
    bludb.open(connectionDB2, function (err, conn) {
        if (err) {
            console.error("Connection error: ", err.message);
        } else {
            conn.query("SELECT * FROM DASH7090.TXPT_SUBSCRIPTION_MAPPING_COLUMNS", 
                function (err, data) {
                    if (err) {
                        console.log("Query Error: " + err);
                    } else {
                        response.send(data);
                }
                conn.close();
            });
        }
    });
}); 

module.exports = router;