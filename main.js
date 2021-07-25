$(document).ready(function() {
	$('.menu-toggle').click(function(){
		$('nav').toggleClass('active');
	});
	$("#chats-tab").show();
});

var currentuserId = "";
var currentPage = "chats-tab";

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
   	window.location.href = 'login.html';
  }else {
      currentuserId = user.uid;
      goto(currentuserId);
      checkCall(currentuserId);
  }
});
function user_sign_out() {
  firebase.auth().signOut().then(function() {
    window.location.href = 'index.html';
  }).catch(function(error) {
    makeToast(error.message)
  });
}

function onclickTab(tabName,currentTabLink){
  currentPage = tabName;
  var i;
  var tabcontent=document.getElementsByClassName("tabcontent");
  var tablink=document.getElementsByClassName("tablink");
  for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    for (i = 0; i < tablink.length; i++) {
      tablink[i].classList.remove("active");
    }

  currentTabLink.classList.add("active");
  $("#"+tabName).show();
}

var chat_database,friend_database,friend_request_database,message_database,user_database;
chat_database = firebase.database().ref().child("Chat");
friend_database = firebase.database().ref().child("Friends");
friend_request_database = firebase.database().ref().child("Friend_request");
message_database = firebase.database().ref().child("messages");
users_database = firebase.database().ref().child("Users");

function goto(currentuserId) {
  if(currentuserId != "") {
    $("#loader").hide();
    chat_database.child(currentuserId).orderByChild("timestamp").on('child_added', function(datasnapshot) {
      var userId = "",userName = "",userStatus = "",thumb_img = "";
      userId = datasnapshot.key;
      users_database.child(userId).once('value',function(snapshot) {
        userName = snapshot.child("name").val();
        thumb_img = snapshot.child("thumb_image").val();
        user_chat_list_creater("chat-list",userId,userName,userStatus,thumb_img);
      });
      var lastmessage = message_database.child(currentuserId).child(userId).limitToLast(1);
      lastmessage.on('child_added', function(snapshot) {
        var type = snapshot.child("type").val();
        userStatus = snapshot.child("message").val();
        if(type == "text") {
          $("#" + userId).find(".message").text(userStatus);
        }else {
          $("#" + userId).find(".message").text(type);
        }
      });   
    });

    chat_database.child(currentuserId).on('child_removed', function(datasnapshot) {
      $("#" + datasnapshot.key).remove();
    });


    friend_database.child(currentuserId).on('child_added', function(datasnapshot) {
      var userId = "",userName = "",userStatus = "",thumb_img = "";
      userId = datasnapshot.key;
      users_database.child(userId).on('value',function(snapshot) {
        userName = snapshot.child("name").val();
        thumb_img = snapshot.child("thumb_image").val();
        userStatus = snapshot.child("online").val();
        if(userStatus == "true") {
          userStatus = "online"
        }else {
          var time = new Date();
          userStatus = getTimeAgo(time.getTime(),chat_user_status);
        }
        user_list_creater("friend-list",userId,userName,userStatus,thumb_img);
      });
    });

    friend_database.child(currentuserId).on('child_changed', function(datasnapshot) {
      $("#" + datasnapshot.key).remove();
    });

    friend_request_database.child(currentuserId).on('child_added', function(datasnapshot) {
      if(datasnapshot.child("request_type").val() != "sent"){
        var userId = "",userName = "",userStatus = "",thumb_img = "";
        userId = datasnapshot.key;
        users_database.child(userId).once('value',function(snapshot) {
          userName = snapshot.child("name").val();
          thumb_img = snapshot.child("thumb_image").val();
          userStatus = snapshot.child("status").val();
          user_list_creater("friend-request-list",userId,userName,userStatus,thumb_img);
        });
      }
    });

    friend_request_database.child(currentuserId).on('child_changed', function(datasnapshot) {
      $("#" + datasnapshot.key).remove();
    });
  }
}

function user_list_creater(whichList,userId,userName,userStatus,thumb_img) {
    var link = document.createElement("li"); 
    var img = document.createElement("img")
    var divcol = document.createElement("div");
    var divrow = document.createElement("div");
    var divName = document.createElement("div");
    var divLastText = document.createElement("div");
    var spanImg = document.createElement("span");
    var optionlist = document.createElement("ul");
    var optionlistitemDelete = document.createElement("li");
    var optionlistitemcancel = document.createElement("li");
    link.setAttribute("id", userId);
    link.setAttribute("class", "list-group-item");
    link.setAttribute("onclick", "profileOpen(this.id)");
    if(thumb_img != "default"){
      img.setAttribute("src", thumb_img);
    } else {
      img.setAttribute("src", "images/dp.jpg");
    }
    img.setAttribute("class", "list-group-item-pic");
    divcol.setAttribute("class", "col-2");
    divrow.setAttribute("class", "row");
    divName.setAttribute("class", "name");
    divLastText.setAttribute("class", "message");
    divLastText.setAttribute("id", "message");
    var text_name = document.createTextNode(userName); 
    var text_last_text = document.createTextNode(userStatus);
    divName.appendChild(text_name);
    divLastText.appendChild(text_last_text);
    divcol.appendChild(divName);
    divcol.appendChild(divLastText);
    divrow.appendChild(img);
    divrow.appendChild(divcol);
    spanImg.setAttribute("class", "material-icons option-arrow");
    spanImg.setAttribute("onclick", "options('"+userId+"')");
    spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
    link.appendChild(divrow);  
    link.appendChild(spanImg);
    optionlist.setAttribute("class", "optionslist");
    optionlistitemDelete.setAttribute("onclick","mdelete('"+userId+"')");
    optionlistitemDelete.appendChild(document.createTextNode("delete"));
    optionlistitemcancel.setAttribute("onclick","cancel('"+userId+"')");
    optionlistitemcancel.appendChild(document.createTextNode("cancel"));
    optionlist.appendChild(optionlistitemDelete);
    optionlist.appendChild(optionlistitemcancel);
    link.appendChild(optionlist);
    document.getElementById(whichList).appendChild(link);
}

