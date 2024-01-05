import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (position) {
              // console.log(
              //   'Latitude: ' +
              //     position.coords.latitude +
              //     'Longitude: ' +
              //     position.coords.longitude
              // );
              let lat = position.coords.latitude;
              let lng = position.coords.longitude;

              const location = {
                lat,
                lng,
              };
              resolve(location);
              
            }
          },
          (error) => console.log(error)
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }
  getLocationAddress(longitude:number, latitude:number): Observable<any>{
    const apiKey = '8191d9a93c9743b6bf0e0cb0fffbe82f';
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${apiKey}&language=en`;

    return this.http.get<any>(apiUrl);
  }

}
