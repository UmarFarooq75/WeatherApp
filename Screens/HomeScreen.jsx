
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView,TouchableWithoutFeedback,Keyboard, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from "lodash";
import * as Progress from 'react-native-progress';
import { StatusBar } from 'expo-status-bar';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import { getData, storeData } from '../utils/asyncStorage';

export const theme = {
  bgWhite: (opacity) => `rgba(255,255,255, ${opacity})`,
};

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});

  const handleSearch = search => {
    if (search && search.length > 2) {
      fetchLocations({ cityName: search }).then(data => {
        setLocations(data);
      });
    }
  };

  const handleLocation = loc => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data => {
      setLoading(false);
      setWeather(data);
      storeData('city', loc.name);
    });
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Islamabad';
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current } = weather;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={{ flex: 1, position: 'relative' }}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      {loading ? (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Progress.CircleSnail thickness={5} size={120} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          {/* search section */}
          <View style={{ height: '10%', marginHorizontal: 4, position: 'relative', zIndex: 50 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                borderRadius: showSearch ? 25 : 0,
                backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent'
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor="lightgray"
                  style={{ paddingLeft: 20, height: 40, paddingBottom: 1, flex: 1, fontSize: 16, color: 'white' }}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{
                  borderRadius: 20,
                  padding: 10,
                  margin: 1,
                  backgroundColor: showSearch ? theme.bgWhite(0.3) : 'transparent'
                }}
              >
                {showSearch ? (
                  <XMarkIcon size={20} color="white" />
                ) : (
                  <MagnifyingGlassIcon size={25} color="white" />
                )}
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View style={{ position: 'absolute', width: '100%', backgroundColor: '#ccc', top: 44, borderRadius: 20 }}>
                {locations.map((loc, index) => {
                  let showBorder = index + 1 !== locations.length;
                  let borderStyle = showBorder ? { borderBottomWidth: 2, borderBottomColor: 'gray' } : {};
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleLocation(loc)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 1, ...borderStyle }}
                    >
                      <MapPinIcon size={20} color="gray" />
                      <Text style={{ color: 'black', fontSize: 16, marginLeft: 5 }}>{loc?.name}, {loc?.country}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* forecast section */}
          <View style={{ marginHorizontal: 4, justifyContent: 'space-around', flex: 2, marginBottom: 2 }}>
            {/* location */}
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>
              {location?.name},
              <Text style={{ color: 'gray', fontSize: 16, fontWeight: '600' }}>{location?.country}</Text>
            </Text>
            {/* weather icon */}
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Image
                source={weatherImages[current?.condition?.text || 'other']}
                style={{ width: 130, height: 130 }}
              />
            </View>
            {/* degree celcius */}
            <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 5 }}>
              <Text style={{ color: 'white', fontSize: 60, fontWeight: 'bold', marginLeft: 5 }}>
                {current?.temp_c}&#176;
              </Text>
              <Text style={{ color: 'white', fontSize: 20, letterSpacing: 1 }}>
                {current?.condition?.text}
              </Text>
            </View>

            {/* other stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assets/icons/wind.png')} style={{ width: 30, height: 30 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{" "}{current?.wind_kph}km</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assets/icons/drop.png')} style={{ width: 30, height: 30 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{" "}{current?.humidity}%</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assets/icons/sun.png')} style={{ width: 30, height: 30 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                {" "}{weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* forecast for next days */}
          <View style={{ marginBottom: 15}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginBottom: 10 }}>
              <CalendarDaysIcon size={22} color="white" />
              <Text style={{ color: 'white', fontSize: 16 }}>Daily forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                const date = new Date(item.date);
                const options = { weekday: 'long' };
                let dayName = date.toLocaleDateString('en-US', options);
                dayName = dayName.split(',')[0];

                return (
                  <View
                    key={index}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 90,
                      borderRadius: 20,
                      paddingVertical: 10,
                      paddingHorizontal: 5,
                      marginRight: 12,
                      backgroundColor: theme.bgWhite(0.15)
                    }}
                  >
                    <Image
                      source={weatherImages[item?.day?.condition?.text || 'other']}
                      style={{ width: 40, height: 40 }}
                    />
                    <Text style={{ color: 'white' }}>{dayName}</Text>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
    </TouchableWithoutFeedback>

  );
}
