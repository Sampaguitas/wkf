import React, { Component } from 'react';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from 'lodash';
import "../styles/param.css"

class ParamInput extends Component{

    render() {
        const { name, focused, value, placeholder, onChange, onFocus, handleClearValue } = this.props;
        return(
            <div className="col">
                <form autoComplete="off">
                    <label className={_.isEqual(focused, name) || !!value ? "drop-label small" : "drop-label"} htmlFor={name}>{placeholder}</label>
                    <div className="form-group drop-form-group">
                        <input
                            autoComplete="off"
                            type="text"
                            className="form-control drop-form-control"
                            id={name}
                            name={name}
                            value={value}
                            onChange={onChange}
                            onFocus={onFocus}
                        />
                        {value &&
                            <div type="button" className="mdb-icon drop-mdb-icon" onClick={event => handleClearValue(event, name)}>
                                <svg><FontAwesomeIcon icon={faTimes} /></svg>
                            </div>
                        }
                    </div>
                </form>
            </div>
        );
    }
}

export default ParamInput;