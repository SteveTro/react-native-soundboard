import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import constants from '../constants/constants';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import {Button, Container, Content} from 'native-base';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import SplashScreen from 'react-native-splash-screen';
import secure from '../constants/secure';
import functions from './../constants/functions';

const LoadApp = (props) => {
  const [loading, setloading] = useState(true);
  const [firstRun, setFirstRun] = useState(true);
  const [updating, setupdating] = useState({
    loading: true,
    message: '',
  });

  useEffect(() => {
    console.log('Splash loaded');
    readStart();
  }, []);

  const readStart = async () => {
    let result = await AsyncStorage.getItem(constants.didStart);
    if (result) {
      setloading(false);
      setFirstRun(false);
      checkSoundFiles();
    } else {
      setloading(false);
      setFirstRun(true);
    }
    SplashScreen.hide();
  };

  const checkSoundFiles = async () => {
    setupdating({...updating, message: 'Check for new files ...'});

    try {
      try {
        var lastAppUpdate = await AsyncStorage.getItem(constants.lastUpdated);
        lastAppUpdate = parseInt(lastAppUpdate);
      } catch (error) {
        console.log(error);
      }

      if (!lastAppUpdate) lastAppUpdate = 0;
      var config = {
        headers: {
          Authorization: secure.bearer,
        },
      };

      let result = '';
      try {
        result = await axios.get(`${secure.api}/overview.json`, config);
      } catch (error) {
        alert(error.message);
      }
      if (result) {
        var {lastUpdated, sounds} = result.data;
        console.log(lastUpdated, '>', lastAppUpdate);
        console.log(lastUpdated > lastAppUpdate);

        if (lastUpdated > lastAppUpdate) {
          console.log('Going to update');
          setupdating({...updating, message: 'Check for new files ...'});

          functions.updateApp(sounds, setupdating, updating).then((result) => {
            props.onLoaded();
          });
        } else {
          props.onLoaded();
        }
      } else {
        setupdating({...updating, message: 'No Result from Server'});
        props.onLoaded();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPermission = async () => {
    let result = await request(
      Platform.select({
        ios: PERMISSIONS.IOS.MEDIA_LIBRARY,
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      }),
    );

    if (result === 'granted') {
      await AsyncStorage.setItem(constants.didStart, 'true');
      setFirstRun(false);
      checkSoundFiles();
    }
  };

  if (loading) {
    return (
      <Container style={styles.wrapper}>
        <View style={styles.content}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#242424" />
            <Text style={{textAlign: 'center', fontSize: 16, marginTop: 15}}>
              Loading ...
            </Text>
          </View>
        </View>
      </Container>
    );
  }

  if (firstRun) {
    return (
      <Container style={styles.wrapper}>
        <View style={styles.content}>
          <View style={styles.center}>
            <Text style={{textAlign: 'center', fontSize: 16}}>
              Um die App zu nutzen braucht diese Zugriff auf den Speicher um die
              Sounddateien abzulegen. Bitte erlaube den Zugriff
            </Text>
            <Button dark bordered style={styles.button} onPress={getPermission}>
              <Text style={styles.buttonText}>Zugriff erlauben</Text>
            </Button>
          </View>
        </View>
      </Container>
    );
  } else {
    return (
      <Container style={styles.wrapper}>
        <View style={styles.content}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#242424" />

            <Text style={{textAlign: 'center', fontSize: 16}}>
              {updating.message}
            </Text>
          </View>
        </View>
      </Container>
    );
  }
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: constants.primaryColor,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
  },
});
export default LoadApp;
