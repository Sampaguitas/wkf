import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class TableHeader extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            clientXStart: 0,
            parentWidth: 0,

        }
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onDragStart(event) {
        this.setState({
            clientXStart: event.clientX,
            parentWidth: event.target.parentElement.offsetWidth
        });
    }

    onDragEnd(event) {
        const { index, setColWidth } = this.props;
        const { clientXStart, parentWidth } = this.state;
        let distanceX = event.clientX - clientXStart;
        setColWidth(index, Math.max(parentWidth + distanceX, 10))
    }

    render() {
        
        const { title, name, width, textNoWrap, sort, toggleSort, index, settingsColWidth, colDoubleClick } = this.props;
        return (
            <th 
                style={{
                    width: `${width ? width : "auto"}`,
                    whiteSpace: `${textNoWrap ? "nowrap" : "auto"}`,
                    padding: "0px"
                }}
            >
                <div role="button" className="btn-header" onClick={event => toggleSort(event, name)}>
                    <span
                        className="btn-header-title no-select"
                        style={{
                            textOverflow: "ellipsis",
                            overflow: "hidden", 
                            minWidth: !settingsColWidth.hasOwnProperty(index) ? 0 : (!!settingsColWidth[index] ? `${settingsColWidth[index]}px` : "10px"),
                            maxWidth: !settingsColWidth.hasOwnProperty(index) ? "none" : (!!settingsColWidth[index] ? `${settingsColWidth[index]}px` : "35px")
                        }}
                    >
                        {title}
                    </span>
                    <span className="btn-header-icon">
                        {sort.name === name && sort.isAscending ?
                            <FontAwesomeIcon icon="sort-up" className="btn-header-icon__icon"/>
                        : sort.name === name && !sort.isAscending &&
                            <FontAwesomeIcon icon="sort-down" className="btn-header-icon__icon"/>
                        }
                    </span>
                </div>
                <div
                    id="draggable-column"
                    role="button"
                    style={{
                        position: "absolute",
                        top: "0px",
                        bottom: "0px",
                        right: "0px",
                        width:"3px",
                        height: "auto",
                        zIndex: "2",
                        cursor: "col-resize"
                    }}
                    draggable
                    onDragStart={event => this.onDragStart(event)}
                    onDragEnd={event => this.onDragEnd(event)}
                    onDoubleClick={event => colDoubleClick(event, index)}
                >

                </div>
            </th>
        );
    }
}