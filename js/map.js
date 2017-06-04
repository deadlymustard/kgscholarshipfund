function myMap() {
var mapProp= {
    center:new google.maps.LatLng(40.6062029,-75.0598688),
    zoom:7,
};
var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
}