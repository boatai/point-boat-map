var map; // make map globally accessible
const url = "./data/points.json"; //path to points.json file (can be replaced by api link later)

var boatPos = [52.373, 4.874]; // [lat, lon] position of the boat

function initMap() {
    // initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: boatPos[0], lng: boatPos[1]},
        zoom: 15
    });
    console.log("map initialized");
    map.data.loadGeoJson('data/geojson.json'); // load map markers from geojson file

    // add boat marker
    var icon = {
        url: "assets/icons/boat-marker.svg",
        scaledSize: new google.maps.Size(50, 50)
    };
    var boatMarker = new google.maps.Marker({
        position: {lat: boatPos[0], lng: boatPos[1]},
        map: map,
        icon: icon
    });

    // activate algorithm
    routeData();

    // Move the boat marker
    // var newLat = boatPos[0];
    // var newLon = boatPos[1];

    // function loop() {
    //     console.log("boat lat: "+newLat+" lon: "+newLon)

    //     newLat += 0.00001;
    //     newLon += 0.00001;
    //     var newLatLon = new google.maps.LatLon(newLat, newLon);
    //     map.setCenter(newLatLon);
    //     boatMarker.setPosition(newLatLon);

    //     window.requestAnimationFrame(loop);
    // }
    // window.requestAnimationFrame(loop);
}


// PSEUDO CODE
// 
// 1. get array with docking points (closest to the users who need to pick up a package)
// 2. calculate nearest point to the boat
// 2.1. add this point to route array
// 2.2. remove this point from points array
// 3. take the last point from route array and calculate nearest point from points array
// 4. repeat 2.1 & 2.2

// make global arrays
var points = new Array();
var route = new Array();

// 1.
// fetch dockPoints data
function routeData(){
    var routeResult;
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
                routeResult = calculateRoute(data); // call calculate function when the data is received
                drawPath(routeResult);
            });
        }
    )
    .catch(function(err) {
        console.log('Fetch Error :-S', err);
    });
}

// 2.
// calculate function to handle point to point calculation
function calculateRoute(data) {
    // get boat position
    var lat2 = boatPos[0];
    var lon2 = boatPos[1];

    // push the boat to the route array as starting point
    route.push(["boat", 0, lat2, lon2])

    // push the points from the json file to a new array
    // this format is easier to use later on in the code
    for(let point of data.points){
        let location = new Array();
        location[0] = point.title;
        // leave location[1] clear for the distance
        location[2] = point.lat;
        location[3] = point.lon;
        points.push(location);
    }
    
    // 2. & 3. loop through points and calculate distance between last route item
    while(points.length > 0){
        var lastRouteItem = route.length - 1; 
        var nextPoint = calcPoint(route[lastRouteItem]);
        // 2.1 add the nearest point to the previous point to the route array
        route.push(nextPoint);
    }

    // log the final route
    console.log("Route: ");
    console.log(route);

    return route;
}


// function that takes the current point and returns the next, 
// closest point, to itself from the remaining points in the pointsArray (2.1)
// afterwards it removes this point from the pointsArray (2.2)
function calcPoint(currentPoint) {
    var distances = new Array(); // make array for the distances
    for(let point of points){

        // call distance function
        var distance = getDistance(point[2], point[3], Number(currentPoint[2]), Number(currentPoint[3]));

        // put the distance from the boat to the point in an array
        var location = new Array();
        location[0] = point[0];
        location[1] = Number(distance)*1000; // *1000 to get meters instead of km's     
        location[2] = point[2];
        location[3] = point[3];
        distances.push(location); // add current position and distance to boat to distances array
    }

    distances.sort(compareSecondColumn); // sort the array by the distances

    var closestPoint = distances[0];   // take the lowest distance

    distances.shift(); // 2.2 remove the used point from the distances
    points = distances; // and replace the points array with the remaining items of the distances array

    return closestPoint; // return the closest point
}

// draw a line based on coordinates
function drawPath(routeResult) {
    var routePlanCoordinates = new Array();

    // add coordinates to array readable by Google maps JavaScript API
    for(var location of routeResult){
        routePlanCoordinates.push({lat: location[2], lng: location[3]})
    }
    
    // API settings
    var routePath = new google.maps.Polyline({
        path: routePlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    routePath.setMap(map); // add to map
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
