var blog = {
	api_url : "https://api.football-data.org/",

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
		if (!upgradeDb.objectStoreNames.contains("team_fav")) {
			// upgradeDb.createObjectStore("events");
			var teamDB = upgradeDb.createObjectStore('team_fav', {keyPath: 'id_team'});
			teamDB.createIndex("id_team", "id_team", { unique: true });
			teamDB.createIndex("team_name", "team_name", { unique: false });
			teamDB.createIndex("created", "created", { unique: false });
			}
		});

		
	},

	initSW:function(){
		if ("serviceWorker" in navigator) {
			registerServiceWorker();
      		requestPermission();
		} else {
			console.log("Your browser is not supported SW");
		}

		// Register service worker
		function registerServiceWorker() {
			return navigator.serviceWorker.register('service-worker.js')
			  .then(function (registration) {
				console.log('Registrasi service worker berhasil.');
				return registration;
			  })
			  .catch(function (err) {
				console.error('Registrasi service worker gagal.', err);
			  });
		}

		function requestPermission() {
			if ('Notification' in window) {
			  Notification.requestPermission().then(function (result) {
				if (result === "denied") {
				  console.log("Fitur notifikasi tidak diijinkan.");
				  return;
				} else if (result === "default") {
				  console.error("Pengguna menutup kotak dialog permintaan ijin.");
				  return;
				}
				
				if (('PushManager' in window)) {
					navigator.serviceWorker.getRegistration().then(function(registration) {
						registration.pushManager.subscribe({
							userVisibleOnly: true,
							applicationServerKey: urlBase64ToUint8Array("BFXF8ujq08jzPiIuqVbzzKicwXUaDaVaXkWkqQWuJsP3m94mpHNStzjuuIKwmlYHFOnNHO6nFd0-NAirpsesb14"),
						}).then(function(subscribe) {
							console.log('Berhasil melakukan subscribe dengan endpoint: ', subscribe.endpoint);
							console.log('Berhasil melakukan subscribe dengan p256dh key: ', btoa(String.fromCharCode.apply(
								null, new Uint8Array(subscribe.getKey('p256dh')))));
							console.log('Berhasil melakukan subscribe dengan auth key: ', btoa(String.fromCharCode.apply(
								null, new Uint8Array(subscribe.getKey('auth')))));
						}).catch(function(e) {
							console.error('Tidak dapat melakukan subscribe ', e.message);
						});
					});
				}
			  });
			}
		}

		function urlBase64ToUint8Array(base64String) {
			const padding = '='.repeat((4 - base64String.length % 4) % 4);
			const base64 = (base64String + padding)
				.replace(/-/g, '+')
				.replace(/_/g, '/');
			const rawData = window.atob(base64);
			const outputArray = new Uint8Array(rawData.length);
			for (let i = 0; i < rawData.length; ++i) {
				outputArray[i] = rawData.charCodeAt(i);
			}
			return outputArray;
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
		    }else if(pages == "favorite_team"){
				self.loadListIdxDB();
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
			if ('caches' in window) {
		    caches.match(self.api_url + 'v2/competitions/'+idLeague+'/standings').then(function(response) {
					if (response) {
						 response.json().then(function (data) {
						 	self.renderTableStanding(data);
		           			$(".preloader-wrapper").removeClass("active");
						 })
					}
				})
			}
			$.ajax({
	            url: self.api_url + 'v2/competitions/'+idLeague+'/standings',
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
	                // alert('League Not Avaiable !');
           			$(".preloader-wrapper").removeClass("active");	
	            }
        	});
		})


		$('body').on('click' , '.show-detail-team' , function(e){
			e.preventDefault();
			idTeam = $(this).attr("data-id");
			$(".preloader-wrapper").addClass("active");	

			if ('caches' in window) {
		    caches.match(self.api_url + 'v2/teams/'+idTeam).then(function(response) {
					if (response) {
						 response.json().then(function (data) {
						 	self.renderModalDetailTeam(data);
	 	    				$("#detail-team-modal").modal("open");
		           			$(".preloader-wrapper").removeClass("active");
						 })
					}
				})
			}

			$.ajax({
	            url: self.api_url + 'v2/teams/'+idTeam,
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
	               // alert('err !');
           			$(".preloader-wrapper").removeClass("active");	
	            }
        	});
		})

		$('body').on('click' , '.add-fav-team' , function(e){
			e.preventDefault();
			idTeam = $(this).attr("data-id");
			teamName = $(this).parents("tr").find(".team-name").html();
			// $(".preloader-wrapper").addClass("active");	

			var dbPromise = idb.open("mydatabase", 1, function(upgradeDb) {
				if (!upgradeDb.objectStoreNames.contains("team_fav")) {
					
					}
				});
	
			dbPromise.then(function(db) {
				var tx = db.transaction('team_fav', 'readwrite');
				var team = tx.objectStore('team_fav');
				var item = {
					id_team: idTeam,
					team_name : teamName,
					created: new Date().getTime()
				};
				team.add(item); //menambahkan key "buku"
				return tx.complete;
			}).then(function() {
				$(".preloader-wrapper").removeClass("active");	
				alert(teamName + ' Has been added!');
			}).catch(function(e) {
				$(".preloader-wrapper").removeClass("active");	
				alert('Failed To Add Team!');
			})
		})


		$('body').on('click' , '.remove-fav-team' , function(e){
			e.preventDefault();
			idTeam = $(this).attr("data-id");
			var dbPromise = idb.open("mydatabase", 1, function(upgradeDb) {
				if (!upgradeDb.objectStoreNames.contains("team_fav")) {
					
				}
			});

			dbPromise.then(function(db) {
				var tx = db.transaction('team_fav', 'readwrite');
				var teams = tx.objectStore('team_fav');
				teams.delete(idTeam);
				return tx.complete;
			}).then(function() {
				self.loadListIdxDB();
				alert('Team Has Been Deleted');
			}).catch(function(){
				alert('Error On Delete')
			});
			// console.log(idTeam);
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
						<td class="team-name">'+rowData['team_name']+'</td>\
						<td>'+rowData['points']+'</td>\
						<td>\
							<a href="" class="waves-effect waves-light btn show-detail-team btn-small" data-id="'+rowData['team_id']+'"><i style="margin-right:0px" class="material-icons left">remove_red_eye</i></a>\
							<a href="" class="waves-effect waves-light yellow darken-2 btn add-fav-team btn-small" data-id="'+rowData['team_id']+'"><i style="margin-right:0px" class="material-icons left">star_border</i></a>\
						</td>\
					</tr>';
				i++;
				tableData.push(rowData);
			})

			$("#standing-table tbody").html(tr);
			
			// console.log(tableData);
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
		if ('caches' in window) {
		    caches.match(self.api_url + "v2/competitions").then(function(response) {
				if (response) {
					 response.json().then(function (data) {
					 	self.renderTableCompetition(data);
	           			$(".preloader-wrapper").removeClass("active");
					 })
				}
			})
		}
		$.ajax({
            url: self.api_url + 'v2/competitions',
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
               // alert('err !')
            }
    	});
	},


	loadListIdxDB : function(){
		$("#favorite-team-table tbody").html('');
		$(".preloader-wrapper").addClass("active");	
		var dbPromise = idb.open("mydatabase", 1, function(upgradeDb) {
			if (!upgradeDb.objectStoreNames.contains("team_fav")) {
				
			}
		});
	
		dbPromise.then(function(db) {
			var tx = db.transaction('team_fav', 'readonly');
			var teams = tx.objectStore('team_fav');
			return teams.getAll();
		}).then(function(rsTeams) {
			// console.log(rsTeams);
			i = 0;
			tr = "";
			if(rsTeams.length == 0){
				alert("Favorite Team Is Empty");
				tr = '<tr>\
						<td colspan=3 style="text-align:center">empty</td>\
					</tr>';
				$(tr).appendTo($("#favorite-team-table tbody"));
			}else{
				$.each(rsTeams , function(idx , row){
				i++;
				tr += 	'<tr>\
						<td>'+i+'</td>\
						<td class="team-name">'+row['team_name']+'</td>\
						<td>\
							<a href="" class="waves-effect waves-light btn red remove-fav-team btn-small" data-id="'+row['id_team']+'"><i style="margin-right:0px" class="material-icons left">remove_circle_outline</i></a>\
						</td>\
					</tr>';
			});

			$(tr).appendTo($("#favorite-team-table tbody"));
			}
			
			$(".preloader-wrapper").removeClass("active");	

		});

	}


}


$(function(){
	$('.modal').modal();
	// $("#md1").modal("open");
	blog.init();
})