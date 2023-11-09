sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        onSubmit: function(oEvent) {
            // MessageToast.show("Custom handler invoked.");
            var appId = 'testoutcomponent';
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);

            let oEventRef = oEvent;
            debugger;
            let sTaskId = '';
            let oWFModel = this._view.getModel("workflowService");
            
            let oBoundContext = oEvent.getBinding().getBoundContext();
            let isExistingReq = oBoundContext.sPath.includes('Edit');
               if(oBoundContext.sPath.includes('modifyExistingCustomer') || oBoundContext.sPath.includes('Edit'))
               {
                oBoundContext = oEvent.getBinding().getBoundContext().getBinding().oReturnValueContext;
               }

            this.editFlow.saveDocument(oBoundContext).then(

                function (resultData) {

                    console.log(resultData);
                    
                    let sPath = oEventRef.getPath().replace(false,true);
                    //get object
                    let oBindContext = this.getModel().bindContext(sPath); 
                    let oReqProm = oBindContext.requestObject(); 
                    
                    var workflowStartPayload = {
                        "definitionId": "ap10.meap-dev-88beeq16.businesspartners.customerBusinessPartner",
                        "context": {
                            "input": {
                                "RequestId": "",
                                "CostCenter": "",
                                "Id":''
                            }
                        }
                    };

                    oReqProm.then(function(oResp){
                        console.log(oResp);
                        debugger;
                        if(isExistingReq){

                            var filter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "READY");

                            oWFModel.read("/TaskCollection", {
                                //filters: [{ path: 'Status', operator: 'EQ', value1: 'RESERVED', and: false },{ path: 'Status', operator: 'EQ', value1: 'READY', and: false }], 
                                filters: [filter], 
                                //sorter : [{ path : 'PriorityNumber'},{ path : 'CreatedOn',descending: true} ],
                                success: function(oRetrievedResult) { 
                                    debugger;
                                    let oTask = oRetrievedResult.results.find(item => item.TaskTitle.includes(oResp.Requestno));
                                    sTaskId = oTask.InstanceID;
                                    var sPath = appModulePath + "/bpmworkflowruntime/public/workflow/rest/v1/task-instances/" + sTaskId;
                                    var oPayload = { "status": "COMPLETED", "decision": "approve" };
                            
                                    new Promise(function (resolve, reject) {
                                        $.ajax({
                                            url: appModulePath + "/bpmworkflowruntime/public/workflow/rest/v1/xsrf-token",
                                            method: "GET",
                                            headers: {
                                                "X-CSRF-Token": "Fetch"
                                            },
                                            success: function (result, xhr, data) {
                                                resolve(data.getResponseHeader("X-CSRF-Token"));
                                            }.bind(this)
                                        });
                                    }.bind(this)).then(
                                        function (sToken) {
                                          
                                            $.ajax({
                                                url: sPath,
                                                type: "PATCH",
                                                data: JSON.stringify(oPayload),
                                                headers: {
                                                    "X-CSRF-Token": sToken,
                                                    "Content-Type": "application/json"
                                                },
                                                async: false,
                                                success: function (result) {
                                                    sap.m.MessageBox.information("Resubmitted successfully", {
                                                        actions: [sap.m.MessageBox.Action.OK],
                                                        emphasizedAction: sap.m.MessageBox.Action.OK,
                                                        onClose: function (sAction) {
                                                            
                                                        }
                                                    });
                                                },
                                                error: function (error) {
                                                    
                                                }
                                            });
                                    
                                    
                        
                                    }.bind(this));
                                },
                                error: function(oError) { /* do something */ }
                                });
                            
                        }else{
                            workflowStartPayload.context.input.RequestId = oResp.Requestno;
                            workflowStartPayload.context.input.CostCenter = oResp.Kostl;
                            workflowStartPayload.context.input.Id = oResp.Rootid;
                
                            new Promise(function (resolve, reject) {
                                $.ajax({
                                    url: appModulePath + "/bpmworkflowruntime/public/workflow/rest/v1/xsrf-token",
                                    method: "GET",
                                    headers: {
                                        "X-CSRF-Token": "Fetch"
                                    },
                                    success: function (result, xhr, data) {
                                        resolve(data.getResponseHeader("X-CSRF-Token"));
                                    }.bind(this)
                                });
                            }.bind(this)).then(
                                function (sToken) {
                            
                            
                                var sPath = appModulePath+"/bpmworkflowruntime/public/workflow/rest/v1/workflow-instances";
                                debugger;
                                // this.callRESTService(sPath, workflowStartPayload, "POST", this.TOKEN, function(){
                                //     sap.m.MessageBox.information("Workflow started with PO Number: "+workflowStartPayload.context.input.RequestId);
                                // });
                
                                $.ajax({
                                    url: sPath,
                                    type: "POST",
                                    data: JSON.stringify(workflowStartPayload),
                                    headers: {
                                        "X-CSRF-Token": sToken,
                                        "Content-Type": "application/json"
                                    },
                                    async: false,
                                    success: function(){
                                            sap.m.MessageBox.information("Customer Business Partner Request created: "+workflowStartPayload.context.input.RequestId);
                                        },
                                    error: function (data) {
                    
                                    }
                                });
                
                            }.bind(this));
                        }
                        
                       
                    });

                    //sap.ui.getCore().getElementById('bp.vendor.vendorbp::bpvendObjectPage--fe::FooterBar::CustomAction::Createtriggerwf').setVisible(false)
                    
                   


                }.bind(this))

                .catch(function (error) {

                    console.log(error);

                });

        }
    };
});
