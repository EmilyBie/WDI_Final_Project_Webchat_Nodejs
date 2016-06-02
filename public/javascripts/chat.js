// client side socket js

jQuery(function($){

  //group chat
  var socket = io.connect();
  var $nickForm = $("#setNick");
  var $nickError = $("#nickError");
  var $nickBox = $("#nickname");
  var $users = $('#users');
  var $usersList = $('.users-list');
  var $messageForm = $("#send-message");
  var $messageBox = $("#message");
  var $chat = $("#chat");
  var $chatMsgList = $('.chat-msg-list');


  $nickForm.submit(function(e) {
    e.preventDefault();
    socket.emit('new user', $nickBox.val(), function(data) {
      if (data) {
        $('#nickWrap').hide();
        $("#contentWrap").show();
      } else {
        $nickError.html("Nickname is taken, try again!");
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

  $messageBox.keypress(function(e) {
    var code = (e.keyCode? e.keyCode : e.which);
    if (code === 13) {
      $messageForm.trigger('submit');
      return true;
    }
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
    $chatMsgList.append("<li class='msg'><b>"+ data.nick+ ": </b>" + data.msg + '</li><br/>');
  }

  socket.on('usernames', function(data) {
    var html = '';
    for(var i=0; i<data.length;i++) {
      html += '<li class="user-item">'+data[i] +'</li>';
    }
    $usersList.html(html);
  });

  socket.on('whisper', function(data) {
    $chatMsgList.append("<li class= 'whisper'><b>"+ data.nick+ ": </b>" + data.msg + '</li><br/>');
  });

});