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
      } catch (error) {
        lastAppUpdate = parseInt(lastAppUpdate);
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
        if (lastUpdated > lastAppUpdate) {
          setupdating({...updating, message: 'Check for new files ...'});

          updateApp(sounds).then((result) => {
            props.onLoaded();
          });
        } else {
          props.onLoaded();
        }
      } else {
        setupdating({...updating, message: 'No Result from Server'});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateApp = async (newSounds) => {
    return new Promise(async (resolve, reject) => {
      let dD = RNFetchBlob.fs.dirs.DocumentDir;

      setupdating({...updating, message: 'Downloading new sounds ...'});
      var filePath = `${dD}/fileList.json`;
      var result = null;
      try {
        result = await RNFetchBlob.fs.exists(filePath);
        if (result) {
          result = await RNFetchBlob.fs.readFile(filePath);
          result = JSON.parse(result);
        } else {
          result = {
            lastUpdated: Date.now(),
            sounds: [],
          };
          RNFetchBlob.fs.createFile(filePath, JSON.stringify(result));
        }
      } catch (error) {
        console.log(error);
      }

      var {sounds} = result;
      var downloadArray = newSounds;
      var deleteArray = sounds;

      if (result && sounds) {
        downloadArray = newSounds.filter((i) => {
          if (sounds.findIndex((s) => s.key === i.key) == -1) return true;
        });

        deleteArray = sounds.filter((i) => {
          if (newSounds.findIndex((n) => n.key == i.key) == -1) return true;
        });
      }

      console.log(deleteArray);
      var downloadProm = downloadArray.map(async (item, index) => {
        let url = `${secure.api}/sounds/${item.path}`;
        let file = await RNFetchBlob.config({
          fileCache: true,
          path: `${dD}/${item.path}`,
        }).fetch('GET', url, {
          Authorization: secure.bearer,
        });
        var path = await file.path();
        setupdating({
          ...updating,
          message: `Download file ${index + 1} of  ${downloadProm.length}`,
        });
        return path;
      });
      setupdating({
        ...updating,
        message: 'Download file 1 of ' + downloadProm.length,
      });

      await Promise.all(downloadProm).catch((error) => console.log(error));
      let file = await RNFetchBlob.config({
        fileCache: true,
        path: `${dD}/fileList.json`,
      }).fetch('GET', `${secure.api}/overview.json`, {
        Authorization: secure.bearer,
      });
      console.log(await file.path());
      await AsyncStorage.setItem(constants.lastUpdated, Date.now().toString());
      resolve();
    });
  };

  const getPermission = async () => {
    let result = await request(
      Platform.select({
        ios: PERMISSIONS.IOS.STOREKIT,
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      }),
    );
    console.log(result);
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
