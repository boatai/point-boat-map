var map;
var pointData;
const url = "./data/points.json";
var lat = 52.373;
var lng = 4.874;

var boatMarker;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: lat, lng: lng},
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
    var newLng = lng;

    function loop() {
        // console.log("boat lat: "+newLat+" lng: "+newLng)

        // newLat += 0.00001;
        // newLng += 0.00001;
        // var newLatLng = new google.maps.LatLng(newLat, newLng);
        // map.setCenter(newLatLng);
        // boatMarker.setPosition(newLatLng);

        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
}
