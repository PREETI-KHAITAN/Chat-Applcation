$(document).ready(function() {
	setTimeout(function(){
	    window.scrollTo(0, listSize*100);
	}, 6000);
	$("#message-typed").bind("keyup", function(e) {
		length = new Number($("#message-typed").val().length);
		if(length > 0) {
			boolTyping = true;
			typing();
		}else if(length == 0) {
			boolTyping = false;
			typing();
		}
	});
	makeStikerList();
	makeStikerPageList("baby");
	$("#message-typed").focus();
});

var currentuserId = "";
var listSize = 0;
var boolCalling = false,boolTyping = false,boolChatoptionloader = false,boolStickerBox = false;
var fileSize = {
	"actors": 30,
	"baby": 88,
	"emoji": 10,
	"faces": 9,
	"hike": 49,
	"iphone": 18,
	"meme": 74,
	"unknown": 3
} 

function typing() {
	if(boolTyping) {
		$("#sticker").hide();
		if(currentuserId != "" && chatuserId != "") {
			chat_database.child(chatuserId).child(currentuserId).update({
				typing: true
			});
		}
	}else if(!boolTyping) {
		$("#sticker").show();
		if(currentuserId != "" && chatuserId != "") {
			chat_database.child(chatuserId).child(currentuserId).update({
				typing: false
			});
		}
	}
}

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
   	window.location.href = 'login.html';
  }else {
      currentuserId = user.uid;
      goto(currentuserId);
      checkCall(currentuserId);
  }
});

$(document).on('keypress',function(e) {
    if(e.which == 13) {
        sendMessage();
    }
    else {
    	$("#message-typed").focus();
    }
});

var chat_database = firebase.database().ref().child("Chat");
var users_database = firebase.database().ref().child("Users");
var messages_database = firebase.database().ref().child("messages");
var lastMessageId = "";

function goto(currentuserId) {
	if(currentuserId != "" && chatuserId != "") {
		chat_database.child(currentuserId).child(chatuserId).update({
			timestamp: firebase.database.ServerValue.TIMESTAMP
		});
		var chat_user_name = "",chat_user_status = "",chat_user_thumb_image = "",current_user_name = "",current_user_thumb_image = "";

		users_database.child(chatuserId).on('value', function(datasnapshot) {
			chat_user_name = datasnapshot.child("name").val();
			chat_user_status = datasnapshot.child("online").val();
			chat_user_thumb_image = datasnapshot.child("thumb_image").val();
			$("#chat_user_name").text(chat_user_name);
			if(chat_user_thumb_image != "default") {
				$("#chat_user_image").attr('src',chat_user_thumb_image);
			}
			if(chat_user_status == "true") {
				$("#chat_user_status").text("online");
				$("#chat_user_online_status").attr('style','display: block');
				$("#chat_user_offline_status").attr('style','display: none');
			}else {
				var time = new Date();
				$("#chat_user_status").text("Last Seen : " + getTimeAgo(time.getTime(),chat_user_status));
				$("#chat_user_offline_status").attr('style','color: rgb(255,0,0); display: block');
				$("#chat_user_online_status").attr('style','display: none');
			}
			$("#loader").hide();
		});

		users_database.child(currentuserId).on('value', function(datasnapshot) {
			current_user_name = datasnapshot.child("name").val();
			current_user_thumb_image = datasnapshot.child("thumb_image").val();
		});

		messages_database.child(currentuserId).child(chatuserId).on('child_added', function(datasnapshot) {
			var date,from,message,push_id,time,type;
			push_id = datasnapshot.child("push_id").val();
			date = datasnapshot.child("date").val();
			from = datasnapshot.child("from").val();
			message = datasnapshot.child("message").val();
			time = datasnapshot.child("time").val();
			type = datasnapshot.child("type").val();
			if(from != currentuserId) {
				if(chat_user_name != "" && chat_user_thumb_image != ""){
					makeMessage(chat_user_name,chat_user_thumb_image,push_id,date,time,message,type);
				}
			}else {
				if(current_user_name != "" && current_user_thumb_image != ""){
					makeselfMessage(current_user_name,current_user_thumb_image,push_id,date,time,message,type);
				}
			}
			lastMessageId = push_id; 
			if(boolChatoptionloader) {
				getmoreArrowoption();
			}
		});

		messages_database.child(currentuserId).child(chatuserId).on('child_removed', function(datasnapshot) {
			$("#" + datasnapshot.key).remove();
		});
	}
}

var dataPassing = decodeURIComponent(window.location.search);
chatuserId = dataPassing.substring(1);

function backfun() {
	window.location.href = 'main.html';
}

function callFun() {
	var dialog = document.querySelector('dialog');
    if (! dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    } else {
    	dialog.showModal();
    }
}

$("#audio_call").click(function() {
	boolCalling = true;
	var dialog = document.querySelector('dialog');
	dialog.close();
});

