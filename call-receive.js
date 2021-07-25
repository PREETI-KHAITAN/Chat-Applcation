var users_database = firebase.database().ref().child("Users");
var currentuserId = "";

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = 'login.html';
  }else {
    currentuserId = user.uid; 
  }
});

var dataPassing = decodeURIComponent(window.location.search);
chatuserId = dataPassing.substring(1);
var page = chatuserId.split("&");
chatuserId = page[0];
var call_channel_id = page[1];
var chatuserName = "",chatuserImage = "",type = "";

users_database.child(chatuserId).on('value', function(snapshot) {  
  chatuserName = snapshot.child("name").val();
  chatuserImage = snapshot.child("thumb_image").val();
  type = snapshot.child("type").val();
  $("#user-name").text(chatuserName);
  $("#user-img").attr("src", chatuserImage);
  $("#mode").text("Calling Mode: " + type);
  $("#user-status").attr("style", "display: block;");
  $("#loader").hide();

  var onCall = snapshot.child("calling").val();
  if(onCall == "none") {
    firebase.database().ref().child("Calling").child(currentuserId).child(call_channel_id).update({
      timestamp_ended: firebase.database.ServerValue.TIMESTAMP
    }).then(function() {
      firebase.database().ref().child("Calling").child(chatuserId).child(call_channel_id).update({
        timestamp_ended: firebase.database.ServerValue.TIMESTAMP
      }).then(function() {
        window.location.href = 'chat.html?' + chatuserId;
      });
    });
  }
});


$("#answer").click(function() {
  if(type != ""){
    if(type == "audio") {
      window.location.href = 'audio-call.html?' + chatuserId + "&" + call_channel_id;
    }else if(type == "video") {
      window.location.href = 'video-call.html?' + chatuserId + "&" + call_channel_id;
    }
  }
});

$("#leave").click(function() {
  if(chatuserId != "" && currentuserId != "") {
    users_database.child(currentuserId).update({
      call_channel_id: "none",
      calling: "none",
      type: "none"
    }).then(function() {
      users_database.child(chatuserId).update({
        call_channel_id: "none",
        calledBy: "none",
        calling: "none",
        type: "none"
      });
    });
  }
});

function makeToast(text) {
  $(".toast").show();
  $("#toast-text").text(text);
  setTimeout(function() {
    $(".toast").hide();
  }, 3000);
}