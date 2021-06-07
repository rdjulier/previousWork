import React, { Component } from 'react';
import axios from 'axios';

//Material UI Imports
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import green from '@material-ui/core/colors/green';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import classNames from 'classnames';
import DialogMaterial from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';

//Material UI Variable Initialization
const variantIcon = {
    success: CheckCircleIcon,
    error: ErrorIcon
};

const styles1 = theme => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

function MySnackbarContent(props) {
    const { classes, className, message, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            className={classNames(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message} style={{whiteSpace: 'pre-line'}}>
                    <Icon className={classNames(classes.icon, classes.iconVariant)} />
                    {message}
                </span>
            }
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={classes.close}   
                    onClick={onClose}
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>,
            ]}
            {...other}
        />
    );
}

const MySnackbarContentWrapper = withStyles(styles1)(MySnackbarContent);
//End Material UI Variable Initialization

const Parse = require('papaparse');
const $ = require('jquery');

let dataSet = [], entityList = [], parsed = [], listEach = [], fileImported = [], parsedImport = [], saidtEntity = [], parsedCheck = 0, parsedRow = 0, legalEntity = '', file = document.getElementById('uploadcsv');
let countryOptions = [], entityOptions = [], yearOptions = [], currencyType = '', parentValues = [], groupOptions = [], entityDivisions = [], entityCombinations = [], seqno = 0;

class ImportTaxableAdjustments extends Component{
    state = {
        errorList: false,
        saveMessage: false,
        validation: false,
        showYear: false,
        showEntity: false,
        showRest: false,
        contentLer: false,
        entity: false,
        saving: true
    }

    userName = window.localStorage.getItem("username")
    ctryNum = window.localStorage.getItem('ctryNum')
    countryID = window.localStorage.getItem('countryID')

    handleAlertClose = () => this.setState({ saveMessage: false, validation: false })
    handleMessage = (message) => {
        this.validationMessage = message
        this.setState({ validation: true })
    }

    constructor(props){
        super(props);
        dataSet = [];
    }

    componentWillMount(){
        axios.post("/DB2/countriesList",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            countryOptions = response.data;
            this.setState({ contentLoaded: true })
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/RRIW/getBoltonsCurrency",{
                headers: {
                    Pragma: "no-cache"
                }
            }).then((response) => {
                currencyType = response.data;
            }).catch((error) => {
                console.log(error)
            })

        axios.post("/RRIW/getBoltons",{
            headers: {
                Pragma: "no-cache"
            }, params: {
                query: 'TP_SEQNO IS NOT NULL'
            }
        }).then((response) => {
            dataSet = response.data;
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/RRIW/getParent1Boltons",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            parentValues = response.data;
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/RRIW/getBoltonsDivisions",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            entityDivisions = response.data;
        }).catch((error) => {
            console.log(error)
        })

        axios.post("/RRIW/getBoltonsGroup",{
            headers: {
                Pragma: "no-cache"
            }
        }).then((response) => {
            for (let key in response.data) {
                if (response.data[key].TP_GRP_NM == 'Unassigned') {
                    response.data.splice(key, 1)
                }
            }

            groupOptions = response.data;
        }).catch((error) => {
            console.log(error)
        })

