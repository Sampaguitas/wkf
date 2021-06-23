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
import ParamTagSelect from "../../../components/param-tag-select";
import ParamTagInput from "../../../components/param-tag-input";
import _ from "lodash";

export default class Walls extends React.Component {
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
                sizeId: { value: "", placeholder: "sizeId", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                mm: { value: "", placeholder: "mm", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                inch: { value: "", placeholder: "inch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                idt: { value: "", placeholder: "idt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                sch: { value: "", placeholder: "sch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                schS: { value: "", placeholder: "schS", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                lunar: { value: "", placeholder: "vLunar", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                tags: { value: "", placeholder: "Tags", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                pffTypes: { value: "", placeholder: "PFF Types", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdBy: { value: "", placeholder: "Created By", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdAt: { value: "", placeholder: "Created At", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                updatedBy: { value: "", placeholder: "Updated By", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                updatedAt: { value: "", placeholder: "Updated At", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_sizeId: { value: "", placeholder: "sizeId (in mm)", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_mm: { value: "", placeholder: "mm", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_inch: { value: "", placeholder: "inch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_idt: { value: "", placeholder: "idt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_sch: { value: "", placeholder: "sch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_schS: { value: "", placeholder: "schS", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_lunar: { value: "", placeholder: "vLunar", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_tags: { value: "", placeholder: "Tags", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
                wall_pffTypes: { value: "", placeholder: "PFF Types", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
            },
            focused: "",
            alert: {
                type: "",
                message: ""
            },
            selectAllRows: false,
            selectedRows: [],
            retrieving: false,
            retrievingElement: false,
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
        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);

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

        if (this.state.params.sizeId.selection._id !== prevState.params.sizeId.selection._id) this.getDocuments();
        if (this.state.params.mm.selection._id !== prevState.params.mm.selection._id) this.getDocuments();
        if (this.state.params.inch.selection._id !== prevState.params.inch.selection._id) this.getDocuments();
        if (this.state.params.idt.selection._id !== prevState.params.idt.selection._id) this.getDocuments();
        if (this.state.params.sch.selection._id !== prevState.params.sch.selection._id) this.getDocuments();
        if (this.state.params.schS.selection._id !== prevState.params.schS.selection._id) this.getDocuments();
        if (this.state.params.lunar.selection._id !== prevState.params.lunar.selection._id) this.getDocuments();
        if (this.state.params.tags.selection._id !== prevState.params.tags.selection._id) this.getDocuments();
        if (this.state.params.pffTypes.selection._id !== prevState.params.pffTypes.selection._id) this.getDocuments();
        if (this.state.params.createdBy.selection._id !== prevState.params.createdBy.selection._id) this.getDocuments();
        if (this.state.params.createdAt.selection._id !== prevState.params.createdAt.selection._id) this.getDocuments();
        if (this.state.params.updatedBy.selection._id !== prevState.params.updatedBy.selection._id) this.getDocuments();
        if (this.state.params.updatedAt.selection._id !== prevState.params.updatedAt.selection._id) this.getDocuments();

        if (this.state.params.sizeId.value !== prevState.params.sizeId.value) this.getDropdownOptions("sizeId", 0);
        if (this.state.params.mm.value !== prevState.params.mm.value) this.getDropdownOptions("mm", 0);
        if (this.state.params.inch.value !== prevState.params.inch.value) this.getDropdownOptions("inch", 0);
        if (this.state.params.idt.value !== prevState.params.idt.value) this.getDropdownOptions("idt", 0);
        if (this.state.params.sch.value !== prevState.params.sch.value) this.getDropdownOptions("sch", 0);
        if (this.state.params.schS.value !== prevState.params.schS.value) this.getDropdownOptions("schS", 0);
        if (this.state.params.lunar.value !== prevState.params.lunar.value) this.getDropdownOptions("lunar", 0);
        if (this.state.params.tags.value !== prevState.params.tags.value) this.getDropdownOptions("tags", 0);
        if (this.state.params.pffTypes.value !== prevState.params.pffTypes.value) this.getDropdownOptions("pffTypes", 0);
        if (this.state.params.createdBy.value !== prevState.params.createdBy.value) this.getDropdownOptions("createdBy", 0);
        if (this.state.params.createdAt.value !== prevState.params.createdAt.value) this.getDropdownOptions("createdAt", 0);
        if (this.state.params.updatedBy.value !== prevState.params.updatedBy.value) this.getDropdownOptions("updatedBy", 0);
        if (this.state.params.updatedAt.value !== prevState.params.updatedAt.value) this.getDropdownOptions("updatedAt", 0);

        if (this.state.params.wall_sizeId.value !== prevState.params.wall_sizeId.value) this.getDropdownOptions("wall_sizeId", 0);
        if (this.state.params.wall_idt.value !== prevState.params.wall_idt.value) this.getDropdownOptions("wall_idt", 0);
        if (this.state.params.wall_sch.value !== prevState.params.wall_sch.value) this.getDropdownOptions("wall_sch", 0);
        if (this.state.params.wall_schS.value !== prevState.params.wall_schS.value) this.getDropdownOptions("wall_schS", 0);
        if (this.state.params.wall_tags.value !== prevState.params.wall_tags.value) this.getDropdownOptions("wall_tags", 0);
        if (this.state.params.wall_pffTypes.value !== prevState.params.wall_pffTypes.value) this.getDropdownOptions("wall_pffTypes", 0);

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
                wall_sizeId: { value: "", placeholder: "sizeId (in mm)", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_mm: { value: "", placeholder: "mm", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_inch: { value: "", placeholder: "inch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_idt: { value: "", placeholder: "idt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_sch: { value: "", placeholder: "sch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_schS: { value: "", placeholder: "schS", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_lunar: { value: "", placeholder: "vLunar", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                wall_tags: { value: "", placeholder: "Tags", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
                wall_pffTypes: { value: "", placeholder: "PFF Types", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
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
                            sizeId: params.sizeId.selection._id,
                            mm: params.mm.selection._id,
                            inch: params.inch.selection._id,
                            idt: params.idt.selection._id,
                            sch: params.sch.selection._id,
                            schS: params.schS.selection._id,
                            lunar: params.lunar.selection._id,
                            tags: params.tags.selection._id,
                            pffTypes: params.pffTypes.selection._id,
                            createdBy: params.createdBy.selection._id,
                            createdAt: params.createdAt.selection._id,
                            updatedBy: params.updatedBy.selection._id,
                            updatedAt: params.updatedAt.selection._id
                        },
                        nextPage: nextPage,
                        pageSize: paginate.pageSize
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/walls/getAll`, requestOptions)
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
                        sizeId: params.wall_sizeId.selection._id,
                        mm: params.wall_mm.selection._id,
                        inch: params.wall_inch.selection._id,
                        idt: params.wall_idt.selection._id,
                        sch: params.wall_sch.selection._id,
                        schS: params.wall_schS.selectionArray,
                        lunar: params.wall_lunar.selectionArray,
                        tags: params.wall_tags.selectionArray,
                        pffTypes: params.wall_pffTypes.selectionArray,
                    })
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/walls/${!!this.state._id ? this.state._id : ""}`, requestOptions)
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
                                    wall_sizeId: { value: "", placeholder: "sizeId (in mm)", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_mm: { value: "", placeholder: "mm", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_inch: { value: "", placeholder: "inch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_idt: { value: "", placeholder: "idt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_sch: { value: "", placeholder: "sch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_schS: { value: "", placeholder: "schS", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_lunar: { value: "", placeholder: "vLunar", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_tags: { value: "", placeholder: "Tags", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
                                    wall_pffTypes: { value: "", placeholder: "PFF Types", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
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
                return fetch(`${process.env.REACT_APP_API_URI}/server/walls/${_id}`, requestOptions)
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
                                    wall_sizeId: { value: "", placeholder: "sizeId (in mm)", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_mm: { value: "", placeholder: "mm", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_inch: { value: "", placeholder: "inch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_idt: { value: "", placeholder: "idt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_sch: { value: "", placeholder: "sch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_schS: { value: "", placeholder: "schS", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_lunar: { value: "", placeholder: "vLunar", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                                    wall_tags: { value: "", placeholder: "Tags", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
                                    wall_pffTypes: { value: "", placeholder: "PFF Types", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
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
        const { currentUser } = this.state;
        if (!!currentUser.isAdmin) {
            this.setState({
                _id,
                params: {
                    ...this.state.params,
                    wall_sizeId: { value: "", placeholder: "sizeId (in mm)", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                    wall_mm: { value: "", placeholder: "mm", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                    wall_inch: { value: "", placeholder: "inch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                    wall_idt: { value: "", placeholder: "idt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                    wall_sch: { value: "", placeholder: "sch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                    wall_schS: { value: "", placeholder: "schS", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                    wall_lunar: { value: "", placeholder: "vLunar", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                    wall_tags: { value: "", placeholder: "Tags", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
                    wall_pffTypes: { value: "", placeholder: "PFF Types", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [] },
                },
                retrievingElement: true,
                showSubmit: true
            }, () => {
                const requestOptions = {
                    method: "GET",
                    headers: { ...authHeader(), "Content-Type": "application/json" },
                };
                return fetch(`${process.env.REACT_APP_API_URI}/server/walls/${_id}`, requestOptions)
                .then(response => response.text().then(text => {
                    const data = text && JSON.parse(text);
                    const resMsg = (data && data.message) || response.statusText;
                    if (response.status === 401) {
                        localStorage.removeItem("user");
                        window.location.reload(true);
                    } else if (response.status !== 200) {
                        this.setState({
                            alert: {
                                type: "alert-danger",
                                message: resMsg,
                                retrievingElement: false
                            }
                        });
                    } else {
                        this.setState({
                            params: {
                                ...this.state.params,
                                wall_sizeId: { value: "", placeholder: "sizeId (in mm)", selection: { _id: data.doc.sizeId || "", name: !!data.doc.sizeId ? `${data.doc.sizeId} mm` : "" }, options: [], hover: "", page: 0 },
                                wall_mm: { value: data.doc.mm || "", placeholder: "mm", selection: { _id: data.doc.mm || "", name: data.doc.mm || "" }, options: [], hover: "", page: 0 },
                                wall_inch: { value: data.doc.inch || "", placeholder: "inch", selection: { _id: data.doc.inch || "", name: data.doc.inch || ""}, options: [], hover: "", page: 0 },
                                wall_idt: { value: "", placeholder: "idt", selection: { _id: data.doc.idt || "", name: data.doc.idt || ""}, options: [], hover: "", page: 0 },
                                wall_sch: { value: "", placeholder: "sch", selection: { _id: data.doc.sch || "", name: data.doc.sch || ""}, options: [], hover: "", page: 0 },
                                wall_schS: { value: "", placeholder: "schS", selection: { _id: data.doc.schS || "", name: data.doc.schS || ""}, options: [], hover: "", page: 0 },
                                wall_lunar: { value: data.doc.lunar, placeholder: "vLunar", selection: { _id: data.doc.lunar, name: data.doc.lunar}, options: [], hover: "", page: 0 },
                                wall_tags: { value: "", placeholder: "Tags", selection: { _id: "", tags: ""}, options: [], hover: "", page: 0, selectionArray: [...data.doc.tags] },
                                wall_pffTypes: { value: "", placeholder: "PFF Types", selection: { _id: "", name: ""}, options: [], hover: "", page: 0, selectionArray: [...data.doc.pffTypes] },
                            },
                            retrievingElement: false,
                        });
                    }
                }))
                .catch( (err) => {
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
                        <TableData colIndex="1" value={element.sizeId} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="2" value={element.mm} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="3" value={element.inch} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="4" value={element.idt} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="5" value={element.sch} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="6" value={element.schS} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="7" value={element.createdBy} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="8" value={element.createdAt} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="9" value={element.updatedBy} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
                        <TableData colIndex="10" value={element.updatedAt} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={element._id} />
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
                sizeId: { value: "", placeholder: "sizeId", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                mm: { value: "", placeholder: "mm", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                inch: { value: "", placeholder: "inch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                idt: { value: "", placeholder: "idt", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                sch: { value: "", placeholder: "sch", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                schS: { value: "", placeholder: "schS", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                lunar: { value: "", placeholder: "vLunar", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                tags: { value: "", placeholder: "Tags", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                pffTypes: { value: "", placeholder: "PFF Types", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdBy: { value: "", placeholder: "Created By", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                createdAt: { value: "", placeholder: "Created At", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                updatedBy: { value: "", placeholder: "Updated By", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
                updatedAt: { value: "", placeholder: "Updated At", selection: { _id: "", name: ""}, options: [], hover: "", page: 0 },
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
                        sizeId: this.state.params.sizeId.selection._id,
                        mm: this.state.params.mm.selection._id,
                        inch: this.state.params.inch.selection._id,
                        idt: this.state.params.idt.selection._id,
                        sch: this.state.params.sch.selection._id,
                        schS: this.state.params.schS.selection._id,
                        lunar: this.state.params.lunar.selection._id,
                        tags: this.state.params.tags.selection._id,
                        pffTypes: this.state.params.pffTypes.selection._id,
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
            return fetch(`${process.env.REACT_APP_API_URI}/server/walls/getDrop/${key}`, requestOptions)
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
            .catch( (err) => {
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

    addTag(event, name, selectionId) {
        event.preventDefault();
        if (!!selectionId && !this.state.params[name].selectionArray.includes(selectionId)) {
            this.setState({
                params: {
                    ...this.state.params,
                    [name]: {
                        ...this.state.params[name],
                        selectionArray: [...this.state.params[name].selectionArray, selectionId],
                        value: "",
                        selection: {
                            _id: "",
                            name: ""
                        }
                    }
                }
            });
        }
    }

    removeTag(event, name, tagId) {
        event.preventDefault();
        if (!!tagId) {
            this.setState({
                params: {
                    ...this.state.params,
                    [name]: {
                        ...this.state.params[name],
                        selectionArray: arrayRemove(this.state.params[name].selectionArray, tagId)
                    }
                }
            });
        }
    }

    render() {
        const { collapsed, toggleCollapse } = this.props;
        const { alert, menuItem, currentUser, sort, showSearch, showSubmit, deleting, upserting, settingsColWidth, selectAllRows } = this.state;
        const { params, focused, retrievingElement } = this.state;
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
                        <button title="Create Wall" className="btn btn-sm btn-gray" onClick={this.toggleModalSubmit} disabled={!currentUser.isAdmin ? true : false}> {/* style={{height: "34px"}} */}
                            <span><FontAwesomeIcon icon="plus" className="fa mr-2" />Create Wall</span>
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
                                                title="sizeId"
                                                name="sizeId"
                                                // width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="1"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="mm"
                                                name="mm"
                                                // width="80px"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="2"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="inch"
                                                name="inch"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="3"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="idt"
                                                name="idt"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="4"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="sch"
                                                name="sch"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="5"
                                                colDoubleClick={this.colDoubleClick}
                                                setColWidth={this.setColWidth}
                                                settingsColWidth={settingsColWidth}
                                            />
                                            <TableHeader
                                                type="text"
                                                title="schS"
                                                name="schS"
                                                sort={sort}
                                                toggleSort={this.toggleSort}
                                                index="6"
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
                                                index="7"
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
                                                index="8"
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
                                                index="9"
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
                                                index="10"
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
                                    <div className="row row-cols-1 row-cols-md-2">
                                        <ParamSelect
                                            key="0"
                                            name="sizeId"
                                            isFocused={params.sizeId.isFocused}
                                            focused={focused}
                                            value={params.sizeId.value}
                                            placeholder={params.sizeId.placeholder}
                                            selection={params.sizeId.selection}
                                            options={params.sizeId.options}
                                            hover={this.state.params.sizeId.hover}
                                            page={params.sizeId.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="1"
                                            name="mm"
                                            isFocused={params.mm.isFocused}
                                            focused={focused}
                                            value={params.mm.value}
                                            placeholder={params.mm.placeholder}
                                            selection={params.mm.selection}
                                            options={params.mm.options}
                                            hover={this.state.params.mm.hover}
                                            page={params.mm.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="2"
                                            name="inch"
                                            isFocused={params.inch.isFocused}
                                            focused={focused}
                                            value={params.inch.value}
                                            placeholder={params.inch.placeholder}
                                            selection={params.inch.selection}
                                            options={params.inch.options}
                                            hover={this.state.params.inch.hover}
                                            page={params.inch.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="3"
                                            name="idt"
                                            isFocused={params.idt.isFocused}
                                            focused={focused}
                                            value={params.idt.value}
                                            placeholder={params.idt.placeholder}
                                            selection={params.idt.selection}
                                            options={params.idt.options}
                                            hover={this.state.params.idt.hover}
                                            page={params.idt.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="4"
                                            name="sch"
                                            isFocused={params.sch.isFocused}
                                            focused={focused}
                                            value={params.sch.value}
                                            placeholder={params.sch.placeholder}
                                            selection={params.sch.selection}
                                            options={params.sch.options}
                                            hover={this.state.params.sch.hover}
                                            page={params.sch.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="5"
                                            name="schS"
                                            isFocused={params.schS.isFocused}
                                            focused={focused}
                                            value={params.schS.value}
                                            placeholder={params.schS.placeholder}
                                            selection={params.schS.selection}
                                            options={params.schS.options}
                                            hover={this.state.params.schS.hover}
                                            page={params.schS.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="6"
                                            name="lunar"
                                            isFocused={params.lunar.isFocused}
                                            focused={focused}
                                            value={params.lunar.value}
                                            placeholder={params.lunar.placeholder}
                                            selection={params.lunar.selection}
                                            options={params.lunar.options}
                                            hover={this.state.params.lunar.hover}
                                            page={params.lunar.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="7"
                                            name="tags"
                                            isFocused={params.tags.isFocused}
                                            focused={focused}
                                            value={params.tags.value}
                                            placeholder={params.tags.placeholder}
                                            selection={params.tags.selection}
                                            options={params.tags.options}
                                            hover={this.state.params.tags.hover}
                                            page={params.tags.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="8"
                                            name="pffTypes"
                                            isFocused={params.pffTypes.isFocused}
                                            focused={focused}
                                            value={params.pffTypes.value}
                                            placeholder={params.pffTypes.placeholder}
                                            selection={params.pffTypes.selection}
                                            options={params.pffTypes.options}
                                            hover={this.state.params.pffTypes.hover}
                                            page={params.pffTypes.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
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
                                        <ParamSelect
                                            key="9"
                                            name="createdBy"
                                            isFocused={params.createdBy.isFocused}
                                            focused={focused}
                                            value={params.createdBy.value}
                                            placeholder={params.createdBy.placeholder}
                                            selection={params.createdBy.selection}
                                            options={params.createdBy.options}
                                            hover={this.state.params.createdBy.hover}
                                            page={params.createdBy.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="10"
                                            name="createdAt"
                                            isFocused={params.createdAt.isFocused}
                                            focused={focused}
                                            value={params.createdAt.value}
                                            placeholder={params.createdAt.placeholder}
                                            selection={params.createdAt.selection}
                                            options={params.createdAt.options}
                                            hover={this.state.params.createdAt.hover}
                                            page={params.createdAt.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="11"
                                            name="updatedBy"
                                            isFocused={params.updatedBy.isFocused}
                                            focused={focused}
                                            value={params.updatedBy.value}
                                            placeholder={params.updatedBy.placeholder}
                                            selection={params.updatedBy.selection}
                                            options={params.updatedBy.options}
                                            hover={this.state.params.updatedBy.hover}
                                            page={params.updatedBy.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
                                            toggleDropDown={this.toggleDropDown}
                                        />
                                        <ParamSelect
                                            key="12"
                                            name="updatedAt"
                                            isFocused={params.updatedAt.isFocused}
                                            focused={focused}
                                            value={params.updatedAt.value}
                                            placeholder={params.updatedAt.placeholder}
                                            selection={params.updatedAt.selection}
                                            options={params.updatedAt.options}
                                            hover={this.state.params.updatedAt.hover}
                                            page={params.updatedAt.page}
                                            onChange={this.handleChange}
                                            handleNext={this.handleNext}
                                            handleSelect={this.handleSelect}
                                            onFocus={this.onFocus}
                                            onHover={this.onHover}
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
                        show={showSubmit}
                        hideModal={this.toggleModalSubmit}
                        title="Size"
                        size="modal-lg"
                    >
                        <div className="modal-body">
                            {!this.state.retrievingElement ?
                                (
                                    <div className="modal-body-content">
                                        <section id="singles" className="drop-section">
                                            <div className="modal-body-content-section-title-container">
                                                <div className="modal-body-content-section-title-row">
                                                    <div className="modal-body-content-section-title">
                                                        Fields
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row row-cols-1 row-cols-md-2">
                                                <ParamSelect
                                                    key="0"
                                                    name="wall_sizeId"
                                                    isFocused={params.wall_sizeId.isFocused}
                                                    focused={focused}
                                                    value={params.wall_sizeId.value}
                                                    placeholder={params.wall_sizeId.placeholder}
                                                    selection={params.wall_sizeId.selection}
                                                    options={params.wall_sizeId.options}
                                                    hover={this.state.params.wall_sizeId.hover}
                                                    page={params.wall_sizeId.page}
                                                    onChange={this.handleChange}
                                                    handleNext={this.handleNext}
                                                    handleSelect={this.handleSelect}
                                                    onFocus={this.onFocus}
                                                    onHover={this.onHover}
                                                    toggleDropDown={this.toggleDropDown}
                                                />
                                                <ParamInput
                                                    key="1"
                                                    name="wall_mm"
                                                    focused={focused}
                                                    value={params.wall_mm.selection.name}
                                                    placeholder={params.wall_mm.placeholder}
                                                    onChange={this.handleChangeInput}
                                                    onFocus={this.onFocus}
                                                    handleClearValue={this.handleClearValue}
                                                />
                                                <ParamInput
                                                    key="2"
                                                    name="wall_inch"
                                                    focused={focused}
                                                    value={params.wall_inch.selection.name}
                                                    placeholder={params.wall_inch.placeholder}
                                                    onChange={this.handleChangeInput}
                                                    onFocus={this.onFocus}
                                                    handleClearValue={this.handleClearValue}
                                                />
                                                <ParamSelect
                                                    key="3"
                                                    name="wall_idt"
                                                    isFocused={params.wall_idt.isFocused}
                                                    focused={focused}
                                                    value={params.wall_idt.value}
                                                    placeholder={params.wall_idt.placeholder}
                                                    selection={params.wall_idt.selection}
                                                    options={params.wall_idt.options}
                                                    hover={this.state.params.wall_idt.hover}
                                                    page={params.wall_idt.page}
                                                    onChange={this.handleChange}
                                                    handleNext={this.handleNext}
                                                    handleSelect={this.handleSelect}
                                                    onFocus={this.onFocus}
                                                    onHover={this.onHover}
                                                    toggleDropDown={this.toggleDropDown}
                                                />
                                                <ParamSelect
                                                    key="4"
                                                    name="wall_sch"
                                                    isFocused={params.wall_sch.isFocused}
                                                    focused={focused}
                                                    value={params.wall_sch.value}
                                                    placeholder={params.wall_sch.placeholder}
                                                    selection={params.wall_sch.selection}
                                                    options={params.wall_sch.options}
                                                    hover={this.state.params.wall_sch.hover}
                                                    page={params.wall_sch.page}
                                                    onChange={this.handleChange}
                                                    handleNext={this.handleNext}
                                                    handleSelect={this.handleSelect}
                                                    onFocus={this.onFocus}
                                                    onHover={this.onHover}
                                                    toggleDropDown={this.toggleDropDown}
                                                />
                                                <ParamSelect
                                                    key="5"
                                                    name="wall_schS"
                                                    isFocused={params.wall_schS.isFocused}
                                                    focused={focused}
                                                    value={params.wall_schS.value}
                                                    placeholder={params.wall_schS.placeholder}
                                                    selection={params.wall_schS.selection}
                                                    options={params.wall_schS.options}
                                                    hover={this.state.params.wall_schS.hover}
                                                    page={params.wall_schS.page}
                                                    onChange={this.handleChange}
                                                    handleNext={this.handleNext}
                                                    handleSelect={this.handleSelect}
                                                    onFocus={this.onFocus}
                                                    onHover={this.onHover}
                                                    toggleDropDown={this.toggleDropDown}
                                                />
                                                <ParamInput
                                                    key="6"
                                                    name="wall_lunar"
                                                    focused={focused}
                                                    value={params.wall_lunar.selection.name}
                                                    placeholder={params.wall_lunar.placeholder}
                                                    onChange={this.handleChangeInput}
                                                    onFocus={this.onFocus}
                                                    handleClearValue={this.handleClearValue}
                                                />
                                            </div>
                                        </section>
                                        <section id="tags" className="drop-section">
                                            <div className="modal-body-content-section-title-container">
                                                <div className="modal-body-content-section-title-row">
                                                    <div className="modal-body-content-section-title">
                                                        Tags
                                                    </div>
                                                </div>
                                            </div>
                                            <ParamTagInput
                                                key="7"
                                                name="wall_tags"
                                                object={params.wall_tags}
                                                focused={focused}
                                                onChange={this.handleChangeInput}
                                                onFocus={this.onFocus}
                                                addTag={this.addTag}
                                                removeTag={this.removeTag}
                                                handleClearValue={this.handleClearValue}
                                            />
                                        </section>
                                        <section id="pfftypes" className="drop-section">
                                            <div className="modal-body-content-section-title-container">
                                                <div className="modal-body-content-section-title-row">
                                                    <div className="modal-body-content-section-title">
                                                        PFF Types
                                                    </div>
                                                </div>
                                            </div>
                                            <ParamTagSelect
                                                key="8"
                                                name="wall_pffTypes"
                                                object={params.wall_pffTypes}
                                                focused={focused}
                                                onChange={this.handleChange}
                                                handleNext={this.handleNext}
                                                handleSelect={this.handleSelect}
                                                onFocus={this.onFocus}
                                                onHover={this.onHover}
                                                toggleDropDown={this.toggleDropDown}
                                                addTag={this.addTag}
                                                removeTag={this.removeTag}
                                            />
                                        </section>
                                    </div>   
                                )
                                :
                                (
                                    <div className="modal-body-content">
                                        <section id="singles" className="drop-section">
                                            <div className="row row-cols-1">
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                                <div className="col"><div className="form-group drop-form-group"><Skeleton /></div></div>
                                            </div>
                                        </section>
                                    </div>  
                                )
                            }
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
