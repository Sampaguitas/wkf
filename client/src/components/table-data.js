import React from "react";
import typeToString from "../functions/typeToString";
import getDateFormat from "../functions/getDateFormat";
import _ from "lodash";

export default class TableData extends React.Component{
    render() {
        const { colIndex, value, type, align, settingsColWidth, handleClick, handleDownlaod, eventId} = this.props
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
              onClick={event => !!handleClick && !!eventId && value !== "complete" ? handleClick(event, eventId) : event.preventDefault()}
            >
              {!!handleDownlaod && eventId && value === "complete" ? (
                <button type="button" className="btn btn-sm btn-link p-0 shadow-none" onClick={event => handleDownlaod(event, eventId)}>Download</button>
                // typeToString(value, type, getDateFormat())
              ):(
                typeToString(value, type, getDateFormat())
              )
              }
            </td>
        );
    }
}