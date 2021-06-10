import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "react-loading-skeleton";
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
import ParamSelect from "../../components/param-select";
import typeToString from "../../functions/typeToString";
import getDateFormat from "../../functions/getDateFormat";
import _ from "lodash";

export default class Stock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            article: {
                location: {
                    title: "",
                    address: "",
                    postalcode: "",
                    city: "",
                    country: "",
                    tel: "",
                    fax: "",
                    email: "",
                    price_info: ""
                },
                opco: "",
                artNr: "",
                description: "",
                vlunar: "",
                weight: 0,
                weight_uom: "",
                uom: "",
                qty: 0,
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
                parameters: {
                    sizeOne: {
                        name: "",
                        tags: [],
                    },
                    sizeTwo: {
                        name: "",
                        tags: [],
                    },
                    sizeThree: {
                        name: "",
                        tags: [],
                    },
                    wallOne: {
                        name: "",
                        tags: [],
                    },
                    wallTwo: {
                        name: "",
                        tags: [],
                    },
                    type: {
                        name: "",
                        tags: [],
                    },
                    grade: {
                        name: "",
                        tags: [],
                    },
                    length: {
                        name: "",
                        tags: [],
                    },
                    end: {
                        name: "",
                        tags: [],
                    },
                    surface: {
                        name: "",
                        tags: [],
                    }
                }
            },
            stocks: [],
            sort: {
                name: "",
                isAscending: true,
            },
            params: {
                pffType: { value: "", placeholder: "PFF type", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                steelType: { value: "", placeholder: "Steel type", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                sizeOne: { value: "", placeholder: "Outside diameter 1", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                sizeTwo: { value: "", placeholder: "Outside diameter 2", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wallOne: { value: "", placeholder: "Wall thickness 1", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wallTwo: { value: "", placeholder: "Wall thickness 2", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                type: { value: "", placeholder: "Article type", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                grade: { value: "", placeholder: "Material grade", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                length: { value: "", placeholder: "Length", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                _end: { value: "", placeholder: "Ends", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                surface: { value: "", placeholder: "Surface treatment", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                region: { value: "", placeholder: "Region", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                country: { value: "", placeholder: "Country", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                opco: { value: "", placeholder: "OPCO", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                artNr: { value: "", placeholder: "ArtNr", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                stock: { value: "", placeholder: "Stock", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                supplier: { value: "", placeholder: "Supplier", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
            },
            focused: "",
            alert: {
                type: "",
                message: ""
            },
            isDisabled: true,
            selectAllRows: false,
            selectedRows: [],
            retrievingStocks: false,
            retrievingArticle: false,
            exportingParams: false,
            exportingStocks: false,
            upserting: false,
            loading: false,
            loaded: false,
            submitted: false,
            showSearch: false,
            showArticle: false,
            menuItem: "Stock",
            settingsColWidth: {},
            // suppliers: [],
            // selectedSuppliers: [],
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
        this.toggleModalSearch = this.toggleModalSearch.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.getDocuments = this.getDocuments.bind(this);
        this.updateDisabled = this.updateDisabled.bind(this);
        this.colDoubleClick = this.colDoubleClick.bind(this);
        this.setColWidth = this.setColWidth.bind(this);
        this.changePage = this.changePage.bind(this);
        this.generateBody = this.generateBody.bind(this);
        // this.generateSuppliers = this.generateSuppliers.bind(this);
        this.handleClearFields = this.handleClearFields.bind(this);
        this.getDropdownOptions = this.getDropdownOptions.bind(this);
        this.handleChangeDropdown = this.handleChangeDropdown.bind(this);
        this.handleNextDropdown = this.handleNextDropdown.bind(this);
        this.handleSelectDropdown = this.handleSelectDropdown.bind(this);
        this.onFocusDropdown = this.onFocusDropdown.bind(this);
        this.onHoverDropdown = this.onHoverDropdown.bind(this);
        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.getArticle = this.getArticle.bind(this);
        this.toggleModalArticle = this.toggleModalArticle.bind(this);
        this.toggleSelectAllRow = this.toggleSelectAllRow.bind(this);
        this.updateSelectedRows = this.updateSelectedRows.bind(this);
        // this.updateSelectedSuppliers = this.updateSelectedSuppliers.bind(this);
    }

    componentDidMount() {
        const tableContainer = document.getElementById("table-container");
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.getElementById("stock").addEventListener("click", event => {
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

        this.setState({
            paginate: {
                ...this.state.paginate,
                pageSize: getPageSize(tableContainer.clientHeight)
            }
        }, () => this.getDocuments(this.state.paginate.currentPage));

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
        const { sort, paginate, stocks, selectedRows } = this.state; //suppliers, selectedSuppliers, 
        
        if (sort !== prevState.sort || (paginate.pageSize !== prevState.paginate.pageSize && prevState.paginate.pageSize !== 0)) {
            this.getDocuments();
        }

        if (this.state.params.pffType.selection._id !== prevState.params.pffType.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.steelType.selection._id !== prevState.params.steelType.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.sizeOne.selection._id !== prevState.params.sizeOne.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.sizeTwo.selection._id !== prevState.params.sizeTwo.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.wallOne.selection._id !== prevState.params.wallOne.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.wallTwo.selection._id !== prevState.params.wallTwo.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.type.selection._id !== prevState.params.type.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.grade.selection._id !== prevState.params.grade.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.length.selection._id !== prevState.params.length.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params._end.selection._id !== prevState.params._end.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.surface.selection._id !== prevState.params.surface.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.region.selection._id !== prevState.params.region.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.country.selection._id !== prevState.params.country.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.opco.selection._id !== prevState.params.opco.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.artNr.selection._id !== prevState.params.artNr.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.stock.selection._id !== prevState.params.stock.selection._id) this.getDocuments() && this.updateDisabled();
        if (this.state.params.supplier.selection._id !== prevState.params.supplier.selection._id) this.getDocuments() && this.updateDisabled();
        
        if (this.state.params.pffType.value !== prevState.params.pffType.value) this.getDropdownOptions("pffType", 0);
        if (this.state.params.steelType.value !== prevState.params.steelType.value) this.getDropdownOptions("steelType", 0);
        if (this.state.params.sizeOne.value !== prevState.params.sizeOne.value) this.getDropdownOptions("sizeOne", 0);
        if (this.state.params.sizeTwo.value !== prevState.params.sizeTwo.value) this.getDropdownOptions("sizeTwo", 0);
        if (this.state.params.wallOne.value !== prevState.params.wallOne.value) this.getDropdownOptions("wallOne", 0);
        if (this.state.params.wallTwo.value !== prevState.params.wallTwo.value) this.getDropdownOptions("wallTwo", 0);
        if (this.state.params.type.value !== prevState.params.type.value) this.getDropdownOptions("type", 0);
        if (this.state.params.grade.value !== prevState.params.grade.value) this.getDropdownOptions("grade", 0);
        if (this.state.params.length.value !== prevState.params.length.value) this.getDropdownOptions("length", 0);
        if (this.state.params._end.value !== prevState.params._end.value) this.getDropdownOptions("_end", 0);
        if (this.state.params.surface.value !== prevState.params.surface.value) this.getDropdownOptions("surface", 0);
        if (this.state.params.region.value !== prevState.params.region.value) this.getDropdownOptions("region", 0);
        if (this.state.params.country.value !== prevState.params.country.value) this.getDropdownOptions("country", 0);
        if (this.state.params.opco.value !== prevState.params.opco.value) this.getDropdownOptions("opco", 0);
        if (this.state.params.artNr.value !== prevState.params.artNr.value) this.getDropdownOptions("artNr", 0);
        if (this.state.params.stock.value !== prevState.params.stock.value) this.getDropdownOptions("stock", 0);
        if (this.state.params.supplier.value !== prevState.params.supplier.value) this.getDropdownOptions("supplier", 0);

        if (stocks !== prevState.stocks) {
            let remaining = selectedRows.reduce(function(acc, cur) {
                let found = stocks.find(element => _.isEqual(element._id, cur));
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

        // if (suppliers !== prevState.suppliers) {
        //     let remaining = selectedSuppliers.reduce(function(acc, cur) {
        //         let found = suppliers.find(element => _.isEqual(element, cur));
        //         if (!_.isUndefined(found)){
        //           acc.push(cur);
        //         }
        //         return acc;
        //     }, []);
        //     this.setState({
        //         selectedSuppliers: remaining,
        //     });
        // }

        if (selectedRows !== prevState.selectedRows) this.updateDisabled();
    }

    updateDisabled() {
        const { params, selectedRows } = this.state;
        if (!_.isEmpty(selectedRows)) {
            this.setState({
                isDisabled: false
            });
        } else {
            this.setState({
                isDisabled: Object.keys(params).reduce(function(acc, cur) {
                    if (acc === true && params[cur].selection._id !== "") acc = false;
                    return acc;
                }, true)
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

    handleExport(event, type) {
        event.preventDefault();
        const { sort, params, exportingParams, exportingStocks, selectedRows } = this.state;
        if (["params", "stocks"].includes(type) && !exportingParams && !exportingStocks) {
            
            this.setState({
                exportingParams: type === "params" ? true : false,
                exportingStocks: type === "stocks" ? true : false,
            }, () => {
                const requestOptions = {
                    method: "POST",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sort: sort,
                        dropdown: {
                            pffType: params.pffType.selection._id,
                            steelType: params.steelType.selection._id,
                            sizeOne: params.sizeOne.selection._id,
                            sizeTwo: params.sizeTwo.selection._id,
                            wallOne: params.wallOne.selection._id,
                            wallTwo: params.wallTwo.selection._id,
                            type: params.type.selection._id,
                            grade: params.grade.selection._id,
                            length: params.length.selection._id,
                            end: params._end.selection._id,
                            surface: params.surface.selection._id,
                            region: params.region.selection._id,
                            country: params.country.selection._id,
                            opco: params.opco.selection._id,
                            artNr: params.artNr.selection._id,
                            stock: params.stock.selection._id,
                            supplier: params.supplier.selection._id,
                        },
                        selectedIds: selectedRows
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/stocks/export/${type}`, requestOptions)
                .then(response => response.text().then(text => {
                    this.setState({
                        exportingParams: type === false,
                        exportingStocks: type === false,
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
                                    type: response.status === 200 ? "alert-success" : "alert-danger",
                                    message: resMsg || ""
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

    getDocuments(nextPage) {
        const {paginate, sort, params} = this.state;
        if (!!paginate.pageSize) {
            this.setState({
                retrievingStocks: true
            }, () => {
                const requestOptions = {
                    method: "POST",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sort: sort,
                        dropdown: {
                            pffType: params.pffType.selection._id,
                            steelType: params.steelType.selection._id,
                            sizeOne: params.sizeOne.selection._id,
                            sizeTwo: params.sizeTwo.selection._id,
                            wallOne: params.wallOne.selection._id,
                            wallTwo: params.wallTwo.selection._id,
                            type: params.type.selection._id,
                            grade: params.grade.selection._id,
                            length: params.length.selection._id,
                            end: params._end.selection._id,
                            surface: params.surface.selection._id,
                            region: params.region.selection._id,
                            country: params.country.selection._id,
                            opco: params.opco.selection._id,
                            artNr: params.artNr.selection._id,
                            stock: params.stock.selection._id,
                            supplier: params.supplier.selection._id,
                        },
                        nextPage: nextPage,
                        pageSize: paginate.pageSize
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/stocks/getAll`, requestOptions)
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
                                // suppliers: data[0].suppliers || [],
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
                location: {
                    title: "",
                    address: "",
                    postalcode: "",
                    city: "",
                    country: "",
                    tel: "",
                    fax: "",
                    email: "",
                    price_info: ""
                },
                opco: "",
                artNr: "",
                description: "",
                vlunar: "",
                weight: 0,
                weight_uom: "",
                uom: "",
                qty: 0,
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
                parameters: {
                    sizeOne: {
                        name: "",
                        tags: [],
                    },
                    sizeTwo: {
                        name: "",
                        tags: [],
                    },
                    sizeThree: {
                        name: "",
                        tags: [],
                    },
                    wallOne: {
                        name: "",
                        tags: [],
                    },
                    wallTwo: {
                        name: "",
                        tags: [],
                    },
                    type: {
                        name: "",
                        tags: [],
                    },
                    grade: {
                        name: "",
                        tags: [],
                    },
                    length: {
                        name: "",
                        tags: [],
                    },
                    end: {
                        name: "",
                        tags: [],
                    },
                    surface: {
                        name: "",
                        tags: [],
                    }
                }
            },
            retrievingArticle: true,
            showArticle: true
        }, () => {
            const requestOptions = {
                method: "GET",
                headers: { ...authHeader(), "Content-Type": "application/json" },
            };
            return fetch(`${process.env.REACT_APP_API_URI}/server/stocks/${_id}`, requestOptions)
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
                location: {
                    title: "",
                    address: "",
                    postalcode: "",
                    city: "",
                    country: "",
                    tel: "",
                    fax: "",
                    email: "",
                    price_info: ""
                },
                opco: "",
                artNr: "",
                description: "",
                vlunar: "",
                weight: 0,
                weight_uom: "",
                uom: "",
                qty: 0,
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
                parameters: {
                    sizeOne: {
                        name: "",
                        tags: [],
                    },
                    sizeTwo: {
                        name: "",
                        tags: [],
                    },
                    sizeThree: {
                        name: "",
                        tags: [],
                    },
                    wallOne: {
                        name: "",
                        tags: [],
                    },
                    wallTwo: {
                        name: "",
                        tags: [],
                    },
                    type: {
                        name: "",
                        tags: [],
                    },
                    grade: {
                        name: "",
                        tags: [],
                    },
                    length: {
                        name: "",
                        tags: [],
                    },
                    end: {
                        name: "",
                        tags: [],
                    },
                    surface: {
                        name: "",
                        tags: [],
                    }
                }
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

    toggleSelectAllRow() {
        const { selectAllRows, stocks } = this.state;
        if (!_.isEmpty(stocks)) {
          if (!!selectAllRows) {
            this.setState({
              selectedRows: [],
              selectAllRows: false,
            });
          } else {
            this.setState({
              selectedRows: stocks.map(stock => stock._id),
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

    // updateSelectedSuppliers(id) {
    //     const { selectedSuppliers } = this.state;
    //     if (selectedSuppliers.includes(id)) {
    //         this.setState({ selectedSuppliers: arrayRemove(selectedSuppliers, id) });
    //     } else {
    //       this.setState({ selectedSuppliers: [...selectedSuppliers, id] });
    //     }
    // }

    generateBody() {
        const { stocks, retrievingStocks, paginate, settingsColWidth, selectAllRows, selectedRows } = this.state;
        let tempRows = [];
        if (!retrievingStocks) {
            stocks.map((stock) => {
                tempRows.push(
                    <tr key={stock._id}>
                        <TableSelectRow
                            id={stock._id}
                            selectAllRows={selectAllRows}
                            selectedRows={selectedRows}
                            callback={this.updateSelectedRows}
                        />
                        <TableData colIndex="0" value={stock.opco} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="1" value={stock.artNr} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="2" value={stock.description} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="3" value={stock.qty} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="4" value={stock.firstInStock} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="5" value={stock.uom} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="6" value={stock.gip} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="7" value={stock.rv} type="number" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        <TableData colIndex="8" value={stock.currency} type="text" settingsColWidth={settingsColWidth} handleClick={this.getArticle} eventId={stock._id} />
                        
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

    // generateSuppliers() {
    //     const { suppliers, selectedsuppliers, retrievingStocks } = this.state;
    //     let tempRows = [];
    //     if (!retrievingStocks) {
    //         suppliers.map( (supplier, index) => tempRows.push(
    //         <div className="modal-body-content-section-checkbox-container" key={index}>
    //             <div>
    //                 <div className="modal-body-content-section-checkbox-text">{supplier}</div> 
    //             </div>
    //             <div className="modal-body-content-section-checkbox-checkbox-container">
                    
    //             </div>
                
    //         </div>));
    //     } else {
    //         for (let i = 0; i < 4; i++) {
    //             tempRows.push(
    //                 <div className="modal-body-content-section-checkbox-container" key={i}>
    //                     <div>
    //                         <div className="modal-body-content-section-checkbox-text"><Skeleton /></div>
    //                     </div>
    //                     <div className="modal-body-content-section-checkbox-checkbox-container">
                    
    //                     </div>
    //                 </div>
    //             );
    //         }
    //     }
    //     return (tempRows);
    // }

    handleClearFields(event) {
        event.preventDefault();
        this.setState({
            sort: {
                name: "",
                isAscending: true,
            },
            params: {
                pffType: { value: "", placeholder: "PFF type", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                steelType: { value: "", placeholder: "Steel type", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                sizeOne: { value: "", placeholder: "Outside diameter 1", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                sizeTwo: { value: "", placeholder: "Outside diameter 2", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wallOne: { value: "", placeholder: "Wall thickness 1", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wallTwo: { value: "", placeholder: "Wall thickness 2", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                type: { value: "", placeholder: "Article type", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                grade: { value: "", placeholder: "Material grade", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                length: { value: "", placeholder: "Length", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                _end: { value: "", placeholder: "Ends", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                surface: { value: "", placeholder: "Surface treatment", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                region: { value: "", placeholder: "Region", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                country: { value: "", placeholder: "Country", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                opco: { value: "", placeholder: "OPCO", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                artNr: { value: "", placeholder: "Art Nr", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                stock: { value: "", placeholder: "Stock", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                supplier: { value: "", placeholder: "Supplier", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
            },
            focused: "",
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
                        pffType: this.state.params.pffType.selection._id,
                        steelType: this.state.params.steelType.selection._id,
                        sizeOne: this.state.params.sizeOne.selection._id,
                        sizeTwo: this.state.params.sizeTwo.selection._id,
                        wallOne: this.state.params.wallOne.selection._id,
                        wallTwo: this.state.params.wallTwo.selection._id,
                        type: this.state.params.type.selection._id,
                        grade: this.state.params.grade.selection._id,
                        length: this.state.params.length.selection._id,
                        end: this.state.params._end.selection._id,
                        surface: this.state.params.surface.selection._id,
                        region: this.state.params.region.selection._id,
                        country: this.state.params.country.selection._id,
                        opco: this.state.params.opco.selection._id,
                        artNr: this.state.params.artNr.selection._id,
                        stock: this.state.params.stock.selection._id,
                        supplier: this.state.params.supplier.selection._id,
                    },
                    name: this.state.params[key].value,
                    page: page || 0
                })
            };
            return fetch(`${process.env.REACT_APP_API_URI}/server/stocks/getDrop/${(key).replace("_", "")}`, requestOptions)
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
        const { alert, menuItem, article, retrievingArticle, sort, showSearch, settingsColWidth, exportingParams, exportingStocks, showArticle, selectAllRows } = this.state; //tabs
        const { params, focused, isDisabled } = this.state;
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
                <div id="stock" className={alert.message ? "main-section-alert" : "main-section"}>
                    <div className="action-row row">
                        <button title="Filters" className="btn btn-sm btn-gray" onClick={this.toggleModalSearch}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="filter" className="fa mr-2" />Filters</span>
                        </button>
                        <button title="Refresh Page" className="btn btn-sm btn-gray" onClick={this.handleRefresh}>
                            <span><FontAwesomeIcon icon="sync-alt" className="fa mr-2"/>Refresh</span>
                        </button>
                        <button title="Export Stock" className="btn btn-sm btn-gray" disabled={isDisabled} onClick={event => this.handleExport(event, "stocks")}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon={exportingStocks ? "spinner" : "file-download"} className={exportingStocks ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Stock</span>
                        </button>
                        <button title="Export Params" className="btn btn-sm btn-gray" disabled={isDisabled} onClick={event => this.handleExport(event, "params")}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon={exportingParams ? "spinner" : "file-download"} className={exportingParams ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"} />Params</span>
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
                                                title="opco"
                                                name="opco"
                                                width="230px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="0"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                title="artNr"
                                                name="artNr"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="1"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                title="description"
                                                name="description"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                title="qty"
                                                name="qty"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="3"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                title="firstInStock"
                                                name="firstInStock"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="4"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                title="uom"
                                                name="uom"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="5"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                title="gip"
                                                name="gip"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="6"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                title="rv"
                                                name="rv"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="7"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                title="currency"
                                                name="currency"
                                                width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="8"
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
                                <section id="description" className="drop-section">
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Item description
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row row-cols-1 row-cols-md-2">
                                        {Object.keys(params).map((key, index) => index < 11 && 
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
                                                onChange={this.handleChangeDropdown}
                                                handleNext={this.handleNextDropdown}
                                                handleSelect={this.handleSelectDropdown}
                                                onFocus={this.onFocusDropdown}
                                                onHover={this.onHoverDropdown}
                                                toggleDropDown={this.toggleDropDown}
                                            />
                                        )}
                                    </div>
                                    {/* <hr /> */}
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
                                        {Object.keys(params).map((key, index) => index > 10 && 
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
                                                onChange={this.handleChangeDropdown}
                                                handleNext={this.handleNextDropdown}
                                                handleSelect={this.handleSelectDropdown}
                                                onFocus={this.onFocusDropdown}
                                                onHover={this.onHoverDropdown}
                                                toggleDropDown={this.toggleDropDown}
                                            />
                                        )}
                                    </div>
                                </section>
                                {/* <section id="parameters" className="drop-section">
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Suppliers
                                            </div>
                                        </div>
                                    </div>
                                    {this.generateSuppliers()}
                                </section> */}
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="modal-footer-button long" onClick={this.toggleModalSearch}>Show results ({typeToString(totalItems, "number", getDateFormat())})</button>
                        </div>
                    </Modal>
                    <Modal
                        show={showArticle}
                        hideModal={this.toggleModalArticle}
                        title={"Stock Info"}
                        size="modal-lg"
                    >
                        <div className="modal-body">
                            <div className="modal-body-content">
                                <section>
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Location
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive" id="location">
                                        <table className="table">
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
                                <section>
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Article
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive" id="article">
                                        <table className="table">
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
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.weight, "number", getDateFormat())} ${article.weight_uom}`}</td>
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
                                <section>
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Suppliers
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive" id="supplier_info">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[0] || "supplier 1"}</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[0], "number", getDateFormat())} ${article.uom}`}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[1] || "supplier 2"}</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[1], "number", getDateFormat())} ${article.uom}`}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[2] || "supplier 3"}</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[2], "number", getDateFormat())} ${article.uom}`}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">{retrievingArticle? <Skeleton /> : article.supplier.names[3] || "supplier 4"}</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : `${typeToString(article.supplier.qtys[3], "number", getDateFormat())} ${article.uom}`}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                                <section>
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Purchase
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive" id="purchase_info">
                                        <table className="table">
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
                                <section>
                                    <div className="modal-body-content-section-title-container">
                                        <div className="modal-body-content-section-title-row">
                                            <div className="modal-body-content-section-title">
                                                Parameters
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive" id="params_info">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <th scope="row" className="w-40">sizeOne</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.sizeOne.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">sizeTwo</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.sizeTwo.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">sizeThree</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.sizeThree.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">wallOne</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.wallOne.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">wallTwo</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.wallTwo.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">type</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.type.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">grade</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.grade.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">length</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.length.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">end</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.end.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row" className="w-40">surface</th>
                                                    <td className="w-60">{retrievingArticle? <Skeleton /> : article.parameters.surface.name}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-footer-button long" onClick={this.toggleModalArticle}>Close</button>
                        </div>
                    </Modal>
                </div>
            </Layout>
        );
    }
}
