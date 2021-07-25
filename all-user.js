$(document).ready(function() {
	$('.menu-toggle').click(function(){
		$('#side-bar').toggleClass('active');
	});
});

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
   	window.location.href = 'login.html';
  } else {
    var currentuserId = user.uid;
    showusers(currentuserId);
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

function showusers(currentuserId) {
  var usersDatabase = firebase.database().ref().child("Users");

  usersDatabase.on('child_added', function(datasnapshot) {
    $("#loader").hide();
    var userId,userName,userStatus,thumb_img;
    userId = datasnapshot.key;
    userName = datasnapshot.child("name").val();
    userStatus = datasnapshot.child("status").val();
    thumb_img = datasnapshot.child("thumb_image").val();
    if(currentuserId != userId) {
      user_list_creater(userId,userName,userStatus,thumb_img);
    }
  });

  usersDatabase.on('child_removed', function(datasnapshot) {
    $("#" + datasnapshot.key).remove();
  });

  usersDatabase.on('child_changed', function(datasnapshot) {
    $("#" + datasnapshot.key).remove();
    var userId,userName,userStatus,thumb_img;
    userId = datasnapshot.key;
    userName = datasnapshot.child("name").val();
    userStatus = datasnapshot.child("status").val();
    thumb_img = datasnapshot.child("thumb_image").val();
    if(currentuserId != userId) {
      user_list_creater(userId,userName,userStatus,thumb_img);
    }
  });
}

function user_list_creater(userId,userName,userStatus,thumb_img) {
    var link = document.createElement("li"); 
    var img = document.createElement("img")
    var divcol = document.createElement("div");
    var divrow = document.createElement("div");
    var divName = document.createElement("div");
    var divLastText = document.createElement("div");
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
    var text_name = document.createTextNode(userName); 
    var text_last_text = document.createTextNode(userStatus);
    divName.appendChild(text_name);
    divLastText.appendChild(text_last_text);
    divcol.appendChild(divName);
    divcol.appendChild(divLastText);
    divrow.appendChild(img);
    divrow.appendChild(divcol);
    link.appendChild(divrow);      
    document.getElementById("list-group").appendChild(link);
}

function profileOpen(userId) {
  window.location.href = 'profile-viewer.html?'+userId+"&all-user.html";
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

function makeToast(text) {
  $(".toast").show();
  $("#toast-text").text(text);
  setTimeout(function() {
    $(".toast").hide();
  }, 3000);
}