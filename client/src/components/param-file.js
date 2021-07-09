import React, { Component } from 'react';
import "../styles/param.css"

class ParamFile extends Component{

    render() {
        const { name, placeholder, onChange, selection, fileRef } = this.props;
        return(
            <div className="col mt-3">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <input
                            autoComplete="off"
                            type="file"
                            name={name}
                            id={name}
                            ref={fileRef}
                            className="custom-file-input"
                            style={{opacity: 0, position: 'absolute', pointerEvents: 'none', width: '1px'}}
                            onChange={event => onChange(event, name)}
                            key={selection._id}
                        />
                    </div>
                    <label type="text" className="form-control drop-file" htmlFor={name}>{selection.name ? selection.name : placeholder}</label>
                </div>
            </div>
        );
    }
}

export default ParamFile;