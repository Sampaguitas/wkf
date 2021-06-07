import React from "react";
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";

import authHeader from "../../helpers/auth-header";
import copyObject from "../../functions/copyObject";
import getPageSize from "../../functions/getPageSize";
import typeToString from "../../functions/typeToString";
import getDateFormat from "../../functions/getDateFormat";
import arrayRemove from "../../functions/arrayRemove";

import TableSelectAll from '../../components/table-select-all';
import TableSelectRow from '../../components/table-select-row';
import TableHeader from "../../components/table-header";
import TableData from "../../components/table-data";
import Layout from "../../components/layout";
import Modal from "../../components/modal";
import Pagination from "../../components/pagination";
import ParamSelect from "../../components/param-select";
import ParamFile from "../../components/param-file";
import _ from "lodash";

export default class Import extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // element: {},
            currentUser: {},
            elements: [],
            sort: {
                name: "",
                isAscending: true,
            },
            params: {
                type: { value: "", placeholder: "type", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                status: { value: "", placeholder: "status", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                user: { value: "", placeholder: "user", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdAt: { value: "", placeholder: "createdAt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                expiresAt: { value: "", placeholder: "expiresAt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                file_param: { value: "", placeholder: "select file", selection: { _id: Date.now(), name: ""}, options: [], hover: "", page: 0 },
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
            //
            showParam: false,
            paramName: "",
            paramKey: Date.now(),
            uploadingParam: false,
            downloadingParam: false,
            //
            showSearch: false,
            menuItem: "Import data",
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
        this.handleRefresh = this.handleRefresh.bind(this);
        this.resize = this.resize.bind(this);
        this.handleClearAlert = this.handleClearAlert.bind(this);
        this.setAlert = this.setAlert.bind(this);
        this.toggleSort = this.toggleSort.bind(this);
        // this.handleChangeHeader = this.handleChangeHeader.bind(this);
        this.getDocuments = this.getDocuments.bind(this);
        this.colDoubleClick = this.colDoubleClick.bind(this);
        this.setColWidth = this.setColWidth.bind(this);
        this.changePage = this.changePage.bind(this);
        this.generateBody = this.generateBody.bind(this);
        //dropdown
        this.toggleModalSearch = this.toggleModalSearch.bind(this);
        this.handleClearFields = this.handleClearFields.bind(this);
        this.getDropdownOptions = this.getDropdownOptions.bind(this);
        this.handleChangeDropdown = this.handleChangeDropdown.bind(this);
        this.handleNextDropdown = this.handleNextDropdown.bind(this);
        this.handleSelectDropdown = this.handleSelectDropdown.bind(this);
        this.onFocusDropdown = this.onFocusDropdown.bind(this);
        this.onHoverDropdown = this.onHoverDropdown.bind(this);
        this.toggleDropDown = this.toggleDropDown.bind(this);
        //selection
        this.toggleSelectAllRow = this.toggleSelectAllRow.bind(this);
        this.updateSelectedRows = this.updateSelectedRows.bind(this);
        //DUF param
        this.toggleParam = this.toggleParam.bind(this);
        this.handleClearValue = this.handleClearValue.bind(this);
        this.handleChangeFile = this.handleChangeFile.bind(this);
        this.handleUploadParam = this.handleUploadParam.bind(this);
        this.file_param = React.createRef();
    }


    

    componentDidMount() {
        let currentUser = JSON.parse(localStorage.getItem("user"));
        const tableContainer = document.getElementById("table-container");
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        // this.interval = setInterval(() => this.getDocuments(this.state.paginate.currentPage), 3000);
        
        document.getElementById("import").addEventListener("click", event => {
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
                    ...this.state.paginate,
                    pageSize: getPageSize(tableContainer.clientHeight)
                }
            }, () => this.getDocuments(this.state.paginate.currentPage));
        } else {
            localStorage.removeItem("user");
            window.location.reload(true);
        }
        
        // this.setState({
        //     paginate: {
        //         ...this.state.paginate,
        //         pageSize: getPageSize(tableContainer.clientHeight)
        //     }
        // }, () => this.getDocuments(this.state.paginate.currentPage));
    }

    handleRefresh(event) {
        event.preventDefault();
        const { currentPage } = this.state.paginate;
        this.getDocuments(currentPage);
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
        const { sort, paginate, elements, selectedRows  } = this.state;
        if (sort !== prevState.sort || (paginate.pageSize !== prevState.paginate.pageSize && prevState.paginate.pageSize !== 0)) {
            this.getDocuments();
        }

        if (this.state.params.type.selection._id !== prevState.params.type.selection._id) this.getDocuments();
        if (this.state.params.status.selection._id !== prevState.params.status.selection._id) this.getDocuments();
        if (this.state.params.user.selection._id !== prevState.params.user.selection._id) this.getDocuments();
        if (this.state.params.createdAt.selection._id !== prevState.params.createdAt.selection._id) this.getDocuments();
        if (this.state.params.expiresAt.selection._id !== prevState.params.expiresAt.selection._id) this.getDocuments();

        if (this.state.params.type.value !== prevState.params.type.value) this.getDropdownOptions("type", 0);
        if (this.state.params.status.value !== prevState.params.status.value) this.getDropdownOptions("status", 0);
        if (this.state.params.user.value !== prevState.params.user.value) this.getDropdownOptions("user", 0);
        if (this.state.params.createdAt.value !== prevState.params.createdAt.value) this.getDropdownOptions("createdAt", 0);
        if (this.state.params.expiresAt.value !== prevState.params.expiresAt.value) this.getDropdownOptions("expiresAt", 0);

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

    toggleModalSearch() {
        const { showSearch } = this.state;
        this.setState({
            showSearch: !showSearch
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
                            type: params.type.selection._id,
                            status: params.status.selection._id,
                            user: params.user.selection._id,
                            createdAt: params.createdAt.selection._id,
                            expiresAt: params.expiresAt.selection._id
                        },
                        nextPage: nextPage,
                        pageSize: paginate.pageSize
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/imports/getAll`, requestOptions)
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
                        <TableData colIndex="1" value={element.type} type="text" settingsColWidth={settingsColWidth} eventId={element._id} />
                        <TableData colIndex="2" value={element.user} type="text" settingsColWidth={settingsColWidth} eventId={element._id} />
                        <TableData colIndex="3" value={element.message} type="text" settingsColWidth={settingsColWidth} eventId={element._id} />
                        <TableData colIndex="4" value={element.createdAtX} type="text" settingsColWidth={settingsColWidth} eventId={element._id} />
                        <TableData colIndex="5" value={element.expiresAtX} type="text" settingsColWidth={settingsColWidth} eventId={element._id} />
                        <TableData colIndex="6" value={element.status} type="text" settingsColWidth={settingsColWidth} eventId={element._id} />
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
                type: { value: "", placeholder: "type", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                status: { value: "", placeholder: "status", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                user: { value: "", placeholder: "user", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdAt: { value: "", placeholder: "createdAt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                expiresAt: { value: "", placeholder: "expiresAt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 }
            },
            focused: "",
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
                        type: params.type.selection._id,
                        status: params.status.selection._id,
                        user: params.user.selection._id,
                        createdAt: params.createdAt.selection._id,
                        expiresAt: params.expiresAt.selection._id
                    },
                    name: this.state.params[key].value,
                    page: page || 0
                })
            };
            return fetch(`${process.env.REACT_APP_API_URI}/server/imports/getDrop/${key}`, requestOptions)
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

    handleNextDropdown(key) {
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

    handleChangeDropdown(event) {
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

    handleSelectDropdown(event, name, selectionId, selectionName) {
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

    onFocusDropdown(event) {
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

    onHoverDropdown(event, name, _id) {
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
        const { params, focused } = this.state;
        if (!!_.isEqual(focused, name) || !!params[name]) {
            this.setState({
                params: {
                    ...params,
                    [name]: {
                        ...params[name],
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

    toggleParam(event) {
        event.preventDefault();
        const { showParam } = this.state;
        this.setState({
            showParam: !showParam,
            alert: {
                type:'',
                message:''
            },
            params: {
                ...this.state.params,
                file_param: { value: "", placeholder: "select file", selection: { _id: Date.now(), name: ""}, options: [], hover: "", page: 0 },
            }
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
                        _id: !!/^file_/.test(name) ? Date.now() : "",
                        name: ""
                    }
                }
            }
        });
    }

    handleChangeFile(event, name) {
        if(event.target.files.length > 0 && !!/^file_/.test(name)) {
            this.setState({
                params: {
                    ...this.state.params,
                    [name]: {
                        ...this.state.params[name],
                        value: event.target.files[0].name,
                        selection: {
                            _id: this.state.params[name].selection._id,
                            name: event.target.files[0].name
                        }
                    }
                }
            });
        //   this.setState({
        //       ...this.state,
        //       paramName: event.target.files[0].name
        //   });
        }
    }

    handleUploadParam(event) {
        event.preventDefault();
        const { uploadingParam } = this.state
        if(!uploadingParam && !!this.file_param.current) {
            this.setState({
                uploadingParam: true
            }, () => {
                var data = new FormData()
                data.append('file', this.file_param.current.files[0]);
                const requestOptions = {
                    method: 'POST',
                    headers: { ...authHeader()}, //, 'Content-Type': 'application/json'
                    body: data
                }
                return fetch(`${process.env.REACT_APP_API_URI}/server/imports/uploadParam`, requestOptions)
                .then(responce => responce.text().then(text => {
                    const data = text && JSON.parse(text);
                    if (responce.status === 401) {
                            localStorage.removeItem('user');
                            window.location.reload(true);
                    } else {
                      this.setState({
                          uploadingParam: false,
                          alert: {
                              type: responce.status === 200 ? 'alert-success' : 'alert-danger',
                              message: data.message
                          }
                      }, () => this.getDocuments());
                    }
                }))
                .catch( () => {
                  localStorage.removeItem('user');
                  window.location.reload(true);
                });
            });      
        }
    }

    render() {
        const { collapsed, toggleCollapse } = this.props;
        const { alert, menuItem, currentUser, sort, showSearch, settingsColWidth, selectAllRows } = this.state;
        const { params, focused } = this.state;
        const { showParam, uploadingParam } = this.state;
        const { currentPage, firstItem, lastItem, pageItems, pageLast, totalItems, first, second, third } = this.state.paginate;

        return (
            <Layout collapsed={collapsed} toggleCollapse={toggleCollapse} menuItem={menuItem}>
                {alert.message && !showParam &&
                    <div className={`alert ${alert.type}`}>{alert.message}
                        <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                            <span aria-hidden="true"><FontAwesomeIcon icon="times" /></span>
                        </button>
                    </div>
                }
                <div id="import" className={alert.message && !showParam ? "main-section-alert" : "main-section"}>
                    <div className="action-row row">
                        <button title="Filters" className="btn btn-sm btn-gray" onClick={this.toggleModalSearch}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="filter" className="fa mr-2" />Filters</span>
                        </button>
                        <button title="Refresh Page" className="btn btn-sm btn-gray" onClick={this.handleRefresh}>
                            <span><FontAwesomeIcon icon="sync-alt" className="fa mr-2"/>Refresh</span>
                        </button>
                        <button title="Import Params" className="btn btn-sm btn-gray" onClick={this.toggleParam} disabled={!currentUser.isAdmin ? true : false}>
                            <span><FontAwesomeIcon icon="file-download" className="fa mr-2"/>Params</span>
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
                                                title="Type"
                                                name="type"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="1"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="User"
                                                name="user"
                                                width="150px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Import Logs"
                                                name="message"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="3"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Date"
                                                name="createdAt"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="4"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Expires"
                                                name="expiresAt"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="5"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="Status"
                                                name="status"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="6"
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
                                <section id="fields" className="drop-section">
                                    <div className="row row-cols-1">
                                        <ParamSelect
                                            key="0"
                                            name="type"
                                            isFocused={params.type.isFocused}
                                            focused={focused}
                                            value={params.type.value}
                                            placeholder={params.type.placeholder}
                                            selection={params.type.selection}
                                            options={params.type.options}
                                            hover={this.state.params.type.hover}
                                            page={params.type.page}
                                            onChange={this.handleChangeDropdown}
                                            handleNext={this.handleNextDropdown}
                                            handleSelect={this.handleSelectDropdown}
                                            onFocus={this.onFocusDropdown}
                                            onHover={this.onHoverDropdown}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="1"
                                            name="status"
                                            isFocused={params.status.isFocused}
                                            focused={focused}
                                            value={params.status.value}
                                            placeholder={params.status.placeholder}
                                            selection={params.status.selection}
                                            options={params.status.options}
                                            hover={this.state.params.status.hover}
                                            page={params.status.page}
                                            onChange={this.handleChangeDropdown}
                                            handleNext={this.handleNextDropdown}
                                            handleSelect={this.handleSelectDropdown}
                                            onFocus={this.onFocusDropdown}
                                            onHover={this.onHoverDropdown}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="2"
                                            name="user"
                                            isFocused={params.user.isFocused}
                                            focused={focused}
                                            value={params.user.value}
                                            placeholder={params.user.placeholder}
                                            selection={params.user.selection}
                                            options={params.user.options}
                                            hover={this.state.params.user.hover}
                                            page={params.user.page}
                                            onChange={this.handleChangeDropdown}
                                            handleNext={this.handleNextDropdown}
                                            handleSelect={this.handleSelectDropdown}
                                            onFocus={this.onFocusDropdown}
                                            onHover={this.onHoverDropdown}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="3"
                                            name="createdAt"
                                            isFocused={params.createdAt.isFocused}
                                            focused={focused}
                                            value={params.createdAt.value}
                                            placeholder={params.createdAt.placeholder}
                                            selection={params.createdAt.selection}
                                            options={params.createdAt.options}
                                            hover={this.state.params.createdAt.hover}
                                            page={params.createdAt.page}
                                            onChange={this.handleChangeDropdown}
                                            handleNext={this.handleNextDropdown}
                                            handleSelect={this.handleSelectDropdown}
                                            onFocus={this.onFocusDropdown}
                                            onHover={this.onHoverDropdown}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="4"
                                            name="expiresAt"
                                            isFocused={params.expiresAt.isFocused}
                                            focused={focused}
                                            value={params.expiresAt.value}
                                            placeholder={params.expiresAt.placeholder}
                                            selection={params.expiresAt.selection}
                                            options={params.expiresAt.options}
                                            hover={this.state.params.expiresAt.hover}
                                            page={params.expiresAt.page}
                                            onChange={this.handleChangeDropdown}
                                            handleNext={this.handleNextDropdown}
                                            handleSelect={this.handleSelectDropdown}
                                            onFocus={this.onFocusDropdown}
                                            onHover={this.onHoverDropdown}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="modal-footer-button long" onClick={this.toggleModalSearch}>Show results ({typeToString(totalItems, "number", getDateFormat())})</button>
                        </div>
                    </Modal>
                    <Modal
                      show={showParam}
                      hideModal={this.toggleParam}
                      title="Params"
                    //   size="modal-lg"
                    >
                        <form
                            className=""
                            encType="multipart/form-data"
                            onSubmit={this.handleUploadParam}
                        >
                            <div className="modal-body">
                                <div className="modal-body-content">
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Download Template
                                            </div>
                                        </div>
                                    </div>
                                    <section id="downloadtemplate" className="drop-section">
                                        <div className="row row-cols-1">
                                            <div className="col">
                                                <div className="modal-body-content-section-info">Download and fill up enclosed template:</div>
                                                <Link className="modal-body-content-section-link" to={{pathname: "//vanleeuwenwkf.s3.eu-west-3.amazonaws.com/templates/duf_params.xlsm"}} target="_blank">
                                                    Download the template
                                                </Link>
                                            </div>
                                        </div>
                                    </section>
                                    <section id="uploadfile" className="drop-section">
                                        <div className="modal-body-content-section-title-container">
                                            <div className="modal-body-content-section-title-row">
                                                <div className="modal-body-content-section-title">
                                                    Upload File
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row row-cols-1">
                                            <div className="col">
                                                <div className="modal-body-content-section-info">Save the file as xslx before upload (xlsxm format is not supported).</div>
                                            </div>
                                            <ParamFile
                                                name="file_param"
                                                placeholder={params.file_param.placeholder}
                                                onChange={this.handleChangeFile}
                                                selection={params.file_param.selection}
                                                ref={this.file_param}
                                            />
                                        </div>
                                    </section>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="modal-footer-button long">
                                <span><FontAwesomeIcon icon={uploadingParam ? "spinner" : "upload"} className={uploadingParam ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Upload</span>
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </Layout>
        );
    }
}
