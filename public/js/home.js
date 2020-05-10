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

$(".menu-option:not('.logout')").on("click", function() {
  let requrl = $(this).attr("redirect");
  $.ajax({
    url : requrl,
    method : "GET",
    success : function(res, status, xhr) {
      $("#rightpane").html(res);
    }
  });
});

$("#logout").on("click", function() {
  $.post("/logout" , function() {
    window.location.href = "/";
  });
});
