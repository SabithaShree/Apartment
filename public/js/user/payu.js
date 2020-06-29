class Payment
{
    registerEvents(payment)
    {
        $(payment).on("click", "#pay-btn", function() {
            var requestData = {
                key: 'YnfV6dAo',
                txnid: '123456789',
                hash: 'defdfaadgerhetiwerer',
                amount: '1',
                firstname: 'Kavin',
                email: 'kavin@dummy.com',
                phone: '6111111111',
                productinfo: 'Bag',
                surl : 'https://google.co.in',
                furl: 'https://photos.google.com',
                mode:'dropout'// non-mandatory for Customized Response Handling
            }
            
            var handler = {
                responseHandler: function(BOLT){
                  // your payment response Code goes here, BOLT is the response object
                  console.log(BOLT);
                },
                catchException: function(BOLT){
                  // the code you use to handle the integration errors goes here
                  console.log(BOLT);
                }
            }
            
            bolt.launch( requestData , handler ); 
        });
    }
}

