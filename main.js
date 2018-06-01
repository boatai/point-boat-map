var map;
var pointData;
const url = "./data/points.json";

var jsonData;

var boatMarker;

var boatPos = [52.373, 4.874]; // [lat, lon]

var route = new Array();    // create route array


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: boatPos[0], lng: boatPos[1]},
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
    
    var newLat = boatPos[0];
    var newLon = boatPos[1];

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


// PSEUDO CODE
// 
// 1. get array with docking points (closest to the users who need to pick up a package)
// 2. calculate nearest point to the boat
// 2.1. add this point to route array
// 2.2. remove this point from points array
// 3. take the last point from route array and calculate nearest point from points array
// 4. repeat 2.1 & 2.2

// 1.
// fetch dockPoints data
fetch('./data/dock-points.json')
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


// 2.
// calculate function to handle point to point calculation
function calculate(data) {
    // get boat position
    var lat2 = boatPos[0];
    var lon2 = boatPos[1];

    var points = data.points;   // get the points data in own array
    var distances = new Array();// make temporary array for the distances
    console.log(points);
    // points.shift();
    // console.log(points);

    route.push(["boat", 0, lat2, lon2])
    

    // 2. loop through points and calculate distance between points and boat
    for(var i = 0; i < points.length; i++){

        // get point coordinations
        var lat1 = points[i].lat;
        var lon1 = points[i].lon;

        // call distance function
        var distance = getDistance(lat1, lon1, lat2, lon2);

        // put the distance from the boat to the point in an array
        var location = new Array();
        location[0] = points[i].title;
        location[1] = Number(distance)*1000; // *1000 to get meters instead of km's
        location[2] = lat1;
        location[3] = lon1;
        distances.push(location);

        var arrayPos = i + 1;
        if(arrayPos == points.length){
            distances.sort(compareSecondColumn)
            route.push(distances[0]);
            distances.shift();
            console.log("Distances:");
            console.log(distances);
            nextPoint(distances, route)
        }
    }

    console.log("Points:");
    console.log(points);
    console.log("Route:");
    console.log(route);
    // sort the array by distance
    // distances.sort(compareSecondColumn)
    // console.log(distances)
}

function nextPoint(distances, route) {
    var tempDistances = new Array();
    //last route point position
    var lastRouteNum = route.length - 1;
    var lastRoutePoint = route[lastRouteNum];
    var lat2 = lastRoutePoint[2];
    var lon2 = lastRoutePoint[3];
    console.log(lastRoutePoint);
    console.log(lat2)

    if(tempDistances.length <= 1) {
        route.push(tempDistances);
    } else {
        for(var i = 0; i < distances.length; i++){
            // get point coordinations
            var lat1 = distances[i][2];
            var lon1 = distances[i][3];

            // call distance function
            var distance = getDistance(lat1, lon1, lat2, lon2);

            // put the distance from the boat to the point in an array
            var location = new Array();
            location[0] = distances[i][0];
            location[1] = Number(distance)*1000; // *1000 to get meters instead of km's
            location[2] = lat1;
            location[3] = lon1;
            tempDistances.push(location);

            var arrayPos = i + 1;
            if(arrayPos == distances.length){
                tempDistances.sort(compareSecondColumn)
                route.push(tempDistances[i]);
                tempDistances.shift();
                console.log("TempDistances:");
                console.log(tempDistances);
                nextPoint(tempDistances, route)
            }
        }
    }
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

