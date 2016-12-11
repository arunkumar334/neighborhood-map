
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
          center: {lat: 26.0028039, lng: 78.0227952},
          zoom: 4,
        });
        ko.applyBindings(new viewModel());
}

var viewModel = function() {
  var self = this;
  self.typedText = ko.observable('');
  self.places = ko.observableArray(locations);
  self.wikiLinks = ko.observableArray();

  var largeInfowindow = new google.maps.InfoWindow();

self.populateMap = ko.computed(function() {
  var searchText = self.typedText().toLowerCase();

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

   self.typedText = ko.observable('');
    //A ko.computed for the filtering of the list and the markers
    self.placesList = ko.computed(function(place) {
    var search = self.typedText().toLowerCase();
    //If there is nothing in the filter, return the full list and all markers are visible
    if (!search) {
      self.places().forEach(function(place) {
          place.marker.setVisible(true);
        });
      return self.places();
    //If a search is entered, compare search data to place names and show only list items and markers that match the search value
      } else {
        return ko.utils.arrayFilter(self.places(), function(place) {
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
    }, self);


  function fullyPopulate() {
  self.places().forEach(function(place) {
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
            getWiki(place);
            getFlickrImage(place);
            populateInfoWindow(this, largeInfowindow);
          });
          // Push the marker to our array of markers.
          place.marker = marker;
    })
  }

function filteredMap() {
  self.places().forEach(function(place) {
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
            getWiki(place);
            getFlickrImage(place);
            populateInfoWindow(this, largeInfowindow);
          });
          // Push the marker to our array of markers.
          self.placesList.push(marker);
          place.marker = marker;
    })
}


    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on self marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            },500);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick',function(){
            marker.setAnimation(null);
            infowindow.setMarker(null);
          });
        }
       }

        function getFlickrImage(place) {
          var query = place.title;

         var url = 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' + query + '&tagmode=any&format=json&jsoncallback=?';
              
                $.getJSON(url, function(data) {
                    console.log(data);
                    var imageUrl = data.items[0].media.m;
                
                        largeInfowindow.setContent('<div>' + query + '</div><img src = "' + imageUrl + '">');
                    // Fallback for failed request to get an image
                }).fail(function() {
                    largeInfowindow.setContent('<div>' + query + '</div><div>No Flickr Image is Found </div>');
                });
       }


       self.getWikiLinks = ko.computed(function() {
        return self.wikiLinks();
    });

        function getWiki(place) {
        self.wikiLinks([]);
        var wiki_query = place.title;
       var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + wiki_query + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){
        $('#wiki').text("failed to get wikipedia resources");
    }, 6000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
            var linksList = response[1];

            for (var i = 0; i < 5; i++) {
                var linksStr = linksList[i];
                var url = 'http://en.wikipedia.org/wiki/' + linksStr;
                self.wikiLinks.push('<li><a href="' + url + '">' + linksStr + '</a></li>');
            };

            clearTimeout(wikiRequestTimeout);
        }
    });

    return false;
  }

       self.placeClicked = function(place) {
          populateInfoWindow(place.marker, largeInfowindow);
          getFlickrImage(place);
          getWiki(place);
       };
};