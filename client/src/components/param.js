import React, { Component } from 'react';
import { faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from 'lodash';
import "../styles/param.css"

class Param extends Component{

    render() {
        const { name, focused, value, placeholder, onChange, onFocus, onHover, options, hover, selection, handleSelect, toggleDropDown } = this.props;
        return(
            <div className="col">
                <label className={_.isEqual(focused, name) || !!selection ? "drop-label small" : "drop-label"} htmlFor={name}>{placeholder}</label>
                <p className="drop-p" hidden={!!_.isEqual(focused, name) || selection === ''}>{selection}</p>
                <div className="form-group drop-form-group">
                    <input
                        type="text"
                        className="form-control drop-form-control"
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onFocus={onFocus}
                    />
                    <div type="button" className="mdb-icon drop-mdb-icon" onClick={event => toggleDropDown(event, name)}>
                        <svg><FontAwesomeIcon icon={!!_.isEqual(focused, name) || !!selection ? faTimes : faChevronDown} /></svg>
                    </div>
                    <ul id={`list_${name}`} className={!_.isEmpty(options) && _.isEqual(focused, name) ? "drop-ul_visible" : "drop-ul"}>
                        {options.map((option, index) =>
                            <li
                                key={index}
                                type="button"
                                onMouseEnter={event => onHover(event, name, option)}
                                onClick={event => handleSelect(event, name, option)}
                                className={option === hover ? "drop-li_selected" : "drop-li"}
                                selected={option === hover ? "selected" : ""}
                            >
                                {option}
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            
        );
    }
}

export default Param;