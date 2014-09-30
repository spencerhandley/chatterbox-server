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
          console.log(data)
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
          console.log(JSON.parse(data));
          var parsedData = JSON.parse(data);
          if($("#chats").children().length < 1){
            for(var i =0; i<parsedData.results.length; i++ ){
              var filteredText = parsedData.results[i].text.replace(/[^\w\s]/gi, '');
              var filteredUN = parsedData.results[i].username.replace(/[^\w\s]/gi, '');
              var message = {
                 text : filteredText,
                 username: filteredUN,
                 createdAt: parsedData.results[i].createdAt
              };
              var highlightClass = _.contains(app.currentUser.friends, filteredUN) ? "highlighted" : "hey";
              app.addMessage(message,highlightClass);
              if(moment(parsedData.results[i].createdAt).format("hhmmss") > moment(new Date()).format("hhmmss") - 1){
                app.addMessage(message,highlightClass);
              }
            }
          }
          console.log('chatterbox: Message sent');
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
          for(var i =0; i<data.results.length; i++ ){
            var filteredText = data.results[i].text.replace(/[^\w\s]/gi, '')
            var filteredUN = data.results[i].username.replace(/[^\w\s]/gi, '')
            var highlightClass = _.contains(app.currentUser.friends,filteredUN) ? "highlighted" : "";
            var message = {
              text : filteredText,
              username: filteredUN,
              createdAt: data.results[i].createdAt
            };
            app.addMessage(message,highlightClass);
            if(moment(data.results[i].createdAt).format("hhmmss") > moment(new Date()).format("hhmmss") - 1){
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
      $("#chats").append("<p class='chat "+ highclass +"' data-username='"+msg.username+"'>" + moment(msg.createdAt).format("D/M/YYYY, h:mma") + " " +msg.username + ": " +msg.text +"</p>");
    },
    addRoom: function(index, room){
      $("#rooms").append("<p>" + (index+1) + ": <a class='room "+room+"' href='#' data-name='"+ room +"''>" +room +" </a><p>")
    },
    addFriend: function(user){
      var filteredUN = user.replace(/[^\w\s]/gi, '');
      app.currentUser.friends.push(filteredUN);
    },
    handleSubmit: function(){
      var msg = {text: $("#send #message").val(), username: getQueryVariable("username"), roomname: app.currentRoom }
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
          for(var i = 0; i < data.results.length; i++){
            if(data.results[i].roomname){
              var filteredRoom = data.results[i].roomname.replace(/[^\w\s]/gi, '')
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
        error: function (data) {
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
    console.log($(this).data())
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
    console.log(roomName)
    app.addRoom(0, roomName);
    app.rooms++
    app.currentRoom = roomName;
    $("#chats").html("");
    $(".roomTitle").text(roomName);
  })
  app.pullRooms()
  // setInterval(function() {app.pullRooms()}, 10000)
  // app.fetch()
  setInterval(function(){
    app.fetch()
  }, 1000)
});
