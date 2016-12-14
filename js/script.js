//required locations
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
        //Creating the map
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 26.0028039, lng: 78.0227952},
          zoom: 4,
        });
        ko.applyBindings(new viewModel());
}

var viewModel = function() {
  //variables are binded using knockout to update data automatically
  var self = this;
  self.typedText = ko.observable('');
  self.places = ko.observableArray(locations);
  self.wikiLinks = ko.observableArray();

  var largeInfowindow = new google.maps.InfoWindow();

self.populateMap = ko.computed(function() {
  var searchText = self.typedText().toLowerCase();
        //checking for user input and call corresponding map function
        if (!searchText) {
            return fullyPopulate();  //map with all markers
        } else {
            return filteredMap();   //map with markers of filtered locations
        }
    });

//supporting function for filtering (to check whether the user entered string matches with the locations)
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
    //if no input is entered, set all the markers as visible
    if (!search) {                
      self.places().forEach(function(place) {
          place.marker.setVisible(true);
        });
      return self.places();
      } else {
        //else filters the locations list and markers depends on user input using knockout's 'arrayFilter' function
        return ko.utils.arrayFilter(self.places(), function(place) {
          var filter = stringStartsWith(place.title.toLowerCase(), search);
           if (filter) {
              place.marker.setVisible(true);    //set visible for the markers that matches with input
              return filter;
            }
           else {
              place.marker.setVisible(false);   //set visible false for the markers that does not match
              return filter;
            }
        });
      }
    }, self);

//function to create map with all of the markers
  function fullyPopulate() {
  self.places().forEach(function(place) {
          var position = place.location;
          var title = place.title;
           var marker = new google.maps.Marker({         //creates a marker
            position: position,
            title: title,
            map: map,
            animation: google.maps.Animation.DROP,
            id: place
          });
           marker.addListener('click', function() {       //event listener for marker
           //calling the below functions when the marker is clicked
            getWiki(place);
            getFlickrImage(place);
            populateInfoWindow(this, largeInfowindow);
          });
          place.marker = marker;
    })
  }

//function to create map with the markers that got filtered
function filteredMap() {
  self.places().forEach(function(place) {
          var position = place.location;
          var title = place.title;
           var marker = new google.maps.Marker({        //creates a marker
            position: position,
            title: title,
            map: map,
            animation: google.maps.Animation.DROP,
            id: place
          });
           marker.addListener('click', function() {      //event listener for marker
           //calling the below functions when the marker is clicked
            getWiki(place);
            getFlickrImage(place);
            populateInfoWindow(this, largeInfowindow);
          });
          self.placesList.push(marker);
          place.marker = marker;
    })
}

    //function to open infowindow with desired content when marker is clicked
    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');  
            infowindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);      //setting animation for marker when it is clicked
            setTimeout(function () {
                marker.setAnimation(null);
            },500);
          infowindow.addListener('closeclick',function(){           //event listener to close the infowindow
            marker.setAnimation(null);
            infowindow.setMarker(null);
          });
        }
       }

        //flickr API for showing location related image when marker or item in the list is clicked
        function getFlickrImage(place) {
          var query = place.title;
        //flickr API url
         var url = 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' + query + '&tagmode=any&format=json&jsoncallback=?';
              
                $.getJSON(url, function(data) {
                    console.log(data);
                    var imageUrl = data.items[0].media.m;
                
                        largeInfowindow.setContent('<div>' + query + '</div><img src = "' + imageUrl + '">');  //setting image in the infowindow
                }).fail(function() {     //fallback function in case of failure
                    largeInfowindow.setContent('<div>' + query + '</div><div>No Flickr Image is Found </div>');
                });
       }


       self.getWikiLinks = ko.computed(function() {
        return self.wikiLinks();
    });
 
        //wikipedia API to provide location related links in the left panel when marker or item in the list is clicked
        function getWiki(place) {
        self.wikiLinks([]);
        var wiki_query = place.title;
        //wikipedia API url
       var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + wiki_query + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){     //fallback function in case of failure
        $('#wiki').text("failed to get wikipedia resources");
    }, 5000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
            var linksList = response[1];

            for (var i = 0; i < 5; i++) {    //generating only 5 links because of the available space in the left panel
                var linksStr = linksList[i];
                var url = 'http://en.wikipedia.org/wiki/' + linksStr;
                self.wikiLinks.push('<li><a href="' + url + '">' + linksStr + '</a></li>');
            };

            clearTimeout(wikiRequestTimeout);   //calling fallback function on failure
        }
    });

    return false;
  }
 
      //function to be executed when an item in left panel list is clicked
       self.placeClicked = function(place) {
        //calling the following functions on click
          populateInfoWindow(place.marker, largeInfowindow);
          getFlickrImage(place);
          getWiki(place);
       };
};

function errorMsg() {
  alert("problem loading google map");
}