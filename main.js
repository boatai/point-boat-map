var map;
var points;
fetch('points.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(pointsJson){
        points = pointsJson;
        // console.log(pointsJson)
        main();
    })



function main() {
    console.log(points.points[0]);

    for (location in points){
        console.log(location)
    };
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.373, lng: 4.874},
        zoom: 15
    });
}