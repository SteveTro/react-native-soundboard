import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon, Item, Input} from 'native-base';

const SearchBar = ({onChangeInput, search}) => {
  return (
    <View style={styles.container}>
      <Icon name="search" />
      <Item>
        <Input
          value={search}
          style={styles.search}
          placeholder="Suche ..."
          onChangeText={onChangeInput}
        />
      </Item>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  search: {
    maxWidth: '90%',
  },
});
export default SearchBar;
