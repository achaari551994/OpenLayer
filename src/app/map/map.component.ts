import { Component, OnInit } from '@angular/core';
import { Feature, Map, View } from 'ol';
import { Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { LocationService } from './location.service';
import { transform } from 'ol/proj';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  address: string = "";
  map!: Map;
  currentPositionMarker!: Feature;
  destinationPositionMarker!: Feature;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer<VectorSource>;
  latitude?: number;
  longitude?: number;
  location?: any = this.currentPosition();

  constructor(private locationService: LocationService) {
  }


  ngOnInit(): void {

    this.currentPositionMarker = new Feature({
      geometry: new Point(fromLonLat([10.209229568299548, 36.84482284328952]))
    });

    this.currentPositionMarker.setStyle(new Style({
      image: new Icon(({
        color: 'Transparent',
        crossOrigin: 'anonymous',
        src: 'assets/pointer.png',
        size: [300, 300],
        height: 50,
        width: 50,
        anchor: [0.5, 1],

      }))
    }));

    this.destinationPositionMarker = new Feature({
      // geometry: new Point(fromLonLat([11.209229568299548, 37.84482284328952]))
    });

    this.destinationPositionMarker.setStyle(new Style({
      image: new Icon(({
        color: 'Transparent',
        crossOrigin: 'anonymous',
        src: 'assets/pointer1.png',
        size: [300, 300],
        height: 50,
        width: 50,
        anchor: [0.5, 1]
      }))
    }));


    this.vectorSource = new VectorSource({
      features: [this.currentPositionMarker, this.destinationPositionMarker]
    });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.map = new Map({
      target: 'map',
      layers: [new TileLayer({
        source: new OSM()
      }), this.vectorLayer],
      view: new View({
        center: fromLonLat([10.209229568299548, 36.84482284328952]),
        zoom: 15,
      })
    });
  }


  currentPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (position) {
          let lat = position.coords.latitude;
          let lng = position.coords.longitude;
          this.location = {
            lat,
            lng,
          };
        }
      },
      (error) => console.log(error)
    );
  }

  onMapClick(event: any) { // Replace with your actual API key

    const coordinate = this.map.getEventCoordinate(event);
    console.log('Raw Coordinate:', coordinate);

    // Transform the coordinates to the expected range
    const transformedCoordinate = transform(coordinate, 'EPSG:3857', 'EPSG:4326');

    // Check if coordinates are within the expected range
    if (
      transformedCoordinate[0] < -180 || transformedCoordinate[0] > 180 ||
      transformedCoordinate[1] < -90 || transformedCoordinate[1] > 90
    ) {
      console.error('Invalid coordinates:', transformedCoordinate);
      return;
    }

    // Use the transformed coordinates for further processing
    const lonLat = fromLonLat(transformedCoordinate);

    // Update the destination marker
    this.destinationPositionMarker.setGeometry(new Point(coordinate));

    // Get the real latitude and longitude of the destination marker
    const markerGeometry = this.destinationPositionMarker.getGeometry();

    if (markerGeometry instanceof Point) {
      const lonLatInWGS84 = this.getLonLatFromGeometry(markerGeometry);
      this.latitude= lonLatInWGS84[1];
      this.longitude=lonLatInWGS84[0];
      this.locationService.getLocationAddress(this.longitude, this.latitude)
        .subscribe({
          next: (response: any) => {
            console.log(response);
            
            this.address = response.results[0].formatted;
            
          },
          error: (error) => {
            console.log(error);
          }
        });

      
    } else {
      console.error('Invalid marker geometry:', markerGeometry);
    }
  }



  // Function to get the real latitude and longitude from a geometry
  getLonLatFromGeometry(geometry: Point): number[] {
    const lonLat = geometry.getCoordinates();
    const lonLatInWGS84 = transform(lonLat, 'EPSG:3857', 'EPSG:4326');
    return lonLatInWGS84;
  }


}
