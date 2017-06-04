const member_rate = 25;
const initial_fee = 100;

var members = 0;
var memberTotal = members * member_rate;
var total = initial_fee + memberTotal;

hashCode = function(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

$(function()
{
    
    $("#members").text(members);
    $("#memberTotal").text("$" + members*25);
    $("#total").text("$" + (100 + (members*25)));
    memberTotal = members * member_rate;
    total = initial_fee + memberTotal;
        
    $(document).on('click', '.btn-add', function(e)
    {

        if(members >= 4) {
            alert("Competitive teams must be 8 members or less.")
        } else {
            e.preventDefault();
            members++;

            $("#members").text(members);
            $("#memberTotal").text("$" + members*25);
            $("#total").text("$" + (100 + (members*25)));
            memberTotal = members * member_rate;
    total = initial_fee + memberTotal;


            var controlForm = $('.controls:first'),
                currentEntry = $(this).parents('.entry:first'),
                newEntry = $(currentEntry.clone()).appendTo('.controls:first');

            newEntry.find('input').val('');
            controlForm.find('.entry:not(:last) .btn-add')
                .removeClass('btn-add').addClass('btn-remove')
                .removeClass('btn-success').addClass('btn-danger')
                .html('<span class="glyphicon glyphicon-minus"></span>');
            
        }
       
    }).on('click', '.btn-remove', function(e)
    {
        if(members <= 0) {
            alert("Competitive teams must have a minimum of 4 players.")
        }else {
            $(this).parents('.entry:first').remove();
            members--;
            $("#members").text(members);
            $("#memberTotal").text("$" + members*25);
            $("#total").text("$" + (100 + (members*25)));
            memberTotal = members * member_rate;
    total = initial_fee + memberTotal;
        }
        

        e.preventDefault();
        return false;
  

        

    });

    $("#player_form").submit( function(eventObj) {
        var hash = hashCode($('#player_form').serialize());
        console.log(hash);

        $(this).append('<input type="hidden" name="hash" value='+hash+'>');

        localStorage.setItem(hash, total);

        e.preventDefault();
        return true;
    });
});
