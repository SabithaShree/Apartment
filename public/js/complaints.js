class Complaint
{
  registerEvents(complaint)
  {
    $(complaint).find("#new-complaint").on("click", function() {
      $(complaint).find("#no-complaints").addClass("hide");
      $(complaint).find("#complaint-form").removeClass("hide");
    });

    $(complaint).find("#complaint-form").on("submit", function(e) {
      let data = $(this).serialize();
      e.preventDefault();
      $.ajax({
        url: "/newcomplaint",
        method: "POST",
        data: data,
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          hideLoading();
        }
      });
    });

    $(complaint).on("click", ".btn-cancel", function(e) {
      e.preventDefault();
      $.ajax({
        url: "/complaints",
        method: "GET",
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          $("#rightpane").html(res);
          hideLoading();
        }
      });
    });
  }
}
