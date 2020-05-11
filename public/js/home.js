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
  $(this).siblings().removeClass("active");
  $(this).addClass("active");

  let requrl = $(this).attr("redirect");
  $.ajax({
    url : requrl,
    method : "GET",
    beforeSend : showLoading(),
    success : function(res, status, xhr) {
      $("#rightpane").html(res);
      $("#rightpane").append(loadingHtml());
    }
  });
});

$("#logout").on("click", function() {
  $.post("/logout" , function() {
    window.location.href = "/";
  });
});
