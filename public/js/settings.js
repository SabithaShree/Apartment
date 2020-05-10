$(".settings-menu").on("click", function() {
  $(this).siblings().removeClass("active");
  $(this).addClass("active");

  $(".settings-form").addClass("hide");
  let activeForm = $(this).attr("name");
  $("." + activeForm + "-form").removeClass("hide");
});


$(".settings-form").on("click", ".btn-cancel", function() {
  $.ajax({
    url : "/profile",
    method : "GET",
    success : function(res, status, xhr) {
      $("#rightpane").html(res);
    }
  });
});
