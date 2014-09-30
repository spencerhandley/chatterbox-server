// YOUR CODE HERE:
$(document).ready(function(){

  var app = {
    currentRoom: "lobby",
    rooms: [],
    currentUser: {
      username: "dooode",
      friends: [],
      rooms: []
    },
    init : function(){},
    send: function(message){
      console.log(JSON.stringify(message));
      $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:3000/classes/chatterbox',
        data: JSON.stringify(message),
        contentType: "application/jsonp",
        success: function (data) {
          var filteredText = message.text.replace(/[^\w\s]/gi, '');
          var filteredUN = message.username.replace(/[^\w\s]/gi, '');
          $("#chats").prepend("<p class='chat'>" + moment(data.createdAt).format("D/M/YYYY, h:mma") + " " + filteredUN + ": " + filteredText +"</p>")
          console.log('chatterbox: Message sent');
        },
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message');
        }
      });
    },
    fetch: function(){

      $.ajax({
        // always use this url
        url: 'http://127.0.0.1:3000/classes/chatterbox',
        type: 'GET',
        // data: {
        //   limit: 200,
        //   order: "-createdAt"
        // },
        // data: JSON.stringify(message),
        contentType: 'application/jsonp',
        success: function (data) {
          var parsedData = JSON.parse(data);
          if($("#chats").children().length < 1){
            for(var i =0; i<parsedData.results.length; i++ ){
              var message = {
                 text : parsedData.results[i].text,
                 username: parsedData.results[i].username,
                 createdAt: parsedData.results[i].createdAt
              };
              var highlightClass = _.contains(app.currentUser.friends, parsedData.results[i].username) ? "highlighted" : "hey";
              app.addMessage(message,highlightClass);
              if(moment(parsedData.results[i].createdAt).format("hhmmss") > moment(new Date()).format("hhmmss") - 1){
                app.addMessage(message,highlightClass);
              }
            }
          }
          console.log('chatterbox: Messages fetched');
        },
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to get message');
        }
      });

    },
    fetchRoom: function(roomname){

      $.ajax({
        // always use this url
        url: 'http://127.0.0.1:3000/classes/chatterbox',
        type: 'GET',
        // data: {
        //   limit: 1000,
        //   where: {"roomname": roomname},
        //   order: "-createdAt"
        // },
        // data: JSON.stringify(message),
        contentType: 'application/jsonp',
        success: function (data) {
          var parsedData = JSON.parse(data);
          for(var i =0; i<parsedData.results.length; i++ ){
            var highlightClass = _.contains(app.currentUser.friends, parsedData.results[i].username) ? "highlighted" : "";
            var message = {
              text : parsedData.results[i].text,
              username: parsedData.results[i].username,
              createdAt: parsedData.results[i].createdAt
            };
            app.addMessage(message,highlightClass);
            if(moment(parsedData.results[i].createdAt).format("hhmmss") > moment(new Date()).format("hhmmss") - 1){
              app.addMessage(message,highlightClass);
            }
          }
        },
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message');
        }
      });

    },
    clearMessages : function(){
      $("#chats").children().remove();
    },
    addMessage : function(msg, highclass){
      var $newchat = $('<p>').addClass('chat').addClass(highclass);
      $newchat.data('username', msg.username);
      var formattedTime = moment(msg.createdAt).format("D/M/YYYY, h:mma");
      var msgText = formattedTime + " " +msg.username + ": " +msg.text;
      $newchat.text(msgText);
      $("#chats").append($newchat);
    },
    addRoom: function(index, room){
      $("#rooms").append("<p>" + (index+1) + ": <a class='room "+room+"' href='#' data-name='"+ room +"''>" +room +" </a><p>")
    },
    addFriend: function(user){
      app.currentUser.friends.push(user);
    },
    handleSubmit: function(){
      var msg = {
        text: $("#send #message").val(),
        username: getQueryVariable("username"),
        roomname: app.currentRoom,
        createdAt: new Date()
      };
      app.send(msg);
      $("#send #message").val("");
    },
    pullRooms: function(){
      $.ajax({
        // always use this url
        url: 'http://127.0.0.1:3000/classes/chatterbox',
        type: 'GET',
        // data: {
        //   limit: 1000,
        //   order: "-createdAt"
        // },
        contentType: 'application/jsonp',
        success: function (data) {
          var parsedData = JSON.parse(data);
          for(var i = 0; i < parsedData.results.length; i++){
            if(parsedData.results[i].roomname){
              var filteredRoom = parsedData.results[i].roomname.replace(/[^\w\s]/gi, '')
            }

            if(app.rooms.indexOf(filteredRoom) === -1){
              app.rooms.push(filteredRoom);
            }
          }
          $("#rooms p").html("");
          for(var i = 0; i < app.rooms.length; i++){
            app.addRoom(i, app.rooms[i]);
          }
        },
        error: function (parsedData) {
          console.error('chatterbox: Failed to send message');
        }
      });
    }
  }

  $(".submit").click(function(){
    event.preventDefault();
    app.handleSubmit();

  })
  $(document).on("click", ".chat", function(){
    app.addFriend($(this).data().username)
    $("#chats").html("");
    app.fetchRoom(app.currentRoom)
  });

  $(document).on("click", ".room", function(){
    console.log($(this).data());
    $("#chats").html("");
    $(".roomTitle").text($(this).data().name);
    app.currentRoom = $(this).data().name;
    app.fetchRoom($(this).data().name);
  })

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  }

  $("#addRoom .submitRoom").click(function(){
    event.preventDefault();
    var roomName = $("#roomName").val()
    console.log(roomName);
    app.addRoom(0, roomName);
    app.rooms++
    app.currentRoom = roomName;
    $("#chats").html("");
    $(".roomTitle").text(roomName);
  })
  app.pullRooms()
  setInterval(function() {app.pullRooms()}, 1000)
  app.fetch()
  setInterval(function(){
    app.fetch()
  }, 1000)
});
