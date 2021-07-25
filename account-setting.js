$(document).ready(function() {
	$('.menu-toggle').click(function(){
		$('nav').toggleClass('active');
	});
});

var currentuserId = "";

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
   	window.location.href = 'login.html';
  } else {
    currentuserId = user.uid;
    getData(currentuserId);
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

function getData(currentuserId) {
  var userDatabase = firebase.database().ref().child("Users").child(currentuserId);
  userDatabase.on('value', function(datasnapshot) {
      $("#loader").hide();
      $("#user-name").val(datasnapshot.child("name").val()).attr("style", "display: block;");
      $("#user-status").val(datasnapshot.child("status").val()).attr("style", "display: block;");
      $("#change-details").attr("style", "display: block;");
      var image = datasnapshot.child("image").val();
      if(image != "default") {
        $('#user-img').attr('src', image);
      }
  });
}

$("#change-details").click(function() {
  if(currentuserId != "") {
    var userDatabase = firebase.database().ref().child("Users").child(currentuserId);
    userDatabase.update({
      name: $("#user-name").val(),
      status: $("#user-status").val()
    }).then(function() {
      makeToast("updated");
    });
  }
}); 


$("#user-img").click(function() {
  var input = $(document.createElement("input"));
  input.attr("type", "file");
  input.attr("accept", "image/*");
  input.attr("onchange", "uploadDp(this)");
  input.trigger("click");
});

function uploadDp(event) {
  var file = event.files[0];
  if(!file.type.match("image.*")) {
    makeToast("select image only");
  }else if(currentuserId != "") {
    var uploadTask = firebase.storage().ref().child("profile_images").child(currentuserId + ".jpg").put(file);
    uploadTask.on('state_changed', function() {
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log('File available at', downloadURL);
        var userDatabase = firebase.database().ref().child("Users").child(currentuserId);
        userDatabase.update({
          image: downloadURL,
          thumb_image: downloadURL
        }).then(function() {
          console.log("file uploaded");
        });
      });
    });
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

function makeToast(text) {
  $(".toast").show();
  $("#toast-text").text(text);
  setTimeout(function() {
    $(".toast").hide();
  }, 3000);
}
