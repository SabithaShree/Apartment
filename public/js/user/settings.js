class Settings
{
  registerEvents(settings)
  {
    $(settings).on("click", ".settings-menu", function() {
      $(this).siblings().removeClass("active");
      $(this).addClass("active");

      $(".settings-form").addClass("hide");
      let activeForm = $(this).attr("name");
      $("." + activeForm + "-form").removeClass("hide");
    });


    $(settings).on("click", ".btn-cancel", function() {
      $.ajax({
        url : "/home",
        method : "GET",
        success : function(res, status, xhr) {
          $("#right-pane").html(res);
        }
      });
    });

    $(settings).on("submit", ".updateprofile-form", function(e) {
      e.preventDefault();
      let formData = new FormData(this);
      $.ajax({
        url : "/updateProfile",
        method : "POST",
        data: formData,
        processData: false,
        contentType: false,
        beforeSend : showStatus("Updating..."),
        success : function(res, status, xhr) {
          hideStatus();
          $("#right-pane").html(res);
        }
      });
    });

    $(settings).on("submit", ".updatepassword-form", function(e) {
      e.preventDefault();
      let formData = $(this).serialize();
      $.ajax({
        url : "/updatePassword",
        method : "POST",
        data: formData,
        beforeSend : showStatus("Updating..."),
        success : function(res, status, xhr) {
          hideStatus();
          $("#right-pane").html(res);
        }
      });
    });
  }
}
