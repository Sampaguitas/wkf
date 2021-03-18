import React from "react";
import typeToString from "../functions/typeToString";
import getDateFormat from "../functions/getDateFormat";
import _ from "lodash";

export default class TableData extends React.Component{
    render() {
        const { colIndex, value, type, align, settingsColWidth, handleClick, eventId} = this.props
        return (
            <td
              style={{
                width: "auto",
                whiteSpace: "nowrap",
                paddingLeft: "5px",
                textOverflow: "ellipsis",
                textAlign: align || "left",
                overflow: "hidden",
                minWidth: _.isUndefined(settingsColWidth) || !settingsColWidth.hasOwnProperty(colIndex) ? 0 : (!!settingsColWidth[colIndex] ? `${settingsColWidth[colIndex]}px` : "10px"),
                maxWidth: _.isUndefined(settingsColWidth) || !settingsColWidth.hasOwnProperty(colIndex) ? "none" : (!!settingsColWidth[colIndex] ? `${settingsColWidth[colIndex]}px` : "35px")
              }}
              onClick={event => !!handleClick && !!eventId ? handleClick(event, eventId) : event.preventDefault()}
            >
              {typeToString(value, type, getDateFormat())}
            </td>
        );
    }
}