function loadingHtml() {
  var loadingDiv = $("<div/>", {
    class: "loading-screen hide",
    id: "loading"
  });
  return loadingDiv;
}

function showLoading() {
  $("#loading").removeClass("hide");
}

function hideLoading() {
  $("#loading").addClass("hide");
}
