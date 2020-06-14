class Forum
{

  registerForumsEvents(forums)
  {
    let contentsArr = $(".content-short");
    $.each(contentsArr, (index, content) => {
      let croppedContent = $(content).html().split("</p>")[0] + " ...";
      if(croppedContent.length > 70) {
        croppedContent = croppedContent.substr(0, 50) + "...";
      }
      $(content).html(croppedContent);
    });

    $(forums).on("click", "div[name=post]", function() {
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

    $(forums).on("click", "#compose", function() {
      $.ajax({
        url: "/composeForum",
        method: "GET",
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          hideLoading();
          $("#rightpane").html(res);
        }
      });
    });
  }

  registerForumEvents(forum)
  {
    $(forum).on("click", ".like-button", function() {
      let likebutton = this;
      let forum_id = $(forum).attr("forum_id");
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

    $(forum).on("click", ".comment-button", function() {
      $("#new-comment").removeClass("hide");
      $("#new-comment").find(".comment-input").autogrow();
      $("#new-comment").find(".comment-input").focus();
      $("html, body").animate({
        scrollTop: $("#new-comment").offset().top
      }, 1000);
    });

    $(forum).on("click", "#post-comment", function(e) {
      let content = $("#new-comment").find("textarea[name=content]").val();
      let forum_id = $(forum).attr("forum_id");
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

    $(forum).on("click", "#delete-comment", function() {
      let delIcon = this;
      $("#alert-popup").modal("show");
      $("#alert-popup").on("click", ".btn-delete", function() {
        let forum_id = $(forum).attr("forum_id");
        let comment_id = $(delIcon).closest(".comment-body").attr("id");
        $.ajax({
          url: "/deletecomment",
          method: "POST",
          beforeSend: showStatus("Deleting..."),
          data: {
            "forum_id": forum_id,
            "comment_id": comment_id
          },
          success: function(res, status, xhr) {
            hideStatus();
            $("#alert-popup").modal("hide");
            $("body").removeClass("modal-open");
            $(".modal-backdrop").remove();
            $("#rightpane").html(res);
          }
        });
      });
    });

    $(forum).on("click", "#more-options", function() {
      $("#more-options-menu").show();
    });

    $(forum).on("click", "#delete-forum", function(e) {
      e.preventDefault();

      $("#alert-popup").modal("show");
      $("#alert-popup").on("click", ".btn-delete", function() {
        let forum_id = $(forum).attr("forum_id");

        let images = $(".forum-body").find("img").map(function() { return $(this).attr("src"); }).get();

        $.ajax({
          url: "/deleteforum",
          method: "POST",
          beforeSend: showStatus("Deleting..."),
          data: {
            "_id": forum_id,
            "images": images
          },
          success: function(res, status, xhr) {
            $("#alert-popup").modal("hide");
            $("body").removeClass("modal-open");
            $(".modal-backdrop").remove();
            window.history.pushState("Apartment", "StepsStone Ananthaya", "/forums");
            $("#rightpane").html(res);
            hideStatus();
          }
        });
      });
    });

    $(forum).on("click", "#edit-forum", function(e) {
      e.preventDefault();
      let forum_id = $(forum).attr("forum_id");
      let forumHtml = $(".forum-body").html();
      let forumTitle = $(".forum-title").text();
      $.ajax({
        url: "/composeForum",
        method: "GET",
        beforeSend: showLoading(),
        success: function(res, status, xhr) {
          $("#rightpane").html(res);
          var editor = new FroalaEditor("#richtext-editor",{
            imageUploadURL: "/uploadImgForum",
            imageUploadParam: "image"
          },
          function() {
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

  registerEvents(forum) {
    $(forum).on("click", ".btn-cancel", function(e) {
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

    $(forum).on("submit", "#newforum-form", function(e) {
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

    $(forum).on("submit", "#updateforum-form", function(e) {
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

  registerEditorEvents(editor) {
    editor.opts.events["image.removed"] = function ($img) {
      console.log($img);
      $.ajax({
        url: "/deleteForumImg",
        method: "POST",
        data: {
          image: $img.attr("src")
        },
        success: function(res, status, xhr) {
        }
      });
    }
  }
}
