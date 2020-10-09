/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, HeaderTitle} from '@react-navigation/stack';

//import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import constants from './constants/constants';
import getTheme from './native-base-theme/components';
import material from './native-base-theme/variables/material';
import {StyleProvider} from 'native-base';
import LoadApp from './screens/SplashScreen';
import {StyleSheet, View, StatusBar, Platform} from 'react-native';

const Stack = createStackNavigator();

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, {backgroundColor}]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

const App = () => {
  const [loading, setstate] = useState(true);
  useEffect(() => {}, []);

  if (loading) {
    return (
      <StyleProvider style={getTheme(material)}>
        <View style={{flex: 1}}>
          <MyStatusBar
            backgroundColor={constants.primaryDark}
            barStyle="light-content"
          />
          <LoadApp onLoaded={() => setstate(false)} />
        </View>
      </StyleProvider>
    );
  }

  return (
    <StyleProvider style={getTheme(material)}>
      <NavigationContainer>
        <MyStatusBar
          backgroundColor={constants.primaryDark}
          barStyle="light-content"
        />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: constants.primaryColor,
              shadowOffset: {
                width: 0,
                height: 0,
              },
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
            shadowOffset: null,
            headerTopInsetEnabled: false,
            headerHideShadow: false,
            headerLargeTitleHideShadow: false,
            contentStyle: {
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              shadowOffset: {
                width: 0,
                height: 0,
              },
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Stormberg Soundboard',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StyleProvider>
  );
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  appBar: {
    backgroundColor: '#79B45D',
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
});

export default App;
