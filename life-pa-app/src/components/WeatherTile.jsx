import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import CardContainer from './CardContainer';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// Dynamically import expo-location to handle potential loading issues
let Location = null;
let hasLocationModule = false;

try {
  Location = require('expo-location');
  hasLocationModule = true;
} catch (error) {
  console.log('Note: expo-location is not available yet. Weather tile will be hidden.');
  hasLocationModule = false;
}

export default function WeatherTile() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(hasLocationModule);

  useEffect(() => {
    if (hasLocationModule && Location) {
      getLocationAndWeather();
    } else {
      // Module not available - hide component entirely
      setIsAvailable(false);
      setLoading(false);
    }
  }, []);

  const getLocationAndWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!Location) {
        throw new Error('Location services not available');
      }

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy?.Balanced || 4,
      });

      setLocation(currentLocation);

      // Fetch weather data using Open-Meteo API (free, no API key required)
      const { latitude, longitude } = currentLocation.coords;
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json();
      
      // Get location name using reverse geocoding
      const locationData = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setWeather({
        ...weatherData.current,
        locationName: locationData[0]?.city || locationData[0]?.region || 'Your Location',
      });

      setLoading(false);
    } catch (err) {
      console.error('Error getting weather:', err);
      setError('Unable to fetch weather');
      setLoading(false);
    }
  };

  // Weather code to emoji mapping (WMO Weather interpretation codes)
  const getWeatherEmoji = (code) => {
    const weatherCodes = {
      0: '☀️', // Clear sky
      1: '🌤️', // Mainly clear
      2: '⛅', // Partly cloudy
      3: '☁️', // Overcast
      45: '🌫️', // Foggy
      48: '🌫️', // Depositing rime fog
      51: '🌦️', // Light drizzle
      53: '🌦️', // Moderate drizzle
      55: '🌦️', // Dense drizzle
      61: '🌧️', // Slight rain
      63: '🌧️', // Moderate rain
      65: '🌧️', // Heavy rain
      71: '🌨️', // Slight snow
      73: '🌨️', // Moderate snow
      75: '🌨️', // Heavy snow
      77: '❄️', // Snow grains
      80: '🌦️', // Slight rain showers
      81: '🌧️', // Moderate rain showers
      82: '⛈️', // Violent rain showers
      85: '🌨️', // Slight snow showers
      86: '🌨️', // Heavy snow showers
      95: '⛈️', // Thunderstorm
      96: '⛈️', // Thunderstorm with slight hail
      99: '⛈️', // Thunderstorm with heavy hail
    };
    return weatherCodes[code] || '🌡️';
  };

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear',
      1: 'Mostly Clear',
      2: 'Partly Cloudy',
      3: 'Cloudy',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      77: 'Snow',
      80: 'Light Showers',
      81: 'Showers',
      82: 'Heavy Showers',
      85: 'Light Snow',
      86: 'Heavy Snow',
      95: 'Thunderstorm',
      96: 'Thunderstorm',
      99: 'Thunderstorm',
    };
    return descriptions[code] || 'Unknown';
  };

  // Don't render anything if the module isn't available
  if (!isAvailable) {
    return null;
  }

  if (loading) {
    return (
      <CardContainer elevated style={styles.weatherCard}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </CardContainer>
    );
  }

  if (error) {
    return (
      <CardContainer elevated style={styles.weatherCard}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🌡️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={getLocationAndWeather} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </CardContainer>
    );
  }

  if (!weather) {
    return null;
  }

  const temperature = Math.round(weather.temperature_2m);
  const feelsLike = Math.round(weather.apparent_temperature);
  const weatherEmoji = getWeatherEmoji(weather.weather_code);
  const weatherDescription = getWeatherDescription(weather.weather_code);
  const windSpeed = Math.round(weather.wind_speed_10m);
  const humidity = weather.relative_humidity_2m;

  return (
    <CardContainer elevated style={styles.weatherCard}>
      <View style={styles.weatherHeader}>
        <View>
          <Text style={styles.locationText}>📍 {weather.locationName}</Text>
          <Text style={styles.weatherDescription}>{weatherDescription}</Text>
        </View>
        <TouchableOpacity onPress={getLocationAndWeather} style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weatherMain}>
        <Text style={styles.weatherEmoji}>{weatherEmoji}</Text>
        <View style={styles.temperatureContainer}>
          <Text style={styles.temperature}>{temperature}°C</Text>
          <Text style={styles.feelsLike}>Feels like {feelsLike}°C</Text>
        </View>
      </View>

      <View style={styles.weatherDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💨</Text>
          <Text style={styles.detailText}>{windSpeed} km/h</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💧</Text>
          <Text style={styles.detailText}>{humidity}%</Text>
        </View>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  weatherCard: {
    padding: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: fonts.sizes.body,
    color: colors.text,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: fonts.sizes.body,
    fontWeight: '600',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  weatherDescription: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    fontSize: 20,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherEmoji: {
    fontSize: 64,
    marginRight: 16,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 52,
  },
  feelsLike: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  detailText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  detailDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
});

