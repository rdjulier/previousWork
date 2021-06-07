import React, { Component } from 'react';
import axios from 'axios';
import "./activityLog.css";

const tags = require('striptags');
const $ = require('jquery');
require('jquery-ui-bundle');

let days = 30, mapping = [], entity = [], mapKey = [];
let services = [], products = [], custResidence = [], entityType = [], country = [];
let activityCustom = [];

class ActivityLog extends Component {
    countryID = window.localStorage.getItem('countryID')

    constructor(props){
        super(props);
        this.state = {
            activity: [],
            activitydata: false,
            cogOptions: false,
            activityCog: '',
            activityDisplay: [],
            activityDisplay30: [],
            activityDisplay60: [],
            activityDisplay90: [],
            filterActivity: [],
            custom: false
        };

        this.filterDays = this.filterDays.bind(this);
        this.filterCog = this.filterCog.bind(this);
        this.removeFilter = this.removeFilter.bind(this);
        this.customDate = this.customDate.bind(this);
    }

    componentWillMount(){
        axios.post("/DB2/getSubscriptionMapping",{
            headers: {
                Pragma: "no-cache"
            },
            params:{
                countryID: this.countryID,
                numberOfDays: days
            }
        }).then((response) => {
            mapping = response.data;
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/DB2/productTypeList",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            products = response.data;
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/DB2/custResidenceList",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            custResidence = response.data;
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/DB2/goodsServicesList",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            services = response.data;
        }).catch((error) => {
            console.log(error)
        })
    
        axios.post("/DB2/entityTypeList",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            entityType = response.data;
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/DB2/countriesList",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            country = response.data;
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/DB2/getActivityLog",{
            headers: {
                Pragma: "no-cache"
            },
            params:{
                countryID: this.countryID,
                numberOfDays: 8000
            }
        }).then((response) => {
            this.activityFill(response.data);
            activityCustom = response.data;
            this.setState({ cogOptions: response.data })
        }).catch((error) => {
            console.log(error)
        })
    }

    filterDays(e, cogName){
        days = e.target.value

        let activityDropdown = [];

        if (days == 30) {
            this.setState({ activity: this.state.activityDisplay30 })
            activityDropdown = this.state.activityDisplay30;
        } else if (days == 60) {
            this.setState({ activity: this.state.activityDisplay60 })
            activityDropdown = this.state.activityDisplay60;
        } else if (days == 90) {
            this.setState({ activity: this.state.activityDisplay90 })
            activityDropdown = this.state.activityDisplay90;
        } else {
            this.setState({ activity: this.state.activityDisplayAll })
            activityDropdown = this.state.activityDisplayAll;
        }

        if (cogName != 30 && cogName != 1) {
            this.state.filterActivity = [];
            for (let key in activityDropdown) {
                if (activityDropdown[key].title == cogName) {
                    this.state.filterActivity.push(activityDropdown[key]);
                }
            }
            this.setState({ activity: this.state.filterActivity })
        }

        if (days == 1) {
            this.setState({ custom: true })
        } else {
            this.setState({ custom: false })
        }
    }

    customDate() {
        if (document.getElementById('fromDate') && document.getElementById('toDate')) {
            if (document.getElementById('fromDate').value != '' && document.getElementById('toDate').value != '') {
                this.state.activityDisplay = [];

                for (let key in this.state.activityDisplayAll) {
                    var dateFrom = document.getElementById('fromDate').value;
                    var dateTo = document.getElementById('toDate').value;
                    let date = new Date(this.state.activityDisplayAll[key].dateActivity)
                    var dateCheck = this.getFormattedDate(date);

                    var d1 = dateFrom.split("/");
                    var d2 = dateTo.split("/");
                    var c = dateCheck.split("/");

                    var from = new Date(d1[2], parseInt(d1[0])-1, d1[1]);
                    var to   = new Date(d2[2], parseInt(d2[0])-1, d2[1]);
                    var check = new Date(c[2], parseInt(c[0])-1, c[1]);

                    if (check > from && check < to) {
                        this.state.activityDisplay.push(this.state.activityDisplayAll[key]);
                    }
                }
                
                this.setState({ activity: this.state.activityDisplay })
            }
        }
    }

    getFormattedDate(date) {
        var year = date.getFullYear();

        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;

        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        
        return month + '/' + day + '/' + year;
    }

    filterCog(e){
        let filterApply = [];

        e.target.style.display = 'none';
        this.setState({ activityCog: e.target.value })
        if (document.getElementsByClassName('ds-icon-close-circle').length > 0) {
            document.getElementsByClassName('ds-icon-close-circle')[0].style.display = '';
        }
        
        if (!this.state.custom) {
            document.getElementById('daterange').value = 8000;

            for (let key in this.state.activityDisplayAll) {
                if (this.state.activityDisplayAll[key].title == e.target.value) {
                    filterApply.push(this.state.activityDisplayAll[key]);
                }
            }
        } else {
            for (let key in this.state.activityDisplay) {
                if (this.state.activityDisplay[key].title == e.target.value) {
                    filterApply.push(this.state.activityDisplay[key]);
                }
            }
        }

        this.setState({ activitydata: true, activity: filterApply })
    }

    removeFilter(days, cogName){
        cogName.style.display = '';
        document.getElementsByClassName('ds-icon-close-circle')[0].style.display = 'none';
        cogName.value = 30;

        this.state.filterActivity = [];

        if (!this.state.custom) {
            if (days == 30) {
                this.setState({ activitydata: true, activity: this.state.activityDisplay30 })
            } else if (days == 60) {
                this.setState({ activitydata: true, activity: this.state.activityDisplay60 })
            } else if (days == 90) {
                this.setState({ activitydata: true, activity: this.state.activityDisplay90 })
            } else {
                this.setState({ activitydata: true, activity: this.state.activityDisplayAll })
            }
        } else {
            this.setState({ activitydata: true, activity: this.state.activityDisplay })
        }
    }

    activityFill(activity){
        let data = []

            for (let key in activity){
                let objDate = new Date(activity[key].MODIFIED_TS),
                    locale = "en-us",
                    month = objDate.toLocaleString(locale, { month: "short" });
            
                activity[key].NONMODIFIED_TS = activity[key].MODIFIED_TS;
                activity[key].MODIFIED_TS = objDate.getDate()+" "+month+" "+objDate.getFullYear()
                activity[key].OLD_VAL = activity[key].OLD_VAL.replace(/&nbsp;|&rsquo;/gi, '')
                activity[key].NEW_VAL = activity[key].NEW_VAL.replace(/&nbsp;|&rsquo;/gi, '')
            }

            for (let key in activity) {
                for (let keys in mapping) {
                    if (activity[key].COLNAME == mapping[keys].COLUMN_NM) {
                        activity[key].COLNAME = mapping[keys].COLUMN_NM_DESC;
                    }
                }

                mapKey = activity[key];

                if (mapKey['ACTION'].trim() == 'UPDATE') {
                    if (activity[key].COLNAME == 'FILE_NAME') {
                        activity[key].COLNAME = 'File Name';
                    } else if (activity[key].COLNAME == 'SUMMARY') {
                        activity[key].COLNAME = 'Summary';
                    } else if (activity[key].COLNAME == 'ATTACHMENT') {
                        activity[key].COLNAME = 'Attachment';
                    }

                    if (mapKey['COG_ID'] == 'Country-Entities and Registrations') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        for (let keys in entityType) {
                            if (jsonObject.ENTITY_TYPE == entityType[keys].ENTITY_TYPE) {
                                jsonObject.ENTITY_TYPE = entityType[keys].ENTITY_TYPE_DESC;
                            }

                            if (activity[key].COLNAME == 'Entity Type') {
                                if (activity[key].OLD_VAL.trim() == entityType[keys].ENTITY_TYPE) {
                                    activity[key].OLD_VAL = entityType[keys].ENTITY_TYPE_DESC;
                                }

                                if (activity[key].NEW_VAL.trim() == entityType[keys].ENTITY_TYPE) {
                                    activity[key].NEW_VAL = entityType[keys].ENTITY_TYPE_DESC;
                                }
                            }
                        }

                        if (activity[key].COLNAME == 'Established Country') {
                            for (let keys in country) {
                                if (activity[key].OLD_VAL.trim() == country[keys].IDGEO) {
                                    activity[key].OLD_VAL = country[keys].IBM_CNTRY_NM;
                                }

                                if (activity[key].NEW_VAL.trim() == country[keys].IDGEO) {
                                    activity[key].NEW_VAL = country[keys].IBM_CNTRY_NM;
                                }
                            }
                        }

                        keyvalueDesc = 'Entity Name: "' + jsonObject.ENTITY_NAME + '", Entity Type: "' + jsonObject.ENTITY_TYPE + '", IDT Registration Number: "' + jsonObject.INDRCT_TAX_RGSTN_NBR + '"';
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    } else if (mapKey['COG_ID'] == 'Invoicing-Commodity Codes') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        if (jsonObject.CMDTY_CD == undefined) {
                            data.push( {title: mapKey['COG_ID'], content: 'Country comment has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                        } else {
                            keyvalueDesc = 'Commodity Code: "' + jsonObject.CMDTY_CD + '"';
                            data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                        }
                    } else if (mapKey['COG_ID'] == 'Invoicing-Accounts Payable VAT Codes') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        if (jsonObject.VAT_CD == undefined) {
                            data.push( {title: mapKey['COG_ID'], content: 'Country comment has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                        } else {
                            keyvalueDesc = 'VAT Code: "' + jsonObject.VAT_CD + '"';
                            data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                        }
                    } else if (mapKey['COG_ID'] == 'Invoicing-Accounts Receivable VAT Codes') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        if (activity[key].COLNAME == 'Product Type') {
                            for (let keys in products) {
                                if (activity[key].OLD_VAL == products[keys].PROD_TYP_ID) {
                                    activity[key].OLD_VAL = products[keys].PROD_TYP_DESC;
                                }

                                if (activity[key].NEW_VAL == products[keys].PROD_TYP_ID) {
                                    activity[key].NEW_VAL = products[keys].PROD_TYP_DESC;
                                }
                            }
                        }

                        if (activity[key].COLNAME == 'Goods and Services') {
                            for (let keys in services) {
                                if (activity[key].OLD_VAL == services[keys].GOODS_SRVCS_ID) {
                                    activity[key].OLD_VAL = services[keys].GOODS_SRVCS_DESC;
                                }

                                if (activity[key].NEW_VAL == services[keys].GOODS_SRVCS_ID) {
                                    activity[key].NEW_VAL = services[keys].GOODS_SRVCS_DESC;
                                }
                            }
                        }

                        if (activity[key].COLNAME == 'Customer Residency for VAT Purpose') {
                            for (let keys in custResidence) {
                                if (activity[key].OLD_VAL == custResidence[keys].CUST_RESIDENCE_ID) {
                                    activity[key].OLD_VAL = custResidence[keys].CUST_RESIDENCE_DESC;
                                }

                                if (activity[key].NEW_VAL == custResidence[keys].CUST_RESIDENCE_ID) {
                                    activity[key].NEW_VAL = custResidence[keys].CUST_RESIDENCE_DESC;
                                }
                            }
                        }

                        keyvalueDesc = 'Customer Residence: "' + jsonObject.CUST_RESIDENCE_ID + '" Goods and Services: "' + jsonObject.GOODS_SRVC_ID + '" Product Specifics: ' + jsonObject.PROD_SPECIFICS + '" Product Type: ' + jsonObject.PROD_TYP_ID + '"';
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    } else if (mapKey['COG_ID'] == 'Direct Tax-Tax Rates') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        keyvalueDesc = 'Valid From: "' + jsonObject.VALID_FROM + '" Valid To: "' + jsonObject.VALID_TO + '"';
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    } else if (mapKey['COG_ID'] == 'Direct Tax-Withholding Taxes') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        keyvalueDesc = "Year: " + jsonObject.YEAR;
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    } else if (mapKey['COG_ID'] == 'Indirect Tax-Tax Rates') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        switch (jsonObject.INDRCT_TAX_TYP_ID) {

                            case 'V':
                                jsonObject.INDRCT_TAX_TYP_ID = 'VALUE ADDED TAX';
                                break;
                            case 'S':
                                jsonObject.INDRCT_TAX_TYP_ID = 'SALES TAX';
                                break;
                            case 'G':
                                jsonObject.INDRCT_TAX_TYP_ID = 'GOODS & SERVICES';
                                break;
                        }

                        keyvalueDesc = 'IDT Type: "' + jsonObject.INDRCT_TAX_TYP_ID + '" Rate Type: "' + jsonObject.TAX_RATE + '" Description: "' + jsonObject.TAX_DESC + '"';
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
    
                    } else if (mapKey['COG_ID'] == 'Country-IBM Systems Used') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        keyvalueDesc = 'System: "' + jsonObject.SRC_SYSTEM_NM_SHORT + '"';
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    } else if (mapKey['COG_ID'] == 'Country-Documents and Agreements') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        keyvalueDesc = 'Document Type: "' + jsonObject.DOCUMENT_TYPE + '" Summary: "' + jsonObject.SUMMARY + '"';
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' had a modification: ' + activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    } else if (mapKey['COG_ID'] == 'Country-Basic Country Info') {
                        let keyvalue = mapKey['KEYVALUE_INFO'];
                        let jsonObject = (new Function('return ' + keyvalue))()
                        let keyvalueDesc = '';

                        switch(jsonObject.CONTACT_CD){
                            case "AP":
                                keyvalueDesc = "Accounts Payable Contact";
                                break;
                            case "CT":
                                keyvalueDesc = "IDT Country Tax Contact";
                                break;
                            case "CE":
                                keyvalueDesc = "IDT CoE Contact";
                                break;
                            case "RT":
                                keyvalueDesc = "Regional IDT Lead";
                                break;
                            case "DT":
                                keyvalueDesc = "Direct Tax Contact";
                                break;
                            case "AR":
                                keyvalueDesc = "Accounts Receivable Contact";
                                break;
                            case "GF":
                                keyvalueDesc = "Global Finance Contact";
                                break;
                            case "GL":
                                keyvalueDesc = "Global Logistic Contact";
                                break;
                            case "IC":
                                keyvalueDesc = "InterCompany Contact";
                                break;
                        }
                        
                        if (jsonObject.CONTACT_CD == undefined) {
                            keyvalueDesc = jsonObject.TAX_FILING_ID;
                        }

                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' has been updated: Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    } else {
                        data.push( {title: mapKey['COG_ID'], content: activity[key].COLNAME + ' has been UPDATED. Old value: ' + tags(activity[key].OLD_VAL) + ', New value: ' + tags(activity[key].NEW_VAL), name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    }
                } else if (mapKey['ACTION'].trim() == 'DELETE') {
                    let keyvalue = mapKey['KEYVALUE_INFO'];
                    let jsonObject = (new Function('return ' + keyvalue))()
                    let keyvalueDesc = '';

                    for (let [ keyMapping, value ] of Object.entries(jsonObject)) {
                        for (let keys in mapping) {
                            if ((keyMapping == mapping[keys].COLUMN_NM) && (keyMapping != 'IDGEO')) {
                                keyvalueDesc += mapping[keys].COLUMN_NM_DESC + ': "' + value.toString().trim() + '", ';
                            }
                        }
                    }

                    if (mapKey['COG_ID'] == 'Country-Documents and Agreements') {
                        keyvalueDesc = 'Document Type: "' + jsonObject.DOCUMENT_TYPE + '"" Summary: "' + jsonObject.SUMMARY + '",';
                    } else if (mapKey['COG_ID'] == 'Invoicing-Accounts Receivable VAT Codes') {
                        keyvalueDesc = 'Product Type: "' + jsonObject.PROD_TYP_ID + '" Customer Residence: "' + jsonObject.CUST_RESIDENCE_ID + '" Goods and Services: "' + jsonObject.GOODS_SRVC_ID + '" Product Specifics: "' + jsonObject.PROD_SPECIFICS + '",';
                    } else if (mapKey['COG_ID'] != 'Country-Entities and Registrations') {
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' has been DELETED', name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    }

                } else {
                    let keyvalue = mapKey['KEYVALUE_INFO'];
                    let jsonObject = (new Function('return ' + keyvalue))()
                    let keyvalueDesc = '';
                    let entities = true;

                    for (let [ keyMapping, value ] of Object.entries(jsonObject)) {
                        for (let keys in mapping) {
                            if ((keyMapping == mapping[keys].COLUMN_NM) && (keyMapping != 'IDGEO')) {
                                keyvalueDesc += mapping[keys].COLUMN_NM_DESC + ': "' + value.toString().trim() + '", ';
                            }
                        }
                    }

                    if (mapKey['COG_ID'] == 'Country-Entities and Registrations') {
                        if (jsonObject.ENTITY_NAME != undefined) {
                            keyvalueDesc = 'Entity Name: "' + jsonObject.ENTITY_NAME + '", Entity Type: "' + jsonObject.ENTITY_TYPE + '", IDT Registration Number: "' + jsonObject.INDRCT_TAX_RGSTN_NBR + '"';
                        } else {
                            entities = false;
                        }
                    } else if (mapKey['COG_ID'] == 'Country-Documents and Agreements') {
                        keyvalueDesc = 'Document Type: "' + jsonObject.DOCUMENT_TYPE + '"" Summary: "' + jsonObject.SUMMARY + '",';
                    } else if (mapKey['COG_ID'] == 'Invoicing-Accounts Receivable VAT Codes') {
                        keyvalueDesc = 'Product Type: "' + jsonObject.PROD_TYP_ID + '" Customer Residence: "' + jsonObject.CUST_RESIDENCE_ID + '" Goods and Services: "' + jsonObject.GOODS_SRVC_ID + '" Product Specifics: "' + jsonObject.PROD_SPECIFICS + '",';
                    } else if (mapKey['COG_ID'] == 'Direct Tax-Withholding Taxes') {
                        keyvalueDesc = 'Year: ' + jsonObject.YEAR;
                    }

                    if (entities) {
                        data.push( {title: mapKey['COG_ID'], content: keyvalueDesc + ' has been ADDED', name: activity[key].MODIFIED_BY, date: activity[key].MODIFIED_TS, dateActivity: activity[key].NONMODIFIED_TS } )
                    }
                }
            }

            for (let key in data) {
                var numDaysBetween = function(date1, date2) {
                  var diff = Math.abs(date1.getTime() - date2.getTime());
                  return diff / (1000 * 60 * 60 * 24);
                };

                var date1 = new Date(data[key].dateActivity);
                var date2 = new Date();

                if (numDaysBetween(date1, date2) <= 30) {
                    this.state.activityDisplay30.push(data[key]);
                }

                if (numDaysBetween(date1, date2) <= 60) {
                    this.state.activityDisplay60.push(data[key]);
                }

                if (numDaysBetween(date1, date2) <= 90) {
                    this.state.activityDisplay90.push(data[key]);
                }
            }

            this.setState({ activitydata: true, activity: this.state.activityDisplay30, activityDisplayAll: data, activityDisplay30: this.state.activityDisplay30, activityDisplay60: this.state.activityDisplay60, activityDisplay90: this.state.activityDisplay90 })
            return data;
    }

    cogDropdown(){
        let filterDropdown = [];
        let cogOption = [];

        for (let key in this.state.cogOptions) {
            if (cogOption.indexOf(this.state.cogOptions[key].COG_ID) < 0) {
                cogOption.push(this.state.cogOptions[key].COG_ID);
            }
        }

        cogOption = cogOption.sort();

        for (let key in cogOption) {
            filterDropdown.push(<option>{cogOption[key]}</option>);
        }

        return filterDropdown;
    }

    showActivityLog(){
        let contentDisplay = []
        this.state.activity.forEach((item) => {
            contentDisplay.push(<div className="border"><div className="heading"><b>{item.title}</b></div><div style={{ marginBottom: '10px' }}>{item.content}</div><div className="updatedBy">by {item.name} on {item.date}</div></div>);
        })
        return contentDisplay;
    }

    render(){
         if (!this.state.activitydata || !this.state.cogOptions) {
            return (
                <div style={{marginTop: '25%'}}>
                    <div className="ds-loader-container ds-loader-blue"></div>
                    <div className="ds-loader ds-loader"></div>
                </div> 
            );
        } else {
            if(this.state.custom){
                const that = this
                var interval = setInterval(function () {
                    if (document.getElementById('fromDate')) {
                        clearInterval(interval);
                        $('#fromDate').datepicker({
                            onSelect: function() {
                                that.customDate()
                            }
                        });
                        $('#toDate').datepicker({
                            onSelect: function() {
                                that.customDate()
                            }
                        });
                    }
                }, 1000);
            }
            return (
                <div className="ds-col-sm-12  ds-col-md-12 ds-col-lg-12" style={{padding: "0"}}>
                    <div className="ds-col-sm-2  ds-col-md-2 ds-col-lg-2 sideMenu">
                        <div className="ds-side-nav ds-col-sds-no-gutter ds-margin-top-3 ds-margin-bottom-2 ds-padding-top-0_5 ds-padding-bottom-0_5 sidebar-nav-pos" style={{overflow: "hidden"}}>
                            <div className={"ds-nav-item ds-active"}><a href="#" style={{textTransform: "none"}} >Activity Log</a></div>
                        </div>
                    </div>

                    <div className="ds-col-sm-10  ds-col-md-10 ds-col-lg-10 page">
                        <div className="ds-col-sm-12 ds-col-md-12  bg-bl" style={{padding: "0"}}>
                            <div>
                                <div className="Rectangle-5"> 
                                    <div className="Menu-Name" style={{float:"left"}}>Activity Log</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="body">
                            <span>
                                <select style={{ height: '27px' }} onChange={(e) => {this.filterDays(e, document.getElementById('cogFilter').value)}} id='daterange'>
                                    <option value='30'>Last 30 days</option>
                                    <option value='60'>Last 60 days</option>
                                    <option value='90'>Last 90 days</option>
                                    <option value='8000'>All</option>
                                    <option value='1'>Custom</option>
                                </select>
                            </span>
                            {this.state.custom && <span>
                                <input id='fromDate' style={{ marginLeft: '10px', width: '204px' }} placeholder="MM/DD/YYYY"></input>
                                <input id='toDate' style={{ marginLeft: '10px', width: '204px' }} placeholder="MM/DD/YYYY"></input>
                            </span>}
                            <span>
                                <select onChange={this.filterCog} style={{ marginLeft: '20px', width: '371px', height: '27px' }} id='cogFilter'>
                                    <option selected='true' disabled='true' value='30'>Select Filter</option>
                                    {this.cogDropdown()}
                                </select>
                            </span>
                            <div>{this.state.activityCog != '' && <span class='ds-icon-close-circle' onClick={() => {this.removeFilter(document.getElementById('daterange').value, document.getElementById('cogFilter'))}} style={{ position: 'absolute', marginLeft: this.state.custom ? '565px': '130px', marginTop: '-48px', cursor: 'pointer' }}><span style={{ marginLeft: '3px', position: 'absolute', width: '400px', bottom: '2px' }}>{this.state.activityCog}</span></span>}</div>
                            <div style={{ borderTop: '1px solid', marginRight: "100px"}}></div>  
                            {this.showActivityLog()}
                            {this.state.activity.length == 0 && <div>There is no activity to display.</div>}
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default ActivityLog;