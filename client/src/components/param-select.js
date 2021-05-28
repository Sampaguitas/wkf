import React, { Component } from 'react';
import { faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from 'lodash';
import "../styles/param.css"

class ParamSelect extends Component{

    componentDidMount() {
        const { name, handleNext } = this.props;
        let thisList = document.getElementById(`list_${name}`);
        thisList.addEventListener('scroll', (e) => {
            if (thisList.scrollTop / (thisList.scrollHeight - thisList.clientHeight ) > 0.9) {
                handleNext(name);
            }
        });
    }

    render() {
        const { name, focused, value, placeholder, onChange, onFocus, onHover, options, hover, selection, handleSelect, toggleDropDown } = this.props;
        return(
            <div className="col">
                <form autoComplete="off">
                    <label className={_.isEqual(focused, name) || !!selection.name ? "drop-label small" : "drop-label"} htmlFor={name}>{placeholder}</label>
                    <p className="drop-p" hidden={!!_.isEqual(focused, name) || selection.name === ''}>{selection.name}</p>
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
                        <div type="button" className="mdb-icon drop-mdb-icon" onClick={event => toggleDropDown(event, name)}>
                            <svg><FontAwesomeIcon icon={!!_.isEqual(focused, name) || !!selection.name ? faTimes : faChevronDown} /></svg>
                        </div>
                        <ul id={`list_${name}`} className={!_.isEmpty(options) && _.isEqual(focused, name) ? "drop-ul_visible" : "drop-ul"}>
                            {options.map((option, index) =>
                                <li
                                    key={index}
                                    type="button"
                                    onMouseEnter={event => onHover(event, name, option._id)}
                                    onClick={event => handleSelect(event, name, option._id, option.name)}
                                    className={option._id === hover ? "drop-li_selected" : "drop-li"}
                                    selected={option.Id === hover ? "selected" : ""}
                                >
                                    {option.name}
                                </li>
                            )}
                        </ul>
                    </div>
                </form>
            </div>
        );
    }
}

export default ParamSelect;