$("#video_call").click(function() {
	boolCalling = true;
	updateCallingDetails(currentuserId,chatuserId);
	var dialog = document.querySelector('dialog');
	dialog.close();
});

$("#close").click(function() {
	var dialog = document.querySelector('dialog');
	dialog.close();
});

function makeMessage(user_name,user_thumb_image,push_id,date,time,message,type) {

	listSize++;
	
	if(type == "text") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var divtext = document.createElement("div");
		var divtime = document.createElement("div");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward");
		spanForward.appendChild(document.createTextNode("forward"));
		link.setAttribute("id", push_id);
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		divbox.setAttribute("class", "message-box");
		divtime.setAttribute("class", "message-time");
		divtext.setAttribute("class", "message-text");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		var text_text = document.createTextNode(message);
		divtime.appendChild(text_time);
		divtext.appendChild(text_text);
		divbox.appendChild(divtime);
		divbox.appendChild(divtext);
		link.appendChild(img);
		link.appendChild(divbox);
		link.appendChild(spanImg);  
		link.appendChild(spanReply);
		link.appendChild(spanForward);           
		document.getElementById("message-list").appendChild(link);
	}else if(type == "image") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var textImg = document.createElement("img");
		var divtime = document.createElement("div");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward");
		spanForward.appendChild(document.createTextNode("forward"));
		link.setAttribute("id", push_id);
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		divbox.setAttribute("class", "message-box");
		divtime.setAttribute("class", "message-time");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		textImg.setAttribute("src",message);
		textImg.setAttribute("class","message-image");
		textImg.setAttribute("style", "cursor: pointer;");
		textImg.setAttribute("onclick", 'fileOpen("' + message + '")');
		divtime.appendChild(text_time);
		divbox.appendChild(divtime);
		divbox.appendChild(textImg);
		link.appendChild(img);
		link.appendChild(divbox);  
		link.appendChild(spanImg);
		link.appendChild(spanReply);
		link.appendChild(spanForward);              
		document.getElementById("message-list").appendChild(link);
	}else if(type == "file") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var divtime = document.createElement("div");
		var divfilebox = document.createElement("div");
		var spanIcon = document.createElement("span");
		var spanFileName = document.createElement("span");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward");
		spanForward.appendChild(document.createTextNode("forward"));
		var id = getId(push_id);
		link.setAttribute("id", id);
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		divbox.setAttribute("class", "message-box");
		divfilebox.setAttribute("class", "file-box");
		divtime.setAttribute("class", "message-time");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		divtime.appendChild(text_time);
		spanIcon.setAttribute("class", "material-icons file-icon");
		spanIcon.appendChild(document.createTextNode("description"));
		spanFileName.setAttribute("class", "file-text");
		var fileName = getFileName(push_id);
		spanFileName.appendChild(document.createTextNode(fileName));
		divfilebox.appendChild(spanIcon);
		divfilebox.appendChild(spanFileName);
		divfilebox.setAttribute("onclick", 'fileOpen("' + message + '")');
		divbox.appendChild(divtime);
		divbox.appendChild(divfilebox);
		link.appendChild(img);
		link.appendChild(divbox);  
		link.appendChild(spanImg); 
		link.appendChild(spanReply);
		link.appendChild(spanForward);             
		document.getElementById("message-list").appendChild(link);
	}else if(type == "sticker") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var textImg = document.createElement("img");
		var divtime = document.createElement("div");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward");
		spanForward.appendChild(document.createTextNode("forward"));
		link.setAttribute("id", push_id);
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		divbox.setAttribute("class", "message-box");
		//divbox.setAttribute("style", "background-color: transparent;");
		divtime.setAttribute("class", "message-time");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		var spliter,lname,position;
		spliter = message.split("+");
		lname = spliter[0];
		position = spliter[1];
		textImg.setAttribute("src","sticker/"+lname+"/"+position+".webp");
		textImg.setAttribute("class","message-image");
		divtime.appendChild(text_time);
		divbox.appendChild(divtime);
		divbox.appendChild(textImg);
		link.appendChild(img);
		link.appendChild(divbox);  
		link.appendChild(spanImg);
		link.appendChild(spanReply);
		link.appendChild(spanForward);              
		document.getElementById("message-list").appendChild(link);
	}else if(type == "current_location") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var textImg = document.createElement("img");
		var divtime = document.createElement("div");
		var divtext = document.createElement("div");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward");
		spanForward.appendChild(document.createTextNode("forward"));
		link.setAttribute("id", push_id);
		divtext.setAttribute("class", "message-text");
		divtext.setAttribute("style", "background-color: #6200EE; border-radius: 5px; margin: 5px; padding-left: 5px;");
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		divbox.setAttribute("class", "message-box");
		divtime.setAttribute("class", "message-time");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		textImg.setAttribute("src", "images/map.jpg");
		textImg.setAttribute("class","message-image");
		textImg.setAttribute("style", "cursor: pointer;");
		textImg.setAttribute("onclick", 'openLocation("' + message + '")');
		var text_text = document.createTextNode("current location");
		divtext.appendChild(text_text);
		divtime.appendChild(text_time);
		divbox.appendChild(divtime);
		divbox.appendChild(divtext);
		divbox.appendChild(textImg);
		link.appendChild(img);
		link.appendChild(divbox);  
		link.appendChild(spanImg);
		link.appendChild(spanReply);
		link.appendChild(spanForward);              
		document.getElementById("message-list").appendChild(link);
	}
	window.scrollTo(0, listSize*100);
}

