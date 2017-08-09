var CartoDbLib = CartoDbLib || {};
var CartoDbLib = {

  map_centroid:    [16.50,80.51],
  defaultZoom:     15,
  lastClickedLayer: null,
  locationScope:   "Guntur",
  currentPinpoint: true,
  layerUrl: '',
  protocol: 'https',
  https: true,
  tableName: 'master',
  maptiks_tracking_code: '',

  initialize: function(){

    //reset filters
    //$("#search_address").val(CartoDbLib.convertToPlainString($.address.parameter('address')));
 
	$(".plotsfilter:checkbox").attr("checked", "checked");
	$('#multiface').prop('checked', false);
    geocoder = new google.maps.Geocoder();

    // initiate leaflet map
    if (!CartoDbLib.map) {
      CartoDbLib.map = new L.Map('mapCanvas', {
		  zoomControl: false
        //center: CartoDbLib.map_centroid,
        //zoom: CartoDbLib.defaultZoom,
        //layers: CartoDbLib.basemap
     });
	 L.control.zoom({
     position:'bottomright'
	}).addTo(CartoDbLib.map);
	
	CartoDbLib.map.locate({setView: true, maxZoom: 16});
	
	//map leaflet popup adjust
	CartoDbLib.map.on('popupopen', function(e) {
    var px = CartoDbLib.map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
    px.y -= e.popup._container.clientHeight/2 // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
    CartoDbLib.map.panTo(CartoDbLib.map.unproject(px),{animate: true}); // pan to new center
	});
	//map popup adjust end
	
	//var api_key = 'pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpcGg5dDdjdDAxMmt1OW5qdzUzMWMxamUifQ.8nfM3INfFUehVzKhmNOrJQ';
	//vrecent = L.tileLayer('https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0g75k/{z}/{x}/{y}.png?access_token=' + api_key, {
    //minZoom: 1,
    //maxZoom: 19,
    //attribution: '(c) <a href="https://microsites.digitalglobe.com/interactive/basemap_vivid/">DigitalGlobe</a>'
	//})//.addTo(CartoDbLib.map);
	  
	  //var googleLayer = new L.Google('ROADMAP');
      //CartoDbLib.google = new L.Google('ROADMAP', {animate: false});
	  
	  CartoDbLib.basemap = L.tileLayer('https://www.google.co.in/maps/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}&s=Ga', {
		detectRetina: true,
		  maxNativeZoom: 25,
		  maxZoom: 30,
	  }).addTo(CartoDbLib.map);
      
	  CartoDbLib.satellite = L.tileLayer('https://www.google.co.in/maps/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga', {
		  detectRetina: true,
		  maxNativeZoom: 25,
		  maxZoom: 30
	  });//.addTo(CartoDbLib.map);
	  
      /*CartoDbLib.satellite = L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.k92mcmc8/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        detectRetina: true,
        sa_id: 'satellite'
      }).addTo(CartoDbLib.map);*/
        
      //CartoDbLib.basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
      //}).addTo(CartoDbLib.map);
	  
      CartoDbLib.baseMaps = {"Basemap": CartoDbLib.basemap, "Satellite": CartoDbLib.satellite};
      //CartoDbLib.map.addLayer(CartoDbLib.google);
	
      CartoDbLib.info = L.control({position: 'bottomleft'});
	  CartoDbLib.cinfo = L.control({position: 'bottomleft'});
      CartoDbLib.info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
          $(this._div).hide();
          return this._div;
      };
	  CartoDbLib.cinfo.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'cinfo'); // create a div with a class "info"
          $(this._div).hide();
          return this._div;
      };

      // method that we will use to update the control based on feature properties passed
      CartoDbLib.info.update = function (props) {
			var facing = "";
			if (props.northfacin>0){
				facing = facing+" North";
			}
			if (props.southfacin>0){
				facing = facing+" South";
			}
			if (props.eastfacing>0){
				facing = facing+" East";
			}
			if (props.westfacing>0){
				facing = facing+" West";
			}
			this._div.innerHTML = "<div class='legendIcon "+props.plot_spe_1+"'></div>  <b>| Plot-type: </b>"+props.plot_gener +"<b> | Plot-no: </b>" + props.plot_no+"<b> | Plot-Extent: </b>"+props.extent+"<b> | Plot-Face: </b>"+facing+"<b> | Location: </b>"+props.plot_allot+"<b> | Recommended Price:  </b> <i class='fa fa-inr' aria-hidden='true'></i>"+props.price_min+"-"+props.price_max+" /Per Sq. Yd";
        $(this._div).show();
		$('.cinfo').hide(); // to let plot supercede when there are info overlaps
      };

      CartoDbLib.info.clear = function(){
        $(this._div).hide();
      };
	CartoDbLib.info.addTo(CartoDbLib.map);
	
	      // method that we will use to update the control based on feature properties passed
      CartoDbLib.cinfo.update = function (props) {
			this._div.innerHTML = "<div class='legendIcon "+props.plot_spe_1+"'></div><b>  | Landuse-type: </b>"+props.plot_gener +"<b> | Landuse-details: </b>"+props.plot_speci+"<b> | Location: </b>"+props.plot_allot+"<b>";
        $(this._div).show();
      };

      CartoDbLib.cinfo.clear = function(){
        $(this._div).hide();
      };
	CartoDbLib.cinfo.addTo(CartoDbLib.map);

      var fields = "cartodb_id"

      cartodb.createLayer(CartoDbLib.map, CartoDbLib.layerUrl, { https: true } )
        .addTo(CartoDbLib.map)
        .done(function(layer) {
          CartoDbLib.mapdata = layer;
          var sublayer = layer.getSubLayer(0);
          sublayer.setInteraction(false);
          sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
            $('#mapCanvas div').css('cursor','pointer');
            CartoDbLib.info.update(data);
          })
          sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex) {
            $('#mapCanvas div').css('cursor','inherit');
            CartoDbLib.info.clear();
          })
          sublayer.on('featureClick', function(e, latlng, pos, data){
            CartoDbLib.getOneZone(data['cartodb_id'], latlng);
          })


          // CartoDbLib.map.on('zoomstart', function(e){
          //   sublayer.hide();
          // })
          // google.maps.event.addListener(CartoDbLib.google._google, 'idle', function(e){
          //   sublayer.show();
          // })

          window.setTimeout(function(){
            if($.address.parameter('id')){
              CartoDbLib.getOneZone($.address.parameter('id'))
            }
          }, 500)

          CartoDbLib.drawLayerControl();

        }).error(function(e) {
          //console.log('ERROR')
          //console.log(e)
        }); 
		
		loadfilter().done( function() {
			CartoDbLib.map.locate({setView: true, maxZoom: 18});
		});
      }

    CartoDbLib.doSearch();
  },

  drawLayerControl: function() {
    if(
      CartoDbLib.onlylanduse
      //&& CartoDbLib.colonies
	  && CartoDbLib.layouts
	  && CartoDbLib.ringroad
    ) {
      L.control.layers(CartoDbLib.baseMaps, {
        "Surrounding Landuse": CartoDbLib.onlylanduse,
        //"Colonies": CartoDbLib.colonies,
		"layouts": CartoDbLib.layouts,
		"Ringroad": CartoDbLib.ringroad
      }, { collapsed: true, autoZIndex: false }).addTo(CartoDbLib.map);
    }
  },


  getOneZone: function(cartodb_id, click_latlng, table){
    //if (CartoDbLib.lastClickedLayer){
    //CartoDbLib.map.removeLayer(CartoDbLib.lastClickedLayer);
    //}
    if (CartoDbLib.lastClickedLayer){
    CartoDbLib.lastClickedLayer.setStyle({weight: 3, fillOpacity: 0, opacity: 1, color: '#000'})
    }
    //$.address.parameter('id', cartodb_id);
    var sql = new cartodb.SQL({user: 'dev', format: 'geojson'});
    sql.execute('select * from ' + table + ' where cartodb_id = {{cartodb_id}}', {cartodb_id:cartodb_id})
    .done(function(data){
		if (data.features[0].properties.plot_spe_1=="U2"){
			return;
		}
      var shape = data.features[0];
      CartoDbLib.lastClickedLayer = L.geoJson(shape);
      CartoDbLib.lastClickedLayer.addTo(CartoDbLib.map);
      CartoDbLib.lastClickedLayer.setStyle({weight: 3, fillOpacity: 0, opacity: 1, color: '#F00'});
      if (CartoDbLib.map.getZoom() < 16) {
      CartoDbLib.map.fitBounds(CartoDbLib.lastClickedLayer.getBounds(), {maxZoom: 16});
	  }
	  else {
		  CartoDbLib.map.setView(CartoDbLib.lastClickedLayer.getBounds().getCenter());
	  }
      // show custom popup
      var props = shape.properties;
      //console.log('props',props);
		var facing = "";
		if (props.northfacin>0){
			facing = facing+" North";
		}
		if (props.southfacin>0){
			facing = facing+" South";
		}
		if (props.eastfacing>0){
			facing = facing+" East";
		}
		if (props.westfacing>0){
			facing = facing+" West";
		}
      if ((props.plot_spe_1=="R3") || (props.plot_spe_1=="C2")){
		  
		  //get market price
		  var marketprice = "N/A";
		  if (props.marketpric>0){
			  marketprice = props.marketpric;
		  };
		  
		  //get lat long
		  var geotag = click_latlng.toString().split(",")[0].slice(0, 8)+", "+ click_latlng.toString().split(",")[1].slice(0, 8);
		  
		  //popup time
		  if (props.plot_dev_a == "CRDA") {
			  var popup_content = 
				"\
				<div id='cus-info-header-container'><img src='https://avenuein.wpengine.netdna-cdn.com/wp-content/uploads/2015/11/Logo-Avenue-Caption-White.png'></div>\
				<div id='cus-info-body-container'><b>Plot No: </b>"+props.plot_no+"<br><b>Township: </b>"+props.plot_allot+"<br><b>Plot Extent: </b>"+props.extent+" Sq. Yd<br><b>Property Type: <div class='legendIcon "+props.plot_spe_1+"'></div></b>"+" "+props.plot_gener +"<br></div>\
				<div id='cus-info-details'><div id='cus-info-details-header'><b style='color:#fff'>Sector Price Details</b></div><b>Recommended Price:  </b> <i class='fa fa-inr' aria-hidden='true'></i>"+props.price_min+"-"+props.price_max+" /Per Sq. Yd<br><b>Market Price: </b>"+marketprice +"</div>\
				<div id='cus-info-details'><div id='cus-info-details-header'><b style='color:#fff'>Construction Details</b></div><b>Maximum Built-up Area: </b>"+props.maximu_bui+" Sq. yd <br><b>Total Floor Area: </b>"+props.total_floo+" Sq. ft<br><b>No Of Floors Allowed: </b>"+props.no_of_floo+"</div>\
				<div class='cus-info-button-group'><a href='https://maps.google.com/maps?saddr=my+location&daddr="+click_latlng+"' target=_blank><div id='cus-info-button-lets-talk' class='cus-dir-button' >Take me there</div></a><div id='cus-info-button-lets-talk' class='cus-info-button' onclick='imIntrested("+props.plot_no+");'>I am interested</div></div>\
				";			  
		  }
		  else {
			  var phase = 1;
				if (props.phase>1){
			  phase = props.phase;
				};
			  
			  var popup_content = 
				"\
				<div id='cus-info-header-container'><img src='https://avenuein.wpengine.netdna-cdn.com/wp-content/uploads/2015/11/Logo-Avenue-Caption-White.png'></div>\
				<div id='cus-info-body-container'><b>Plot No: </b>"+props.plot_no+"<br><b>Layout: </b>"+props.plot_allot+"<br><b>Plot Extent: </b>"+props.extent+" Sq. Yd<br><b>Property Type: <div class='legendIcon "+props.plot_spe_1+"'></div></b>"+" "+props.plot_gener +"<br><b>Layout Plot No: </b>"+props.plot_no_la+"<br><b>Plot Phase: </b>"+phase+" Phase<br></div>\
				<div id='cus-info-details'><div id='cus-info-details-header'><b style='color:#fff'>Layout Price Details</b></div><b>Price:  </b> <i class='fa fa-inr' aria-hidden='true'></i>"+marketprice +"/Per Sq. Yd</div>\
				<div class='cus-info-button-group'><a href='https://maps.google.com/maps?saddr=my+location&daddr="+click_latlng+"' target=_blank><div id='cus-info-button-lets-talk' class='cus-dir-button' >Take me there</div></a><div id='cus-info-button-lets-talk' class='cus-info-button' onclick='imIntrested("+props.plot_no+");'>I am interested</div></div>\
				";		  
		  }

	  }
	  else {
		  var popup_content = 
			"\
			<div id='cus-info-header-container'><img src='https://avenuein.wpengine.netdna-cdn.com/wp-content/uploads/2015/11/Logo-Avenue-Caption-White.png'></div>\
			<div id='cus-info-body-container'><b>Landuse Type: </b>"+props.plot_gener +"<br><b>Landuse Details: </b><div class='legendIcon "+props.plot_spe_1+"'></div></b>"+" "+props.plot_speci+"<div>\
			";
	  }
		//<b>Plot No:</b>"+"26083"+"<br><b>Township:</b> Velagapudi<br><b>Plot Extent:</b> 1000 Sq. Yd<br><b>Property Type:</b> Residential<br><div id="cus-info-details"><div id="cus-info-details-header"><b style="color:#fff">Sector Price Details</b></div><b>Recommended Price: </b>  14,000 - 14,000/Per Sq. Yd<br><b>Market Price: </b> N/A<div id="cus-info-details-header"><b style="color:#fff">Construction Details</b></div><b>Maximum Built-up Area: </b> 600 Sq. yd <br><b>Total Floor Area: </b> 19,800 Sq. ft <br><b>No Of Floors Allowed: </b> 5<br></div><div class="cus-info-button-group"><div id="cus-info-button-lets-talk" class="cus-info-button" onclick="imIntrested(26083);">I am interested</div></div></div>
 
      // if (zone_info.project_link != "")
      //   popup_content += "<p><a target='_blank' href='" + zone_info.project_link + "'>Read the full development plan for " + props.zone_class + "&nbsp;»</a></p>"

      if (click_latlng) {
        CartoDbLib.popup = L.popup()
        .setContent(popup_content)
        .setLatLng(click_latlng)
        .openOn(CartoDbLib.map);
      }
      else {
        CartoDbLib.lastClickedLayer.bindPopup(popup_content);
        CartoDbLib.lastClickedLayer.openPopup();
      }

    }).error(function(e){console.log(e)});
  },

  doSearch: function() {
    CartoDbLib.clearSearch();
    var address = $("#search_address").val();
    
    if (address != "") {
      if (address.toLowerCase().indexOf(CartoDbLib.locationScope) == -1)
        address = address + " " + CartoDbLib.locationScope;
      
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          CartoDbLib.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
          $.address.parameter('address', encodeURIComponent(address));
          CartoDbLib.map.setView(new L.LatLng( CartoDbLib.currentPinpoint[0], CartoDbLib.currentPinpoint[1] ), 16)
          CartoDbLib.centerMark = new L.Marker(CartoDbLib.currentPinpoint, { icon: (new L.Icon({
            iconUrl: 'https://avenuein.staging.wpengine.com/wp-content/themes/wpresidence-child/amaravati-plots-layout/images/blue-pushpin.png',
            iconSize: [32, 32],
            iconAnchor: [10, 32]
          }))}).addTo(CartoDbLib.map);

          var sql = new cartodb.SQL({user: 'dev', format: 'geojson'});
          sql.execute('select cartodb_id, the_geom from landuse where ST_Intersects( the_geom, ST_SetSRID(ST_POINT({{lng}}, {{lat}}) , 4326))', {lng:CartoDbLib.currentPinpoint[1], lat:CartoDbLib.currentPinpoint[0]})
          .done(function(data){
          //CartoDbLib.getOneZone(data.features[0].properties.cartodb_id, CartoDbLib.currentPinpoint)
          }).error(function(e){console.log(e)});

          CartoDbLib.drawCircle(CartoDbLib.currentPinpoint);
        } 
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else { //search without geocoding callback
      CartoDbLib.map.setView(new L.LatLng( CartoDbLib.map_centroid[0], CartoDbLib.map_centroid[1] ), CartoDbLib.defaultZoom)
    }
  },

  clearSearch: function(){
    if (CartoDbLib.lastClickedLayer) {
      CartoDbLib.map.removeLayer(CartoDbLib.lastClickedLayer);
    }
    if (CartoDbLib.centerMark)
      CartoDbLib.map.removeLayer( CartoDbLib.centerMark );
    if (CartoDbLib.circle)
      CartoDbLib.map.removeLayer( CartoDbLib.circle );

    CartoDbLib.map.setView(new L.LatLng( CartoDbLib.map_centroid[0], CartoDbLib.map_centroid[1] ), CartoDbLib.defaultZoom)
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var foundLocation;
    
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        CartoDbLib.addrFromLatLng(foundLocation);
      }, null);
    }
    else {
      alert("Sorry, we could not find your location.");
    }
  },
  
  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search_address').val(results[1].formatted_address);
          $('.hint').focus();
          CartoDbLib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
    return decodeURIComponent(text);
  }
}

