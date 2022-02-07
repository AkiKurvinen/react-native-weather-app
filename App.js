import * as React from 'react';
import {
  Text,
  Button,
  View,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useState, useEffect, useRef} from 'react';
import Geolocation from 'react-native-geolocation-service';

const App = () => {
  const [weatherData, setWeatherData] = useState({
    city: 'Tampere',
    desc: '--',
    temperature: -5,
    windSpeed: 3,
    icon: '01d',
  });
  const watchID = useRef(null);
  //
  const [currentLongitude, setCurrentLongitude] = useState('23.78712');
  const [currentLatitude, setCurrentLatitude] = useState('61.49911');
  const [locationStatus, setLocationStatus] = useState('');
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        getOneTimeLocation();
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Access Required',
              message: 'This App needs to Access your location',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //To Check, If Permission is granted
            getOneTimeLocation();
          } else {
            setLocationStatus('Permission Denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestLocationPermission();
    return () => {
      Geolocation.clearWatch(watchID);
    };
  }, []);

  const getOneTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        setLocationStatus('You are Here');

        //getting the Longitude from the location json
        const curLongitude = JSON.stringify(position.coords.longitude);

        //getting the Latitude from the location json
        const curLatitude = JSON.stringify(position.coords.latitude);

        //Setting Longitude state
        setCurrentLongitude(curLongitude);

        //Setting Longitude state
        setCurrentLatitude(curLatitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000,
      },
    );
  };

  //

  const updateWeather = (
    a_city,
    a_desc,
    a_temperature,
    a_windSpeed,
    a_icon,
  ) => {
    setWeatherData({
      city: a_city,
      desc: a_desc,
      temperature: a_temperature,
      windSpeed: a_windSpeed,
      icon: a_icon,
    });
  };
  const fetchWeatherData = async location => {
    const apikey = '22ba8ea1a4113ec446bbb83bccc40c5c';

    let url = '';
    if (location !== 'gps') {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apikey}`;
    } else {
      getOneTimeLocation();
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLatitude}&lon=${currentLongitude}&appid=${apikey}`;
    }
    try {
      const response = await fetch(url);

      const weatherObject = await response.json();

      updateWeather(
        weatherObject.name,
        weatherObject.weather[0].description,
        weatherObject.main.temp,
        weatherObject.wind.speed,
        weatherObject.weather[0].icon,
      );
    } catch (error) {
      console.log(error);
      updateWeather('Tampere', 'error', 0, 0, '01d');
    }
  };

  return (
    <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
      <Text style={{fontSize: 16}}>{weatherData.city}</Text>
      <Image
        style={{height: 50, width: 50}}
        source={{
          uri: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`,
        }}
      />

      <Text>{weatherData.desc}</Text>
      <Text>{weatherData.temperature} °C</Text>
      <Text>{weatherData.windSpeed} m/s</Text>
      <Button
        title="Hae säätiedot"
        onPress={() => fetchWeatherData('tampere')}
      />
      <Button title="GPS" onPress={() => fetchWeatherData('gps')} />
    </View>
  );
};
export default App;
