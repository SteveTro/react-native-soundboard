import React from 'react';
import {View, Text, StyleSheet, Button, TouchableOpacity} from 'react-native';
import {Icon} from 'native-base';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import constants from '../constants/constants';

const FlatListItem = ({
  item,
  playing,
  isFav,
  playItem,
  stopItem,
  makeFavorite,
}) => {
  const shareItem = () => {
    console.log(item);
    var path = `file://${RNFetchBlob.fs.dirs.DocumentDir}/${item.path}`;
    console.log(path);
    const options = {
      url: path,
      type: 'audio/mp3',
      failOnCancel: false,
    };
    Share.open(options)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <View style={styles.item} key={item.key}>
      <TouchableOpacity style={styles.label} onPress={playItem}>
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
      <View style={styles.icons}>
        <TouchableOpacity onPress={makeFavorite}>
          <Icon
            style={[styles.icon, {color: 'orange'}]}
            type="FontAwesome"
            name={isFav !== -1 ? 'star' : 'star-o'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={shareItem}>
          <Icon
            style={[styles.icon, {color: constants.primaryColor}]}
            type="Entypo"
            name="share"
          />
        </TouchableOpacity>
        {playing == 'true' ? (
          <TouchableOpacity onPress={stopItem}>
            <Icon style={styles.icon} name="stop" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 0,
    backgroundColor: '#fff',
    marginVertical: 5,
    paddingHorizontal: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    flex: 2,
    height: '100%',
    width: '100%',
  },
  name: {
    flexWrap: 'wrap',
    paddingVertical: 15,
  },
  icons: {
    justifyContent: 'flex-end',
    display: 'flex',
    flexDirection: 'row',
  },
  icon: {
    borderLeftColor: 'rgba(0,0,0,0.03)',
    borderLeftWidth: 1,
    padding: 10,
  },
});

export default FlatListItem;
