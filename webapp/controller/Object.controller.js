sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/cg",
    "../model/formatter",
    "../model/CMPO",
], function (BaseController, JSONModel, History, CG, formatter, CMPO) {
    "use strict";

    return BaseController.extend("testoutcomponent.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.odataModel = this.getOwnerComponent().getModel("oDataModel");
            var CustomerDetailModel = new JSONModel();
            this.getView().setModel(CustomerDetailModel, "CustomerDetailModel");
            var settingsModel = new JSONModel();
            settingsModel.setData({
                isEditable: false
            })
            this.getView().setModel(settingsModel, "settingsModel");

            this.cmpo = new CMPO({
                page: this.oView.byId("ObjectPageLayout"),
                formModel: this.getView().getModel("CustomerDetailModel")
            });

            this.cmpo.addMessage(
                {
                    message: "The value should not exceed 40",
                    type: CMPO.MessageType.Warning,
                    additionalText: "test",
                    description: "The value of the working hours field should not exceed 40 hours.",
                    target: "/ContactName",
                }
            );
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },


        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function (oEvent) {
            // sap.ui.core.BusyIndicator.show();
            this.getView().getModel("CustomerDetailModel").setData(" ");
            var sReqNumbber = oEvent.getParameter("arguments").objectId;

            this.getDetails(sReqNumbber);
        },

        getDetails: function (ReqNumber) {
            var that = this;
            var sUrl = "/Customers" + "(CustomerID='" + ReqNumber + "')";
            this.getView().getModel().read(sUrl, {
                method: "GET", urlParameters: {
                    // "$expand": "CPtoCustBPReqDetails",
                }, success: function (oData, response) {
                    that.setCPReqDetailsToModel(oData);
                }.bind(this), error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                }
            });
            const oModel = this.getView().getModel();
            oModel.getMetaModel().loaded().then(function () {
                that.getView().byId("SF1").bindElement(sUrl);
                that.getView().byId("SF2").bindElement(sUrl);
            });
        },

        setCPReqDetailsToModel: function (oData) {
            var oCPReqDetailsModel = this.getView().getModel("CustomerDetailModel");
            oCPReqDetailsModel.setData(oData);
            // oBPReqDetailsModel.setData(oData.results);
            this.getView().setModel(oCPReqDetailsModel, "CustomerDetailModel");
            sap.ui.core.BusyIndicator.hide();
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView: function (sObjectPath) {
            var oViewModel = this.getModel("objectView");

            this.getView().bindElement({
                path: sObjectPath, events: {
                    change: this._onBindingChange.bind(this), dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    }, dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(), oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(), oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.Zcpbp, sObjectName = oObject.ContactPersonHeaderSet;

            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },

        onEditPress: function (oEvent) {
            const settingsModel = this.getView().getModel("settingsModel");
            settingsModel.setProperty("/isEditable", true);
        },

        onValueHelpRequest: async function (oEvent) {
            var oCPReqDetailsModel = this.getView().getModel("CustomerDetailModel");
            if (!this._valueHelpDialog) {
                this._valueHelpDialog = await CG.createValueHelp({
                    title: "Customer Business Partner",
                    model: this.getView().getModel(),
                    keyField: "CustomerID",
                    keyDescField: "ContactName",
                    basePath: "/Customers",
                    preFilters: [
                        {
                            path: "CustomerID",
                            operator: sap.ui.model.FilterOperator.Contains,
                            values: [
                                "ANT"
                            ]
                        }
                    ],
                    columns: [
                        {
                            label: "Customer Id", path: "CustomerID"
                        },
                        {
                            label: "Contact Name", path: "ContactName"
                        }
                    ],
                    ok: function (selectedRow) {
                        oCPReqDetailsModel.setProperty("/ContactName", selectedRow.ContactName);
                    }
                });
                // this._valueHelpDialog = await CG.createSmartValueHelp({
                //     model: this.getView().getModel(),
                // });
                this.getView().addDependent(this._valueHelpDialog);
            }
            this._valueHelpDialog.open();
        },

        onMessagePopover: function (oEvent) {
            var that = this;

            this.oMP = this.cmpo.createMessageBox();

            this.getView().byId("messagePopoverBtn").addDependent(this.oMP);

            var oButton = oEvent.getSource();
            this.cmpo.open(oButton);
        }
    });

});
