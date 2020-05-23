

let cardPaymentMethod = {
  type: "CARD",
  parameters: {
    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
    allowedCardNetworks: ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"]
  }
};

let clientConfiguration = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [cardPaymentMethod]
};

paymentsClient.isReadyToPay(clientConfiguration)
  .then(function(response) {
    if (response.result) {
      // add a Google Pay payment button
      googlePayButton();
    }
  })
  .catch(function(err) {
    // show error in developer console for debugging
    console.error(err);
  });


function googlePayButton() {
  const gpayButton = paymentsClient.createButton({
    onClick: () => initializePayment,
    buttonColor: "default",
    buttonType: "long"
  });
  $(gpayButton).on("click", "button", initializePayment);
  $(gpayButton).find("button").html("Pay Maintanance");
  document.getElementById("maintanance").appendChild(gpayButton);
}


function initializePayment() {
  // this is our payment_gateway details.
  const tokenizationSpecification = {
    type: "PAYMENT_GATEWAY",
    parameters: {
      "gateway": "example",
      "gatewayMerchantId": "exampleGatewayMerchantId"
    }
  };

  let paymentMethod = Object.assign({
      tokenizationSpecification: tokenizationSpecification
    },
    cardPaymentMethod
  );

  let paymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [paymentMethod]
  };
  paymentDataRequest.transactionInfo = {
    totalPriceStatus: "FINAL",
    totalPrice: "1",
    currencyCode: "INR",
    countryCode: "IN"
  };
  paymentDataRequest.merchantInfo = {
    merchantName: "Example Merchant",
    //https://pay.google.com/business/console/in/info/BCR2DN6TTP3LBZAJ
    //go to the above site to get merchant id
    merchantId: "0123456789"
  };

  paymentsClient.loadPaymentData(paymentDataRequest)
    .then(function(paymentData) {
      // if using gateway tokenization, pass this token without modification
      paymentToken = paymentData.paymentMethodData.tokenizationData.token;
      processPayment(paymentToken);
    })
    .catch(function(err) {
      console.error(err);
    });
}

function processPayment(paymentToken) {
  // this token must to sent to server side and made call to payment gateway using this
  // token as parameter
  console.log(paymentToken);
}
