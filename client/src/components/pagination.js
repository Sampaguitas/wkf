import React, { Component } from "react";
import "../styles/pagination.css";

export default class Pagination extends Component {

    render() {
        const { currentPage, pageLast, first, second, third, firstItem, lastItem, pageItems, totalItems, changePage } = this.props
        return (
            <div className="pagination-row row ml-1 mr-1">
                <div className="pagination-col col">
                    <nav aria-label="Page navigation" className="pagination-nav">
                        <ul className="pagination">
                            <li className={currentPage === 1 ? "page-item disabled" : "page-item"}>
                                <button className="page-link" onClick={event => changePage(event, currentPage - 1)}>Previous</button>
                            </li>
                            <li className={`page-item${currentPage === first && " active"}`}><button className="page-link" onClick={event => changePage(event, first)}>{first}</button></li>
                            <li className={`page-item${currentPage === second ? " active" : pageLast < 2 && " disabled"}`}><button className="page-link" onClick={event => changePage(event, second)}>{second}</button></li>
                            <li className={`page-item${currentPage === third ? " active" : pageLast < 3 && " disabled"}`}><button className="page-link" onClick={event => changePage(event, third)}>{third}</button></li>
                            <li className={currentPage === pageLast ? "page-item disabled" : "page-item"}>
                                <button className="page-link" onClick={event => changePage(event, currentPage + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="col text-right displaying">Displaying<b> {firstItem} - {lastItem} </b><i>({pageItems})</i> entries out of {totalItems}</div>
            </div>
        ); 
    }
}