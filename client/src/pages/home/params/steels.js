import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
import authHeader from "../../../helpers/auth-header";
import copyObject from "../../../functions/copyObject";
import getPageSize from "../../../functions/getPageSize";
import arrayRemove from "../../../functions/arrayRemove";
import typeToString from "../../../functions/typeToString";
import getDateFormat from "../../../functions/getDateFormat";

import TableSelectAll from '../../../components/table-select-all';
import TableSelectRow from '../../../components/table-select-row';
import TableHeader from "../../../components/table-header";
import TableData from "../../../components/table-data";
import Layout from "../../../components/layout";
import Modal from "../../../components/modal";
import Pagination from "../../../components/pagination";
import ParamSelect from "../../../components/param-select";
import ParamInput from "../../../components/param-input";
import _ from "lodash";

export default class Steels extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: "",
            currentUser: {},
            elements: [],
            sort: {
                name: "",
                isAscending: true,
            },
            params: {
                name: { value: "", placeholder: "Name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdBy: { value: "", placeholder: "Created By", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdAt: { value: "", placeholder: "Created At", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                updatedBy: { value: "", placeholder: "Updated By", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                updatedAt: { value: "", placeholder: "Updated At", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                steel_name: { value: "", placeholder: "Name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 }
            },
            focused: "",
            alert: {
                type: "",
                message: ""
            },
            selectAllRows: false,
            selectedRows: [],
            retrieving: false,
            loading: false,
            deleting: false,
            upserting: false,
            showSearch: false,
            showSubmit: false,
            menuItem: "Params",
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
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleClearAlert = this.handleClearAlert.bind(this);
        this.setAlert = this.setAlert.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
        this.getDocuments = this.getDocuments.bind(this);
        this.colDoubleClick = this.colDoubleClick.bind(this);
        this.setColWidth = this.setColWidth.bind(this);
        this.changePage = this.changePage.bind(this);
        this.generateBody = this.generateBody.bind(this);
        this.toggleModalSearch = this.toggleModalSearch.bind(this);
        this.toggleModalSubmit = this.toggleModalSubmit.bind(this);
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
        this.toggleSelectAllRow = this.toggleSelectAllRow.bind(this);
        this.updateSelectedRows = this.updateSelectedRows.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleOnclick = this.handleOnclick.bind(this);

    }


    handleRefresh(event) {
        event.preventDefault();
        const { currentPage } = this.state.paginate;
        this.getDocuments(currentPage);
    }

    componentDidMount() {
        const { paginate } = this.state;
        let currentUser = JSON.parse(localStorage.getItem("user"));
        const tableContainer = document.getElementById("table-container");
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        document.getElementById("export").addEventListener("click", event => {
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
            }, () => this.getDocuments(this.state.paginate.currentPage));
        } else {
            localStorage.removeItem("user");
            window.location.reload(true);
        }
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
        const { sort, paginate, elements, selectedRows } = this.state;
        if (sort !== prevState.sort || (paginate.pageSize !== prevState.paginate.pageSize && prevState.paginate.pageSize !== 0)) {
            this.getDocuments();
        }

        if (this.state.params.name.selection._id !== prevState.params.name.selection._id) this.getDocuments();
        if (this.state.params.createdBy.selection._id !== prevState.params.createdBy.selection._id) this.getDocuments();
        if (this.state.params.createdAt.selection._id !== prevState.params.createdAt.selection._id) this.getDocuments();
        if (this.state.params.updatedBy.selection._id !== prevState.params.updatedBy.selection._id) this.getDocuments();
        if (this.state.params.updatedAt.selection._id !== prevState.params.updatedAt.selection._id) this.getDocuments();


        if (this.state.params.name.value !== prevState.params.name.value) this.getDropdownOptions("name", 0);
        if (this.state.params.createdBy.value !== prevState.params.createdBy.value) this.getDropdownOptions("createdBy", 0);
        if (this.state.params.createdAt.value !== prevState.params.createdAt.value) this.getDropdownOptions("createdAt", 0);
        if (this.state.params.updatedBy.value !== prevState.params.updatedBy.value) this.getDropdownOptions("updatedBy", 0);
        if (this.state.params.updatedAt.value !== prevState.params.updatedAt.value) this.getDropdownOptions("updatedAt", 0);

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

    toggleModalSubmit() {
        const { showSubmit } = this.state
        this.setState({
            _id: "",
            params: {
                ...this.state.params,
                steel_name: { value: "", placeholder: "Name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
            },
            deleting: false,
            upserting: false,
            showSubmit: !showSubmit
        });
    }



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
                            createdBy: params.createdBy.selection._id,
                            createdAt: params.createdAt.selection._id,
                            updatedBy: params.updatedBy.selection._id,
                            updatedAt: params.updatedAt.selection._id
                        },
                        nextPage: nextPage,
                        pageSize: paginate.pageSize
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/steels/getAll`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        retrieving: false,
                    }, () => {
                        const data = text && JSON.parse(text);
                        const resMsg = (data && data.message) || response.statusText;
                        if (response.status === 401) {
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
                        name: params.steel_name.selection._id,
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/steels/${!!this.state._id ? this.state._id : ""}`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        upserting: false,
                    }, () => {
                        const data = text && JSON.parse(text);
                        const resMsg = (data && data.message) || response.statusText;
                        if (response.status === 401) {
                            localStorage.removeItem("user");
                            window.location.reload(true);
                        } else {
                            this.setState({
                                _id: "",
                                params: {
                                    ...this.state.params,
                                    steel_name: { value: "", placeholder: "Name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                },
                                alert: {
                                    type: response.status !== 200 ? "alert-danger" : "alert-success",
                                    message: resMsg
                                },
                                showSubmit: false
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
        if (!!_id && !deleting && !!window.confirm("Would you like to permanantly delete the entry?")) {
            this.setState({
                deleting: true
            }, () => {
                const requestOptions = {
                    method: "DELETE",
                    headers: authHeader()
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/steels/${_id}`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        deleting: false,
                    }, () => {
                        const data = text && JSON.parse(text);
                        const resMsg = (data && data.message) || response.statusText;
                        if (response.status === 401) {
                            localStorage.removeItem("user");
                            window.location.reload(true);
                        } else {
                            this.setState({
                                _id: "",
                                params: {
                                    ...this.state.params,
                                    steel_name: { value: "", placeholder: "Name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                },
                                alert: {
                                    type: response.status !== 200 ? "alert-danger" : "alert-success",
                                    message: resMsg
                                },
                                showSubmit: false
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
                    steel_name: { value: found.name, placeholder: "Name", selection: { _id: found.name, name: found.name}, options: [], hover: "", page: 0 },
                },
                showSubmit: true
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
        const { elements, retrieving, paginate, settingsColWidth, selectAllRows, selectedRows } = this.state;
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
                        <TableData colIndex="2" value={element.createdBy} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="3" value={element.createdAt} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="4" value={element.updatedBy} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="5" value={element.updatedAt} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
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
                name: { value: "", placeholder: "Name", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdBy: { value: "", placeholder: "Created By", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdAt: { value: "", placeholder: "Created At", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                updatedBy: { value: "", placeholder: "Updated By", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                updatedAt: { value: "", placeholder: "Updated At", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 }
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
        const { focused, sort } = this.state;
        this.setState({
            loading: true
        }, () => {
            const requestOptions = {
                method: "POST",
                headers: { ...authHeader(), "Content-Type": "application/json" },
                body: JSON.stringify({
                    sort: sort,
                    dropdown: {
                        name: this.state.params.name.selection._id,
                        createdBy: this.state.params.createdBy.selection._id,
                        createdAt: this.state.params.createdAt.selection._id,
                        updatedBy: this.state.params.updatedBy.selection._id,
                        updatedAt: this.state.params.updatedAt.selection._id,
                    },
                    name: this.state.params[key].value,
                    page: page || 0,
                    selectionArray: this.state.params[key].selectionArray || []
                })
            };
            return fetch(`${process.env.REACT_APP_API_URI}/server/steels/getDrop/${key}`, requestOptions)
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
        const { alert, menuItem, currentUser, sort, showSearch, showSubmit, deleting, upserting, settingsColWidth, selectAllRows } = this.state;
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
                <div id="export" className={alert.message ? "main-section-alert" : "main-section"}>
                    <div className="action-row row">
                        <button title="Filters" className="btn btn-sm btn-gray" onClick={this.toggleModalSearch}>
                            <span><FontAwesomeIcon icon="filter" className="fa mr-2" />Filters</span>
                        </button>
                        <button title="Refresh Page" className="btn btn-sm btn-gray" onClick={this.handleRefresh}>
                            <span><FontAwesomeIcon icon="sync-alt" className="fa mr-2"/>Refresh</span>
                        </button>
                        <button title="Create Steel Type" className="btn btn-sm btn-gray" onClick={this.toggleModalSubmit} disabled={!currentUser.isAdmin ? true : false}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="plus" className="fa mr-2" />Create Steel</span>
                        </button>
                    </div>
                    <div className="body-section">
                        <div className="row row-table-container">
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
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="1"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Created By"
                                                name="createdBy"
                                                width="220px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Created At"
                                                name="createdAt"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="3"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Updated By"
                                                name="updatedBy"
                                                width="220px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="4"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Updated At"
                                                name="updatedAt"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="5"
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
                        size="modal-lg"
                    >
                        <div className="modal-body">
                            <div className="modal-body-content">
                                <section id="fields" className="drop-section">
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Fields
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row row-cols-1">
                                        {Object.keys(params).map((key, index) => index < 1 &&  
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
                                        )}
                                    </div>
                            </section>
                            <section id="morefilters" className="drop-section">
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                More filters
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row row-cols-1 row-cols-md-2">
                                        {Object.keys(params).map((key, index) => index > 0 && index < 5 &&  
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
                                        )}
                                    </div>
                            </section>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="modal-footer-button long" onClick={this.toggleModalSearch}>Show results ({typeToString(totalItems, "number", getDateFormat())})</button>
                        </div>
                    </Modal>
                    <Modal
                        show={showSubmit}
                        hideModal={this.toggleModalSubmit}
                        title="Steel Type"
                    >
                        <div className="modal-body">
                            <div className="modal-body-content">
                                <section id="filters" className="drop-section">
                                    <div className="row row-cols-1">
                                        <ParamInput
                                            key="0"
                                            name="steel_name"
                                            focused={focused}
                                            value={params.steel_name.selection.name}
                                            placeholder={params.steel_name.placeholder}
                                            onChange={this.handleChangeInput}
                                            onFocus={this.onFocus}
                                            handleClearValue={this.handleClearValue}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>
                        
                        {this.state._id ?
                            (
                                <div className="modal-footer">
                                    <button className="modal-footer-button red" onClick={event => this.handleDelete(event)}>
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
                    </Modal>
                </div>
            </Layout>
        );
    }
}