function makeselfMessage(user_name,user_thumb_image,push_id,date,time,message,type) {

	listSize++;
	
	if(type == "text") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var divtext = document.createElement("div");
		var divtime = document.createElement("div");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow self");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply option-self");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward option-self");
		spanForward.appendChild(document.createTextNode("forward"));
		link.setAttribute("id", push_id);
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		img.setAttribute("style", "float: right;");
		divbox.setAttribute("class", "message-box");
		divbox.setAttribute("style", "float: right;");
		divtime.setAttribute("class", "message-time");
		divtext.setAttribute("class", "message-text");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		var text_text = document.createTextNode(message);
		divtime.appendChild(text_time);
		divtext.appendChild(text_text);
		divbox.appendChild(divtime);
		divbox.appendChild(divtext);
		link.appendChild(img);
		link.appendChild(divbox);
		link.appendChild(spanImg);  
		link.appendChild(spanReply);
		link.appendChild(spanForward);           
		document.getElementById("message-list").appendChild(link);
	}else if(type == "image") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var textImg = document.createElement("img");
		var divtime = document.createElement("div");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow self");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply option-self");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward option-self");
		spanForward.appendChild(document.createTextNode("forward"));
		link.setAttribute("id", push_id);
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		img.setAttribute("style", "float: right;");
		divbox.setAttribute("class", "message-box");
		divbox.setAttribute("style", "float: right;");
		divtime.setAttribute("class", "message-time");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		textImg.setAttribute("src",message);
		textImg.setAttribute("class","message-image");
		textImg.setAttribute("style", "cursor: pointer;");
		textImg.setAttribute("onclick", 'fileOpen("' + message + '")');
		divtime.appendChild(text_time);
		divbox.appendChild(divtime);
		divbox.appendChild(textImg);
		link.appendChild(img);
		link.appendChild(divbox);  
		link.appendChild(spanImg);
		link.appendChild(spanReply);
		link.appendChild(spanForward);              
		document.getElementById("message-list").appendChild(link);
	}else if(type == "file") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var divtime = document.createElement("div");
		var divfilebox = document.createElement("div");
		var spanIcon = document.createElement("span");
		var spanFileName = document.createElement("span");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow self");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply option-self");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward option-self");
		spanForward.appendChild(document.createTextNode("forward"));
		var id = getId(push_id);
		link.setAttribute("id", id);
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		img.setAttribute("style", "float: right;");
		divbox.setAttribute("class", "message-box");
		divbox.setAttribute("style", "float: right;");
		divfilebox.setAttribute("class", "file-box");
		divtime.setAttribute("class", "message-time");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		divtime.appendChild(text_time);
		spanIcon.setAttribute("class", "material-icons file-icon");
		spanIcon.appendChild(document.createTextNode("description"));
		spanFileName.setAttribute("class", "file-text");
		var fileName = getFileName(push_id);
		spanFileName.appendChild(document.createTextNode(fileName));
		divfilebox.appendChild(spanIcon);
		divfilebox.appendChild(spanFileName);
		divfilebox.setAttribute("onclick", 'fileOpen("' + message + '")');
		divbox.appendChild(divtime);
		divbox.appendChild(divfilebox);
		link.appendChild(img);
		link.appendChild(divbox);  
		link.appendChild(spanImg); 
		link.appendChild(spanReply);
		link.appendChild(spanForward);             
		document.getElementById("message-list").appendChild(link);
	}else if(type == "sticker") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var textImg = document.createElement("img");
		var divtime = document.createElement("div");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow self");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply option-self");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward option-self");
		spanForward.appendChild(document.createTextNode("forward"));
		link.setAttribute("id", push_id);
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		img.setAttribute("style", "float: right;");
		divbox.setAttribute("class", "message-box");
		divbox.setAttribute("style", "float: right;");
		//divbox.setAttribute("style", "background-color: transparent;");
		divtime.setAttribute("class", "message-time");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		var spliter,lname,position;
		spliter = message.split("+");
		lname = spliter[0];
		position = spliter[1];
		textImg.setAttribute("src","sticker/"+lname+"/"+position+".webp");
		textImg.setAttribute("class","message-image");
		divtime.appendChild(text_time);
		divbox.appendChild(divtime);
		divbox.appendChild(textImg);
		link.appendChild(img);
		link.appendChild(divbox);  
		link.appendChild(spanImg);
		link.appendChild(spanReply);
		link.appendChild(spanForward);              
		document.getElementById("message-list").appendChild(link);
	}else if(type == "current_location") {
		var testdate = new Date();
		var current_date = testdate.getDate() + "-" + (testdate.getMonth()+1) + "-" + testdate.getFullYear();
		var link = document.createElement("li"); 
		var img = document.createElement("img")
		var divbox = document.createElement("div");
		var textImg = document.createElement("img");
		var divtime = document.createElement("div");
		var divtext = document.createElement("div");
		var spanImg = document.createElement("span");
		var spanForward = document.createElement("span");
		var spanReply = document.createElement("span");
		spanImg.setAttribute("class", "material-icons option-arrow self");
		spanImg.appendChild(document.createTextNode("keyboard_arrow_down"));
		spanReply.setAttribute("class", "material-icons option-reply option-self");
		spanReply.appendChild(document.createTextNode("reply"));
		spanForward.setAttribute("class", "material-icons option-forward option-self");
		spanForward.appendChild(document.createTextNode("forward"));
		link.setAttribute("id", push_id);
		divtext.setAttribute("class", "message-text");
		divtext.setAttribute("style", "background-color: #6200EE; border-radius: 5px; margin: 5px; padding-left: 5px;");
		if(user_thumb_image != "default"){
			img.setAttribute("src", user_thumb_image);
		}else {
			img.setAttribute("src", "images/dp.jpg");
		}
		img.setAttribute("class", "list-group-item-pic");
		img.setAttribute("style", "float: right;");
		divbox.setAttribute("class", "message-box");
		divbox.setAttribute("style", "float: right;");
		divtime.setAttribute("class", "message-time");
		if(current_date == date) {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm" );
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am"); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am"); 
			}
		}else {
			var change_time = parseInt(time.substring(0,2))
			if( change_time > 12 ) {
				change_time = change_time - 12;
				var text_time = document.createTextNode(user_name + "  "+ change_time + time.substring(2) + " Pm , " + date);
			}else if(change_time == "00") {
				var text_time = document.createTextNode(user_name + "  "+ "12" + time.substring(2) + " Am , " + date); 
			}else {
				var text_time = document.createTextNode(user_name + "  "+ time + " Am , " + date); 
			}
		}
		textImg.setAttribute("src", "images/map.jpg");
		textImg.setAttribute("class","message-image");
		textImg.setAttribute("style", "cursor: pointer;");
		textImg.setAttribute("onclick", 'openLocation("' + message + '")');
		var text_text = document.createTextNode("current location");
		divtext.appendChild(text_text);
		divtime.appendChild(text_time);
		divbox.appendChild(divtime);
		divbox.appendChild(divtext);
		divbox.appendChild(textImg);
		link.appendChild(img);
		link.appendChild(divbox);  
		link.appendChild(spanImg);
		link.appendChild(spanReply);
		link.appendChild(spanForward);              
		document.getElementById("message-list").appendChild(link);
	}
	window.scrollTo(0, listSize*100);
}

