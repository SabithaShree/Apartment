class Forum
{
    constructor(forumEle)
    {
      this.forum = forumEle;
    }

    registerForumsEvents()
    {
      $(this.forum).on("click", "div[name=post]", function() {
        $.ajax({
          url: "/forum/" + $(this).attr("forum_id"),
          method: "GET",
          beforeSend: showLoading(),
          success: function(res, status, xhr) {
            hideLoading();
            $("#rightpane").html(res);
            $("#rightpane").append(loadingHtml());
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
            $("#rightpane").append(loadingHtml());
          }
        });
      });
    }

    registerForumEvents()
    {
      $(this.forum).on("click", ".like-button", function() {
        var hidden = $(this).find("i.hide");
        var shown =  $(this).find("i:not('.hide')");
        $(hidden).removeClass("hide");
        $(shown).addClass("hide");
      });
    }
}

class Compose
{
  constructor(newforum)
  {
    this.forum = newforum;
  }

  registerEvents()
  {
    $(this.forum).on("click", ".btn-cancel", function() {
      $.ajax({
        url : "/forums",
        method : "GET",
        beforeSend : showLoading(),
        success : function(res, status, xhr) {
          hideLoading();
          $("#rightpane").html(res);
          $("#rightpane").append(loadingHtml());
        }
      });
    })
  }
}
