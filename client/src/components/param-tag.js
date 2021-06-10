import React, { Component } from 'react';
import { faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from 'lodash';
import "../styles/param.css"

class ParamTag extends Component{

    componentDidMount() {
        const { name, handleNext } = this.props;
        let thisList = document.getElementById(`list_${name}`);
        thisList.addEventListener('scroll', (e) => {
            if (thisList.scrollTop / (thisList.scrollHeight - thisList.clientHeight ) > 0.9) {
                handleNext(name);
            }
        });
    }

    generateTags(selectionArray) {
        const { name, removeTag } = this.props;
        let tempArray = [];
        if (selectionArray.length > 0) {
            selectionArray.map((tag, index) => {
                tempArray.push(
                    <div className="col" key={index}>
                        <div className="tag-container">
                            <span>{tag}</span>
                            <div type="button" className="mdb-icon drop-mdb-icon" onClick={event => removeTag(event, name, tag)}>
                                <svg><FontAwesomeIcon icon="times" className="fa mr-2" /></svg>
                            </div>
                        </div> 
                    </div>
                )
            });
        }
        return tempArray;
    }

    render() {
        const { name, object, focused, onChange, onFocus, onHover, handleSelect, toggleDropDown, addTag } = this.props;
        const { value, placeholder, selection, options, hover, selectionArray } = object;
        return(

            <div className="row row-cols-1">
                <div className="col">
                    <form autoComplete="off" className="row" style={{paddingRight: "15px"}}>
                        <div className="col">
                                <label className={_.isEqual(focused, name) || !!selection.name ? "drop-label small" : "drop-label"} htmlFor={name}>Add {placeholder}</label>
                                <p className="drop-p" hidden={!!_.isEqual(focused, name) || selection.name === ''}>{selection.name}</p>
                                <div className="form-group drop-form-group" style={{flexGrow: "1"}}>
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
                                            {options.map((option, index) => //.filter(e => !selectionArray.includes(e._id))
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
                        </div>
                        <button type="button" className="btn tag-btn-add float-right" style={{marginBottom: "16px"}} disabled={!!selection._id && !selectionArray.includes(selection._id) ? false : true} onClick={event => addTag(event, name, selection._id)}>
                            <FontAwesomeIcon icon="plus" className="fa"/>
                        </button>
                    </form>
                </div>

                {this.generateTags(selectionArray)}
            </div>
        );
    }
}

export default ParamTag;