function sendMessage() {
	var text = $('#message-typed').val();
	if(text != "" && currentuserId != "" && chatuserId != "") {
		var pushId = messages_database.child(currentuserId).child(chatuserId).push().key;
		var date = new Date();
		var strDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
		var current_time = date.getHours() + ":" + date.getMinutes();
		messages_database.child(currentuserId).child(chatuserId).child(pushId).update({
			date: strDate,
			from: currentuserId,
			message: text,
			push_id: pushId,
			time: current_time,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			type: "text"
		});
		messages_database.child(chatuserId).child(currentuserId).child(pushId).update({
			date: strDate,
			from: currentuserId,
			message: text,
			push_id: pushId,
			time: current_time,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			type: "text"
		});
		$('#message-typed').val("").focus().trigger("keyup");
		

		var chat_update_database = chat_database.child(chatuserId);
		chat_update_database.once('value', function(snapshot) {
			if(!snapshot.hasChild(currentuserId)) {
				chat_update_database.child(currentuserId).update({
					timestamp: firebase.database.ServerValue.TIMESTAMP
				});
			}
		})
	}
}

function openDawer() {
	$("#add-btn-drawer").attr("style", "display: inline-flex");
	$("#openDawer").attr("style", "display: none");
	$("#message-typed").attr("style", "display: none");
	$("#sendMessage").attr("style", "display: none");
}
function closeDrawer() {
	$("#add-btn-drawer").attr("style", "display: none");
	$("#openDawer").attr("style", "display: block");
	$("#message-typed").attr("style", "display: block");
	$("#sendMessage").attr("style", "display: block");
}

function sendCamPic() {
}
function sendFile() {
  var input = $(document.createElement("input"));
  input.attr("type", "file");
  input.attr("onchange", "uploadFile(this)");
  input.trigger("click");
}
function sendImage() {
  var input = $(document.createElement("input"));
  input.attr("type", "file");
  input.attr("accept", "image/*");
  input.attr("onchange", "uploadImage(this)");
  input.trigger("click");
}
function sendCurrentLocation() {
	var pos;
	if (navigator.geolocation) {
	 navigator.geolocation.getCurrentPosition(function(position) {
	      pos = {
	        lat: position.coords.latitude,
	        lng: position.coords.longitude
	      };
	      sendlocation(pos);
	   });
	}else {
	   toast("Unable to detect current location");
	}
}

