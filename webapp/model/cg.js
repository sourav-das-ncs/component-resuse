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
        "sap/ui/table/Column"
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

        ValueHelpDialog.prototype.cgResetFilters = function (filters) {

            for (const column in this.dialogMetadata.columns) {
                this.dialogMetadata.columns[column].filterValues = [];
                const filterField = this.dialogMetadata.columns[column].filterField;
                filterField.setConditions([]);
            }

            this.getFilterBar().fireSearch();
        }

        ValueHelpDialog.prototype.cgAddFilters = function (filters) {

            for (let filter of filters) {
                let path = filter.path;
                this.dialogMetadata.columns[path].filterValues.push(filter);
            }

            for (const column in this.dialogMetadata.columns) {
                const filterField = this.dialogMetadata.columns[column].filterField;
                filterField.setConditions(this.dialogMetadata.columns[column].filterValues);
            }

            this.getFilterBar().fireSearch();
        }

        ValueHelpDialog.prototype.cgSetFilters = function (filters) {

            for (const column in this.dialogMetadata.columns) {
                this.dialogMetadata.columns[column].filterValues = [];
            }

            for (let filter of filters) {
                let path = filter.path;
                this.dialogMetadata.columns[path].filterValues.push(filter);
            }

            for (const column in this.dialogMetadata.columns) {
                const filterField = this.dialogMetadata.columns[column].filterField;
                filterField.setConditions(this.dialogMetadata.columns[column].filterValues);
            }

            this.getFilterBar().fireSearch();
        }

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
                    supportMultiselect: config.multiSelect,
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
                        if (token.length > 0) {
                            if (config.multiSelect) {
                                var selectedRows = token.map(item => item.data().row)
                                console.log("Selected Row", selectedRows);
                                dialog.close();
                                if (config.ok) {
                                    config.ok(selectedRows);
                                }
                            } else {
                                token = token[0];
                                // Handle the selected value
                                var selectedRow = token.data().row;
                                console.log("Selected Row", selectedRow);
                                dialog.close();
                                if (config.ok) {
                                    config.ok(selectedRow);
                                }
                            }
                        }

                        // console.log(token);

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

                dialog.dialogMetadata = dialogMetadata;


                if (config.preFilters) {
                    dialog.cgSetFilters(config.preFilters);
                }


                dialog.update();
                // dialog.setTable(oTable);
                return dialog;
            },

            createMessagePopOver: function (config) {
                this._MessageManager = Core.getMessageManager();
                this._MessageManager.registerObject(this.oView.byId("ObjectPageLayout"), true);

                this.oView.setModel(this._MessageManager.getMessageModel(), "message");


            },

        };
    });