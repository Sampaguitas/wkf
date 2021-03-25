import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
import authHeader from "../../helpers/auth-header";
import copyObject from "../../functions/copyObject";
import getPageSize from "../../functions/getPageSize";
import typeToString from "../../functions/typeToString";
import getDateFormat from "../../functions/getDateFormat";

import TableHeaderInput from "../../components/table-header-input";
import TableData from "../../components/table-data";
import Layout from "../../components/layout";
import Modal from "../../components/modal";
import Pagination from "../../components/pagination";
import Param from '../../components/param';
import _ from "lodash";

export default class Stock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: {},
            article: {
                price: {
                    gip: 0,
                    rv: 0
                },
                purchase: {
                    supplier: "",
                    qty: 0,
                    firstInStock: 0,
                    deliveryDate: null
                },
                supplier: {
                    names: [ "", "", "", "" ],
                    qtys: [ 0, 0, 0, 0 ]
                },
                artNr: "",
                opco: "",
                qty: 0,
                description: "",
                uom: "",
                vlunar: "",
                weight: 0
            },
            stocks: [],
            filter: {
                opco:"",
                artNr:"",
                description: "",
                qty: "",
                uom: "",
                firstInStock: "",
                weight: "",
                gip: "",
                currency: "",
                rv: ""
            },
            sort: {
                name: "",
                isAscending: true,
            },
            dropdown: {
                opco: "",
                artNr: "",
                pffType: "",
                steelType: "",
                sizeOne: "",
                sizeTwo: "",
                wallOne: "",
                wallTwo: "",
                type: "",
                grade: "",
                length: "",
                end: "",
                surface: ""
            },
            params: {
                opco: { value: "", placeholder: "OPCO", options: [], hover: "" },
                artNr: { value: "", placeholder: "Article number", options: [], hover: "" },
                pffType: { value: "", placeholder: "PFF type", options: [], hover: "" },
                steelType: { value: "", placeholder: "Steel type", options: [], hover: "" },
                sizeOne: { value: "", placeholder: "Outside diameter 1", options: [], hover: "" },
                sizeTwo: { value: "", placeholder: "Outside diameter 2", options: [], hover: "" },
                wallOne: { value: "", placeholder: "Wall thickness 1", options: [], hover: "" },
                wallTwo: { value: "", placeholder: "Wall thickness 2", options: [], hover: "" },
                type: { value: "", placeholder: "Article type", options: [], hover: "" },
                grade: { value: "", placeholder: "Material grade", options: [], hover: "" },
                length: { value: "", placeholder: "Length", options: [], hover: "" },
                end: { value: "", placeholder: "Ends", options: [], hover: "" },
                surface: { value: "", placeholder: "Surface treatment", options: [], hover: "" },
            },
            alert: {
                type: "",
                message: ""
            },
            retrievingStocks: false,
            retrievingArticle: false,
            upserting: false,
            loaded: false,
            submitted: false,
            showSearch: false,
            showArticle: false,
            menuItem: "Stock",
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
        this.handleChangeHeader = this.handleChangeHeader.bind(this);
        this.getDocuments = this.getDocuments.bind(this);
        this.colDoubleClick = this.colDoubleClick.bind(this);
        this.setColWidth = this.setColWidth.bind(this);
        this.changePage = this.changePage.bind(this);
        this.generateBody = this.generateBody.bind(this);
        //dropdown
        this.handleClearFields = this.handleClearFields.bind(this);
        this.getDropdownOptions = this.getDropdownOptions.bind(this);
        this.handleChangeDropdown = this.handleChangeDropdown.bind(this);
        this.handleSelectDropdown = this.handleSelectDropdown.bind(this);
        this.onFocusDropdown = this.onFocusDropdown.bind(this);
        this.onHoverDropdown = this.onHoverDropdown.bind(this);
        this.toggleDropDown = this.toggleDropDown.bind(this);
        //article
        this.getArticle = this.getArticle.bind(this);
        this.toggleModalArticle = this.toggleModalArticle.bind(this);
    }

    componentDidMount() {
        const { paginate, params } = this.state;
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

        // const fields = document.getElementById('fields');
        // fields.addEventListener("keydown", event => {
        //     if (Object.keys(params).includes(event.target.id)) {
        //         let name = event.target.id;
        //         switch(event.key) {
        //             case "ArrowDown":
        //                 if (!_.isEmpty(this.state.params[name].options)) {
        //                     let selectedIndex = this.state.params[name].options.findIndex(element => _.isEqual(element, this.state.params[name].hover));
        //                     if (selectedIndex === -1) {
        //                         this.setState({
        //                             params: {
        //                                 ...this.state.params,
        //                                 [name]: {
        //                                     ...this.state.params[name],
        //                                     hover: this.state.params[name].options[0]
        //                                 }
        //                             },
        //                             dropdown: {
        //                                 ...this.state.dropdown,
        //                                 [name]: this.state.params[name].options[0],
        //                             }
        //                         });
        //                     } else if (selectedIndex < this.state.params[name].options.length - 1) {
        //                         this.setState({
        //                             params: {
        //                                 ...this.state.params,
        //                                 [name]: {
        //                                     ...this.state.params[name],
        //                                     hover: this.state.params[name].options[selectedIndex + 1]
        //                                 }
        //                             },
        //                             dropdown: {
        //                                 ...this.state.dropdown,
        //                                 [name]: this.state.params[name].options[selectedIndex + 1]
        //                             }
        //                         });
        //                     }
        //                 }
        //                 break;
        //             case "ArrowUp":
        //                 if (!_.isEmpty(this.state.params[name].options)) {
        //                     let selectedIndex = this.state.params[name].options.findIndex(element => _.isEqual(element, this.state.params[name].hover));
        //                 if (selectedIndex > 0) {
        //                         this.setState({
        //                             params: {
        //                                 ...this.state.params,
        //                                 [name]: {
        //                                     ...this.state.params[name],
        //                                     hover: this.state.params[name].options[selectedIndex - 1]
        //                                 }
        //                             },
        //                             dropdown: {
        //                                 ...this.state.dropdown,
        //                                 [name]: this.state.params[name].options[selectedIndex - 1]
        //                             }
        //                         });
        //                     }
        //                 }
        //                 break;
        //             case "Enter":
        //                 let selected = this.state.params[name].options.find(element => _.isEqual(element, this.state.params[name].hover));
        //                 if (!_.isUndefined(selected)) {
        //                     this.setState({
        //                         params: {
        //                             ...this.state.params,
        //                             [name]: {
        //                                 ...this.state.params[name],
        //                                 options: [],
        //                                 value: '',
        //                                 hover: ''
        //                             }
        //                         },
        //                         dropdown: {
        //                             ...this.state.dropdown,
        //                             [name]: selected._id,
        //                         },
        //                         focused: '',
        //                     });
        //                     let myInput = document.getElementById(name);
        //                     myInput.blur();
        //                 }
        //                 break;
        //             case "Escape":
        //                 this.setState({
        //                     params: {
        //                         ...this.state.params,
        //                         [name]: {
        //                             ...this.state.params[name],
        //                             options: [],
        //                             value: '',
        //                             hover: '',
        //                         }
        //                     },
        //                     dropdown: {
        //                         ...this.state.dropdown,
        //                         [name]: "",
        //                     },
        //                     focused: '',
        //                 });
        //                 let myInput = document.getElementById(name);
        //                 myInput.blur();
        //                 break;
        //             default: // do nothing;
        //                 break;
        //         }
        //     }
        // });

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.params.opco.value !== prevState.params.opco.value) this.getDropdownOptions("opco");
        if (this.state.params.artNr.value !== prevState.params.artNr.value) this.getDropdownOptions("artNr");
        if (this.state.params.pffType.value !== prevState.params.pffType.value) this.getDropdownOptions("pffType");
        if (this.state.params.steelType.value !== prevState.params.steelType.value) this.getDropdownOptions("steelType");
        if (this.state.params.sizeOne.value !== prevState.params.sizeOne.value) this.getDropdownOptions("sizeOne");
        if (this.state.params.sizeTwo.value !== prevState.params.sizeTwo.value) this.getDropdownOptions("sizeTwo");
        if (this.state.params.wallOne.value !== prevState.params.wallOne.value) this.getDropdownOptions("wallOne");
        if (this.state.params.wallTwo.value !== prevState.params.wallTwo.value) this.getDropdownOptions("wallTwo");
        if (this.state.params.type.value !== prevState.params.type.value) this.getDropdownOptions("type");
        if (this.state.params.grade.value !== prevState.params.grade.value) this.getDropdownOptions("grade");
        if (this.state.params.length.value !== prevState.params.length.value) this.getDropdownOptions("length");
        if (this.state.params.end.value !== prevState.params.end.value) this.getDropdownOptions("end");
        if (this.state.params.surface.value !== prevState.params.surface.value) this.getDropdownOptions("surface");
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
        const { sort, filter, dropdown, paginate } = this.state;
        if (sort !== prevState.sort || filter !== prevState.filter || dropdown !== prevState.dropdown || (paginate.pageSize !== prevState.paginate.pageSize && prevState.paginate.pageSize !== 0)) {
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

    toggleModalSearch() {
        const { showSearch } = this.state;
        this.setState({
            showSearch: !showSearch
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
        const { filter, sort, dropdown, paginate } = this.state;
        if (!!paginate.pageSize) {
            this.setState({
                retrievingStocks: true
            }, () => {
                const requestOptions = {
                    method: "POST",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filter: filter,
                        sort: sort,
                        dropdown: dropdown,
                        nextPage: nextPage,
                        pageSize: paginate.pageSize
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/api/search/stocks/getAll`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        retrievingStocks: false,
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
                                stocks: data[0].data,
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

    getArticle(event, _id) {
        event.preventDefault();
        this.setState({
            article: {
                price: {
                    gip: 0,
                    rv: 0
                },
                purchase: {
                    supplier: "",
                    qty: 0,
                    firstInStock: 0,
                    deliveryDate: null
                },
                supplier: {
                    names: [ "", "", "", "" ],
                    qtys: [ 0, 0, 0, 0 ]
                },
                artNr: "",
                opco: "",
                qty: 0,
                description: "",
                uom: "",
                vlunar: "",
                weight: 0
            },
            retrievingArticle: true,
            showArticle: true
        }, () => {
            const requestOptions = {
                method: "GET",
                headers: { ...authHeader(), "Content-Type": "application/json" },
            };
            return fetch(`${process.env.REACT_APP_API_URI}/api/search/stocks/${_id}`, requestOptions)
            .then(response => response.text().then(text => {
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
                            message: resMsg,
                            retrievingArticle: false,
                        }
                    });
                } else {
                    this.setState({
                        article: data.article,
                        retrievingArticle: false,
                    });
                }
            }))
            .catch( () => {
                localStorage.removeItem("user");
                window.location.reload(true);
            });
        });
    }

    toggleModalArticle(event) {
        event.preventDefault();
        const {showArticle} = this.state;
        this.setState({
            article: {
                price: {
                    gip: 0,
                    rv: 0
                },
                purchase: {
                    supplier: "",
                    qty: 0,
                    firstInStock: 0,
                    deliveryDate: null
                },
                supplier: {
                    names: [ "", "", "", "" ],
                    qtys: [ 0, 0, 0, 0 ]
                },
                artNr: "",
                opco: "",
                qty: 0,
                description: "",
                uom: "",
                vlunar: "",
                weight: 0
            },
            retrievingArticle: false,
            showArticle: !showArticle
        });
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
        const { stocks, retrievingStocks, currentUser, paginate, settingsColWidth } = this.state;
        let tempRows = [];
        if (!_.isEmpty(stocks) || !retrievingStocks) {
            stocks.map((stock) => {
                tempRows.push(
                    <tr key={stock._id}>
                        <TableData colIndex="0" value={stock.opco} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="1" value={stock.artNr} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="2" value={stock.description} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="3" value={stock.qty} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="4" value={stock.uom} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="5" value={stock.firstInStock} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="6" value={stock.weight} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="7" value={stock.gip} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="8" value={stock.currency} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="9" value={stock.rv} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
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
            filter: {
                opco:"",
                artNr:"",
                description: "",
                qty: "",
                uom: "",
                firstInStock: "",
                weight: "",
                gip: "",
                currency: "",
                rv: ""
            },
            sort: {
                name: "",
                isAscending: true,
            },
            dropdown: {
                opco: "",
                artNr: "",
                pffType: "",
                steelType: "",
                sizeOne: "",
                sizeTwo: "",
                wallOne: "",
                wallTwo: "",
                type: "",
                grade: "",
                length: "",
                end: "",
                surface: ""
            },
            params: {
                opco: { value: "", placeholder: "OPCO", options: [], hover: "" },
                artNr: { value: "", placeholder: "Art number", options: [], hover: "" },
                pffType: { value: "", placeholder: "PFF type", options: [], hover: "" },
                steelType: { value: "", placeholder: "Steel type", options: [], hover: "" },
                sizeOne: { value: "", placeholder: "Outside diameter 1", options: [], hover: "" },
                sizeTwo: { value: "", placeholder: "Outside diameter 2", options: [], hover: "" },
                wallOne: { value: "", placeholder: "Wall thickness 1", options: [], hover: "" },
                wallTwo: { value: "", placeholder: "Wall thickness 2", options: [], hover: "" },
                type: { value: "", placeholder: "Article type", options: [], hover: "" },
                grade: { value: "", placeholder: "Material grade", options: [], hover: "" },
                length: { value: "", placeholder: "Length", options: [], hover: "" },
                end: { value: "", placeholder: "Ends", options: [], hover: "" },
                surface: { value: "", placeholder: "Surface treatment", options: [], hover: "" },
            },
            focused: "",
        });
    }

    getDropdownOptions(key) {
        const { focused } = this.state;
        console.log("getDropdownOptions(",key,")");
        this.setState({
            loading: true
        }, () => {
            const requestOptions = {
                method: "GET",
                headers: { ...authHeader(), "Content-Type": "application/json" },
            };
            return fetch(`${process.env.REACT_APP_API_URI}/api/dropdown/${key}?name=${encodeURI(this.state.params[key].value)}&pffType=${encodeURI(this.state.dropdown.pffType)}&steelType=${encodeURI(this.state.dropdown.steelType)}&sizeOne=${encodeURI(this.state.dropdown.sizeOne)}&sizeTwo=${encodeURI(this.state.dropdown.sizeTwo)}&opco=${encodeURI(this.state.dropdown.opco)}&isComplete=false&isMultiple=false`, requestOptions)
            .then(response => response.text().then(text => {
                this.setState({
                    loading: false,
                }, () => {
                    const data = text && JSON.parse(text);
                    console.log(data);
                    if (response.status === 200) {
                        this.setState({
                            params: {
                                ...this.state.params,
                                [key]: {
                                    ...this.state.params[key],
                                    options: key !== focused ? [] : data,
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
        }, () => this.getDropdownOptions(name));
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
            }, () => this.getDropdownOptions(name));
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
            }, () => this.getDropdownOptions(name));
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
        const { alert, menuItem, article, retrievingArticle, filter, sort, showSearch, settingsColWidth, upserting, deleting, showArticle } = this.state;
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
                        <button title="Create User" className="btn btn-sm btn-leeuwen-blue" onClick={this.toggleModalSearch}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="search" className="fa mr-2" />Search</span>
                        </button>
                    </div>
                    <div className="body-section">
                        <div className="row ml-1 mr-1" style={{ height: "calc(100% - 40px)" }}>
                            <div id="table-container" className="table-responsive custom-table-container" >
                                <table className="table table-hover table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <TableHeaderInput
                                                type="text"
                                                title="opco"
                                                name="opco"
                                                value={filter.opco}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="0"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="artNr"
                                                name="artNr"
                                                value={filter.artNr}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="1"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="description"
                                                name="description"
                                                value={filter.description}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="qty"
                                                name="qty"
                                                value={filter.qty}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="3"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="uom"
                                                name="uom"
                                                value={filter.uom}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="4"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="firstInStock"
                                                name="firstInStock"
                                                value={filter.firstInStock}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="5"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="weight"
                                                name="weight"
                                                value={filter.weight}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="6"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="gip"
                                                name="gip"
                                                value={filter.gip}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="7"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="curr"
                                                name="currency"
                                                value={filter.currency}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="8"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeaderInput
                                                type="text"
                                                title="rv"
                                                name="rv"
                                                value={filter.rv}
                                                onChange={this.handleChangeHeader}
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="9"
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
                                        onChange={this.handleChangeDropdown}
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
                    <Modal
                        show={showArticle}
                        hideModal={this.toggleModalArticle}
                        title={article.description ? article.description : "Article"}
                        size="modal-lg"
                    >
                        <div>
                            <section className="mb-3">
                                <label htmlFor="stock_info" className="mb-2">Stock Info</label>
                                <div className="table-responsive" id="stock_info">
                                    <table className="table table-hover">
                                        <tbody>
                                            <tr>
                                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "vLunar"}</th>
                                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.vlunar}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "artNr"}</th>
                                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.artNr}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : "opco"}</th>
                                                <td className="w-60">{retrievingArticle? <Skeleton /> : article.opco}</td>
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
                            <section className="mb-3">
                                <label htmlFor="supplier_info" className="mb-2">Suppliers</label>
                                <div className="table-responsive" id="supplier_info">
                                    <table className="table table-hover">
                                        <tbody>
                                            <tr>
                                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[0]}</th>
                                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[0], "number", getDateFormat())} ${article.uom}`}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[1]}</th>
                                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[1], "number", getDateFormat())} ${article.uom}`}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[2]}</th>
                                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[2], "number", getDateFormat())} ${article.uom}`}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[3]}</th>
                                                <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[3], "number", getDateFormat())} ${article.uom}`}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                            <section className="mb-3">
                                <label htmlFor="purchase_info" className="mb-2">Pruchase</label>
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
                        </div>
                        
                        <div className="modal-footer">
                            <div className="row">
                                <button className="btn btn-sm btn-leeuwen-blue ml-2" onClick={this.toggleModalArticle}>
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
