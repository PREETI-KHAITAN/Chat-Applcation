$(document).ready(function() {
	$('.menu-toggle').click(function(){
		$('nav').toggleClass('active');
	});
});

var currentuserId;

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = 'login.html';
  } else {
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

function backfun() {
  window.location.href = page[1];
}

var friends_state = "not_friends";
var friend_request_database = firebase.database().ref().child("Friend_request");
var friend_database = firebase.database().ref().child("Friends");
var date = new Date();
var monthNames =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep", "Oct","Nov","Dec"];
var strDate = date.getDate() + "-" + monthNames[date.getMonth()+1] + "-" + date.getFullYear();

var dataPassing = decodeURIComponent(window.location.search);
profileUserId = dataPassing.substring(1);
var page = profileUserId.split("&");
profileUserId = page[0];
if(profileUserId != "" && currentuserId != ""){
  var userDatabase = firebase.database().ref().child("Users").child(profileUserId);
  userDatabase.on('value', function(datasnapshot) {
      $("#loader").hide();
      $("#user-name").text(datasnapshot.child("name").val());
      $("#user-status").text(datasnapshot.child("status").val());
      var image = datasnapshot.child("image").val();
      if(image != "default") {
        $('#user-img').attr('src', image);
      }
      friend_request_database.child(currentuserId).on('value', function(snapshot) {
        if(snapshot.hasChild(profileUserId)) {
          var request_type = snapshot.child(profileUserId).child("request_type").val();
          if(request_type == "received") {
            $("#sendRequest").attr('style','display: block;').text("ACCEPT FRIEND REQUEST");
            $("#cancleRequest").attr('style','display: block;');
            friends_state = "request_received";
          } else if(request_type == "sent"){
            $("#sendRequest").attr('style','display: block;').text("CANCLE FRIEND REQUEST");
            $("#cancleRequest").attr('style','display: none;');
            friends_state = "request_sent";
          }
        }else {
          $("#sendRequest").attr('style','display: block;');
          friends_state = "not_friends";
        }
      });
      friend_database.child(currentuserId).on('value', function(snapshot) {
        if(snapshot.hasChild(profileUserId)) {
          friends_state = "friends";
          $("#sendRequest").attr('style','display: block;').text("SEND MESSAGE");
          $("#cancleRequest").attr('style','display: block;').text("UNFRIEND");
        }
      });
  });
}

function goto(currentuserId) {
  if(currentuserId != "" && profileUserId != "") {
    $("#sendRequest").click(function() {
      $("#sendRequest").prop('disabled', true);

      if(friends_state == "not_friends") {
        friend_request_database.child(currentuserId).child(profileUserId).update({
          request_type: "sent"
        }).then(function() {
            friend_request_database.child(profileUserId).child(currentuserId).update({
            request_type: "received"
          }).then(function() {
            makeToast("request sent");
            friends_state = "request_sent";
            $("#sendRequest").prop('disabled', false).text("CANCLE FRIEND REQUEST");
            $("#cancleRequest").attr('style','display: none;');
          }).catch(function(error) {
            makeToast(error.message);
            $("#sendRequest").prop('disabled', false);
          });
        }).catch(function(error) {
          makeToast(error.message);
          $("#sendRequest").prop('disabled', false);
        });
      }else if(friends_state == "request_sent") {
        friend_request_database.child(currentuserId).child(profileUserId).update({
          request_type: null
        }).then(function() {
            friend_request_database.child(profileUserId).child(currentuserId).update({
            request_type: null
          }).then(function() {
            makeToast("request cancled");
            friends_state = "not_friends";
            $("#sendRequest").prop('disabled', false).text("SEND FRIEND REQUEST");
            $("#cancleRequest").attr('style','display: none;');
          }).catch(function(error) {
            makeToast(error.message);
            $("#sendRequest").prop('disabled', false);
          });
        }).catch(function(error) {
          makeToast(error.message);
          $("#sendRequest").prop('disabled', false);
        });
      }else if(friends_state == "request_received" && strDate != "") {
        friend_request_database.child(currentuserId).child(profileUserId).update({
          request_type: null
        }).then(function() {
            friend_request_database.child(profileUserId).child(currentuserId).update({
            request_type: null
          }).then(function() {
            friend_database.child(currentuserId).child(profileUserId).update({
              date: strDate
            }).then(function() {
                friend_database.child(profileUserId).child(currentuserId).update({
                  date: strDate
                }).then(function() {
                  $("#sendRequest").prop('disabled', false).text("SEND MESSAGE");
                  $("#cancleRequest").attr('style','display: block;').text("UNFRIEND");
                  friends_state = "friends";
                  makeToast(friends_state);
                });
            });  
          }).catch(function(error) {
            makeToast(error.message);
            $("#sendRequest").prop('disabled', false);
          });
        }).catch(function(error) {
          makeToast(error.message);
          $("#sendRequest").prop('disabled', false);
        });
      }else if(friends_state == "friends") {
        var dataPassing = "?" + profileUserId;
        window.location.href = 'chat.html'+ dataPassing;
      }
    });
  }
}

$("#cancleRequest").click(function() {

  if(friends_state == "friends") {
    friend_database.child(currentuserId).child(profileUserId).update({
      date: null
    }).then(function() {
        friend_database.child(profileUserId).child(currentuserId).update({
          date: null
        }).then(function() {
          $("#sendRequest").prop('disabled', false).text("SEND FRIEND REQUEST");
          $("#cancleRequest").attr('style','display: none;');
          friends_state = "not_friends";
          makeToast(friends_state);
        });
    });  
  }else {
    friend_request_database.child(currentuserId).child(profileUserId).update({
      request_type: null
    }).then(function() {
        friend_request_database.child(profileUserId).child(currentuserId).update({
        request_type: null
      }).then(function() {
        makeToast("request cancled");
        friends_state = "not_friends";
        $("#sendRequest").prop('disabled', false).text("SEND FRIEND REQUEST");
        $("#cancleRequest").attr('style','display: none;');
      }).catch(function(error) {
        makeToast(error.message);
        $("#sendRequest").prop('disabled', false);
      });
    }).catch(function(error) {
      makeToast(error.message);
      $("#sendRequest").prop('disabled', false);
    });
  }
});


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
