
var locations = [
          {title: 'Chennai', location: {lat: 13.0478573, lng: 80.0689241}},
          {title: 'Bengaluru', location: {lat: 12.9542946, lng: 77.4908518}},
          {title: 'Goa', location: {lat: 15.3497393, lng: 73.4544319}},
          {title: 'Mumbai', location: {lat: 19.0830944, lng: 72.7411167}},
          {title: 'Kolkata', location: {lat: 22.6763858, lng: 88.0880551}},
          {title: 'New Delhi', location: {lat: 28.5275198, lng: 77.0688984}},
          {title: 'Agra', location: {lat: 27.1763098, lng: 77.9099723}},
          {title: 'Ooty', location: {lat: 11.4119347, lng: 76.6584019}},
          {title: 'Kanyakumari', location: {lat: 8.0864232, lng: 77.5371157}},
          {title: 'Hyderabad', location: {lat: 17.4126274, lng: 78.2679581}}
        ];

var map;

function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 20.0028039, lng: 78.0227952},
          zoom: 5,
        });
        ko.applyBindings(new viewModel());
}

var viewModel = function() {
  
  this.typedText = ko.observable('');
  this.places = ko.observableArray(locations);

  var largeInfowindow = new google.maps.InfoWindow();

this.populateMap = ko.computed(function() {
        var searchText = this.typedText().toLowerCase();
        if (!searchText) {
            return fullyPopulate();
        } else {
            return filteredMap();

        }
    });

function stringStartsWith(string, startsWith) {
    if (startsWith.length > string.length) {
        return false;
    }
    return string.substring(0, startsWith.length) === startsWith;
  }

   this.typedText = ko.observable('');
    //A ko.computed for the filtering of the list and the markers
    this.placesList = ko.computed(function(place) {
    var search = this.typedText().toLowerCase();
    //If there is nothing in the filter, return the full list and all markers are visible
    if (!search) {
      this.places().forEach(function(place) {
          place.marker.setVisible(true);
        });
      return this.places();
    //If a search is entered, compare search data to place names and show only list items and markers that match the search value
      } else {
        return ko.utils.arrayFilter(this.places(), function(place) {
          var filter = stringStartsWith(place.title.toLowerCase(), search);
          //To show markers that match the search value and return list items that match the search value
           if (filter) {
              place.marker.setVisible(true);
              return filter;
            }
          //To Hide markers that do not match the search value
           else {
              place.marker.setVisible(false);
              return filter;
            }
        });
      }
    }, this);


  function fullyPopulate() {
  this.places().forEach(function(place) {
          // Get the position from the location array.
          var position = place.location;
          var title = place.title;
          // Create a marker per location, and put into markers array.
           var marker = new google.maps.Marker({
            position: position,
            title: title,
            map: map,
            animation: google.maps.Animation.DROP,
            id: place
          });
           marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          // Push the marker to our array of markers.
          place.marker = marker;
    });
  }

function filteredMap() {
  this.places().forEach(function(place) {
          // Get the position from the location array.
          var position = place.location;
          var title = place.title;
          // Create a marker per location, and put into markers array.
           var marker = new google.maps.Marker({
            position: position,
            title: title,
            map: map,
            animation: google.maps.Animation.DROP,
            id: place
          });
           marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          // Push the marker to our array of markers.
          this.placesList.push(marker);
          place.marker = marker;
    });
}


    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick',function(){
            infowindow.setMarker(null);
          });
        }
       }

       this.placeClicked = function(place) {
          populateInfoWindow(place, largeInfowindow);
       };


};