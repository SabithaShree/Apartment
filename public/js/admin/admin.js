class AdminHome
{
    registerEvents(admin) 
    {
        $(admin).ready(function() {
            $(".menu-option").removeClass("active");
            let activeMenu = $("#right-pane").attr("name");
            $("li.menu-option." + activeMenu).addClass("active");
        });
        
        $(admin).on("click", "#logout", function() {
            $.post("/logout" , function() {
                window.location.href = "/";
            });
        });

        $(admin).on("click", ".menu-option:not('.logout')", function() {
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

        $(admin).on("click", ".flat", function() {
            let flat = this;
            let popup = $(admin).find("#flatDetails");
            $(popup).modal("show");
            $(popup).find(".modal-title").html($(flat).attr("block") + " - " + $(flat).attr("flat_id"));
            $(popup).find(".pro-photo").attr("src", "/uploads/" + $(flat).attr("photo"));
            let detailArr = $(popup).find(".flat-detail");
            [...detailArr].forEach((detail) => {
                let detailName = $(detail).attr("name");
                let detailVal = $(flat).attr(detailName);
                $(detail).find(".detail-value").text(detailVal);
            });
        });
    }
}

class Complaint
{
    registerEvents(complaint)
    {
        $(complaint).find("#complaint-search").searchBar();
    }
}

class Association
{
    registerEvents(association)
    {
        let flats = null;

        $(association).on("click", "#edit-association", function() {
            let members = $(association).find("#association-members-container");
            let form = $(association).find("#association-form-container");

            let inputs = $(form).find("input.search-member:not('.multi-input')");
            [...inputs].forEach((input) => {
                let category = $(input).attr("name");
                let member = $(members).find("div[name=" + category + "]");
                $(input).val($(member).find(".member-name").html()).attr("id", $(member).attr("id"));
            });

            let otherMembersIp = $(form).find("#other-members");
            let otherMembers = $(members).find(".other-member");
            [...otherMembers].forEach((otherMember) => {
                let span = $("<span />")
                            .attr("class", "multi-select-option")
                            .text($(otherMember).find(".member-name").html())
                            .attr("id", $(otherMember).attr("id"));
                $(span).append($("<i />").attr("class", "remove-member fa fa-times"));
                $(otherMembersIp).find(".nested-input").before(span);
            });


            $(members).addClass("hide");
            $(form).removeClass("hide");
        });


        $(association).on("focus", ".search-member", function() {
            if(flats == null) {
                $.ajax({
                    url : "/getFlats",
                    method : "GET",
                    success : function(res, status, xhr) {
                      flats = res;
                    }
                });
            }
        });

        $(association).on("keyup", ".search-member", function() {
            let searchInput = this;
            let searchVal = $(searchInput).val();
            if(searchVal != "") {
                let matchingCases = [...flats].filter((flat) => {
                    return flat.name.toLowerCase().includes(searchVal.toLowerCase());
                });

                let multi = $(this).hasClass("multi-input");
                $(searchInput).dropdown(matchingCases, multi);
            }
        });
    
        $(association).on("click", ".remove-member", function() {
            $(this).closest(".multi-select-option").remove();
        });

        $(association).on("submit", "#association-form", function(e) {
            e.preventDefault();
            let data = [];
            let inputs = $(this).find("input.search-member:not('.multi-input')");
            [...inputs].forEach((input) => {
                let obj = {};
                obj.title = $(input).attr("name");
                obj.members = [$(input).attr("id")];
                data.push(obj);
            });

            let otherMembers = $(this).find("#other-members .multi-select-option");
            let other = {};
            other.title = "Other Members";
            other.members = [];
            [...otherMembers].forEach((member) => {
                other.members.push($(member).attr("id"));
            });
            data.push(other);

            $.ajax({
                url : "/updateAssociation",
                method : "POST",
                data : {"association" : data},
                beforeSend : showStatus("Updating.."),
                success : function(res, status, xhr) {
                    $("#right-pane").html(res);
                  hideStatus();
                }
              });
        });

        $(association).on("click", ".btn-cancel", function(e) {
            e.preventDefault();
            $("#left-pane").find("li[name='/admin/association']").trigger("click");
        });

        
    }

}

class Maintanance 
{
    registerEvents(maintanance)
    {
        let date = new Date();
        let currentMonth = date.toLocaleString('default', { month: 'long' });
        let currentYear = date.getFullYear();
        let span = "<span class='caret'></span>";

        // $(maintanance).find(".maintanance-period-select #month").html(currentMonth + span).attr("val", currentMonth);
        // $(maintanance).find(".maintanance-period-select #year").html(currentYear + span).attr("val", currentYear);

        $(maintanance).on("click", ".maintanance-period-select .dropdown-item", function() {

            var selText = $(this).text();
             $(this).parents('.btn-group').find('.dropdown-toggle')
                .html(selText + span)
                .attr("val", selText);

            let month = $(maintanance).find(".maintanance-period-select #month").attr("val");
            let year = $(maintanance).find(".maintanance-period-select #year").attr("val");

            month = (month == "Month") ? currentMonth : month;
            year = (year == "Year") ? currentYear : year;

            $.ajax({
                url : "/admin/maintanance",
                method : "GET",
                data : {"period": month + " " + year},
                beforeSend : showLoading(),
                success : function(res, status, xhr) {
                    $("#right-pane").html(res);
                    $("#right-pane").find(".maintanance-period-select #month").html(month + span).attr("val", currentMonth);
                    $("#right-pane").find(".maintanance-period-select #year").html(year + span).attr("val", currentYear);
                    hideLoading();
                }
              });
        });
    }
}