sap.ui.define([
        "sap/ui/model/json/JSONModel",
        "sap/ui/Device",
        "sap/ui/comp/filterbar/FilterBar",
        "sap/ui/comp/filterbar/FilterGroupItem",
        "sap/ui/mdc/FilterField",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/base/util/uid",
        "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
        "sap/m/Button",
        "sap/ui/comp/smartfilterbar/SmartFilterBar",
        "sap/ui/comp/smarttable/SmartTable",
        "sap/ui/core/CustomData",
        "sap/m/FlexItemData",
        "sap/f/DynamicPage",
        "sap/f/DynamicPageHeader",
        "sap/m/Dialog",
        "sap/ui/table/Table",
        "sap/ui/table/Column",
    ],
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     *
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     *
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device,
              FilterBar, FilterGroupItem,
              FilterField, Filter, FilterOperator,
              uid, ValueHelpDialog, Button,
              SmartFilterBar, SmartTable, CustomData,
              FlexItemData, DynamicPage, DynamicPageHeader, Dialog, Table, Column) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            createValueHelp: async function (config) {
                const groupName = uid();
                const filterGroupItems = [];
                const dialogMetadata = {
                    columnDefinition: config.columns,
                    columns: {},
                    filterId2ColId: {}
                }
                for (let colDef of config.columns) {
                    const searchFieldId = groupName + colDef.path;
                    dialogMetadata.columns[colDef.path] = {
                        searchFieldId: searchFieldId,
                        filterValues: [],
                    };
                    dialogMetadata.filterId2ColId[searchFieldId] = colDef.path;
                    const oFilterField = new FilterField({
                        id: searchFieldId,
                        defaultOperator: sap.ui.model.FilterOperator.Contains,
                        change: function (oEvent) {
                            const filterID = oEvent.getSource().getId();
                            const colId = dialogMetadata.filterId2ColId[filterID];
                            dialogMetadata.columns[colId].filterValues = oEvent.getParameter("conditions");
                            console.log(dialogMetadata);
                        }
                    });
                    filterGroupItems.push(new FilterGroupItem({
                        groupName: sap.ui.comp.filterbar.FilterBar.INTERNAL_GROUP,
                        name: colDef.path,
                        label: colDef.label,
                        control: oFilterField
                    }));
                    dialogMetadata.columns[colDef.path].filterField = oFilterField;
                }

                let dialog = new ValueHelpDialog({
                    draggable: false,
                    title: config.title,
                    supportMultiselect: false,
                    supportRanges: false,
                    key: config.keyField, // Specify the key field
                    descriptionKey: config.keyDescField, // Specify the description field
                    filterBar: new FilterBar({
                        isRunningInValueHelpDialog: false,
                        advancedMode: true,
                        filterBarExpanded: true,
                        filterGroupItems: filterGroupItems,
                        search: function (oEvent) {
                            var oBinding = dialog.getTable().getBinding();
                            const filter = [];
                            for (let columnId in dialogMetadata.columns) {
                                let conditions = dialogMetadata.columns[columnId].filterValues;
                                for (let cond of conditions) {
                                    if (!cond.isEmpty) {
                                        filter.push(new sap.ui.model.Filter(columnId,
                                            FilterOperator[cond.operator],
                                            cond.values));
                                    }
                                }
                            }
                            if (filter.length > 0) {
                                oBinding.filter(new sap.ui.model.Filter({
                                    filters: filter,
                                    and: false
                                }));
                            } else {
                                oBinding.filter()
                            }
                        }
                    }), ok: function (oEvent) {
                        var token = oEvent.getParameter("tokens");
                        // console.log(token);
                        if (token.length > 0) {
                            token = token[0];
                            // Handle the selected value
                            var selectedRow = token.data().row;
                            console.log("Selected Row", selectedRow);
                            dialog.close();
                            if (config.ok) {
                                config.ok(selectedRow);
                            }
                            // You can do something with the selected key and description here
                        }
                    }, cancel: function (oEvent) {
                        // Handle the case when the user cancels the dialog
                        // You can add any specific logic or reset values here
                        dialog.close();
                    }.bind(this)
                });

                // Create a JSONModel with sample data for the dialog
                // var oModel = new sap.ui.model.json.JSONModel({
                //     data: [
                //         {yourKeyField: "1", yourDescriptionField: "Value 1"},
                //         {yourKeyField: "2", yourDescriptionField: "Value 2"},
                //         {yourKeyField: "3", yourDescriptionField: "Value 3"}
                //     ]
                // });

                // Create a Table to display the data
                var oTable = await dialog.getTableAsync();

                oTable.setModel(config.model);
                if (oTable.bindRows) {
                    for (let colDef of config.columns) {
                        oTable.addColumn(new sap.ui.table.Column({label: colDef.label, template: colDef.path}));
                    }
                    oTable.bindRows(config.basePath);
                } else {
                    const cells = [];
                    for (let colDef of config.columns) {
                        oTable.addColumn(new sap.m.Column({header: new sap.m.Label({text: colDef.label})}));
                        cells.push(new sap.m.Text({text: `{${colDef.path}}`}));
                    }
                    oTable.bindItems(config.basePath, new sap.m.ColumnListItem({
                        cells: cells
                    }));
                }

                if (config.preFilters) {
                    for (let filter of config.preFilters) {
                        let path = filter.path;
                        const filterField = dialogMetadata.columns[path].filterField;
                        filterField.setConditions([filter]);
                        dialogMetadata.columns[path].filterValues.push(filter);
                        dialog.getFilterBar().fireSearch();
                    }
                }


                dialog.update();
                // dialog.setTable(oTable);
                return dialog;
            },

            createSmartValueHelp: async function (config) {
                const sfbID = uid();
                // Create a SmartFilterBar
                var oSmartFilterBar = new SmartFilterBar({
                    id: sfbID,
                    entitySet: "Customers",
                    requestAtLeastFields: "CustomerID,ContactName",
                    persistencyKey: "SmartFilter_Explored",
                    controlConfiguration: [
                        {
                            key: "CustomerID",
                            visibleInAdvancedArea: true
                        },
                        {
                            key: "ContactName",
                            visibleInAdvancedArea: true
                        }
                    ],
                });
                // oSmartFilterBar.setModel(config.model);

                // Create a SmartTable
                var oSmartTable = new SmartTable({
                    id: "smartTable",
                    entitySet: "Customers",
                    smartFilterId: sfbID,
                    tableType: "Table",
                    enableAutoColumnWidth: true,
                    header: "Customer orders",
                    showRowCount: true,
                    useVariantManagement: true,
                    enableAutoBinding: true,
                    layoutData: new FlexItemData({
                        growFactor: 1,
                    }),
                    // content:[oTable]
                });

                // Create a DynamicPage
                var oDynamicPage = new DynamicPage({
                    id: "dynamicPage",
                    fitContent: true,
                    header: new DynamicPageHeader({
                        content: [oSmartFilterBar],
                        pinnable: true
                    }),
                    content: [oSmartTable]
                });
                // oSmartTable.setModel(config.model)
                oDynamicPage.setModel(config.model)

                let oDialog = new Dialog("myDialog", {
                    title: "Sample Dialog",
                    content: [oDynamicPage],
                    beginButton: new Button({
                        text: "Close",
                        press: function () {
                            oDialog.close();
                        }
                    })
                });

                return oDialog;

            }
        };
    });