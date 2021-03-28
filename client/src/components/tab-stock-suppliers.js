import React from "react";
import Skeleton from "react-loading-skeleton";
import getDateFormat from "../functions/getDateFormat";
import typeToString from "../functions/typeToString";

export default class TabStockSuppliers extends React.Component {

    render() {
        const { article, retrievingArticle } = this.props
        return (
            <section>
                <div className="table-responsive" id="supplier_info">
                    <table className="table table-hover">
                        <tbody>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[0] || "supplier 1"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[0], "number", getDateFormat())} ${article.uom}`}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[1] || "supplier 2"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[1], "number", getDateFormat())} ${article.uom}`}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[2] || "supplier 3"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[2], "number", getDateFormat())} ${article.uom}`}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[3] || "supplier 4"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[3], "number", getDateFormat())} ${article.uom}`}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
}