import React from "react";
import "../styles/modal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            transition: ""
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show) {
            if (!!this.props.show) {
                this.setState({show: true}, () => setTimeout(() => this.setState({transition: " transition"}), 100));
            } else {
                this.setState({ transition: "" }, () => setTimeout(() => this.setState({show: false}), 600));
            }
        }
    }

    render() {
        if(!this.state.show){
            return null;
        }
        return (
            <div className={`modal${this.state.transition}`} tabIndex="-1" role="dialog">
                <div className={`modal-dialog${this.props.size ? " " + this.props.size : ""}${this.state.transition}`} role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-header-close">
                                <button type="button" className="modal-header-close-button" onClick={this.props.hideModal} data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true" className="modal-header-close-button-icon">
                                        <FontAwesomeIcon icon="times" data-dismiss="modal" aria-label="Close"/>
                                    </span>
                                </button>
                            </div>
                            <div className="modal-header-title">
                                {this.props.title}
                            </div>
                            {!!this.props.clearModal ? <button className="modal-header-clear" onClick={event => !!this.props.clearModal ? this.props.clearModal(event) : event.preventDefault()}>Clear</button> : <span></span>}
                        </div>
                            {this.props.children}
                    </div>
                </div> 
            </div>
        );
    }
}