function sendlocation(position) {
	var pushId = messages_database.child(currentuserId).child(chatuserId).push().key;
	var date = new Date();
	var strDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
	var current_time = date.getHours() + ":" + date.getMinutes();
	messages_database.child(currentuserId).child(chatuserId).child(pushId).update({
		date: strDate,
		from: currentuserId,
		message: position.lat+","+position.lng,
		push_id: pushId,
		time: current_time,
		timestamp: firebase.database.ServerValue.TIMESTAMP,
		type: "current_location"
	});
	messages_database.child(chatuserId).child(currentuserId).child(pushId).update({
		date: strDate,
		from: currentuserId,
		message: position.lat+","+position.lng,
		push_id: pushId,
		time: current_time,
		timestamp: firebase.database.ServerValue.TIMESTAMP,
		type: "current_location"
	});
} 

async function uploadFile(event) {
	var file = event.files[0];
    if(!file) {
      makeToast("unable to get File");
    }else if(currentuserId != "" && chatuserId != "") {
    	var pushId = messages_database.child(currentuserId).child(chatuserId).push().key;
    	var uploadTask = firebase.storage().ref().child("message_files").child(pushId + "_" + file.name).put(file);
    	uploadTask.on('state_changed',  function(snapshot) {
		var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		  console.log('Upload is ' + progress + '% done');
		  switch (snapshot.state) {
		    case firebase.storage.TaskState.PAUSED: console.log('Upload is paused');
		      break;
		    case firebase.storage.TaskState.RUNNING: console.log('Upload is running');
		      break;
		  }
		}, function(error) {
		  makeToast(error.message);
		}, function() {
	      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
	        var date = new Date();
			var strDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
			var current_time = date.getHours() + ":" + date.getMinutes();
			messages_database.child(currentuserId).child(chatuserId).child(pushId).update({
				date: strDate,
				from: currentuserId,
				message: downloadURL,
				push_id: pushId + "_" + file.name,
				time: current_time,
				timestamp: firebase.database.ServerValue.TIMESTAMP,
				type: "file"
			});
			messages_database.child(chatuserId).child(currentuserId).child(pushId).update({
				date: strDate,
				from: currentuserId,
				message: downloadURL,
				push_id: pushId + "_" + file.name,
				time: current_time,
				timestamp: firebase.database.ServerValue.TIMESTAMP,
				type: "file"
			});
	      });
	    });
    }
    $("#add-btn-drawer").attr("style", "display: none");
	$("#openDawer").attr("style", "display: block");
	$("#message-typed").attr("style", "display: block");
	$("#sendMessage").attr("style", "display: block");
}

async function uploadImage(event) {
  var file = event.files[0];
  if(!file.type.match("image.*")) {
    makeToast("select image only");
  }else if(currentuserId != "" && chatuserId != "") {
  	var pushId = messages_database.child(currentuserId).child(chatuserId).push().key;
    var uploadTask = firebase.storage().ref().child("message_images").child(pushId + ".jpg").put(file);
    uploadTask.on('state_changed',  function(snapshot) {
		var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
	  console.log('Upload is ' + progress + '% done');
	  switch (snapshot.state) {
	    case firebase.storage.TaskState.PAUSED: console.log('Upload is paused');
	      break;
	    case firebase.storage.TaskState.RUNNING: console.log('Upload is running');
	      break;
	  }
	}, function(error) {
	 makeToast(error.message);
	}, function() {
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        var date = new Date();
		var strDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
		var current_time = date.getHours() + ":" + date.getMinutes();
		messages_database.child(currentuserId).child(chatuserId).child(pushId).update({
			date: strDate,
			from: currentuserId,
			message: downloadURL,
			push_id: pushId,
			time: current_time,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			type: "image"
		});
		messages_database.child(chatuserId).child(currentuserId).child(pushId).update({
			date: strDate,
			from: currentuserId,
			message: downloadURL,
			push_id: pushId,
			time: current_time,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			type: "image"
		});
      });
    });
  }
	$("#add-btn-drawer").attr("style", "display: none");
	$("#openDawer").attr("style", "display: block");
	$("#message-typed").attr("style", "display: block");
	$("#sendMessage").attr("style", "display: block");
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

function getFileName(push_id) {
	var index = push_id.lastIndexOf('_');
	var filename = push_id.substring(index+1);
	return filename;
}

function getId(push_id) {
	var index = push_id.lastIndexOf('_');
	var id = push_id.substring(0,index);
	return id;
}

function fileOpen(url) {
	var win = window.open(url, '_blank');
	win.focus();
}
function openLocation(location) {
	var win = window.open("https://www.google.co.in/maps/search/"+location, '_blank');
	win.focus();
}

