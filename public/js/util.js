function showLoading() {
  $("#loading").removeClass("hide");
}

function hideLoading() {
  $("#loading").addClass("hide");
}

function showStatus(msg, callback) {
  var status = $("<div />", {
    "class": "status-bar hide",
    "id": "status-bar"
  });
  $(status).html(msg);
  $("body").prepend(status);
  $(status).slideDown(600, callback);
}

function hideStatus() {
  var status = $("#status-bar");
  $(status).slideUp(600, () => $(status).remove());
}
