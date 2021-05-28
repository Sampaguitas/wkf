import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
import authHeader from "../../helpers/auth-header";

import copyObject from "../../functions/copyObject";
import getPageSize from "../../functions/getPageSize";
import arrayRemove from "../../functions/arrayRemove";
import typeToString from "../../functions/typeToString";
import getDateFormat from "../../functions/getDateFormat";

import TableSelectAll from '../../components/table-select-all';
import TableSelectRow from '../../components/table-select-row';
import TableHeader from "../../components/table-header";
import TableData from "../../components/table-data";
import TableCheckBoxAdmin from "../../components/table-check-box-admin";
import Input from "../../components/input";
import Layout from "../../components/layout";
import Modal from "../../components/modal";
import Pagination from "../../components/pagination";
import ParamSelect from "../../components/param-select";
import ParamInput from "../../components/param-input";
import _ from "lodash";

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: "",
            currentUser: {},
            element: {},
            elements: [],
            sort: {
                name: "",
                isAscending: true,
            },
            params: {
                name: { value: "", placeholder: "name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                email: { value: "", placeholder: "email", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                isAdmin: { value: "", placeholder: "isAdmin", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                user_name: { value: "", placeholder: "name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                user_email: { value: "", placeholder: "email", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
            },
            focused: "",
            alert: {
                type: "",
                message: ""
            },
            selectAllRows: false,
            selectedRows: [],
            retrieving: false,
            exporting: false,
            upserting: false,
            loading: false,
            loaded: false,
            submitted: false,
            showSearch: false,
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
        this.toggleModalSearch = this.toggleModalSearch.bind(this);
        // this.showModal = this.showModal.bind(this);
        this.toggleModalUser = this.toggleModalUser.bind(this);
        // this.handleChangeHeader = this.handleChangeHeader.bind(this);
        this.handleClearFields = this.handleClearFields.bind(this);
        this.handleClearValue = this.handleClearValue.bind(this);
        this.getDropdownOptions = this.getDropdownOptions.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onHover = this.onHover.bind(this);
        this.toggleDropDown = this.toggleDropDown.bind(this);
        //selection
        this.toggleSelectAllRow = this.toggleSelectAllRow.bind(this);
        this.updateSelectedRows = this.updateSelectedRows.bind(this);

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
        const { paginate } = this.state;
        let currentUser = JSON.parse(localStorage.getItem("user"));
        const tableContainer = document.getElementById("table-container");

        document.getElementById("setting").addEventListener("click", event => {
            if (!/drop-/.test(event.target.className) && event.target.type !== "checkbox") {
                if (!!this.state.focused) {
                    this.setState({
                        params: {
                            ...this.state.params,
                            [this.state.focused]: {
                                ...this.state.params[this.state.focused],
                                value: "",
                                options: [],
                                hover: "",
                                page: 0
                            }
                        },
                        focused: ""
                    });
                } else {
                    this.setState({focused: ""});
                }
            }
        });

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
        const { sort, paginate, elements, selectedRows } = this.state;
        if (sort !== prevState.sort || (paginate.pageSize !== prevState.paginate.pageSize && prevState.paginate.pageSize !== 0)) {
            this.getDocuments();
        }

        if (this.state.params.name.selection._id !== prevState.params.name.selection._id) this.getDocuments();
        if (this.state.params.email.selection._id !== prevState.params.email.selection._id) this.getDocuments();
        if (this.state.params.isAdmin.selection._id !== prevState.params.isAdmin.selection._id) this.getDocuments();

        if (this.state.params.name.value !== prevState.params.name.value) this.getDropdownOptions("name", 0);
        if (this.state.params.email.value !== prevState.params.email.value) this.getDropdownOptions("email", 0);
        if (this.state.params.isAdmin.value !== prevState.params.isAdmin.value) this.getDropdownOptions("isAdmin", 0);

        if (elements !== prevState.elements) {
            let remaining = selectedRows.reduce(function(acc, cur) {
                let found = elements.find(element => _.isEqual(element._id, cur));
                if (!_.isUndefined(found)){
                  acc.push(cur);
                }
                return acc;
            }, []);
            this.setState({
                selectedRows: remaining,
                selectAllRows: false,
            });
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

    toggleModalSearch() {
        const { showSearch } = this.state;
        this.setState({
            showSearch: !showSearch
        });
    }

    // showModal() {
    //     this.setState({
    //         params: {
    //             ...this.state.params,
    //             user_name: { value: "", placeholder: "Name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
    //             user_email: { value: "", placeholder: "Email", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
    //         },
    //         showUser: true
    //     });
    // }

    toggleModalUser() {
        const { showUser } = this.state
        this.setState({
            _id: "",
            params: {
                ...this.state.params,
                user_name: { value: "", placeholder: "name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                user_email: { value: "", placeholder: "email", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
            },
            deleting: false,
            upserting: false,
            showUser: !showUser
        });
    }


    // handleChangeHeader(event) {
    //     const { filter } = this.state;
    //     const { name, value } = event.target;
    //     this.setState({
    //         filter: {
    //             ...filter,
    //             [name]: value
    //         }
    //     });
    // }

    getDocuments(nextPage) {
        const { paginate, sort, params } = this.state;
        if (!!paginate.pageSize) {
            this.setState({
                retrieving: true
            }, () => {
                const requestOptions = {
                    method: "POST",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sort: sort,
                        dropdown: {
                            name: params.name.selection._id,
                            email: params.email.selection._id,
                            isAdmin: params.isAdmin.selection._id,
                        },
                        nextPage: nextPage,
                        pageSize: paginate.pageSize
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/users/getAll`, requestOptions)
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
                                elements: data[0].data,
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

    handleSubmit(event) {
        event.preventDefault();
        const { params, upserting } = this.state;
        if (!upserting) {
            this.setState({
                upserting: true,
            }, () => {
                const requestOptions = {
                    method: !!this.state._id ? "PUT" : "POST",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: params.user_name.selection._id,
                        email: params.user_email.selection._id
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/users/${!!this.state._id ? this.state._id : ""}`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        upserting: false,
                    }, () => {
                        const data = text && JSON.parse(text);
                        const resMsg = (data && data.message) || response.statusText;
                        if (response.status === 401) {
                            // Unauthorized
                            localStorage.removeItem("user");
                            window.location.reload(true);
                        } else {
                            this.setState({
                                _id: "",
                                params: {
                                    ...this.state.params,
                                    user_name: { value: "", placeholder: "name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    user_email: { value: "", placeholder: "email", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                },
                                alert: {
                                    type: response.status !== 200 ? "alert-danger" : "alert-success",
                                    message: resMsg
                                },
                                showUser: false
                            }, () => {
                                this.getDocuments();
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

    handleDelete(event) {
        event.preventDefault();
        const { _id, deleting } = this.state;
        if (!!_id && !deleting) {
            this.setState({
                deleting: true
            }, () => {
                const requestOptions = {
                    method: "DELETE",
                    headers: authHeader()
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/users/${_id}`, requestOptions)
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
                                _id: "",
                                params: {
                                    ...this.state.params,
                                    user_name: { value: "", placeholder: "name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    user_email: { value: "", placeholder: "email", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                },
                                alert: {
                                    type: response.status !== 200 ? "alert-danger" : "alert-success",
                                    message: resMsg
                                },
                                showUser: false
                            }, () => {
                                this.getDocuments();
                            });
                        }
                    });
                }));
            });
        }
    }

    handleOnclick(event, _id) {
        event.preventDefault();
        const { elements, currentUser } = this.state;
        let found = elements.find(element => _.isEqual(element._id, _id));
        if (!_.isUndefined(found) && !!currentUser.isAdmin) {
            this.setState({
                _id,
                params: {
                    ...this.state.params,
                    user_name: { value: found.name, placeholder: "name", selection: { _id: found.name, name: found.name}, options: [], hover: "", page: 0 },
                    user_email: { value: found.email, placeholder: "email", selection: { _id: found.email, name: found.email}, options: [], hover: "", page: 0 },
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

    toggleSelectAllRow() {
        const { selectAllRows, elements } = this.state;
        if (!_.isEmpty(elements)) {
          if (!!selectAllRows) {
            this.setState({
              selectedRows: [],
              selectAllRows: false,
            });
          } else {
            this.setState({
              selectedRows: elements.map(element => element._id),
              selectAllRows: true
            });
          }         
        }
    }

    updateSelectedRows(id) {
        const { selectedRows } = this.state;
        if (selectedRows.includes(id)) {
            this.setState({ selectedRows: arrayRemove(selectedRows, id) });
        } else {
          this.setState({ selectedRows: [...selectedRows, id] });
        }       
    }

    generateBody() {
        const { elements, retrieving, currentUser, paginate, settingsColWidth, selectAllRows, selectedRows } = this.state;
        let tempRows = [];
        if (!retrieving) {
            elements.map((element) => {
                tempRows.push(
                    <tr key={element._id}>
                        <TableSelectRow
                            id={element._id}
                            selectAllRows={selectAllRows}
                            selectedRows={selectedRows}
                            callback={this.updateSelectedRows}
                        />
                        <TableData colIndex="1" value={element.name} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="2" value={element.email} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <td data-type="checkbox">
                            <TableCheckBoxAdmin
                                _id={element._id}
                                checked={element.isAdmin || false}
                                refreshStore={this.getDocuments}
                                setAlert={this.setAlert}
                                disabled={_.isEqual(currentUser._id, element._id) || !currentUser.isAdmin ? true : false}
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
                        <td className="no-select"><Skeleton /></td>
                    </tr>
                );
            }
        }
        return tempRows;
    }

    handleClearFields(event) {
        event.preventDefault();
        this.setState({
            sort: {
                name: "",
                isAscending: true,
            },
            params: {
                ...this.state.params,
                name: { value: "", placeholder: "name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                email: { value: "", placeholder: "email", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                isAdmin: { value: "", placeholder: "isAdmin", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 }
            },
            focused: "",
        });
    }

    handleClearValue(event, name) {
        event.preventDefault();
        this.setState({
            params: {
                ...this.state.params,
                [name]: {
                    ...this.state.params[name],
                    value: "",
                    selection: {
                        _id: "",
                        name: ""
                    }
                }
            }
        });
    }

    getDropdownOptions(key, page) {
        const { focused, sort, params } = this.state;
        this.setState({
            loading: true
        }, () => {
            const requestOptions = {
                method: "POST",
                headers: { ...authHeader(), "Content-Type": "application/json" },
                body: JSON.stringify({
                    sort: sort,
                    dropdown: {
                        name: params.name.selection._id,
                        email: params.email.selection._id,
                        isAdmin: params.isAdmin.selection._id,
                    },
                    name: this.state.params[key].value,
                    page: page || 0
                })
            };
            return fetch(`${process.env.REACT_APP_API_URI}/server/users/getDrop/${key}`, requestOptions)
            .then(response => response.text().then(text => {
                this.setState({
                    loading: false,
                }, () => {
                    const data = text && JSON.parse(text);
                    if (response.status === 200) {
                        this.setState({
                            params: {
                                ...this.state.params,
                                [key]: {
                                    ...this.state.params[key],
                                    options: key !== focused ? [] : page !== 0 ? [ ...this.state.params[key].options, ...data ] : data,
                                    page
                                }
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

    handleNext(key) {
        this.setState({
            params: {
                ...this.state.params,
                [key]: {
                    ...this.state.params[key],
                    page: this.state.params[key].page + 1
                }
            }
        }, () => {
            this.getDropdownOptions(key, this.state.params[key].page)
        });
    }

    handleChange(event) {
        event.preventDefault();
        const { name, value } = event.target;
        this.setState({
            params: {
                ...this.state.params,
                [name]: {
                    ...this.state.params[name],
                    value: value,
                    selection: {
                        _id: "",
                        name: ""
                    }
                }
            }
        });
    }

    handleChangeInput(event) {
        event.preventDefault();
        const { name, value } = event.target;
        this.setState({
            params: {
                ...this.state.params,
                [name]: {
                    ...this.state.params[name],
                    value: value,
                    selection: {
                        _id: value,
                        name: value
                    }
                }
            }
        });
    }

    handleSelect(event, name, selectionId, selectionName) {
        event.preventDefault();
        this.setState({
            params: {
                ...this.state.params,
                [name]: {
                    ...this.state.params[name],
                    value: "",
                    options: [],
                    selection: {
                        _id: selectionId,
                        name: selectionName
                    },
                    hover: "",
                }
            },
            focused: ""
        })
        let myInput = document.getElementById(name);
        myInput.blur();
    }

    onFocus(event) {
        const { name } = event.target;
        const { focused } = this.state;
        if (!!focused) {
            this.setState({
                params: {
                    ...this.state.params,
                    [name]: {
                        ...this.state.params[name],
                        options: [],
                        value: this.state.params[name].selection.name,
                        hover: ""
                    },
                    [focused]: {
                       ...this.state.params[focused],
                       options: [],
                       value: "",
                       hover: ""
                    },
                },
                focused: name, //
            }, () => this.getDropdownOptions(name, 0));
        } else {
            this.setState({
                params: {
                    ...this.state.params,
                    [name]: {
                        ...this.state.params[name],
                        options: [],
                        value: this.state.params[name].selection.name,
                        hover: ""
                    }
                },
                focused: name,
            }, () => this.getDropdownOptions(name, 0));
        }
    }

    onHover(event, name, _id) {
        event.preventDefault();
        this.setState({
            params: {
                ...this.state.params,
                [name]: {
                    ...this.state.params[name],
                    hover: _id
                }
            }
        });
    }

    toggleDropDown(event, name) {
        event.preventDefault();
        const { focused } = this.state;
        if (!!_.isEqual(focused, name) || !!this.state.params[name].selection.name) {
            this.setState({
                params: {
                    ...this.state.params,
                    [name]: {
                        ...this.state.params[name],
                        options: [],
                        value: "",
                        selection: {
                            _id: "",
                            name: ""
                        },
                        hover: ""
                    }
                },
                focused: "",
            });
            let myInput = document.getElementById(name);
            myInput.blur();
        } else {
            let myInput = document.getElementById(name);
            myInput.focus();
            // myInput.select();
        }
    }

    render() {
        const { collapsed, toggleCollapse } = this.props;
        const { alert, menuItem, element, sort, showSearch, showUser, settingsColWidth, upserting, deleting, selectAllRows } = this.state;
        const { params, focused } = this.state;
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
                        <button title="Filters" className="btn btn-sm btn-gray" onClick={this.toggleModalSearch}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="filter" className="fa mr-2" />Filters</span>
                        </button>
                        <button title="Create User" className="btn btn-sm btn-gray" onClick={this.toggleModalUser}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="plus" className="fa mr-2" />Create User</span>
                        </button>
                    </div>
                    <div className="body-section">
                        <div className="row row-table-container"> {/* borderStyle: "solid", borderWidth: "1px", borderColor: "#ddd", */}
                            <div id="table-container" className="table-responsive custom-table-container custom-table-container__fixed-row" >
                                <table className="table table-hover table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <TableSelectAll
                                                checked={selectAllRows}
                                                onChange={this.toggleSelectAllRow}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Name"
                                                name="name"
                                                // width="30%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="0"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Email"
                                                name="email"
                                                // width="30%"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="1"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="isAdmin"
                                                name="isAdmin"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
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
                    <Modal
                        show={showSearch}
                        hideModal={this.toggleModalSearch}
                        clearModal={this.handleClearFields}
                        title="Filters"
                        // size="modal-lg"
                    >
                        <div className="modal-body">
                            <div className="modal-body-content">
                            <section id="filters" className="drop-section">
                                <div className="row row-cols-1">
                                    <ParamSelect
                                        key="0"
                                        name="name"
                                        focused={focused}
                                        value={params.name.value}
                                        placeholder={params.name.placeholder}
                                        selection={params.name.selection}
                                        options={params.name.options}
                                        hover={this.state.params.name.hover}
                                        page={params.name.page}
                                        onChange={this.handleChange}
                                        handleNext={this.handleNext}
                                        handleSelect={this.handleSelect}
                                        onFocus={this.onFocus}
                                        onHover={this.onHover}
                                        toggleDropDown={this.toggleDropDown}
                                    />
                                    <ParamSelect
                                        key="1"
                                        name="email"
                                        focused={focused}
                                        value={params.email.value}
                                        placeholder={params.email.placeholder}
                                        selection={params.email.selection}
                                        options={params.email.options}
                                        hover={this.state.params.email.hover}
                                        page={params.email.page}
                                        onChange={this.handleChange}
                                        handleNext={this.handleNext}
                                        handleSelect={this.handleSelect}
                                        onFocus={this.onFocus}
                                        onHover={this.onHover}
                                        toggleDropDown={this.toggleDropDown}
                                    />
                                    <ParamSelect
                                        key="1"
                                        name="isAdmin"
                                        focused={focused}
                                        value={params.isAdmin.value}
                                        placeholder={params.isAdmin.placeholder}
                                        selection={params.isAdmin.selection}
                                        options={params.isAdmin.options}
                                        hover={this.state.params.isAdmin.hover}
                                        page={params.isAdmin.page}
                                        onChange={this.handleChange}
                                        handleNext={this.handleNext}
                                        handleSelect={this.handleSelect}
                                        onFocus={this.onFocus}
                                        onHover={this.onHover}
                                        toggleDropDown={this.toggleDropDown}
                                    />
                                    {/* {Object.keys(params).map(key => 
                                        <ParamSelect
                                            key={key}
                                            name={key}
                                            isFocused={params[key].isFocused}
                                            focused={focused}
                                            value={params[key].value}
                                            placeholder={params[key].placeholder}
                                            selection={params[key].selection}
                                            options={params[key].options}
                                            hover={this.state.params[key].hover}
                                            page={params[key].page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                    )} */}
                                </div>
                            </section>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="modal-footer-button long" onClick={this.toggleModalSearch}>Show results ({typeToString(totalItems, "number", getDateFormat())})</button>
                        </div>
                    </Modal>

                    <Modal
                        show={showUser}
                        hideModal={this.toggleModalUser}
                        title="User"
                    >
                        {/* <form
                                name="form"
                                onSubmit={this.handleSubmit}
                        > */}
                            <div className="modal-body">
                                <div className="modal-body-content">
                                    <section id="filters" className="drop-section">
                                        <div className="row row-cols-1">
                                            <ParamInput
                                                key="0"
                                                name="user_name"
                                                focused={focused}
                                                value={params.user_name.selection.name}
                                                placeholder={params.user_name.placeholder}
                                                onChange={this.handleChangeInput}
                                                onFocus={this.onFocus}
                                                handleClearValue={this.handleClearValue}
                                            />
                                            <ParamInput
                                                key="0"
                                                name="user_email"
                                                focused={focused}
                                                value={params.user_email.selection.name}
                                                placeholder={params.user_email.placeholder}
                                                onChange={this.handleChangeInput}
                                                onFocus={this.onFocus}
                                                handleClearValue={this.handleClearValue}
                                            />
                                        </div>
                                    </section>
                                    {/* <section>
                                        <div className="col-12">
                                            <Input
                                                title="Full Name"
                                                name="name"
                                                type="text"
                                                value={element.name}
                                                onChange={this.handleChangeInput}
                                                inline={false}
                                                required={true}
                                            />
                                            <Input
                                                title="Email"
                                                name="email"
                                                type="email"
                                                value={element.email}
                                                onChange={this.handleChangeInput}
                                                inline={false}
                                                required={true}
                                            />
                                        </div>
                                    </section> */}
                                </div>
                            </div>
                            
                                {this.state._id ?
                                    (
                                        <div className="modal-footer">
                                            <button className="modal-footer-button" onClick={event => this.handleDelete(event)}>
                                                <span><FontAwesomeIcon icon={deleting ? "spinner" : "trash-alt"} className={deleting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Delete</span>
                                            </button>
                                            <button className="modal-footer-button" onClick={event => this.handleSubmit(event)}>
                                                <span><FontAwesomeIcon icon={upserting ? "spinner" : "edit"} className={upserting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Update</span>
                                            </button>
                                        </div>
                                    )
                                    :
                                    (
                                        <div className="modal-footer">
                                            <button type="submit" className="modal-footer-button long" onClick={event => this.handleSubmit(event)}>
                                                <span><FontAwesomeIcon icon={upserting ? "spinner" : "plus"} className={upserting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Create</span>
                                            </button>
                                        </div>
                                    )
                                }
                        {/* </form> */}

                        {/* <div className="col-12">
                            <form
                                name="form"
                                onSubmit={this.handleSubmit}
                            >
                                <Input
                                    title="Full Name"
                                    name="name"
                                    type="text"
                                    value={element.name}
                                    onChange={this.handleChangeInput}
                                    inline={false}
                                    required={true}
                                />
                                <Input
                                    title="Email"
                                    name="email"
                                    type="email"
                                    value={element.email}
                                    onChange={this.handleChangeInput}
                                    inline={false}
                                    required={true}
                                />
                                <div className="modal-footer">
                                    {this.state.element._id ?
                                        <div className="row">
                                            <button className="btn btn-sm btn-leeuwen" onClick={(event) => { this.handleDelete(event, this.state.element._id) }}>
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
                        </div> */}
                    </Modal>
                </div>
            </Layout>
        );
    }
}
