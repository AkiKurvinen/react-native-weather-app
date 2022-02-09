import * as React from 'react';
import {
  Text,
  Button,
  View,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import {useState, useEffect, useRef} from 'react';
import Geolocation from 'react-native-geolocation-service';
import Topbar from './components/Topbar';
import LinearGradient from 'react-native-linear-gradient';
import {NavigationContainer} from '@react-navigation/native';

const App = () => {
  const [weatherData, setWeatherData] = useState({
    city: 'Tampere',
    desc: '--',
    temperature: 0,
    windSpeed: 0,
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
      if (locationStatus !== '' && locationStatus !== 'Permission Denied') {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLatitude}&lon=${currentLongitude}&units=metric&appid=${apikey}`;
      }
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
      updateWeather('--', 'Error', 0, 0, '01d');
    }
  };

  return (
    <View style={styles.container}>
      <Topbar name={weatherData.city} />
      <View style={styles.contentContainer}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.linearGradient}>
          <Text style={styles.cityNameTxt}>Sää</Text>
          <Image
            style={styles.weatherIconImage}
            source={{
              uri: `https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`,
            }}
          />

          <Text style={[styles.center, styles.p]}>{weatherData.desc}</Text>
          <Text style={[styles.center, styles.p]}>
            {weatherData.temperature} °C
          </Text>
          <Text style={[styles.center, styles.p]}>
            {weatherData.windSpeed} m/s
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.bottomMenu}>
        <Button
          color="teal"
          title="Hae säätiedot"
          onPress={() => fetchWeatherData('tampere')}
        />
        <View style={styles.space} />
        <Button
          color="teal"
          title="GPS"
          onPress={() => fetchWeatherData('gps')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  p: {fontSize: 24},
  main: {
    flex: 1, // pushes the footer to the end of the screen
  },
  bottomMenu: {
    margin: 25,
  },
  footer: {
    height: 100,
  },
  space: {
    width: 20, // or whatever size you need
    height: 20,
  },
  cityNameTxt: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  weatherIconImage: {
    height: 200,
    width: 200,
  },
  linearGradient: {
    flex: 1,
    alignSelf: 'stretch',
    textAlign: 'center',
    alignItems: 'center',
    paddingTop: 25,
  },
});

export default App;
