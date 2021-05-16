import React from "react";
import Skeleton from "react-loading-skeleton";
import getDateFormat from "../functions/getDateFormat";
import typeToString from "../functions/typeToString";

export default class TabStockArticle extends React.Component {

    render() {
        const { article, retrievingArticle } = this.props
        return (
            <section>
                <div className="table-responsive" id="article">
                    <table className="table table-hover">
                        <tbody>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "vLunar"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.vlunar}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "description"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.description}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "artNr"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.artNr}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "qty"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.qty, "number", getDateFormat())} ${article.uom}`}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "weight"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.weight, "number", getDateFormat())} KG`}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "gip"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.price.gip, "number", getDateFormat())} EUR`}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "rv"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.price.rv, "number", getDateFormat())} EUR`}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
}