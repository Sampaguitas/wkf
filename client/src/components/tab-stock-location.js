import React from "react";
import Skeleton from "react-loading-skeleton";
// import getDateFormat from "../functions/getDateFormat";
// import typeToString from "../functions/typeToString";

export default class TabStockLocation extends React.Component {

    render() {
        const { article, retrievingArticle } = this.props
        return (
            <section>
                <div className="table-responsive" id="location">
                    <table className="table table-hover">
                        <tbody>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "title"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.title}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "address"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.address}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "postal code"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.postalcode}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "city"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.city}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "country"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.country}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "tel"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.tel}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "fax"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.fax}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "email"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.email}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "price info"}</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.location.price_info}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
}