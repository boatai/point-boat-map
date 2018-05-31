var map;
var pointData;
const url = "./data/points.json";
var lat = 52.373;
var lon = 4.874;

var jsonData;

var boatPos = [lat, lon];

var boatMarker;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: lat, lng: lon},
        zoom: 15
    });
    console.log("map initialized");
    map.data.loadGeoJson('data/geojson.json');

    var icon = {
        url: "assets/icons/boat-marker.svg",
        scaledSize: new google.maps.Size(50, 50)
    };
    boatMarker = new google.maps.Marker({
        position: {lat: 52.373, lng: 4.874},
        map: map,
        icon: icon
    });
    
    var newLat = lat;
    var newLon = lon;

    function loop() {
        // console.log("boat lat: "+newLat+" lon: "+newLon)

        // newLat += 0.00001;
        // newLon += 0.00001;
        // var newLatLon = new google.maps.LatLon(newLat, newLon);
        // map.setCenter(newLatLon);
        // boatMarker.setPosition(newLatLon);

        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
}

// fetch point data
fetch('./data/points.json')
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(function(data) {
        calculate(data); // call calculate function when the data is received
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });


// calculate function to handle point to point calculation
function calculate (data) {
    // get boat position
    var lat2 = lat;
    var lon2 = lon;

    // create route array
    var route = new Array();

    // loop through points and calculate distance between points and boat
    for(var i = 0; i < data.points.length; i++){
        
        // get point coordinations
        var lat1 = data.points[i].lat;
        var lon1 = data.points[i].lon;

        // call distance function
        var distance = getDistance(lat1, lon1, lat2, lon2);

        // put the distance from the boat to the point in an array
        var location = new Array();
        location[0] = data.points[i].title;
        location[1] = Number(distance)*1000;
        route.push(location);
    }

    // sort the array by distance
    route.sort(compareSecondColumn)
    console.log(route)
}

// function to sort multidimensional array for the second column
function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

// point to point distance calculation algorithm
function getDistance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}