function updateCallingDetails(currentuserId, chatuserId) {
	if(currentuserId != "" && chatuserId != "") {
		users_database.once('value', function(snapshot) {
			if(snapshot.child(currentuserId).hasChild("calling") && snapshot.child(chatuserId).hasChild("calling")) {
				var current_user_calling_status,chat_user_calling_status;
				current_user_calling_status = snapshot.child(currentuserId).child("calling").val();
				chat_user_calling_status = snapshot.child(chatuserId).child("calling").val();
				if(current_user_calling_status == "none" && chat_user_calling_status == "none") {
					var calling_pushId = firebase.database().ref().child("Calling").child(currentuserId).push().key;
					users_database.child(currentuserId).update({
						call_channel_id: calling_pushId,
						calling: chatuserId,
						type: "video"
					}).then(function() {
						users_database.child(chatuserId).update({
							call_channel_id: calling_pushId,
							calledBy: currentuserId,
							calling: currentuserId,
							type: "video"
						}).then(function() {
							firebase.database().ref().child("Calling").child(currentuserId).child(calling_pushId).update({
								from: currentuserId,
								timestamp_started: firebase.database.ServerValue.TIMESTAMP,
								type: "video" 
							}).then(function() {
								firebase.database().ref().child("Calling").child(chatuserId).child(calling_pushId).update({
									from: currentuserId,
									timestamp_started: firebase.database.ServerValue.TIMESTAMP,
									type: "video" 
								}).then(function() {
									window.location.href = 'video-call.html?' + chatuserId + "&" + calling_pushId;
								});
							});
						});
					});		
				}else {
					alert("person is on other call, plaese try again later");
				}
			}else {
				var calling_pushId = firebase.database().ref().child("Calling").child(currentuserId).push().key;
				users_database.child(currentuserId).update({
					call_channel_id: calling_pushId,
					calling: chatuserId,
					type: "video"
				}).then(function() {
					users_database.child(chatuserId).update({
						call_channel_id: calling_pushId,
						calledBy: currentuserId,
						calling: currentuserId,
						type: "video"
					}).then(function() {
						firebase.database().ref().child("Calling").child(currentuserId).child(calling_pushId).update({
							from: currentuserId,
							timestamp_started: firebase.database.ServerValue.TIMESTAMP,
							type: "video" 
						}).then(function() {
							firebase.database().ref().child("Calling").child(chatuserId).child(calling_pushId).update({
								from: currentuserId,
								timestamp_started: firebase.database.ServerValue.TIMESTAMP,
								type: "video" 
							}).then(function() {
								window.location.href = 'video-call.html?' + chatuserId + "&" + calling_pushId;
							});
						});
					});
				});		
			}
		})
	}
}

function checkCall(currentuserId) {
  firebase.database().ref().child("Users").child(currentuserId).on("value", function(snapshot) {
    var calledBy = snapshot.child("calledBy").val();
    var type = snapshot.child("type").val();
    var call_channel = snapshot.child("call_channel_id").val();
    if(calledBy != "none" && type != "none" && call_channel != "none" && boolCalling != true) {
      window.location.href = "call-receive.html?" + calledBy + "&" + call_channel;
    }
  });
}

setTimeout(function(){
	getArrowoption();
	boolChatoptionloader = true;
}, 6000);

function getArrowoption() {	
	$(".message-box").mouseenter(function() {
		var messageId = $(this).parent().attr("id");
		$("#" + messageId).children(".option-arrow").show();
	}).mouseleave(function() {
		var messageId = $(this).parent().attr("id");
		$("#" + messageId).children(".option-arrow").hover(function() {
			$("#" + messageId).children(".option-arrow").show();
		});
		$(".option-arrow").attr("style", "display: none;");
	});
	$(".option-arrow").click(function() {
		var messageId = $(this).parent().attr("id");
		if($(window).width() > 500) {
			if(messageId == lastMessageId) {
				$(".inputer").css("z-index", "-1");
			}
			if(!$("#option-box"+messageId).length > 0) {
				makeOptions(messageId);
				setTimeout(function() {
					$("#option-box"+messageId).attr("style", "display: none;");
					$(".inputer").css("z-index", "1");
				}, 15000);
			}else if(!$("#option-box"+messageId).attr("style") || $("#option-box"+messageId).attr("style") == "display: block;"){
				$("#option-box"+messageId).attr("style", "display: none;");
				$(".inputer").css("z-index", "1");
			}else if($("#option-box"+messageId).attr("style") == "display: none;") {
				$("#option-box"+messageId).attr("style", "display: block;");
				setTimeout(function() {
					$("#option-box"+messageId).attr("style", "display: none;");
					$(".inputer").css("z-index", "1");
				}, 15000);
			}
		}else {
			$(".chat-page-option-bar").css("z-index", "1");
			$(".delete-option").click(function() {
				mdelete(messageId);
				$(".option-arrow").attr("style", "display: none;");
			});
			$(".copy-option").click(function() {
				copy(messageId);
				$(".option-arrow").attr("style", "display: none;");
			});
			$(".forward-option").click(function() {
				forward(messageId);
				$(".option-arrow").attr("style", "display: none;");
			});
			$(".reply-option").click(function() {
				reply(messageId);
				$(".option-arrow").attr("style", "display: none;");
			});
		}	
	});
	$("#message-list li").mouseenter(function() {
		var messageId = $(this).attr("id");
		$("#"+ messageId+" .option-reply").show();
		$("#"+ messageId+" .option-forward").show();
	}).mouseleave(function() {
		var messageId = $(this).attr("id");
		$("#"+ messageId+" .option-reply").hide();
		$("#"+ messageId+" .option-forward").hide();
	});

	$(".option-reply").click(function() {
		var messageId = $(this).parent().attr("id");
		reply(messageId);
	});
	$(".option-forward").click(function() {
		var messageId = $(this).parent().attr("id");
		forward(messageId);
	});
}

