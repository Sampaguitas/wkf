import React from "react";
import _ from "lodash";

export default class CurrencyTable extends React.Component{
    constructor(props) {
        super(props);
        this.state = { rates: [] };
    }

    componentDidMount() {
        const requestOptions = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        };
        return fetch(`${process.env.REACT_APP_API_URI}/server/rates/currencyTable`, requestOptions)
        .then(response => response.text().then(text => {
            const data = text && JSON.parse(text);
            const resMsg = (data && data.message) || response.statusText;
            if (response.status === 200 || !_.isEmpty(data.rates)) {
            this.setState({
                    rates: data.rates
                });
            }
        }));
    }

    render() {
        const { rates } = this.state;
        return(
            <div className="container full-height" style={{overflowY: "auto"}}>
                <div className="table-responsive" >
                    <table id="table" className="table">
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>units / USD</th>
                            <th>USD / unit</th>
                        </tr>
                        {rates.map(rate => (
                            <tr>
                                <td>{rate._id}</td>
                                <td>{rate.name}</td>
                                <td>{rate.unitPerUsd}</td>
                                <td>{rate.usdPerUnit}</td>
                            </tr>
                        ))}
                    </table>
                </div>     
            </div>
        );
    }
}