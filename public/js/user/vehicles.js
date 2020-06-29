class Vehicle 
{
    registerEvents(vehicle)
    {
        $(vehicle).on("submit", ".vehicles-search-form", function(e) {
            var formData = $(this).serialize();
            e.preventDefault();
            $.ajax({
                url: "/searchVehicle",
                method: "GET",
                data: formData,
                beforeSend: showLoading(),
                success: function(res, status, xhr) {
                  let resContainer = $(vehicle).find("#vehicle-search-result");
                  if(res != null && res !=""){
                    $(resContainer).find("#vehicle-owner").attr("src", "/uploads/" + res.photo);
                    $(resContainer).find("#vehicle-owner-name").html(res.name);
                    $(resContainer).find("#vehicle-owner-phone").html(res.phone);
                    $(resContainer).find("#no-results").addClass("hide");
                    $(resContainer).find("#search-result").removeClass("hide");
                  }
                  else{
                    $(resContainer).find("#search-result").addClass("hide");
                    $(resContainer).find("#no-results").removeClass("hide");
                  }
                  $("html, body").animate({
                    scrollTop: $(resContainer).offset().top
                  }, 500);
                  hideLoading();
                }
              });
        });

        $(vehicle).on("click", ".btn-cancel", function(e) {
            e.preventDefault();
            $("#left-pane").find("li[name='/vehicles']").trigger("click");
          });
    }
}