function getmoreArrowoption() {	
	$(".message-box").mouseenter(function() {
		var messageId = $(this).parent().attr("id");
		$("#" + messageId).children(".option-arrow").show();
	}).mouseleave(function() {
		var messageId = $(this).parent().attr("id");
		$("#" + messageId).children(".option-arrow").hover(function() {
			$("#" + messageId).children(".option-arrow").show();
		});
		$(".option-arrow").attr("style", "display: none;");
	});
	$(".option-arrow").click(function() {
		var messageId = $(this).parent().attr("id");
		if($(window).width() > 500) {
			if(messageId == lastMessageId) {
				$(".inputer").css("z-index", "-1");
			}
			if(!$("#option-box"+messageId).length > 0) {
				makeOptions(messageId);
				setTimeout(function() {
					$("#option-box"+messageId).attr("style", "display: none;");
					$(".inputer").css("z-index", "1");
				}, 15000);
			}else if(!$("#option-box"+messageId).attr("style") || $("#option-box"+messageId).attr("style") == "display: block;"){
				$("#option-box"+messageId).attr("style", "display: none;");
				$(".inputer").css("z-index", "1");
			}else if($("#option-box"+messageId).attr("style") == "display: none;") {
				$("#option-box"+messageId).attr("style", "display: block;");
				setTimeout(function() {
					$("#option-box"+messageId).attr("style", "display: none;");
					$(".inputer").css("z-index", "1");
				}, 15000);
			}
		}else {
			$(".chat-page-option-bar").css("z-index", "1");
			$(".delete-option").click(function() {
				mdelete(messageId);
				$(".option-arrow").attr("style", "display: none;");
			});
			$(".copy-option").click(function() {
				copy(messageId);
				$(".option-arrow").attr("style", "display: none;");
			});
			$(".forward-option").click(function() {
				forward(messageId);
				$(".option-arrow").attr("style", "display: none;");
			});
			$(".reply-option").click(function() {
				reply(messageId);
				$(".option-arrow").attr("style", "display: none;");
			});
		}	
	});
	$("#message-list li").mouseenter(function() {
		var messageId = $(this).attr("id");
		$("#"+ messageId+" .option-reply").show();
		$("#"+ messageId+" .option-forward").show();
	}).mouseleave(function() {
		var messageId = $(this).attr("id");
		$("#"+ messageId+" .option-reply").hide();
		$("#"+ messageId+" .option-forward").hide();
	});

	$(".option-reply").click(function() {
		var messageId = $(this).parent().attr("id");
		reply(messageId);
	});
	$(".option-forward").click(function() {
		var messageId = $(this).parent().attr("id");
		forward(messageId);
	});

	setTimeout(function(){
		getArrowoption();
		boolChatoptionloader = true;
	}, 6000);
}

function makeOptions(messageId) {
	var divbox = document.createElement("div");
	var list = document.createElement("ul");
	var link1 = document.createElement("li");
	var link2 = document.createElement("li");
	var link3 = document.createElement("li");
	var link4 = document.createElement("li");
	var link5 = document.createElement("li");
	divbox.setAttribute("class", "option-box");
	divbox.setAttribute("id", "option-box"+messageId);
	link1.appendChild(document.createTextNode("reply"));
	link2.appendChild(document.createTextNode("forward"));
	link3.appendChild(document.createTextNode("copy"));
	link4.appendChild(document.createTextNode("delete"));
	link5.appendChild(document.createTextNode("cancel"));
	link1.setAttribute("onclick", "reply('" + messageId + "')");
	link2.setAttribute("onclick", "forward('" + messageId + "')");
	link3.setAttribute("onclick", "copy('" + messageId + "')");
	link4.setAttribute("onclick", "mdelete('" + messageId + "')");
	link5.setAttribute("onclick", "cancle('" + messageId + "')");
	list.appendChild(link1);
	list.appendChild(link2);
	list.appendChild(link3);
	list.appendChild(link4);
	list.appendChild(link5);
	divbox.appendChild(list);
	document.getElementById(messageId).appendChild(divbox);
}

