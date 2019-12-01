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

	reinit: function(){
  		$('select').formSelect();
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
		self = this;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
		  var content = document.querySelector("#body-content");
		  if (this.status == 200) {
		    content.innerHTML = xhttp.responseText;
		    self.reinit();
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

		$('body').on('click' , '#load-league' , function(){
			idLeague = $("#select-league").val();
			$.ajax({
	            url: 'https://api.football-data.org/v2/competitions/'+idLeague+'/standings',
	            type: 'GET',
	            dataType: 'json',
	            headers: {
	                'X-Auth-Token': '41998c78d52e4bf588634a956b0aa17e'
	            },
	            success: function (result) {
	            	self.renderTableStanding(result);
	            },
	            error: function (error) {
	               alert('League Not Avaiable !')
	            }
        	});
		})


		$('body').on('click' , '.show-detail-team' , function(e){
			e.preventDefault();
			idTeam = $(this).attr("data-id");

			$.ajax({
	            url: 'https://api.football-data.org/v2/teams/'+idTeam,
	            type: 'GET',
	            dataType: 'json',
	            headers: {
	                'X-Auth-Token': '41998c78d52e4bf588634a956b0aa17e'
	            },
	            success: function (result) {
	            	// console.log(result);
	            	self.renderModalDetailTeam(result);
    				$("#detail-team-modal").modal("open");
	            },
	            error: function (error) {
	               alert('err !')
	            }
        	});
		})

	},

	renderTableStanding: function(data){
		try{
			standing  = data.standings[0].table;
			limit     = 10;
			i         = 0;
			tableData = []; rowData = []; tr = "";
			$.each(standing , function(key , row){
				rowData['position'] = row.position;
				rowData['team_id'] = row.team.id;
				rowData['team_name'] = row.team.name;
				rowData['img_url'] = row.team.crestUrl;
				rowData['points'] = row.points;
				tr += 	'<tr>\
						<td>'+rowData['position']+'</td>\
						<td>'+rowData['team_name']+'</td>\
						<td>'+rowData['points']+'</td>\
						<td><a href="" class="waves-effect waves-light btn show-detail-team" data-id="'+rowData['team_id']+'"><i style="margin-right:0px" class="material-icons left">remove_red_eye</i></a></td>\
					</tr>';
				i++;
				tableData.push(rowData);
			})

			$("#standing-table tbody").html(tr);
			
			console.log(tableData);
		}catch(e){
			alert(e);
		}
	},

	renderModalDetailTeam: function(data){
		try{
			tableData = []; tr = "";
			rowData = {
				'name'       : data.name,
				'address'    : data.address,
				'phone'      : data.phone,
				'website'    : data.website,
				'founded'    : data.founded,
				'clubColors' : data.clubColors,
				'venue'      : data.venue,
			}


			$.each(rowData , function(key , value){
				tr += 	'<tr>\
					<th>'+key+'</th>\
					<td>'+value+'</td>\
				</tr>';
			})
			$("#detail-team-table-info").html(tr);
		}catch(e){
			alert(e);
		}
	}
}


$(function(){
	$('.modal').modal();
	blog.init();


})