$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 120; // Calculate the top offset

  //$('#mapCanvas').css('height', (h - offsetTop));
  var widthl = $('#accordion-left').width();
  //console.log(widthl);
  $('#panel-heading-left').css('width', widthl);
  var widthr = $('#accordion-right').width();
  //console.log(widthr);
  $('#panel-heading-right').css('width', widthr);
}).resize();

$(function() {
  $('label.checkbox.inline').popover({
    delay: { show: 300, hide: 100 }
  });


  CartoDbLib.initialize();
  var autocomplete = new google.maps.places.Autocomplete(document.getElementById('search_address'));

 // $(':checkbox').click(function(){
 //   CartoDbLib.doSearch();
//  });

  $('#btnSearch').click(function(){
    CartoDbLib.doSearch();
  });

  $('#findMe').click(function(){
    CartoDbLib.findMe();
    return false;
  });

  $('#reset').click(function(){
    $.address.parameter('address','');
    $.address.parameter('radius','');
    $.address.parameter('id','');
    CartoDbLib.initialize();
    return false;
  });

  $("#search_address").keydown(function(e){
      var key =  e.keyCode ? e.keyCode : e.which;
      if(key == 13) {
          $('#btnSearch').click();
          return false;
      }
  });

  $('.simcopter').click(function(e){
    //console.log('simcopter!');
    return false;
  });

  $('.yay-link').click(function(e){
    var location = $(this).attr('href');
    setTimeout(
      function(){
        window.location = location;
      },3000)
    e.preventDefault();
  });

  $('#close_info').click(function(){
    $('#a_info_accordion').click();
  });

  $('.zones label').popover({trigger: "hover", placement: "top"})

});

