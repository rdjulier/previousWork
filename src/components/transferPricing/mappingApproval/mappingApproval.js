import React, {Component} from 'react';
import { DataTable } from 'react-data-components';
import Tbl from '../../datatable/tpMappingApproval';
import "../transferPricing.css";

class MappingApproval extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>
                <div className="ds-col-sm-12 ds-col-md-12  bg-bl" style={{padding: "0"}}>
                    <div>
                        <div className="Rectangle-5"> 
                            <div className="Menu-Name" style={{float:"left"}}>Approval</div>
                        </div>
                    </div>
                </div>

                <div id="viewMappingApproval">
                    <Tbl></Tbl>
                </div>
            </div>
        );
    }
}

export default MappingApproval;