import React, {Component} from 'react';
import { DataTable } from 'react-data-components';
import Tbl from '../../datatable/tpMapping';
import "../transferPricing.css";

class Mapping extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div style={{marginBottom: "80px"}}>
                <div className="ds-col-sm-12 ds-col-md-12  bg-bl" style={{padding: "0"}}>
                    <div>
                        <div className="Rectangle-5"> 
                            <div className="Menu-Name" style={{float:"left"}}>Mapping</div>
                        </div>
                    </div>
                </div>

                <div>
                    <Tbl></Tbl>
                </div>
            </div>
        );
    }
}

export default Mapping;