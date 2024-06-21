const requestOptions = {
  method: "GET",
  redirect: "follow"
};

fetch("https://zbtp-po-process-srv-uat.cfapps.ap10.hana.ondemand.com/service/zbtp_po_process/approvedRelasePO()?PONumber=5180152187&PORequestNumber=P240000077", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));


