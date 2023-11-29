sap.ui.define([
    'sap/ui/core/Core',
    'sap/ui/core/message/Message',
    'sap/ui/core/library',
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/core/Element',
    "sap/ui/dom/isBehindOtherElement",
    "sap/base/util/uid"
], function (Core, Message, coreLibrary, MessagePopover, MessageItem, Element, isBehindOtherElement, uid) {
    "use strict";

    var MessageType = coreLibrary.MessageType;

    class CMPO {

        static MessageType = coreLibrary.MessageType;

        constructor(config) {
            this.formModel = config.formModel;
            this.page = config.page;
            this._MessageManager = Core.getMessageManager();
            this._MessageManager.registerObject(config.page, true);
            this.messageModel = this._MessageManager.getMessageModel();
            this.messages = {};
        }

        clear() {
            this.messages = {};
            this._MessageManager.removeAllMessages();
        }

        addMessage(config) {
            this.messages[config.target] = config;

            // this._MessageManager.addMessages(message);
            this._MessageManager.addMessages(
                new Message({
                    message: config.message,
                    type: config.type,
                    additionalText: config.additionalText,
                    description: config.description,
                    target: config.target,
                    processor: this.formModel
                })
            )
        }

        getGroupName(target) {
            return this.messages[target].groupName;
        }

        createMessageBox() {
            if (!this.oMP) {
                this.oMP = new MessagePopover({
                    activeTitlePress: function (oEvent) {
                        var oItem = oEvent.getParameter("item"),
                            oMessage = oItem.getBindingContext("message").getObject(),
                            oControl = Element.registry.get(oMessage.getControlId());

                        if (oControl) {
                            $("#" + oControl.getId()).get(0).scrollIntoView({behavior: 'smooth'})
                            // oPage.scrollToElement(oControl.getDomRef().id, 200, [0, -100]);
                            setTimeout(function () {
                                var bIsBehindOtherElement = isBehindOtherElement(oControl.getDomRef());
                                if (bIsBehindOtherElement) {
                                    this.close();
                                }
                                if (oControl.isFocusable()) {
                                    oControl.focus();
                                }
                            }.bind(this), 300);
                        }
                    },
                    items: {
                        path: "message>/",
                        template: new MessageItem(
                            {
                                title: "{message>message}",
                                subtitle: "{message>additionalText}",
                                groupName: {parts: [{path: 'message>target'}], formatter: this.getGroupName.bind(this)},
                                activeTitle: {parts: [{path: 'message>controlIds'}], formatter: () => true},
                                type: "{message>type}",
                                description: "{message>message}"
                            })
                    },
                    groupItems: false
                });
                this.oMP.setModel(this.messageModel, "message");
            }
            return this.oMP;
        }

        buttonTypeFormatter() {
            var sHighestSeverity;
            var aMessages = this._MessageManager.getMessageModel().oData;
            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sHighestSeverity = "Negative";
                        break;
                    case "Warning":
                        sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
                        break;
                    case "Success":
                        sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ?  "Success" : sHighestSeverity;
                        break;
                    default:
                        sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
                        break;
                }
            });

            return sHighestSeverity;
        }

        highestSeverityMessages() {
            var sHighestSeverityIconType = this.buttonTypeFormatter();
            var sHighestSeverityMessageType;

            switch (sHighestSeverityIconType) {
                case "Negative":
                    sHighestSeverityMessageType = "Error";
                    break;
                case "Critical":
                    sHighestSeverityMessageType = "Warning";
                    break;
                case "Success":
                    sHighestSeverityMessageType = "Success";
                    break;
                default:
                    sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                    break;
            }

            return this._MessageManager.getMessageModel().oData.reduce(function(iNumberOfMessages, oMessageItem) {
                return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
            }, 0) || "";
        }

        buttonIconFormatter() {
            var sIcon;
            var aMessages = this._MessageManager.getMessageModel().oData;
            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sIcon = "sap-icon://error";
                        break;
                    case "Warning":
                        sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                        break;
                    case "Success":
                        sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                        break;
                    default:
                        sIcon = !sIcon ? "sap-icon://information" : sIcon;
                        break;
                }
            });

            return sIcon;
        }

        open(parent) {
            this.oMP.openBy(parent);
        }
    }

    return CMPO;

});