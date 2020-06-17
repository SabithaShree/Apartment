// $("#toggler-menu").on("click", function() {
//   $("body").addClass("modal-open");
//   $("#freeze").removeClass("hide");
//   $("#slider-menu").show("slide", {"direction" : "right"}, 500);
// });

// $("#freeze").on("click", function() {
//   $("body").removeClass("modal-open");
//   $("#freeze").addClass("hide");
//   $("#slider-menu").hide("slide", {"direction" : "right"}, 500);
// });

class Home
{
  registerLeftPaneEvents(leftpane)
  {

    $(leftpane).ready(function() {
      $(".menu-option").removeClass("active");
      let activeMenu = $("#right-pane").attr("name");
      $("li.menu-option." + activeMenu).addClass("active");
    });

    $(leftpane).on("click", ".menu-option:not('.logout')", function() {
      $(this).siblings().removeClass("active");
      $(this).addClass("active");

      let requrl = $(this).attr("name");
      $.ajax({
        url : requrl,
        method : "GET",
        beforeSend : showLoading(),
        success : function(res, status, xhr) {
          hideLoading();
          window.history.pushState("Apartment", "StepsStone Ananthaya", requrl);
          $("#right-pane").html(res);
        }
      });
    });

    $(leftpane).on("click", "#logout",  function() {
      $.post("/logout" , function() {
        window.location.href = "/";
      });
    });
  }
}
