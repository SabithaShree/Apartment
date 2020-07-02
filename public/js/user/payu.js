class Payment
{
    registerEvents(payment)
    {
        $(payment).on("click", ".dropdown-menu .dropdown-item", function() {
          var selText = $(this).text();
          $(this).parents('.btn-group').find('.dropdown-toggle')
            .html(selText+' <span class="caret"></span>')
            .attr("val", selText);
        });

        $(payment).on("submit", "#payment-form", function(e) {
            e.preventDefault();
            let formData = {
                period: $(payment).find("#month").attr("val") + " " + $(payment).find("#year").attr("val"),
                amount: $(payment).find("input[name=amount]").val() 
            };
            $.ajax({
                url : "/initiatePayment",
                method : "POST",
                data: formData,
                beforeSend : showStatus("Initiating Payment..."),
                success : function(res, status, xhr) {
                    hideStatus();

                    var handler = {
                        responseHandler: function(BOLT){
                        },
                        catchException: function(BOLT){
                        }
                    }
                    bolt.launch( res , handler ); 
                }
              });
        })
    }
}

