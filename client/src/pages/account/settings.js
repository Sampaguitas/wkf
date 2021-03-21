import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
import authHeader from "../../helpers/auth-header";
import copyObject from "../../functions/copyObject";
import getPageSize from "../../functions/getPageSize";

import TableHeaderCheckBox from "../../components/table-header-check-box";
import TableHeaderInput from "../../components/table-header-input";
import TableData from "../../components/table-data";
import TableCheckBoxAdmin from "../../components/table-check-box-admin";
import Input from "../../components/input";
import Layout from "../../components/layout";
import Modal from "../../components/modal";
import Pagination from "../../components/pagination";
import _ from "lodash";

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: {},
            user: {},
            users: [],
            filter: {
                name: "",
                email: "",
                isAdmin: 0,
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
            showUser: false,
            menuItem: "",
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
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.handleChangeUser = this.handleChangeUser.bind(this);
        this.handleChangeHeader = this.handleChangeHeader.bind(this);
        this.getDocuments = this.getDocuments.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleOnclick = this.handleOnclick.bind(this);
        this.colDoubleClick = this.colDoubleClick.bind(this);
        this.setColWidth = this.setColWidth.bind(this);
        this.changePage = this.changePage.bind(this);
        this.generateBody = this.generateBody.bind(this);
    }

    componentDidMount() {
        const { menuItem, paginate } = this.state;
        let currentUser = JSON.parse(localStorage.getItem("user"));
        const tableContainer = document.getElementById("table-container");
        if (!!currentUser) {
            this.setState({
                currentUser: currentUser,
                paginate: {
                    ...paginate,
                    pageSize: getPageSize(tableContainer.clientHeight)
                }
            }, () => this.getDocuments());
        } else {
            localStorage.removeItem("user");
            window.location.reload(true);
        }
    }

    resize() {
        const { paginate } = this.state;
        const tableContainer = document.getElementById("table-container");
        this.setState({
            paginate: {
                ...paginate,
                pageSize: getPageSize(tableContainer.clientHeight)
            }
        }, () => this.getDocuments());
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

    showModal() {
        this.setState({
            user: {
                name: "",
                email: ""
            },
            showUser: true
        });
    }

    hideModal() {
        this.setState({
            user: {
                name: "",
                email: ""
            },
            submitted: false,
            showUser: false
        });
    }

    handleChangeUser(event) {
        const { name, value } = event.target;
        const { user } = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
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
                return fetch(`${process.env.REACT_APP_API_URI}/api/users/getAll`, requestOptions)
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
                                users: data.users,
                                paginate: {
                                    ...paginate,
                                    currentPage: data.currentPage,
                                    firstItem: data.firstItem,
                                    lastItem: data.lastItem,
                                    pageItems: data.pageItems,
                                    pageLast: data.pageLast,
                                    totalItems: data.totalItems,
                                    first: data.first,
                                    second: data.second,
                                    third: data.third
                                }
                            });
                        }
                    });
                }));
            });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const { user, upserting } = this.state;
        if (!!user.name && !!user.email && !upserting) {
            this.setState({
                upserting: true,
            }, () => {
                const requestOptions = {
                    method: !!user._id ? "PUT" : "POST",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user.name,
                        email: user.email
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/api/users/${user._id}`, requestOptions)
                .then(response => response.text().then(text => {
                    const data = text && JSON.parse(text);
                    const resMsg = (data && data.message) || response.statusText;
                    if (response.status === 401) {
                        // Unauthorized
                        localStorage.removeItem("user");
                        window.location.reload(true);
                    } else {
                        this.setState({
                            alert: {
                                type: response.status !== 200 ? "alert-danger" : "alert-success",
                                message: response.message
                            }
                        }, () => {
                            this.getDocuments();
                            this.hideModal();
                        });
                    }
                }));
            });
        }
    }

    handleDelete(event, _id) {
        event.preventDefault();
        const { deleting } = this.state;
        if (!!_id && !deleting) {
            this.setState({
                deleting: true
            }, () => {
                const requestOptions = {
                    method: "DELETE",
                    headers: authHeader()
                };
                return fetch(`${process.env.REACT_APP_API_URI}/api/users/${_id}`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        deleting: false,
                    }, () => {
                        const data = text && JSON.parse(text);
                        const resMsg = (data && data.message) || response.statusText;
                        if (response.status === 401) {
                            // Unauthorized
                            localStorage.removeItem("user");
                            window.location.reload(true);
                        } else {
                            this.setState({
                                alert: {
                                    type: response.status !== 200 ? "alert-danger" : "alert-success",
                                    message: resMsg
                                }
                            }, () => {
                                this.getDocuments();
                                this.hideModal();
                            });
                        }
                    });
                }));
            });
        }
    }

    handleOnclick(event, _id) {
        event.preventDefault();
        const { users, currentUser } = this.state;
        let found = users.find(element => _.isEqual(element._id, _id));
        if (!_.isUndefined(found) && !!currentUser.isAdmin) {
            this.setState({
                user: {
                    _id: found._id,
                    name: found.name,
                    email: found.email,
                },
                showUser: true
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

    generateBody() {
        const { users, retrieving, currentUser, paginate, settingsColWidth } = this.state;
        let tempRows = [];
        if (!_.isEmpty(users) || !retrieving) {
            users.map((user) => {
                tempRows.push(
                    <tr key={user._id}>
                        <TableData colIndex="0" value={user.name} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={user._id} />
                        <TableData colIndex="0" value={user.email} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={user._id} />
                        <td data-type="checkbox">
                            <TableCheckBoxAdmin
                                _id={user._id}
                                checked={user.isAdmin || false}
                                refreshStore={this.getDocuments}
                                setAlert={this.setAlert}
                                disabled={_.isEqual(currentUser._id, user._id) || !currentUser.isAdmin ? true : false}
                                data-type="checkbox"
                            />
                        </td>
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
                    </tr>
                );
            }
        }
        return tempRows;
    }

    render() {
        const { collapsed, toggleCollapse } = this.props;
        const { alert, menuItem, user, filter, sort, showUser, settingsColWidth, upserting, deleting } = this.state;
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
                    <div className="action-row row">
                        <button title="Create User" className="btn btn-sm btn-leeuwen-blue" onClick={this.showModal}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="plus" className="fa mr-2" />Create User</span>
                        </button>
                    </div>
                    <div className="body-section">
                        <div className="row ml-1 mr-1" style={{ height: "calc(100% - 40px)" }}> {/* borderStyle: "solid", borderWidth: "1px", borderColor: "#ddd", */}
                            <div id="table-container" className="table-responsive custom-table-container" >
                                <table className="table table-hover table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <TableHeaderInput
                                                type="text"
                                                title="Name"
                                                name="name"
                                                value={filter.name}
                                                onChange={this.handleChangeHeader}
                                                width="30%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="1"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="Email"
                                                name="email"
                                                value={filter.email}
                                                onChange={this.handleChangeHeader}
                                                width="30%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderCheckBox
                                                title="Admin"
                                                name="isAdmin"
                                                value={filter.isAdmin}
                                                onChange={this.handleChangeHeader}
                                                width="10%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
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

                    <Modal
                        show={showUser}
                        hideModal={this.hideModal}
                        title={this.state.user._id ? "Update user" : "Add user"}
                    >
                        <div className="col-12">
                            <form
                                name="form"
                                onSubmit={this.handleSubmit}
                            >
                                <Input
                                    title="Full Name"
                                    name="name"
                                    type="text"
                                    value={user.name}
                                    onChange={this.handleChangeUser}
                                    inline={false}
                                    required={true}
                                />
                                <Input
                                    title="Email"
                                    name="email"
                                    type="email"
                                    value={user.email}
                                    onChange={this.handleChangeUser}
                                    inline={false}
                                    required={true}
                                />
                                <div className="modal-footer">
                                    {this.state.user._id ?
                                        <div className="row">
                                            <button className="btn btn-sm btn-leeuwen" onClick={(event) => { this.handleDelete(event, this.state.user._id) }}>
                                                <span><FontAwesomeIcon icon={deleting ? "spinner" : "trash-alt"} className={deleting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Delete</span>
                                            </button>
                                            <button type="submit" className="btn btn-sm btn-leeuwen-blue ml-2">
                                                <span><FontAwesomeIcon icon={upserting ? "spinner" : "edit"} className={upserting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Update</span>
                                            </button>
                                        </div>
                                        :
                                        <button type="submit" className="btn btn-sm btn-leeuwen-blue btn-full">
                                            <span><FontAwesomeIcon icon={upserting ? "spinner" : "plus"} className={upserting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Create</span>
                                        </button>
                                    }
                                </div>
                            </form>
                        </div>
                    </Modal>
                </div>
            </Layout>
        );
    }
}
