import React, {useEffect, useState, useRef} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import FlatListItem from '../components/FlatListItem';
import {Button, Icon, Content, Input, Item} from 'native-base';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {setActive} from 'react-native-sound';
import SearchBar from './../components/SearchBar';
import constants from '../constants/constants';
import Sound, {MAIN_BUNDLE} from 'react-native-sound';

const HomeScreen = ({navigation}) => {
  const [index, setIndex] = useState(0);
  const [data, setdata] = useState({sounds: [], filtered: []});
  const [favorite, setFavorite] = useState({sounds: [], filtered: []});
  const [search, setSearch] = useState('');

  const [player, setPlayer] = useState({isPlaying: false, item: null});

  const whoosh = useRef(null);
  Sound.setCategory('Playback');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    let file = await RNFetchBlob.fs.readFile(
      `${RNFetchBlob.fs.dirs.DocumentDir}/fileList.json`,
    );
    var {sounds} = JSON.parse(file);
    setdata({...data, all: JSON.parse(file), sounds: sounds, filtered: sounds});

    let result = await RNFetchBlob.fs.exists(
      `${RNFetchBlob.fs.dirs.DocumentDir}/favList.json`,
    );
    var favSounds = [];
    if (result) {
      result = await RNFetchBlob.fs.readFile(
        `${RNFetchBlob.fs.dirs.DocumentDir}/favList.json`,
      );
      favSounds = JSON.parse(result);
    }
    setFavorite({...favorite, sounds: favSounds, filtered: favSounds});
  };

  const renderItem = ({item}) => {
    var isFav = false;
    if (favorite.sounds) {
      isFav = favorite.sounds.findIndex((i) => i.key == item.key);
    }
    // var isFav = false;
    // if (favorite.sounds) {
    //   isFav = favorite.sounds.indexOf(item);
    // }
    // console.log(isFav);
    return (
      <FlatListItem
        item={item}
        playing={item.playing}
        playItem={() => playItem(item)}
        stopItem={() => stopItem(item)}
        makeFavorite={() => makeFavorite(item)}
        isFav={isFav}
      />
    );
  };

  const makeFavorite = async (item) => {
    var {sounds, filtered} = favorite;
    var i = sounds.findIndex((i) => i.key == item.key);

    var newSounds = [];
    var newFiltered = [];

    if (i !== -1) {
      newSounds = sounds.filter((item, index) => index !== i);
      newFiltered = filtered.filter((item, index) => index !== i);
      console.log(sounds);
      console.log(newSounds);
      console.log(filtered);
      console.log(newFiltered);
    } else {
      sounds.push(item);
      newSounds = sounds;
    }
    setFavorite({...favorite, sounds: newSounds, filtered: newFiltered});
    RNFetchBlob.fs.writeFile(
      `${RNFetchBlob.fs.dirs.DocumentDir}/favList.json`,
      JSON.stringify(newSounds),
    );
  };

  const stopItem = async (item) => {
    var {filtered} = data;
    var i = filtered.indexOf(item);
    filtered[i].playing = 'false';
    setdata({...data, filtered});
    setPlayer({...player, isPlaying: false, item: null});

    whoosh.current.stop();
  };

  const playItem = async (item) => {
    if (player.isPlaying) stopItem(player.item);

    console.log(
      'Existiert: ',
      await RNFetchBlob.fs.exists(
        `${RNFetchBlob.fs.dirs.DocumentDir}/${item.path}`,
      ),
    );

    setPlayer({...player, isPlaying: true, item});
    console.log(`${RNFetchBlob.fs.dirs.DocumentDir}/${item.path}`);
    console.log(encodeURI(`${RNFetchBlob.fs.dirs.DocumentDir}/${item.path}`));
    try {
      whoosh.current = new Sound(
        encodeURI(`${RNFetchBlob.fs.dirs.DocumentDir}/${item.path}`),
        '',
        (error) => {
          if (error) {
            console.log(error);
            return;
          }

          var {filtered} = data;
          var i = filtered.indexOf(item);
          filtered[i].playing = 'true';
          setdata({...data, filtered});

          whoosh.current.play((success) => {
            whoosh.current.release();
            filtered[i].playing = 'false';
            setdata({...data, filtered});
          });
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const changeIndex = (value) => {
    setIndex(value);
    setFavorite({...favorite, filtered: favorite.sounds});
    setdata({...data, filtered: data.sounds});
    setSearch('');
  };

  const searchData = (query) => {
    if (index === 0) {
      var {sounds} = data;
      var filtered = sounds.filter((item) => {
        if (item.name.toLowerCase().includes(query.toLowerCase())) return true;
      });
      setdata({...data, filtered});
    } else {
      var {sounds} = favorite;
      var filtered = sounds.filter((item) => {
        if (item.name.toLowerCase().includes(query.toLowerCase())) return true;
      });
      setFavorite({...favorite, filtered});
    }
    setSearch(query);
  };

  const ListHeaderComponent = () => {
    return (
      <View style={styles.listHeader}>
        <Button
          style={styles.buttons}
          block
          onPress={() => changeIndex(0)}
          bordered>
          <Icon
            name="list"
            style={index === 1 ? styles.iconNotActive : styles.iconActive}
          />
        </Button>
        <Button
          style={styles.buttons}
          block
          bordered
          onPress={() => changeIndex(1)}>
          <Icon
            name="star"
            style={index === 1 ? styles.iconActive : styles.iconNotActive}
          />
        </Button>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.searchWrapper}>
        <SearchBar onChangeInput={searchData} search={search} />
      </View>
      <FlatList
        initialNumToRender={20}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        ListHeaderComponent={ListHeaderComponent}
        data={index === 0 ? data.filtered : favorite.filtered}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    backgroundColor: constants.primaryColor,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  listHeader: {
    display: 'flex',
    flexDirection: 'row',
  },
  buttons: {
    flex: 1,
  },
  iconNotActive: {
    color: '#ccc',
  },
  iconActive: {
    color: constants.primaryColor,
  },
});

export default HomeScreen;
