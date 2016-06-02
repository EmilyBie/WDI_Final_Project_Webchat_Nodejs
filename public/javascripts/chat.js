// client side socket js

jQuery(function($){

  var socket = io.connect();
  var $nickForm = $("#setNick");
  var $nickError = $("#nickError");
  var $nickBox = $("#nickname");
  var $users = $('#users');
  var $messageForm = $("#send-message");
  var $messageBox = $("#message");
  var $chat = $("#chat");

  $nickForm.submit(function(e) {
    e.preventDefault();
    socket.emit('new user', $nickBox.val(), function(data) {
      if (data) {
        $('#nickWrap').hide();
        $("#contentWrap").show();
      } else {
        $nickError.html("That username is already taken, try again!");
      }

    });
    $nickBox.val('');
  });

  $messageForm.submit(function(e){
    e.preventDefault();
    socket.emit('send message', $messageBox.val(), function(data) {
      $chat.append('<span class="error">'+data+'</span><br/>');
    });
    $messageBox.val("");
  });

  socket.on('load old msgs', function(docs) {
    for(var i=docs.length-1; i>= 0; i--) {
      displayMsgs(docs[i]);
    }
  });

  socket.on('new message', function(data) {
    displayMsgs(data);
  });

  function displayMsgs(data) {
    $chat.append("<span class='msg'><b>"+ data.nick+ ": </b>" + data.msg + '</span><br/>');
  }

  socket.on('usernames', function(data) {
    var html = '';
    for(var i=0; i<data.length;i++) {
      html += data[i] +'<br/>';
    }
    $users.html(html);
  });

  socket.on('whisper', function(data) {
    $chat.append("<span class= 'whisper'><b>"+ data.nick+ ": </b>" + data.msg + '</span><br/>');
  });

});