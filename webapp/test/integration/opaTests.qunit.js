sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/meap/btp/fi/zbtpbpcustomer/test/integration/FirstJourney',
		'com/meap/btp/fi/zbtpbpcustomer/test/integration/pages/CustomerDataList',
		'com/meap/btp/fi/zbtpbpcustomer/test/integration/pages/CustomerDataObjectPage'
    ],
    function(JourneyRunner, opaJourney, CustomerDataList, CustomerDataObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/meap/btp/fi/zbtpbpcustomer') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCustomerDataList: CustomerDataList,
					onTheCustomerDataObjectPage: CustomerDataObjectPage
                }
            },
            opaJourney.run
        );
    }
);