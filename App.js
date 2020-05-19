import React from 'react';
import { StyleSheet, Text, View, } from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import SearchScreen from './screens/searchScreen';
import BookTransaction from './screens/bookTransaction';

export default class App extends React.Component {
  render(){
    return(
      <AppContainer></AppContainer>
    )
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction: {screen: BookTransaction}, Search: {screen: SearchScreen}
})

const AppContainer = createAppContainer(TabNavigator)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
