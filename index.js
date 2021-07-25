$(document).ready(function() {
	$('.menu-toggle').click(function(){
		$('nav').toggleClass('active');
	});
});

/*firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
   	firebase.auth().signOut();
  }
});*/

$("#login-progress").hide();
$("#register-progress").hide();
$("#login-progress-m").hide();
$("#register-progress-m").hide();

$(document).on('keypress',function(e) {
    if(e.which == 13) {
    	var pageName = window.location.href;
        if(pageName.includes("index.html")) {
        	$("#login-btn").trigger("click");
        	$("#login-btn-mobile").trigger("click");
        }else if(pageName.includes("register.html")) {
        	$("#register-btn").trigger("click");
        	$("#register-btn-mobile").trigger("click");
        }else if(pageName.includes("login.html")) {
        	$("#login-btn").trigger("click");
        	$("#login-btn-mobile").trigger("click");
        }else if(pageName.includes("forgot-password.html")) {
        	$("#reset-btn").trigger("click");
        	$("#reset-btn-mobile").trigger("click");
        }
    }
});

$("#login-btn").click(
	function () {
		var useremail = $("#login-email-tf").val();
		var userpassword = $("#login-password-tf").val();
		if(useremail != "" && userpassword != "" ){
			$("#login-progress").show();
			$("#login-btn").hide();
			firebase.auth().signInWithEmailAndPassword(useremail, userpassword).then(function() {
				var currentUser = firebase.auth().currentUser;
				firebase.database().ref().child('Users/' + currentUser.uid).update({
					online: "true"
				}).then(function() {
					window.location.href = 'main.html';
				});
			}).catch(function(error) {
				$("#sign-in-error").show().text(error.message);
				$("#login-btn").show();
				$("#login-progress").hide();
			});
		}
	}
);

$("#login-btn-mobile").click(
	function () {
		var useremail = $("#login-email-tf-mobile").val();
		var userpassword = $("#login-password-tf-mobile").val();
		if(useremail != "" && userpassword != "" ){
			$("#login-btn-mobile").hide();
			$("#login-progress-m").show();
			firebase.auth().signInWithEmailAndPassword(useremail, userpassword).then(function() {
				var currentUser = firebase.auth().currentUser;
				firebase.database().ref().child('Users/' + currentUser.uid).update({
					online: "true"
				}).then(function() {
					window.location.href = 'main.html';
				});
			}).catch(function(error) {
				$("#sign-in-error-mobile").show().text(error.message);
				$("#login-btn-mobile").show();
				$("#login-progress-m").hide();
			});
		}
	}
);

$("#register-btn").click(function(){
	var username = $("#register-name-tf").val();
	var useremail = $("#register-email-tf").val();
	var userpassword = $("#register-password-tf").val();
	if(useremail != "" && userpassword != ""  && username != ""){
		$("#register-btn").hide();
		$("#register-progress").show();
		firebase.auth().createUserWithEmailAndPassword(useremail, userpassword).then(function() {
			var currentUser = firebase.auth().currentUser;
			firebase.database().ref().child('Users/' + currentUser.uid).update({
				device_token: "none",
				image: "default",
				name: username,
				online: "true",
				status: "Hi there.I'm using Macky.",
				thumb_image: "default",
				call_channel_id: "none",
				calledBy: "none",
				calling: "none",
				type: "none"
			}).then(function(){
					window.location.href = 'account-setting.html';
				});
		}).catch(function(error) {
			$("#sign-up-error").show().text(error.message);
			$("#register-btn").show();
			$("#register-progress").hide();
		});
	}
});

$("#register-btn-mobile").click(function(){
	var username = $("#register-name-tf-mobile").val();
	var useremail = $("#register-email-tf-mobile").val();
	var userpassword = $("#register-password-tf-mobile").val();
	if(useremail != "" && userpassword != ""  && username != ""){
		$("#register-btn-mobile").hide();
		$("#register-progress-m").show();
		firebase.auth().createUserWithEmailAndPassword(useremail, userpassword).then(function() {
			var currentUser = firebase.auth().currentUser;
			firebase.database().ref().child('Users/' + currentUser.uid).update({
				device_token: "none",
				image: "https://firebasestorage.googleapis.com/v0/b/chat-app-3bbfc.appspot.com/o/profile_images%2Fdp.jpg?alt=media&token=33f49eb4-9940-45d8-9a02-884572c10dcc",
				name: username,
				online: "true",
				status: "Hi there.I'm using Macky.",
				thumb_image: "https://firebasestorage.googleapis.com/v0/b/chat-app-3bbfc.appspot.com/o/profile_images%2Fdp.jpg?alt=media&token=33f49eb4-9940-45d8-9a02-884572c10dcc",
				call_channel_id: "none",
				calledBy: "none",
				calling: "none",
				type: "none"
			}).then(function(){
					window.location.href = 'account-setting.html';
				});
		}).catch(function(error) {
			$("#sign-up-error-mobile").show().text(error.message);
			$("#register-btn-mobile").show();
			$("#register-progress-m").hide();
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

$("#reset-btn-mobile").click(function() {
	var email = $("#reset-email-tf-mobile").val();
	if(email != "") {
		$("#reset-progress-m").show();
		$("#reset-btn-mobile").hide();
		firebase.auth().sendPasswordResetEmail(email).then(function() {
		  makeToast("Reset Password Sent, please check your mail");
		  setTimeout(function() {
		  	window.location.href = 'login.html';
		  }, 2000);
		}).catch(function(error) {
		  $("#reset-error-mobile").show().text(error.message);
		  $("#reset-progress-m").hide();
		  $("#reset-btn-mobile").show();
		});
	}
});

$("#reset-btn").click(function() {
	var email = $("#reset-email-tf").val();
	if(email != "") {
		$("#reset-progress").show();
		$("#reset-btn").hide();
		firebase.auth().sendPasswordResetEmail(email).then(function() {
		  makeToast("Reset Password Sent, please check your mail");
		  setTimeout(function() {
		  	window.location.href = 'login.html';
		  }, 2000);
		}).catch(function(error) {
		  $("#reset-error").show().text(error.message);
		  $("#reset-progress").hide();
		  $("#reset-btn").show();
		});
	}
});