function reply(messageId) {

	$(".chat-page-option-bar").css("z-index", "-1");
}
function forward(messageId) {
	window.location.href = "friends.html?"+chatuserId + "&"+messageId;
	$(".chat-page-option-bar").css("z-index", "-1");
}
function copy(messageId) {
	var text = "";
	messages_database.child(currentuserId).child(chatuserId).child(messageId).once("value", function(snapshot) {
		text = snapshot.child("message").val();
	});
	if(text != "") {
		var textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.top = "0";
	    textArea.style.left = "0";
	    textArea.style.position = "fixed";
	    document.body.appendChild(textArea);
	    textArea.focus();
	    textArea.select();
	    document.execCommand('copy');
	    document.body.removeChild(textArea);
	}
	$("#option-box"+messageId).attr("style", "display: none;");
	$(".inputer").css("z-index", "1");
	$(".chat-page-option-bar").css("z-index", "-1");
}
function mdelete(messageId) {
	if(currentuserId != "" && chatuserId != "") {
		messages_database.child(currentuserId).child(chatuserId).child(messageId).remove();
	}
	$(".chat-page-option-bar").css("z-index", "-1");
}
function cancle(messageId) {
	$("#option-box"+messageId).attr("style", "display: none;");
	$(".inputer").css("z-index", "1");
}

$("#sticker").click(function() {
	if(boolStickerBox){
		if($(window).width() > 500) {
			$("#sticker-box").hide();
			$(".inputer").css("bottom","0");
			$("#message-list").css("padding-bottom", "55px");
			boolStickerBox = false;
			$("#message-typed").focus();
		}else {
			$("#sticker-box").hide();
			$(".inputer").css("bottom","0");
			$("#message-list").css("padding-bottom", "55px");
			boolStickerBox = false;
			$("#message-typed").focus();
		}
	}else {
		if($(window).width() > 500) {
			$("#sticker-box").show().css("bottom", "50px");
			$("#message-list").css("padding-bottom", "325px"); //355
			window.scrollTo(0, listSize*100);
			$("#sticker-box").focus();
			boolStickerBox = true;
		}else {
			$("#sticker-box").show().css("bottom","0");
			$(".inputer").css("bottom","270px");
			$("#message-list").css("padding-bottom", "325px"); //355
			window.scrollTo(0, listSize*100);
			$("#sticker-box").focus();
			boolStickerBox = true;
		}
	}
});

function makeStikerList() {
	var fileName = ["baby","actors","emoji","faces","hike","iphone","meme","unknown"];
	for (var i = 0; i < fileName.length; i++) {
		var link = document.createElement("li"); 
		var img = document.createElement("img"); 
		img.setAttribute("src" , "sticker/"+fileName[i]+"/1.webp");
		img.setAttribute("id", fileName[i]);
		img.setAttribute("class", "sticker-tab-img");
		img.setAttribute("onclick", "makeStikerPageList('"+fileName[i]+"')");
		link.appendChild(img);
		document.getElementById("sticker-list").appendChild(link);
	}
}
function makeStikerPageList(lname) {
	var size = fileSize[lname];
	$("#sticker-list-page").empty();
	var fileName = ["actors","baby","emoji","faces","hike","iphone","meme","unknown"];
	for (var i = 0; i < fileName.length; i++) {
		$("#sticker-list li #"+fileName[i]).css("background-color", "transparent");
	}
	$("#sticker-list li #"+lname).css("background-color", "#fff");
	for (var i = 1; i <= size; i++) {
		var link = document.createElement("li"); 
		var img = document.createElement("img");
		img.setAttribute("class", "sticker-img");
		img.setAttribute("src", "sticker/"+lname+"/"+i+".webp");
		img.setAttribute("onclick", "sendSticker('"+lname+"',"+i+")");
		link.appendChild(img);
		document.getElementById("sticker-list-page").appendChild(link);
	}
}

function sendSticker(lname,position) {
	if(currentuserId != "" && chatuserId != "") {
		var pushId = messages_database.child(currentuserId).child(chatuserId).push().key;
		var date = new Date();
		var strDate = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
		var current_time = date.getHours() + ":" + date.getMinutes();
		messages_database.child(currentuserId).child(chatuserId).child(pushId).update({
			date: strDate,
			from: currentuserId,
			message: lname+"+"+position,
			push_id: pushId,
			time: current_time,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			type: "sticker"
		});
		messages_database.child(chatuserId).child(currentuserId).child(pushId).update({
			date: strDate,
			from: currentuserId,
			message: lname+"+"+position,
			push_id: pushId,
			time: current_time,
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			type: "sticker"
		});
	}
}

function makeToast(text) {
  $(".toast").show();
  $("#toast-text").text(text);
  setTimeout(function() {
    $(".toast").hide();
  }, 3000);
}

function backoptionfun() {
	$(".chat-page-option-bar").css("z-index", "-1");
}