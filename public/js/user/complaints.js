class Complaint
{
  registerEvents(complaint)
  {
    $(complaint).find("#new-complaint-btn").add("#new-complaint").on("click", function() {
      $(complaint).find("#no-complaints").addClass("hide");
      $(complaint).find("#complaints").addClass("hide");
      $(complaint).find("#complaint-form").removeClass("hide");
    });

    $(complaint).find("#complaint-form").off("submit").on("submit", function(e) {

      e.preventDefault();

      let data = $(this).serialize();
      let reqUrl = "/newComplaint";

      if($(this).attr("isUpdate") == "true") {
        data = data + "&complaintId=" + $(this).attr("complaintId");
        reqUrl = "/updateComplaint";
      }

      $.ajax({
        url: reqUrl,
        method: "POST",
        data: data,
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          $("#right-pane").html(res);
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
          $("#right-pane").html(res);
          hideLoading();
        }
      });
    });

    $(complaint).on("click", ".complaint-title", function(e) {
      let complaintId = $(this).closest(".complaint").attr("id");
      $.ajax({
        url: "/editComplaint",
        method: "GET",
        data: {"_id" : complaintId},
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          $(complaint).find("#complaints").addClass("hide");
          let complaintForm = $(complaint).find("#complaint-form");
          $(complaintForm).removeClass("hide");
          $(complaintForm).find(".btn-primary").text("Update");
          $(complaintForm).find("input[name=title]").val(res.title);
          $(complaintForm).find("textarea[name=description]").val(res.description);
          $(complaintForm).attr("complaintId", complaintId);
          $(complaintForm).attr("isUpdate", "true");
          hideLoading();
        }
      });
    });

    $(complaint).on("click", "#delete-complaint", function(){
      
      let complaintId = $(this).closest(".complaint").attr("id");

      $("#alert-popup").modal("show");
      $("#alert-popup").on("click", ".btn-delete", function() {

        $.ajax({
          url: "/deleteComplaint",
          method: "POST",
          data: {"_id" : complaintId},
          beforeSend: showStatus("Deleting..."),
          success: function(res, status, xhr) {
            $("#alert-popup").modal("hide");
            $("body").removeClass("modal-open");
            $(".modal-backdrop").remove();
            hideStatus();
            $("#right-pane").html(res);
            window.history.pushState("Apartment", "StepsStone Ananthaya", "/complaints");
          }
        });
      });
    });
  
  }
}
