import React from "react";
import Skeleton from "react-loading-skeleton";

export default class TabStockParams extends React.Component {

    render() {
        const { article, retrievingArticle } = this.props;
        const { sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface } = article.parameters;
        return (
            <section>
                <div className="table-responsive" id="params_info">
                    <table className="table table-hover">
                        <tbody>
                            <tr>
                                <th scope="row" className="w-40">sizeOne</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : sizeOne.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">sizeTwo</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : sizeTwo.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">sizeThree</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : sizeThree.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">wallOne</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : wallOne.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">wallTwo</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : wallTwo.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">type</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : type.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">grade</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : grade.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">length</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : length.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">end</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : end.name}</td>
                            </tr>
                            <tr>
                                <th scope="row" className="w-40">surface</th>
                                <td className="w-60">{retrievingArticle? <Skeleton /> : surface.name}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
}