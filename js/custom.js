var blog = {
	init : function(){
		this.initSidebar();
		this.loadNav();
		this.initPage();
		this.initSW();
		this.eventHandler();
		this.initIdb();
	},

	initIdb : function(){
		var dbPromise = idb.open("mydatabase", 1, function(upgradeDb) {
		if (!upgradeDb.objectStoreNames.contains("events")) {
			upgradeDb.createObjectStore("events");
			}
		});
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
		    if(pages == "list_competition"){
		    	self.loadListCompetition();
		    }
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
			$(".preloader-wrapper").addClass("active");	
			$.ajax({
	            url: 'https://api.football-data.org/v2/competitions/'+idLeague+'/standings',
	            type: 'GET',
	            dataType: 'json',
	            headers: {
	                'X-Auth-Token': '41998c78d52e4bf588634a956b0aa17e'
	            },
	            success: function (result) {
	            	self.renderTableStanding(result);
    				$(".preloader-wrapper").removeClass("active");	
	            },
	            error: function (error) {
	               alert('League Not Avaiable !');
           			$(".preloader-wrapper").removeClass("active");	
	            }
        	});
		})


		$('body').on('click' , '.show-detail-team' , function(e){
			e.preventDefault();
			idTeam = $(this).attr("data-id");
			$(".preloader-wrapper").addClass("active");	
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
					$(".preloader-wrapper").removeClass("active");	
	            },
	            error: function (error) {
	               alert('err !');
           			$(".preloader-wrapper").removeClass("active");	
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
						<td>\
							<a href="" class="waves-effect waves-light btn show-detail-team btn-small" data-id="'+rowData['team_id']+'"><i style="margin-right:0px" class="material-icons left">remove_red_eye</i></a>\
							<a href="" class="waves-effect waves-light yellow darken-2 btn show-detail-team btn-small" data-id="'+rowData['team_id']+'"><i style="margin-right:0px" class="material-icons left">star_border</i></a>\
						</td>\
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
	},

	renderTableCompetition: function(data){
		try{
			competitions  = data.competitions;	
			tableData = []; rowData = []; tr = "";
			$.each(competitions , function(key , row){
				rowData['country_name'] = row.area.name;
				rowData['competition_name'] = row.name;
				// console.log(row.name);
				if(row.currentSeason != null){	
					rowData['start_date'] = (row.currentSeason.startDate == null) ? "-" : row.currentSeason.startDate;
					rowData['end_date'] = (row.currentSeason.endDate == null) ? "-" : row.currentSeason.endDate;	
					if(row.currentSeason.winner != null){
						rowData['winner'] = (row.currentSeason.winner.name == null) ? "-" : row.currentSeason.winner.name;
					}else{
						rowData['winner'] = "-";						
					}		
				}else{
					rowData['start_date'] = "-";
					rowData['end_date'] = "-";
					rowData['winner'] = "-";
				}
				
				tr += 	'<tr>\
						<td>'+rowData['country_name']+'</td>\
						<td>'+rowData['competition_name']+'</td>\
						<td>'+rowData['start_date']+'</td>\
						<td>'+rowData['end_date']+'</td>\
						<td>'+rowData['winner']+'</td>\
					</tr>';
				// i++;
			})

			$("#competition-table tbody").html(tr);
			
			// console.log(rowData);
		}catch(e){
			alert(e);
		}
	},

	loadListCompetition : function(){	
		$(".preloader-wrapper").addClass("active");	
		$.ajax({
            url: 'https://api.football-data.org/v2/competitions',
            type: 'GET',
            dataType: 'json',
            headers: {
                'X-Auth-Token': '41998c78d52e4bf588634a956b0aa17e'
            },
            success: function (result) {
            	self.renderTableCompetition(result);
           		$(".preloader-wrapper").removeClass("active");	
            },
            error: function (error) {
               alert('err !')
            }
    	});
	}


}


$(function(){
	$('.modal').modal();
	blog.init();


})