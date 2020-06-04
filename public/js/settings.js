class Settings
{
  constructor(settingsEle)
  {
    this.settings = settingsEle;
  }

  registerEvents()
  {
    $(this.settings).on("click", ".settings-menu", function() {
      $(this).siblings().removeClass("active");
      $(this).addClass("active");

      $(".settings-form").addClass("hide");
      let activeForm = $(this).attr("name");
      $("." + activeForm + "-form").removeClass("hide");
    });


    $(this.settings).on("click", ".btn-cancel", function() {
      $.ajax({
        url : "/home",
        method : "GET",
        success : function(res, status, xhr) {
          $("#rightpane").html(res);
        }
      });
    });

    $(this.settings).on("submit", ".updateprofile-form", function(e) {
      e.preventDefault();
      let formData = $(this).serialize();
      $.ajax({
        url : "/updateProfile",
        method : "POST",
        data: formData,
        beforeSend : showStatus("Updating..."),
        success : function(res, status, xhr) {
          hideStatus();
          $("#rightpane").html(res);
        }
      });
    });

    $(this.settings).on("submit", ".updatepassword-form", function(e) {
      e.preventDefault();
      let formData = $(this).serialize();
      $.ajax({
        url : "/updatePassword",
        method : "POST",
        data: formData,
        beforeSend : showStatus("Updating..."),
        success : function(res, status, xhr) {
          hideStatus();
          $("#rightpane").html(res);
        }
      });
    });
  }
}
