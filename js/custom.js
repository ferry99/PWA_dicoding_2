var blog = {
	init : function(){
		this.initSidebar();
		this.loadNav();
		this.initPage();
		this.initSW();
		this.eventHandler();
	},

	initSW:function(){
		if ("serviceWorker" in navigator) {
		    window.addEventListener("load", function() {
		      navigator.serviceWorker
		        .register("service-worker.js")
		        .then(function() {
		          console.log("SW has been registered");
		        })
		        .catch(function() {
		          console.log("Registration SW failed");
		        });
		    });
		} else {
			console.log("Your browser is not supported SW");
		}
	},

	initPage : function(){
		var myPage = window.location.hash.substr(1);
		if (myPage == "") myPage = "home";
		this.loadPage(myPage);
	},

	initSidebar: function(){
	    var elems = document.querySelectorAll(".sidenav");
	    M.Sidenav.init(elems);
	},

	loadNav: function(){
		self = this;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
		  if (this.status != 200) return;

		  document.querySelectorAll(".sidenav").forEach(function(elm) {
		    elm.innerHTML = xhttp.responseText;
		  });		 
		}
		};
		xhttp.open("GET", "pages/nav.html", true);
		xhttp.send();
	},

	loadPage: function(pages){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
		  var content = document.querySelector("#body-content");
		  if (this.status == 200) {
		    content.innerHTML = xhttp.responseText;
		  } else if (this.status == 404) {
		    content.innerHTML = "<p>Page not found.</p>";
		  } else {
		    content.innerHTML = "<p>Can't access Page</p>";
		  }
		}
		};
		xhttp.open("GET", "pages/" + pages + ".html", true);
		xhttp.send();
	},

	eventHandler: function(){
		self = this;
		$('body').on('click' , '.sidenav a' , function(){
			page = $(this).attr("href").substr(1);
			var windowWidth = $(window).width();
			if(windowWidth < 978){
				var instance = M.Sidenav.getInstance($(".sidenav"));
				instance.close();
			}			
			self.loadPage(page);
		})
	}
}


$(function(){
	blog.init();
})