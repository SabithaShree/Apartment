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

$.fn.extend({
  dropdown : function(array, multi) { // list is array of objects
    let input = this;
    let dd = $("<div />").attr("class", "drop-down");
    let ul = $("<ul />").attr("class", "drop-down-options");
    if(array.length > 0) {
      array.forEach((element) => {
        let option =  $("<li />").html(element.name);
        for (let [key, value] of Object.entries(element)) {
          $(option).attr(key, value);
        }
        $(ul).append(option);
      });
    }
    else {
      let option =  $("<li />").html("- No matching results found -");
      $(ul).append(option);
    }
    
    $(dd).append(ul);
    $(input).siblings(".drop-down").remove();
    $(input).after(dd);

    if(multi) {
      $(dd).on("click", "li", function() {
        if($(this).html() != "- No matching results found -") {
          let span = $("<span />")
            .attr("class", "multi-select-option")
            .attr("text", $(this).html())
            .attr("id", $(this).attr("flat_id"))
            .html($(this).html());
          $(span).append("<i class='remove-member fa fa-times'></i>");
          $(this).closest(".nested-input").before(span);
          $(dd).remove();
          $(input).val("");
        }
      });
    } 
    else{
      // drop down events
      $(dd).on("click", "li", function() {
        if($(this).html() != "- No matching results found -") {
          $(input).val($(this).html());
          $(input).attr("id", $(this).attr("flat_id"));
          $(dd).remove();
        }
      });
    }
    

    $("body").on("click", ":not('.drop-down-options')", function() {
      $(dd).remove();
      // $(input).val("");
    })

  }
});

$.expr[":"].icontains = $.expr.createPseudo(function (arg) {   // insensitive dom search for particular text                                                                                                                                                             
  return function (elem) {                                                            
      return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;        
  };                                                                                  
});

$.fn.extend({
  searchBar: function() {
    let searchbar = this;
    $(searchbar).on("keyup", "input[name=searchInput]", function() {
      let searchVal = $(this).val();
      let container = $(searchbar).attr("parent");
      let searchTarget = $(searchbar).attr("target");
      let filteredElements = $(container).find(searchTarget + ":not(:icontains('" + searchVal + "'))");
      $(container).find(searchTarget).removeClass("hide");
      $(filteredElements).addClass("hide");
    });
  }
});