        if (this.state.saving) {
            axios.post("/RRIW/getBoltonsEntityImport",{
                headers: {
                    Pragma: "no-cache"
                }
            }).then((response) => {
                entityCombinations = response.data;
                this.setState({ saving: false })
            }).catch((error) => {
                console.log(error)
            })
        }
    }

    dropdownMapping(element){
        document.getElementById(element).style.color = '#2f2f2f';
        
        switch(element){
            case 'country':
                this.setState({ showEntity: false, entity: false })
                axios.post("/RRIW/getBoltonsEntity",{
                    params : {
                        LCTRYNUM: document.getElementById('country').value
                    }, headers: {
                        Pragma: "no-cache"
                    }
                }).then((response) => {
                    let entityOptionsCodes = [];
                    entityOptions = [];

                    for (let key in response.data) {
                        if (response.data[key].ENTITY_CODE && response.data[key].LEGAL_ENTITY_KEY) {
                            if (entityOptionsCodes.indexOf(response.data[key].ENTITY_CODE) < 0) {
                                entityOptionsCodes.push(response.data[key].ENTITY_CODE)
                                entityOptions.push({ ENTITY_CODE: response.data[key].ENTITY_CODE, LEGAL_ENTITY_KEY: response.data[key].LEGAL_ENTITY_KEY, ENTITY_DESC: response.data[key].ENTITY_DESC })
                            }
                        }
                    }

                    this.setState({ showEntity: true, contentLer: false })
                }).catch((error) => {
                    console.log(error)
                })
                break;

            case 'entity':
                axios.post("/RRIW/getBoltonsYear",{
                    params : {
                        LCTRYNUM: document.getElementById('country').value,
                        ENTITY_CODE: document.getElementById('entity').selectedOptions[0].innerText
                    },
                    headers: {
                        Pragma: "no-cache"
                    }
                }).then((response) => {
                    yearOptions = response.data;
                    this.setState({ contentLer: false, entity: true })
                }).catch((error) => {
                    console.log(error)
                })
                break;
        }
    }

    exportToCsv = () => {
        let data = [];
        
        for (let key in fileImported) {
            data.push({'LCTRYNUM': fileImported[key].LCTRYNUM, 'ENTITY_CODE': fileImported[key].ENTITY_CODE, 'MONTH': fileImported[key].MONTH, 'YEAR': fileImported[key].YEAR, 'TP_ACCT_PARENT1': fileImported[key].TP_ACCT_PARENT1, 'TP_GRP_NM1': fileImported[key].TP_GRP_NM1, 'TP_DESCR_SHORT': fileImported[key].TP_DESCR_SHORT, 'TP_DESCR_LONG': fileImported[key].TP_DESCR_LONG, 'TP_CALC_TYPE': fileImported[key].TP_CALC_TYPE, 'TP_INCEXC_TYPE': fileImported[key].TP_INCEXC_TYPE, 'TP_CURR_TYP': fileImported[key].TP_CURR_TYP, 'TP_AMT': fileImported[key].TP_AMT.replace(/,/g,''), 'Comments': fileImported[key].IMPORT_ERROR});
        }

        var csvData = this.jsonObjectsToCsvData(data);
        if (csvData == null) { return };

        var filename = 'Boltons - Errors.csv';
        var blob = new Blob([csvData], {type: "text/csv;charset=utf-8;"});
        var link = document.createElement("a");
        
        if (link.download !== undefined) {
            // feature detection, Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style = "visibility:hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.handleMessage('The download has been completed');
        }
    }

    jsonObjectsToCsvData(jsonData) {  
        var result, index, keys, columnDelimiter, lineDelimiter, data;

        data = jsonData || null;
        
        if (data == null || !data.length) {
            return null;
        }

        columnDelimiter = jsonData.columnDelimiter || ',';
        lineDelimiter = jsonData.lineDelimiter || '\n';
        keys = Object.keys(data[0]);
        result = '' + keys.join(columnDelimiter) + lineDelimiter;

        data.forEach(function(item) {
            index = 0;
            keys.forEach(function(key) {
                if (index > 0) result += columnDelimiter;

                let containcomma = item[key];
                if (key != 'ADJ_AMT' && containcomma != null) {
                    item[key] = containcomma.replace(/,/g, ";");
                }
                result += item[key];
                index++;
            });
            result += lineDelimiter;
        }); 

        return result;
    }

    uploads(){
        $('#displayList').empty();
        file = document.getElementById('uploadcsv').files[0];

        const that = this;

        if (file == null) {
            this.handleMessage('Please select a file to import');
            that.setState({ errorList: false })
        } else {
            Parse.parse(file, {
                header: true,
                complete: function(results) {
                    listEach = [];
                    parsed = results.data;
                    fileImported = [];

                    that.setState({errorList: false})
                    
                    let rowNumber
                    for (let each in dataSet) {
                        rowNumber = 1

                        for (let key in parsed) {
                            if (parsed[key].LCTRYNUM != '') {
                                rowNumber += 1
                                let parent1 = parsed[key].TP_ACCT_PARENT1;
                                let groupName = parsed[key].TP_GRP_NM1;
                                let descShort = parsed[key].TP_DESCR_SHORT;
                                let descLong = parsed[key].TP_DESCR_LONG;
                                let calcType = parsed[key].TP_CALC_TYPE;
                                let includeExclude = parsed[key].TP_INCEXC_TYPE;
                                let currType = parsed[key].TP_CURR_TYP;
                                let amt = parsed[key].TP_AMT;

                                // if (dataSet[each].TP_ACCT_PARENT1.trim() == parent1.trim() && dataSet[each].TP_GRP_NM1.trim() == groupName.trim()) {
                                //     listEach.push('Row '+ rowNumber + ' contains an entry that has already been added');
                                //     parsed[key].IMPORT_ERROR = 'Contains an entry that has already been added';
                                //     fileImported.push(parsed[key]);
                                // }
                            }
                        }
                    }
                        
                    rowNumber = 1
                    for (let key in parsed) {
                        rowNumber += 1

                        if (Object.keys(parsed[key]).length != 1) {
                            let parent1 = parsed[key].TP_ACCT_PARENT1;
                            let month = parsed[key].MONTH;
                            let year = parsed[key].YEAR;
                            let groupName = parsed[key].TP_GRP_NM1;
                            let descShort = parsed[key].TP_DESCR_SHORT;
                            let descLong = parsed[key].TP_DESCR_LONG;
                            let calcType = parsed[key].TP_CALC_TYPE;
                            let includeExclude = parsed[key].TP_INCEXC_TYPE;
                            let currType = parsed[key].TP_CURR_TYP;
                            let amt = parsed[key].TP_AMT;
                            
                            //Parent1
                            let validParent = false;
                            for (let keys in parentValues) {
                                if (parent1.trim().toLowerCase() == parentValues[keys].PARENT.trim().toLowerCase()) {
                                    parsed[key].TP_ACCT_TYPE = parentValues[keys].TYPE;
                                    parsed[key].TP_ACCT_PARENT1 = parentValues[keys].PARENT.trim();
                                    validParent = true;
                                }
                            }

                            if (!validParent) {
                                listEach.push('Row '+ rowNumber + ' Parent value not found in hierarchy table');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Parent value not found in hierarchy table' : parsed[key].IMPORT_ERROR += ' - Error: Parent value not found in hierarchy table'
                                fileImported.push(parsed[key]);
                            }

                            //Group Name
                            let validGroup = false;
                            for (let keys in groupOptions) {
                                if (groupName.trim().toLowerCase() == groupOptions[keys].KEY.trim().toLowerCase()) {
                                    parsed[key].TP_GRP_NM1 = groupOptions[keys].KEY.trim();
                                    validGroup = true;
                                }
                            }

                            if (!validGroup) {
                                listEach.push('Row '+ rowNumber + ' Group name not found in table');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Group name not found in table' : parsed[key].IMPORT_ERROR += ' - Error: Group Name not found in table'
                                fileImported.push(parsed[key]);
                            }

                            //Month
                            if (month.length > 2) {
                                listEach.push('Row '+ rowNumber + ' Month is too long');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Month is too long' : parsed[key].IMPORT_ERROR += ' - Error: Month is too long'
                                fileImported.push(parsed[key]);
                            }

                            if (year.length != 4) {
                                listEach.push('Row '+ rowNumber + ' Year must be 4 digits');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Year must be 4 digits' : parsed[key].IMPORT_ERROR += ' - Error: Year must be 4 digits'
                                fileImported.push(parsed[key]);
                            }

                            if (isNaN(year)) {
                                listEach.push('Row '+ rowNumber + ' Year must be a number');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Year must be a number' : parsed[key].IMPORT_ERROR += ' - Error: Year must be a number'
                                fileImported.push(parsed[key]);
                            }

                            if (parseInt(year) != NaN) {
                                let date = new Date();

                                if (year >= date.getFullYear()) {
                                    listEach.push('Row '+ rowNumber + ' Year cannot be equal to or greater than the current year');
                                    parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Year cannot be equal to or greater than the current year' : parsed[key].IMPORT_ERROR += ' - Error: Year cannot be equal to or greater than the current year'
                                    fileImported.push(parsed[key]);
                                }
                            }

                            if (isNaN(month)) {
                                listEach.push('Row '+ rowNumber + ' Month must be a number');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Month must be a number' : parsed[key].IMPORT_ERROR += ' - Error: Month must be a number'
                                fileImported.push(parsed[key]);
                            }

                            if (parseInt(month) != NaN) {
                                if (month < 1 || month > 12) {
                                    listEach.push('Row '+ rowNumber + ' Month must be between 1 and 12');
                                    parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Month must be between 1 and 12' : parsed[key].IMPORT_ERROR += ' - Error: Month must be between 1 and 12'
                                    fileImported.push(parsed[key]);
                                }
                            }

                            //Desc Short
                            if (descShort.length > 40) {
                                listEach.push('Row '+ rowNumber + ' Short Description is too long');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Short Description is too long' : parsed[key].IMPORT_ERROR += ' - Error: Short Description is too long'
                                fileImported.push(parsed[key]);
                            }

                            //Desc Long
                            if (descLong.length > 250) {
                                listEach.push('Row '+ rowNumber + ' Long Description is too long');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Long Description is too long' : parsed[key].IMPORT_ERROR += ' - Error: Long Description is too long'
                                fileImported.push(parsed[key]);
                            }
                                
                            //Calc Type
                            if (parsed[key].TP_CALC_TYPE) {
                                parsed[key].TP_CALC_TYPE = parsed[key].TP_CALC_TYPE.toUpperCase();

                                if (parsed[key].TP_CALC_TYPE != 'A' && parsed[key].TP_CALC_TYPE != 'B') {
                                    listEach.push('Row '+ rowNumber + ' Calculation Type must be A or B');
                                    parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Calculation Type must be A or B' : parsed[key].IMPORT_ERROR += ' - Error: Calculation Type must be A or B'
                                    fileImported.push(parsed[key]);
                                }
                            }

                            //Include Exclude
                            if (parsed[key].TP_INCEXC_TYPE) {
                                parsed[key].TP_INCEXC_TYPE = parsed[key].TP_INCEXC_TYPE.toUpperCase();
                                
                                if (parsed[key].TP_INCEXC_TYPE != 'I' && parsed[key].TP_INCEXC_TYPE != 'E') {
                                    listEach.push('Row '+ rowNumber + ' Include/Exclude must be I or E');
                                    parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Include/Exclude must be I or E' : parsed[key].IMPORT_ERROR += ' - Error: Include/Exclude must be I or E'
                                    fileImported.push(parsed[key]);
                                }
                            }

                            //Curr Type
                            if (parsed[key].TP_CURR_TYP) {
                                if (parsed[key].TP_CURR_TYP != 'USD' && parsed[key].TP_CURR_TYP != 'Local') {
                                    listEach.push('Row '+ rowNumber + ' Currency Type must be USD or Local');
                                    parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Currency Type must be USD or Local' : parsed[key].IMPORT_ERROR += ' - Error: Currency Type must be USD or Local'
                                    fileImported.push(parsed[key]);
                                }
                            }

                            //Adjustment Amount
                            if (amt.indexOf(',') > 0) {
                                listEach.push('Row ' + rowNumber + ' Adjustment Amount cannot contain a comma');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Adjustment Amount cannot contain a comma' : parsed[key].IMPORT_ERROR += ' - Error: Adjustment Amount cannot contain a comma'
                                fileImported.push(parsed[key]);
                            }

                            if (isNaN(amt)) {
                                listEach.push('Row ' + rowNumber + ' Adjustment Amount is not valid');
                                parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Adjustment Amount is not valid' : parsed[key].IMPORT_ERROR += ' - Error: Adjustment Amount is not valid'
                                fileImported.push(parsed[key]);
                            }

                            if (validGroup && validParent && currType.trim().toLowerCase() == 'local') {
                                for (let keys in currencyType) {
                                    if (parsed[key].ENTITY_CODE == currencyType[keys].ENTITY_CODE) {
                                        parsed[key].TP_CURR = currencyType[keys].CURRENCY_TYPE;
                                    }
                                }
                            } else {
                                parsed[key].TP_CURR = 'USD';
                            }

                            //Validation of combinations
                            switch(parent1.trim().toLowerCase()){
                                case '7xxx/8xxx':
                                case 'dividend - nonop':
                                case 'eqs bmc reclass':
                                case 'hybrid profit sharing - nonop':
                                case 'interco - nonop':
                                case 'intercompany financing - nonop':
                                case 'ipp - nonop':
                                case 'mark up - nonop':
                                case 'oini - non major 922':
                                case 'other income expenses - nonop':
                                case 'slf - nonop':
                                case 'warranty recovery?':
                                    if (groupName.trim().toLowerCase() != 'unallocated brand' || parsed[key].TP_CALC_TYPE != 'A') {
                                        listEach.push('Row ' + rowNumber + ' "Unallocated brand" must be the group name and After (A) must be the calculation type for this parent');
                                        parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Unallocated brand" must be the group name and After (A) must be the calculation type for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Unallocated brand" must be the group name and After (A) must be the calculation type for this parent'
                                        fileImported.push(parsed[key]);
                                    }
                                    break;

                                case 'bus partners':
                                case 'ibm.com':
                                case 'othchg':
                                case 'restra':
                                case 'services mra':
                                case 'sga':
                                case 'stock':
                                    if (groupName.trim().toLowerCase() == 'maint branded' || groupName.trim().toLowerCase() == 'allocated' || groupName.trim().toLowerCase() == 'allocated - gbs/gps' || groupName.trim().toLowerCase() == 'allocated - its/so') {
                                        listEach.push('Row ' + rowNumber + ' "Maint Branded / Allocated / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent');
                                        parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Maint Branded / Allocated / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Maint Branded / Allocated / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent'
                                        fileImported.push(parsed[key]);
                                    }
                                    break;
                    
                                case 'agency fee':
                                case 'buy sell':
                                case 'pdl comm':
                                case 'slf':
                                    if (groupName.trim().toLowerCase() != 'sw' || parsed[key].TP_CALC_TYPE != 'A') {
                                        listEach.push('Row ' + rowNumber + ' "SW" must be the group name and After (A) must be the calculation type for this parent');
                                        parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "SW" must be the group name and After (A) must be the calculation type for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "SW" must be the group name and After (A) must be the calculation type for this parent'
                                        fileImported.push(parsed[key]);
                                    }
                                    break;
                    
                                case 'intercompany cost':
                                case 'intercompany revenue':
                                case 'ni revenue':
                                case 'non-intercompany cost':
                                    if (groupName.trim().toLowerCase() == 'maint branded' || groupName.trim().toLowerCase() == 'allocated - gbs/gps' || groupName.trim().toLowerCase() == 'allocated - its/so' || groupName.trim().toLowerCase() == 'allocated' || groupName.trim().toLowerCase() == 'unallocated brand') {
                                        listEach.push('Row ' + rowNumber + ' "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO / Allocated / Unallocated brand" cannot be the group names for this parent');
                                        parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO / Allocated / Unallocated brand" cannot be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO / Allocated / Unallocated brand" cannot be the group names for this parent'
                                        fileImported.push(parsed[key]);
                                    }

                                    if (parsed[key].TP_CALC_TYPE != 'B'){
                                        listEach.push('Row ' + rowNumber + ' Before (B) must be the calculation type for this parent');
                                        parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Before (B) must be the calculation type for this parent' : parsed[key].IMPORT_ERROR += ' - Error: Before (B) must be the calculation type for this parent'
                                        fileImported.push(parsed[key]);
                                    }
                                    break;
                    
                                case 'royalty - nonop':
                                    if (groupName.trim().toLowerCase() == 'maint branded' || groupName.trim().toLowerCase() == 'allocated - gbs/gps' || groupName.trim().toLowerCase() == 'allocated - its/so' || groupName.trim().toLowerCase() == 'allocated' || groupName.trim().toLowerCase() == 'unallocated brand') {
                                        listEach.push('Row ' + rowNumber + ' "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO / Allocated / Unallocated brand" cannot be the group names for this parent');
                                        parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO / Allocated / Unallocated brand" cannot be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO / Allocated / Unallocated brand" cannot be the group names for this parent'
                                        fileImported.push(parsed[key]);
                                    }
                                    break;
                    
                                case 'warranty recovery':
                                    if (groupName.trim().toLowerCase() == 'maint branded' || groupName.trim().toLowerCase() == 'allocated - gbs/gps' || groupName.trim().toLowerCase() == 'allocated - its/so' || groupName.trim().toLowerCase() == 'allocated' || groupName.trim().toLowerCase() == 'unallocated brand') {
                                        listEach.push('Row ' + rowNumber + ' "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent');
                                        parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent'
                                        fileImported.push(parsed[key]);
                                    }
                                    break;
                    
                                case 'logo cost':
                                    if (groupName.trim().toLowerCase() != 'hwr' || groupName.trim().toLowerCase() != 'logo' || groupName.trim().toLowerCase() != 'nonlogo') {
                                        listEach.push('Row ' + rowNumber + ' "HWR / LOGO / NONLOGO" can be the group names for this parent');
                                        parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "HWR / LOGO / NONLOGO" can be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "HWR / LOGO / NONLOGO" can be the group names for this parent'
                                        fileImported.push(parsed[key]);
                                    }
                                    break;
                
                                case 'sih':
                                    if (parsed[key].TP_CALC_TYPE == 'B'){
                                        if (groupName.trim().toLowerCase() != 'allocated - gbs/gps' || groupName.trim().toLowerCase() != 'allocated - its/so') {
                                            listEach.push('Row ' + rowNumber + ' "Allocated - GBS/GPS / Allocated - ITS/SO" can be the group names for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Allocated - GBS/GPS / Allocated - ITS/SO" can be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Allocated - GBS/GPS / Allocated - ITS/SO" can be the group names for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    } else {
                                        if (groupName.trim().toLowerCase() != 'gbs' || groupName.trim().toLowerCase() != 'gps' || groupName.trim().toLowerCase() != 'so' || groupName.trim().toLowerCase() != 'its') {
                                            listEach.push('Row ' + rowNumber + ' "GBS / GPS / SO / ITS" can be the group names for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "GBS / GPS / SO / ITS" can be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "GBS / GPS / SO / ITS" can be the group names for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    }
                                    break;

                                case 'branded expense':
                                    if (parsed[key].TP_CALC_TYPE == 'B'){
                                        if (groupName.trim().toLowerCase() == 'maint branded') {
                                            listEach.push('Row ' + rowNumber + ' "Maint Branded" cannot be the group name for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Maint Branded" cannot be the group name for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Maint Branded" cannot be the group name for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    } else {
                                        if (groupName.trim().toLowerCase() == 'maint branded' || groupName.trim().toLowerCase() == 'allocated - gbs/gps' || groupName.trim().toLowerCase() == 'allocated - its/so' || groupName.trim().toLowerCase() == 'allocated' || groupName.trim().toLowerCase() == 'unallocated brand') {
                                            listEach.push('Row ' + rowNumber + ' "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    }
                                    break;

                                case 'internal use':
                                    if (parsed[key].TP_CALC_TYPE == 'B'){
                                        if (groupName.trim().toLowerCase() != 'allocated') {                                         
                                            listEach.push('Row ' + rowNumber + ' "Allocated" must be the group name for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Allocated" must be the group name for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Allocated" must be the group name for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    } else {
                                        if (groupName.trim().toLowerCase() == 'maint branded' || groupName.trim().toLowerCase() == 'allocated - gbs/gps' || groupName.trim().toLowerCase() == 'allocated - its/so' || groupName.trim().toLowerCase() == 'allocated' || groupName.trim().toLowerCase() == 'unallocated brand') {
                                            listEach.push('Row ' + rowNumber + ' "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Maint Branded / Allocated - GBS/GPS / Allocated - ITS/SO" cannot be the group names for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    }
                                    break;

                                case 'oini - major 922':
                                    if (parsed[key].TP_CALC_TYPE == 'B'){
                                        if (groupName.trim().toLowerCase() != 'allocated - gbs/gps' || groupName.trim().toLowerCase() != 'allocated - its/so' || groupName.trim().toLowerCase() != 'unallocated brand') {
                                            listEach.push('Row ' + rowNumber + ' "Allocated - GBS/GPS / Allocated - ITS/SO / Unallocated brand" can be the group names for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Allocated - GBS/GPS / Allocated - ITS/SO / Unallocated brand" can be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Allocated - GBS/GPS / Allocated - ITS/SO / Unallocated brand" can be the group names for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    } else {
                                        if (groupName.trim().toLowerCase() != 'hwr' || groupName.trim().toLowerCase() != 'sw' || groupName.trim().toLowerCase() != 'gf' || groupName.trim().toLowerCase() != 'logo' || groupName.trim().toLowerCase() != 'nonlogo' || groupName.trim().toLowerCase() != 'other services') {
                                            listEach.push('Row ' + rowNumber + ' "HWR / SW / GF / LOGO / NONLOGO / Other Services" can be the group names for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "HWR / SW / GF / LOGO / NONLOGO / Other Services" can be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "HWR / SW / GF / LOGO / NONLOGO / Other Services" can be the group names for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    }
                                    break;

                                case 'royalty hwr maint':
                                    if (parsed[key].TP_CALC_TYPE == 'B'){
                                        if (groupName.trim().toLowerCase() != 'maint branded') {
                                            listEach.push('Row ' + rowNumber + ' "Maint Branded" must be the group name for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "Maint Branded" must be the group name for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "Maint Branded" must be the group name for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    } else {
                                        if (groupName.trim().toLowerCase() != 'logo' || groupName.trim().toLowerCase() != 'nonlogo') {
                                            listEach.push('Row ' + rowNumber + ' "LOGO / NONLOGO" can be the group names for this parent');
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: "LOGO / NONLOGO" can be the group names for this parent' : parsed[key].IMPORT_ERROR += ' - Error: "LOGO / NONLOGO" can be the group names for this parent'
                                            fileImported.push(parsed[key]);
                                        }
                                    }
                                    break;
                            }
                        } else {
                            parsed = parsed.splice(0, key);
                        }
                    }

                    rowNumber = 1;
                    let validEntity = false;
                    parsed.forEach((item) => {
                        rowNumber += 1;
                        if (Object.values(item).includes('')) {
                            listEach.push('Row '+ rowNumber + ' contains a blank field');
                            item.IMPORT_ERROR == undefined ? item.IMPORT_ERROR = 'Error: Contains a blank field' : item.IMPORT_ERROR += ' - Error: Contains a blank field'
                            fileImported.push(item);
                        }

                        for (let keys in entityCombinations) {
                            if (item.LCTRYNUM == entityCombinations[keys].LCTRYNUM && item.ENTITY_CODE == entityCombinations[keys].ENTITY_CODE) {
                                validEntity = true;
                            }
                        }
    
                        if (!validEntity) {
                            listEach.push('Row '+ rowNumber + ' contains an invalid combination of entity code and country code');
                            item.IMPORT_ERROR == undefined ? item.IMPORT_ERROR = 'Error: Contains an invalid combination of entity code and country code' : item.IMPORT_ERROR += ' - Error: Contains an invalid combination of year and selected legal entity for this country'
                            fileImported.push(item);
                        }
                    })

                    parsed.forEach((item) => {
                        Object.keys(item).map((option) => item[option] = option != 'IMPORT_ERROR' ? item[option].toString().replace(/[&#,+$~%'":*<>{}]/g, '') : item[option])
                    })

                    for (let key in parsed) {
                        parsedCheck = 0;
                        rowNumber = 1;
                        for (let keys in parsed) {
                            rowNumber += 1;
                            if (parsed[key] != undefined) {
                                if (parsed[key].TP_ACCT_PARENT1 && parsed[key].TP_GRP_NM1 && parsed[keys].TP_ACCT_PARENT1 && parsed[keys].TP_GRP_NM1) {
                                    if (parsed[key].LCTRYNUM == parsed[keys].LCTRYNUM && parsed[key].ENTITY_CODE == parsed[keys].ENTITY_CODE && parsed[key].MONTH == parsed[keys].MONTH && parsed[key].YEAR == parsed[keys].YEAR && parsed[key].TP_ACCT_PARENT1 == parsed[keys].TP_ACCT_PARENT1 && parsed[key].TP_GRP_NM1 == parsed[keys].TP_GRP_NM1 && parsed[key].TP_DESCR_SHORT == parsed[keys].TP_DESCR_SHORT && parsed[key].TP_DESCR_LONG == parsed[keys].TP_DESCR_LONG && parsed[key].TP_CALC_TYPE == parsed[keys].TP_CALC_TYPE && parsed[key].TP_INCEXC_TYPE == parsed[keys].TP_INCEXC_TYPE && parsed[key].TP_CURR_TYP == parsed[keys].TP_CURR_TYP && parsed[key].TP_AMT == parsed[keys].TP_AMT) {
                                        parsedCheck++;
                                        if (parsedCheck == 1) {
                                            parsedRow = parseInt(keys) + 2;
                                        }
                                        if (parsedCheck >= 2) {
                                            listEach.push('Row '+ rowNumber + ' contains a duplicate entry with row ' + parsedRow);
                                            parsed[key].IMPORT_ERROR == undefined ? parsed[key].IMPORT_ERROR = 'Error: Contains a duplicate entry with another row' : parsed[key].IMPORT_ERROR += ' - Error: Contains a duplicate entry with another row'
                                            fileImported.push(parsed[key]);
                                        }
                                    }     
                                }
                            }
                        }
                    }

                    listEach = [...new Set(listEach)];

                    parsedImport = [];

                    for (let key in parsed) {
                        if (parsed[key].IMPORT_ERROR == undefined) {
                            parsedImport.push(parsed[key]);
                        }
                    }

                    parsedImport = Array.from(new Set(parsedImport.map(JSON.stringify))).map(JSON.parse);

                    if (listEach.length != 0) {
                        listEach.forEach((item) => {
                            $('#display ul').append('<li>' + item + '</li>');
                        })

                        that.setState({errorList: true})
                    } else if (listEach.length == 0) {
                        that.setState({errorList: false})
                    }

                    if (fileImported.length != 0) {
                        fileImported = Array.from(new Set(fileImported.map(JSON.stringify))).map(JSON.parse);
                    }

                    document.getElementById('uploadcsv').value = '';

                    if(parsedImport.length != 0 && listEach.length == 0){
                        axios.post("/RRIW/importBoltons", {
                            params: {
                                CREATED_BY: that.userName,
                                UPDATED_BY: that.userName,
                                record: parsed
                            } 
                        }).then((response) => {
                            that.setState({ saveMessage: true })
                            that.componentWillMount();
                            that.dropdownMapping('year');
                            $('#displayList').empty();
                        }).catch((error) => {
                            console.log(error)
                        }) 
                    } else if (parsedImport.length != 0 && listEach.length != 0) {
                        axios.post("/RRIW/importBoltons", {
                            params: {
                                CREATED_BY: that.userName,
                                UPDATED_BY: that.userName,
                                record: parsedImport
                            } 
                        }).then((response) => {
                            that.setState({ saveMessage: true })
                            that.handleMessage('Only some records were imported. Please see the import error list for more details.');
                            that.componentWillMount();
                            that.dropdownMapping('year');
                        }).catch((error) => {
                            console.log(error)
                        }) 
                    } else {
                        that.handleMessage('The data was not saved. Please see the errors listed below');
                    }
                }
            })
        };
    }

    render(){
        return (
            <div style={{marginTop: "40px", marginBottom: "80px"}}>
                <div className="Rectangle-5"> 
                    <p className="Menu-Name">Import Bolt-ons</p>
                </div>

                {!this.state.contentLoaded ? 
                    <div style={{marginTop: '15%'}}>
                        <div className="ds-loader-container ds-loader-blue"></div>
                        <div className="ds-loader ds-loader"></div>
                    </div>
                :
                    <div>
                        <div style={{textAlign: 'center', fontWeight: 'bold', fontSize: '20px'}}>Instructions</div>
                        <div style={{marginLeft: '7%', marginRight: '7%', fontSize: '18px', marginBottom: '15px'}}>Please <span style={{color: 'blue', cursor: 'pointer'}} onClick={ () => require("downloadjs")('data:text/csv,LCTRYNUM,ENTITY_CODE,MONTH,YEAR,TP_ACCT_PARENT1,TP_GRP_NM1,TP_DESCR_SHORT,TP_DESCR_LONG,TP_CALC_TYPE,TP_INCEXC_TYPE,TP_CURR_TYP,TP_AMT', 'Boltons Template.csv', 'text/csv') }>download</span> the file import template and fully read the instructions, as the import will not work if any field doesnt meet the following criteria</div>

                        <div style={{marginLeft: '20%'}}>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Country(LCTRYNUM):</span><span style={{fontSize: '17px'}}> Enter a valid country code</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Legal Entity(ENTITY_CODE):</span><span style={{fontSize: '17px'}}> Enter a valid legal entity code</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Month (MONTH):</span><span style={{fontSize: '17px'}}> Enter a valid month in number format (such as 3, 10, 12)</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Year (YEAR):</span><span style={{fontSize: '17px'}}> Enter a valid year</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Parent 1 (TP_ACCT_PARENT1):</span><span style={{fontSize: '17px'}}> Enter a valid parent for the selected legal entity</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Group Name (TP_GRP_NM1):</span><span style={{fontSize: '17px'}}> Enter a valid group name for the selected legal entity</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Short Description (TP_DESCR_SHORT):</span><span style={{fontSize: '17px'}}> Enter a description of up to 40 characters</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Long Description (TP_DESCR_LONG):</span><span style={{fontSize: '17px'}}> Enter a description of up to 250 characters</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Calculation Type (TP_CALC_TYPE):</span><span style={{fontSize: '17px'}}> Enter either 'B' (before) or 'A' (after)</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Include/Exclude (TP_INCEXC_TYPE):</span><span style={{fontSize: '17px'}}> Enter either 'I' (include) or 'E' (exclude)</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Currency Type (TP_CURR_TYP):</span><span style={{fontSize: '17px'}}> Enter either 'USD' or 'Local'</span></div>
                            <div><span style={{fontWeight: 'bold', fontSize: '16px'}}>Amount (TP_AMT):</span><span style={{fontSize: '17px'}}> Enter a signed amount ( - or positive)  avoiding ','</span></div>
                        </div>
            
                        <div style={{display: 'flex', fontFamily: 'IBMPlexsans', fontSize: '16px', marginTop: '20px'}}>
                            <div style={{marginLeft: '85px'}}>
                            <div style={{ fontWeight: 'bold' }}>Please use the dropdowns below to assist with finding a country code and entity code.</div>
                                <span>Country</span>
                                <select style={{ marginLeft: '30px' }} id='country' className="filter-dropdown" onChange={(e) => this.dropdownMapping('country')} >
                                    <option value='' disabled selected='true'>Select Country</option>
                                    {Object.keys(countryOptions).map((item) => 
                                        <option value={countryOptions[item].IBM_CNTRY_CD}>{countryOptions[item].IBM_CNTRY_NM} - {countryOptions[item].IBM_CNTRY_CD}</option>
                                    )}
                                </select>
                            </div>
                            {this.state.showEntity && <div style={{marginLeft: '515px', position: 'absolute', marginTop: '22px'}}>
                                <span>Legal Entity</span>
                                {entityOptions.length != 0 && <select style={{ marginLeft: '30px' }} id='entity' className="filter-dropdown" onChange={(e) => this.dropdownMapping('entity')} >
                                    <option value='' disabled selected='true'>Select Legal Entity</option>
                                    {Object.keys(entityOptions).map((item) => 
                                        <option value={entityOptions[item].ENTITY_CODE}>{entityOptions[item].ENTITY_CODE} - {entityOptions[item].ENTITY_DESC}</option>
                                    )}
                                </select>}
                                {entityOptions.length == 0 && <span style={{ marginLeft: '40px' }}>No entities found.</span>}
                            </div>}
                            {this.state.showEntity && <div style={{ fontWeight: 'bold', position: 'absolute', marginTop: '50px', marginLeft: '85px' }}>Country Code: {document.getElementById('country').value}</div>}
                            {this.state.entity && <span style={{ fontWeight: 'bold', position: 'absolute', marginTop: '50px', marginLeft: '270px' }}>Entity Code: {document.getElementById('entity').value}</span>}
                            {this.state.showEntity && <div style={{ fontWeight: 'bold', position: 'absolute', marginTop: '70px', marginLeft: '85px' }}>Note: These dropdowns have no effect on the import sheet, they are used only for finding valid country/entity combinations.</div>}
                            <input id='uploadcsv' type='file' accept='.csv' style={{marginLeft: "85px", position: 'absolute', marginTop: '100px'}} />
                        </div>
                        {this.state.saving && 
                            <div>
                                <div className="ds-loader-container ds-loader-blue"></div>
                                <div style={{ marginLeft: '110px', marginTop: '85px' }} className="ds-loader ds-loader loading-wheel"></div>
                            </div>
                        }
                        {!this.state.saving && <div>
                            <button id='button' style={{ cursor: 'pointer', marginTop: '95px', marginLeft: '85px', border: 'transparent', backgroundColor: 'rgb(246, 213, 3)', padding: '10px 12px', width: '95px', fontFamily: 'IBMPlexSans'}} onClick={() => this.uploads()}>IMPORT</button>
                        </div>}
                        <div id='display'>
                            {this.state.errorList && <div style={{ marginLeft: '7%', marginRight: '7%', marginTop: '30px', fontWeight: 'bold' }}>The following errors were found in the file provided. Please use the button below to export and update all rows with errors then import the file again.</div>}
                            {this.state.errorList && <div style={{ marginTop: '10px', marginLeft: '90px' }}><span className="ds-icon-export" style={{ marginLeft: '20px' }}></span><button id="exportData" onClick={this.exportToCsv} class="add-Button" style={{ width: '165px' }}>EXPORT TO CSV</button></div>}
                            <ul style={{ marginLeft: '4%' }} id='displayList'></ul> 
                        </div>
                    </div>
                }

                {/* Material UI SnackBar -- Success/Error Message Alert */}
                {this.state.saveMessage &&
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left'
                        }}
                        open={this.state.saveMessage}
                        autoHideDuration={6000}
                        onClose={this.handleAlertClose}
                    >
                        <MySnackbarContentWrapper
                            onClose={this.handleAlertClose}
                            variant="success"
                            message="Your data has been saved!"
                        />
                    </Snackbar>
                }
                {/* End Material UI SnackBar */}

                {/* Material UI Custom Alert Box for Validation */}
                {this.state.validation &&
                    <DialogMaterial
                        open={this.state.validation}
                        onClose={this.handleAlertClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {this.validationMessage}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleAlertClose} color="primary" style={{ color: '#2f2f2f', backgroundColor: '#f6d503', height: '46px', width: '99px' }}>
                                Ok
                            </Button>
                        </DialogActions>
                    </DialogMaterial>
                }
                {/* End Material UI Custom Alert for Validation */}
            </div>
        );
    }
} 

export default ImportTaxableAdjustments;