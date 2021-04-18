import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
import { saveAs } from 'file-saver';
import authHeader from "../../helpers/auth-header";
import copyObject from "../../functions/copyObject";
import getPageSize from "../../functions/getPageSize";

import TableHeaderInput from "../../components/table-header-input";
import TableData from "../../components/table-data";
import Layout from "../../components/layout";
import Pagination from "../../components/pagination";
import _ from "lodash";

export default class Export extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            processes: [],
            filter: {
                type:"",
                status:"",
                user:"",
                createdAt:"",
                expiresAt: ""
            },
            sort: {
                name: "",
                isAscending: true,
            },
            alert: {
                type: "",
                message: ""
            },
            retrieving: false,
            upserting: false,
            loaded: false,
            submitted: false,
            menuItem: "Export data",
            settingsColWidth: {},
            paginate: {
                pageSize: 0,
                currentPage: 1,
                firstItem: 0,
                lastItem: 0,
                pageItems: 0,
                pageLast: 1,
                totalItems: 0,
                first: 1,
                second: 2,
                third: 3
            }
        };

        this.resize = this.resize.bind(this);
        this.handleClearAlert = this.handleClearAlert.bind(this);
        this.setAlert = this.setAlert.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
        this.handleChangeHeader = this.handleChangeHeader.bind(this);
        this.getDocuments = this.getDocuments.bind(this);
        this.colDoubleClick = this.colDoubleClick.bind(this);
        this.setColWidth = this.setColWidth.bind(this);
        this.changePage = this.changePage.bind(this);
        this.handleDownlaod = this.handleDownlaod.bind(this);
        this.generateBody = this.generateBody.bind(this);
    }


    

    componentDidMount() {
        const { paginate } = this.state;
        const tableContainer = document.getElementById("table-container");
        this.interval = setInterval(() => this.getDocuments(this.state.paginate.currentPage), 3000);
        this.setState({
            paginate: {
                ...this.state.paginate,
                pageSize: getPageSize(tableContainer.clientHeight)
            }
        }, () => this.getDocuments(this.state.paginate.currentPage));
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    resize() {
        const tableContainer = document.getElementById("table-container");
        this.setState({
            paginate: {
                ...this.state.paginate,
                pageSize: getPageSize(tableContainer.clientHeight)
            }
        }, () => this.getDocuments(this.state.paginate.currentPage));
    }

    componentDidUpdate(prevProps, prevState) {
        const { sort, filter, paginate } = this.state;
        if (sort !== prevState.sort || filter !== prevState.filter || (paginate.pageSize !== prevState.paginate.pageSize && prevState.paginate.pageSize !== 0)) {
            this.getDocuments();
        }
    }

    handleClearAlert(event) {
        event.preventDefault();
        this.setState({
            alert: {
                type: "",
                message: ""
            }
        });
    }

    setAlert(type, message) {
        this.setState({
            alert: {
                type: type,
                message: message
            }
        })
    }

    toggleSort(event, name) {
        event.preventDefault();
        const { sort } = this.state;
        if (sort.name !== name) {
            this.setState({
                sort: {
                    name: name,
                    isAscending: true
                }
            });
        } else if (!!sort.isAscending) {
            this.setState({
                sort: {
                    name: name,
                    isAscending: false
                }
            });
        } else {
            this.setState({
                sort: {
                    name: "",
                    isAscending: true
                }
            });
        }
    }

    handleChangeHeader(event) {
        const { filter } = this.state;
        const { name, value } = event.target;
        this.setState({
            filter: {
                ...filter,
                [name]: value
            }
        });
    }

    getDocuments(nextPage) {
        const { filter, sort, paginate } = this.state;
        if (!!paginate.pageSize) {
            this.setState({
                retrieving: true
            }, () => {
                const requestOptions = {
                    method: "POST",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filter: filter,
                        sort: sort,
                        nextPage: nextPage,
                        pageSize: paginate.pageSize
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/exports/getAll`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        retrieving: false,
                    }, () => {
                        const data = text && JSON.parse(text);
                        const resMsg = (data && data.message) || response.statusText;
                        if (response.status === 401) {
                            // Unauthorized
                            localStorage.removeItem("user");
                            window.location.reload(true);
                        } else if (response.status !== 200) {
                            this.setState({
                                alert: {
                                    type: "alert-danger",
                                    message: resMsg
                                }
                            });
                        } else {
                            this.setState({
                                processes: data[0].data,
                                paginate: {
                                    ...paginate,
                                    ...data[0].paginate,
                                }
                            });
                        }
                    });
                }))
                .catch( () => {
                    localStorage.removeItem("user");
                    window.location.reload(true);
                });
            });
        }
    }

    colDoubleClick(event, index) {
        event.preventDefault();
        const { settingsColWidth } = this.state;
        if (settingsColWidth.hasOwnProperty(index)) {
            let tempArray = copyObject(settingsColWidth);
            delete tempArray[index];
            this.setState({ settingsColWidth: tempArray });
        } else {
            this.setState({
                settingsColWidth: {
                    ...settingsColWidth,
                    [index]: 10
                }
            });
        }
    }

    setColWidth(index, width) {
        const { settingsColWidth } = this.state;
        this.setState({
            settingsColWidth: {
                ...settingsColWidth,
                [index]: width
            }
        });
    }

    changePage(event, nextPage) {
        event.preventDefault();
        const { paginate } = this.state;
        if ((nextPage > 0) && (nextPage < (paginate.pageLast + 1))) {
            this.getDocuments(nextPage);
        }
    }

    handleDownlaod(event, exportId) {
        event.preventDefault();
        const { downloadingExport } = this.state;
        if (!!exportId && !downloadingExport) {
            this.setState({
                downloadingExport: true
            }, () => {
                const requestOptions = {
                    method: "GET",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/exports/download/${exportId}`, requestOptions)
                .then(response => {
                    this.setState({ downloadingExport: false });
                    if (!response.ok) {
                        if (response.status === 401) {
                            localStorage.removeItem('user');
                            window.location.reload(true);
                        } else {
                            response.text().then(text => {
                                const data = text && JSON.parse(text);
                                const resMsg = (data && data.message) || response.statusText;
                                this.setState({
                                    alert: {
                                        type: "alert-danger",
                                        message: resMsg
                                    },
                                });
                            });
                        }
                    } else {
                        response.blob().then(blob => saveAs(blob, "export.xlsx"));
                    }
                });
            });
        }
    }

    generateBody() {
        const { processes, retrieving, paginate, settingsColWidth } = this.state;
        let tempRows = [];
        if (!_.isEmpty(processes) || !retrieving) {
            processes.map((process) => {
                tempRows.push(
                    <tr key={process._id}>
                        <TableData colIndex="0" value={process.type} type="text" settingsColWidth={settingsColWidth} eventId={process._id} />
                        <TableData colIndex="1" value={process.user} type="text" settingsColWidth={settingsColWidth} eventId={process._id} />
                        <TableData colIndex="2" value={process.createdAtX} type="text" settingsColWidth={settingsColWidth} eventId={process._id} />
                        <TableData colIndex="3" value={process.expiresAtX} type="text" settingsColWidth={settingsColWidth} eventId={process._id} />
                        <TableData colIndex="4" value={process.status} type="text" settingsColWidth={settingsColWidth} handleDownlaod={this.handleDownlaod} eventId={process._id} />
                    </tr>
                );
            });
        } else {
            for (let i = 0; i < paginate.pageSize; i++) {
                tempRows.push(
                    <tr key={i}>
                        <td className="no-select"><Skeleton /></td>
                        <td className="no-select"><Skeleton /></td>
                        <td className="no-select"><Skeleton /></td>
                        <td className="no-select"><Skeleton /></td>
                        <td className="no-select"><Skeleton /></td>
                    </tr>
                );
            }
        }
        return tempRows;
    }

    render() {
        const { collapsed, toggleCollapse } = this.props;
        const { alert, menuItem, filter, sort, settingsColWidth } = this.state;
        const { currentPage, firstItem, lastItem, pageItems, pageLast, totalItems, first, second, third } = this.state.paginate;

        return (
            <Layout collapsed={collapsed} toggleCollapse={toggleCollapse} menuItem={menuItem}>
                {alert.message &&
                    <div className={`alert ${alert.type}`}>{alert.message}
                        <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                            <span aria-hidden="true"><FontAwesomeIcon icon="times" /></span>
                        </button>
                    </div>
                }
                <div id="setting" className={alert.message ? "main-section-alert" : "main-section"}>
                    <div className="body-section">
                        <div className="row ml-1 mr-1" style={{ height: "calc(100% - 40px)" }}> {/* borderStyle: "solid", borderWidth: "1px", borderColor: "#ddd", */}
                            <div id="table-container" className="table-responsive custom-table-container" >
                                <table className="table table-hover table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <TableHeaderInput
                                                type="text"
                                                title="Type"
                                                name="type"
                                                value={filter.type}
                                                onChange={this.handleChangeHeader}
                                                width="25%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="0"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="User"
                                                name="user"
                                                value={filter.user}
                                                onChange={this.handleChangeHeader}
                                                width="25%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="1"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="Date"
                                                name="createdAt"
                                                value={filter.createdAt}
                                                onChange={this.handleChangeHeader}
                                                width="25%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="Expires"
                                                name="expiresAt"
                                                value={filter.expiresAt}
                                                onChange={this.handleChangeHeader}
                                                width="25%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="3"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="Status"
                                                name="status"
                                                value={filter.status}
                                                onChange={this.handleChangeHeader}
                                                width="25%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="4"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                        </tr>
                                    </thead>
                                    <tbody className="full-height">
                                        {this.generateBody()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            pageLast={pageLast}
                            first={first}
                            second={second}
                            third={third}
                            firstItem={firstItem}
                            lastItem={lastItem}
                            pageItems={pageItems}
                            totalItems={totalItems}
                            changePage={this.changePage}
                        />
                    </div>
                </div>
            </Layout>
        );
    }
}
