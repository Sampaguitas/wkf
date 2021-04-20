import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
import { saveAs } from 'file-saver';
import authHeader from "../../helpers/auth-header";
import copyObject from "../../functions/copyObject";
import getPageSize from "../../functions/getPageSize";
import arrayRemove from "../../functions/arrayRemove";

import TableSelectAll from '../../components/table-select-all';
import TableSelectRow from '../../components/table-select-row';
import TableHeader from "../../components/table-header";
import TableData from "../../components/table-data";
import Layout from "../../components/layout";
import Modal from "../../components/modal";
import Pagination from "../../components/pagination";
import Param from "../../components/param";
import _ from "lodash";

export default class Export extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // element: {},
            elements: [],
            sort: {
                name: "",
                isAscending: true,
            },
            dropdown: {
                type:"",
                status:"",
                user:"",
                createdAt:"",
                expiresAt: ""
            },
            params: {
                type: { value: "", placeholder: "Type", options: [], hover: "", page: 0 },
                status: { value: "", placeholder: "Status", options: [], hover: "", page: 0 },
                user: { value: "", placeholder: "User", options: [], hover: "", page: 0 },
                createdAt: { value: "", placeholder: "createdAt", options: [], hover: "", page: 0 },
                expiresAt: { value: "", placeholder: "expiresAt", options: [], hover: "", page: 0 }
            },
            focused: "",
            alert: {
                type: "",
                message: ""
            },
            selectAllRows: false,
            selectedRows: [],
            // exporting: false,
            retrieving: false,
            // upserting: false,
            loading: false,
            // loaded: false,
            // submitted: false,
            showSearch: false,
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
        // this.handleChangeHeader = this.handleChangeHeader.bind(this);
        this.getDocuments = this.getDocuments.bind(this);
        this.colDoubleClick = this.colDoubleClick.bind(this);
        this.setColWidth = this.setColWidth.bind(this);
        this.changePage = this.changePage.bind(this);
        this.handleDownlaod = this.handleDownlaod.bind(this);
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
    }


    

    componentDidMount() {
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
        const { sort, dropdown, paginate, elements, selectedRows } = this.state;
        if (sort !== prevState.sort || dropdown !== prevState.dropdown || (paginate.pageSize !== prevState.paginate.pageSize && prevState.paginate.pageSize !== 0)) {
            this.getDocuments();
        }

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
        const { paginate, sort, dropdown } = this.state;
        if (!!paginate.pageSize) {
            this.setState({
                retrieving: true
            }, () => {
                const requestOptions = {
                    method: "POST",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sort: sort,
                        dropdown: dropdown,
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
        const { elements, retrieving, paginate, settingsColWidth, selectAllRows, selectedRows } = this.state;
        let tempRows = [];
        if (!_.isEmpty(elements) || !retrieving) {
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
                        <TableData colIndex="3" value={element.createdAtX} type="text" settingsColWidth={settingsColWidth} eventId={element._id} />
                        <TableData colIndex="4" value={element.expiresAtX} type="text" settingsColWidth={settingsColWidth} eventId={element._id} />
                        <TableData colIndex="5" value={element.status} type="text" settingsColWidth={settingsColWidth} handleDownlaod={this.handleDownlaod} eventId={element._id} />
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
            dropdown: {
                type:"",
                status:"",
                user:"",
                createdAt:"",
                expiresAt: ""
            },
            params: {
                type: { value: "", placeholder: "Type", options: [], hover: "", page: 0 },
                status: { value: "", placeholder: "Status", options: [], hover: "", page: 0 },
                user: { value: "", placeholder: "User", options: [], hover: "", page: 0 },
                createdAt: { value: "", placeholder: "createdAt", options: [], hover: "", page: 0 },
                expiresAt: { value: "", placeholder: "expiresAt", options: [], hover: "", page: 0 }
            },
            focused: "",
        });
    }

    getDropdownOptions(key, page) {
        const { focused, sort, dropdown } = this.state;
        this.setState({
            loading: true
        }, () => {
            const requestOptions = {
                method: "POST",
                headers: { ...authHeader(), "Content-Type": "application/json" },
                body: JSON.stringify({
                    sort: sort,
                    dropdown: dropdown,
                    name: this.state.params[key].value,
                    page: page || 0
                })
            };
            return fetch(`${process.env.REACT_APP_API_URI}/server/exports/getDrop/${key}`, requestOptions)
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
                }
            },
            dropdown: {
                ...this.state.dropdown,
                [name]: ""
            }
        });
    }

    handleSelectDropdown(event, name, selection) {
        event.preventDefault();
        this.setState({
            params: {
                ...this.state.params,
                [name]: {
                    ...this.state.params[name],
                    value: "",
                    options: [],
                    hover: "",
                }
            },
            dropdown: {
                ...this.state.dropdown,
                [name]: selection
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
                        value: this.state.dropdown[name],
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
                        value: this.state.dropdown[name],
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
        const { params, dropdown, focused } = this.state;
        if (!!_.isEqual(focused, name) || !!dropdown[name]) {
            this.setState({
                params: {
                    ...params,
                    [name]: {
                        ...params[name],
                        options: [],
                        value: "",
                        hover: ""
                    }
                },
                dropdown: {
                    ...dropdown,
                    [name]: ""
                },
                focused: "",
            });
            let myInput = document.getElementById(name);
            myInput.blur();
        } else {
            let myInput = document.getElementById(name);
            myInput.focus();
            myInput.select();
        }
    }

    render() {
        const { collapsed, toggleCollapse } = this.props;
        const { alert, menuItem, sort, showSearch, settingsColWidth, selectAllRows } = this.state;
        const { params, focused, dropdown } = this.state;
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
                        <button title="Search" className="btn btn-sm btn-leeuwen-blue mr-2" onClick={this.toggleModalSearch}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="search" className="fa mr-2" />Search</span>
                        </button>
                    </div>
                    <div className="body-section">
                        <div className="row ml-1 mr-1" style={{ height: "calc(100% - 40px)" }}> {/* borderStyle: "solid", borderWidth: "1px", borderColor: "#ddd", */}
                            <div id="table-container" className="table-responsive custom-table-container" >
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
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
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
                                                index="3"
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
                                                index="4"
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
                        title="Search"
                        size="modal-lg"
                    >
                        <section id="fields" className="drop-section">
                            <div className="row row-cols-1 row-cols-md-2">
                                {Object.keys(params).map(key => 
                                    <Param
                                        key={key}
                                        name={key}
                                        isFocused={params[key].isFocused}
                                        focused={focused}
                                        value={params[key].value}
                                        placeholder={params[key].placeholder}
                                        selection={dropdown[key]}
                                        options={params[key].options}
                                        hover={this.state.params[key].hover}
                                        page={params[key].page}
                                        onChange={this.handleChangeDropdown}
                                        handleNextDropdown={this.handleNextDropdown}
                                        handleSelect={this.handleSelectDropdown}
                                        onFocus={this.onFocusDropdown}
                                        onHover={this.onHoverDropdown}
                                        toggleDropDown={this.toggleDropDown}
                                    />
                                )}
                            </div>
                        </section>
                        <div className="modal-footer">
                            <div className="row">
                                <button className="btn btn-sm btn-leeuwen" onClick={this.handleClearFields}>
                                    <span><FontAwesomeIcon icon="filter" className="fa mr-2" />Clear Fields</span>
                                </button>
                                <button className="btn btn-sm btn-leeuwen-blue ml-2" onClick={this.toggleModalSearch}>
                                    <span><FontAwesomeIcon icon={"times"} className="fa mr-2" />Close</span>
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </Layout>
        );
    }
}
