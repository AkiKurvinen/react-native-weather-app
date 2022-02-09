import * as React from 'react';

import {Appbar} from 'react-native-paper';

import {StyleSheet} from 'react-native';

const Topbar = props => (
  <Appbar.Header style={styles.item}>
    <Appbar.Content title={props.name} />

    <Appbar.Action icon="menu" onPress={() => {}} />
  </Appbar.Header>
);

export default Topbar;

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'teal',
  },
});
