class Forum {
  constructor(forumEle) {
    this.forum = forumEle;
  }

  registerForumsEvents() {
    $(this.forum).on("click", "div[name=post]", function() {
      let reqUrl = "/forum/" + $(this).attr("forum_id");
      $.ajax({
        url: "/forum/" + $(this).attr("forum_id"),
        method: "GET",
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          hideLoading();
          window.history.pushState("Apartment", "StepsStone Ananthaya", reqUrl);
          $("#rightpane").html(res);
          window.scrollTo(0, 0);
        }
      });
    });

    $(this.forum).on("click", "#compose", function() {
      $.ajax({
        url: "/forum/compose",
        method: "GET",
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          hideLoading();
          $("#rightpane").html(res);
        }
      });
    });
  }

  registerForumEvents() {
    $(this.forum).on("click", ".like-button", function() {
      let likebutton = this;
      let forum_id = $("#forum-container").attr("forum_id");
      $.ajax({
        url: "/like",
        method: "POST",
        data: {
          "forum_id": forum_id
        },
        success: function(res, status, xhr) {
          var hidden = $(likebutton).find("i.hide");
          var shown = $(likebutton).find("i:not('.hide')");
          $(hidden).removeClass("hide");
          $(shown).addClass("hide");
          $("#rightpane").html(res);
        }
      });
    });

    $(this.forum).on("click", ".comment-button", function() {
      $("#new-comment").removeClass("hide");
      $("#new-comment").autogrow();
      $("html, body").animate({
        scrollTop: $("#new-comment").offset().top
      }, 1000);
    });

    $(this.forum).on("click", "#post-comment", function(e) {
      let content = $("#new-comment").find("textarea[name=content]").val();
      let forum_id = $("#forum-container").attr("forum_id");
      $.ajax({
        url: "/comment",
        method: "POST",
        data: {
          "content": content,
          "forum_id": forum_id
        },
        success: function(res, status, xhr) {
          $("#rightpane").html(res);
        }
      });
    });

    $(this.forum).on("click", "#delete-comment", function() {
      let delIcon = this;
      $("#alert-popup").modal("show");
      $("#alert-popup").on("click", ".btn-delete", function() {
        let forum_id = $("#forum-container").attr("forum_id");
        let comment_id = $(delIcon).closest(".comment-body").attr("id");
        $.ajax({
          url: "/deletecomment",
          method: "POST",
          beforeSend: showStatus("Delelted !"),
          data: {
            "forum_id": forum_id,
            "comment_id": comment_id
          },
          success: function(res, status, xhr) {
            hideStatus();
            $("#alert-popup").modal("hide");
            $("body").removeClass('modal-open');
            $(".modal-backdrop").remove();
            $("#rightpane").html(res);
          }
        });
      });
    });

    $(this.forum).on("click", "#more-options", function() {
      $("#more-options-menu").show();
    });

    $(this.forum).on("click", "#delete-forum", function(e) {
      e.preventDefault();
      let forum_id = $("#forum-container").attr("forum_id");
      $.ajax({
        url: "/forums/delete",
        method: "POST",
        beforeSend: showStatus("Deleting..."),
        data: {
          "_id": forum_id
        },
        success: function(res, status, xhr) {
          $("#rightpane").html(res);
          hideStatus();
        }
      });
    });

    $(this.forum).on("click", "#edit-forum", function(e) {
      e.preventDefault();
      let forum_id = $("#forum-container").attr("forum_id");
      let forumHtml = $(".forum-body").html();
      let forumTitle = $(".forum-title").text();
      $.ajax({
        url: "/forum/compose",
        method: "GET",
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          $("#rightpane").html(res);
          var editor = new FroalaEditor("#richtext-editor", {}, function() {
            $("#newforum-container").find("input[name=title]").val(forumTitle);
            $("#newforum-container").find(".btn-primary").text("Update");
            $("#newforum-container").find("#newforum-form").attr("id", "updateforum-form");
            $("#newforum-container").find("#updateforum-form").attr("forum_id", forum_id);
            editor.html.set(forumHtml);
            hideLoading();
          });
        }
      });
    });
  }
}

class Compose {
  constructor(newforum) {
    this.forum = newforum;
  }

  registerEvents() {
    $(this.forum).on("click", ".btn-cancel", function(e) {
      e.preventDefault();
      $.ajax({
        url: "/forums",
        method: "GET",
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          $("#rightpane").html(res);
          hideLoading();
        }
      });
    });

    $(this.forum).on("submit", "#newforum-form", function(e) {
      e.preventDefault();
      $.ajax({
        url: "/newforum",
        method: "POST",
        data: $("#newforum-form").serialize(),
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          $("#rightpane").html(res);
          hideLoading();
        }
      });
    });

    $(this.forum).on("submit", "#updateforum-form", function(e) {
      e.preventDefault();
      let forum_id = $("#updateforum-form").attr("forum_id");
      $.ajax({
        url: "/updateforum",
        method: "POST",
        data: $("#updateforum-form").serialize() + "&forum_id=" + forum_id,
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          $("#rightpane").html(res);
          hideLoading();
        }
      });
    });
  }
}
