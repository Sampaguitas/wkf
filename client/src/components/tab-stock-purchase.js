import React from "react";
import Skeleton from "react-loading-skeleton";
import getDateFormat from "../functions/getDateFormat";
import typeToString from "../functions/typeToString";

export default class TabStockPurchase extends React.Component {

    render() {
        const { article, retrievingArticle } = this.props
        return (
            <section>
                <div className="table-responsive" id="purchase_info">
                    <table className="table table-hover">
                        <tbody>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "supplier"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.purchase.supplier}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "qty"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.purchase.qty, "number", getDateFormat())} ${article.uom}`}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "firstInStock"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.purchase.firstInStock, "number", getDateFormat())} ${article.uom}`}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "deliveryDate"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : typeToString(article.purchase.deliveryDate, "date", getDateFormat())}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
}