function user_chat_list_creater(whichList,userId,userName,userStatus,thumb_img) {
    var link = document.createElement("li"); 
    var img = document.createElement("img")
    var divcol = document.createElement("div");
    var divrow = document.createElement("div");
    var divName = document.createElement("div");
    var divLastText = document.createElement("div");
    var spanImg = document.createElement("span");
    var optionlist = document.createElement("ul");
    var optionlistitemDelete = document.createElement("li");
    var optionlistitemcancel = document.createElement("li");
    link.setAttribute("id", userId);
    link.setAttribute("class", "list-group-item");
    link.setAttribute("onclick", "profileOpen(this.id)");
    link.setAttribute("style", "transform: rotate(-180deg);");
    if(thumb_img != "default"){
      img.setAttribute("src", thumb_img);
    } else {
      img.setAttribute("src", "images/dp.jpg");
    }
    img.setAttribute("class", "list-group-item-pic");
    divcol.setAttribute("class", "col-2");
    divrow.setAttribute("class", "row");
    divName.setAttribute("class", "name");
    divLastText.setAttribute("class", "message");
    divLastText.setAttribute("id", "message");
    var text_name = document.createTextNode(userName); 
    var text_last_text = document.createTextNode(userStatus);
    divName.appendChild(text_name);
    divLastText.appendChild(text_last_text);
    divcol.appendChild(divName);
    divcol.appendChild(divLastText);
    divrow.appendChild(img);
    divrow.appendChild(divcol);
    spanImg.setAttribute("class", "material-icons option-arrow");
    spanImg.setAttribute("onclick", "options('"+userId+"')");
    spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
    link.appendChild(divrow);  
    link.appendChild(spanImg);
    optionlist.setAttribute("class", "optionslist");
    optionlistitemDelete.setAttribute("onclick","mdelete('"+userId+"')");
    optionlistitemDelete.appendChild(document.createTextNode("delete"));
    optionlistitemcancel.setAttribute("onclick","cancel('"+userId+"')");
    optionlistitemcancel.appendChild(document.createTextNode("cancel"));
    optionlist.appendChild(optionlistitemDelete);
    optionlist.appendChild(optionlistitemcancel);
    link.appendChild(optionlist);
    document.getElementById(whichList).appendChild(link);
}

function profileOpen(userid) {
  if(currentPage == "chats-tab" && boolOption){
    var dataPassing = "?" + userid;
    window.location.href = 'chat.html'+ dataPassing;
  }else if((currentPage == "friend-request-tab" && boolOption) || (currentPage == "friends-tab" && boolOption)) {
    var dataPassing = "?" + userid;
    window.location.href = 'profile-viewer.html'+ dataPassing + '&main.html';
  }
}

function getTimeAgo(current_time,previous_time) {
  var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current_time - previous_time;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function checkCall(currentuserId) {
  firebase.database().ref().child("Users").child(currentuserId).on("value", function(snapshot) {
    if(snapshot.hasChild("calledBy") && snapshot.hasChild("type") && snapshot.hasChild("call_channel_id")) {
      var calledBy = snapshot.child("calledBy").val();
      var type = snapshot.child("type").val();
      var call_channel = snapshot.child("call_channel_id").val();
      if(calledBy != "none" && type != "none" && call_channel != "none") {
        window.location.href = "call-receive.html?" + calledBy + "&" + call_channel;
      }
    }
  });
}

var boolOption = true;

if(currentPage == "chats-tab") {
  setTimeout(function() {
    $("#chat-list li").mouseenter(function() {
      var id = $(this).attr("id");
      $("#" + id + " .option-arrow").css("display", "block");
    }).mouseleave(function() {
      var id = $(this).attr("id");
      $("#" + id + " .option-arrow").css("display", "none");
    });
  }, 5000);
}

function options(id) {
  boolOption = false;
  $("#"+ id +" .optionslist").css("display","block");
}

function mdelete(id) {
  if(currentuserId != "") {
    chat_database.child(currentuserId).child(id).remove();
  }
}
function cancel(id) {
  setTimeout(function() {
    boolOption = true;
  }, 100);
  $("#"+ id +" .optionslist").css("display","none");
}

function makeToast(text) {
  $(".toast").show();
  $("#toast-text").text(text);
  setTimeout(function() {
    $(".toast").hide();
  }, 3000);
}