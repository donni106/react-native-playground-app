import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import PropTypes from 'prop-types';
import * as React from 'react';

import TabBarIcon from '../components/TabBarIcon';
import ExpenseTrackerScreen from '../screens/ExpenseTrackerScreen';
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

export default function BottomTabNavigator({ navigation, route }) {
  React.useLayoutEffect(() => {
    // Set the header title on the parent stack navigator depending on the
    // currently active tab. Learn more in the documentation:
    // https://reactnavigation.org/docs/en/screen-options-resolution.html
    navigation.setOptions({
      headerTitle: getHeaderTitle(route),
      headerRight: getHeaderRight(route)
    });
  }, [navigation, route]);

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Get Started',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-code-working" />
        }}
      />
      <BottomTab.Screen
        name="Links"
        component={LinksScreen}
        options={{
          title: 'Resources',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-book" />
        }}
      />
      <BottomTab.Screen
        name="ExpenseTracker"
        component={ExpenseTrackerScreen}
        options={{
          title: 'Expense Tracker',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-cash" />
        }}
        // https://reactnavigation.org/docs/params/#updating-params
        initialParams={{ rootRouteKey: route.key }}
      />
    </BottomTab.Navigator>
  );
}

BottomTabNavigator.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};

function getHeaderTitle(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Home':
      return 'How to get started';
    case 'Links':
      return 'Links to learn more';
    case 'ExpenseTracker':
      return 'Expense Tracker';
  }
}

function getHeaderRight(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Home':
      return null;
    case 'Links':
      return null;
    case 'ExpenseTracker': {
      return route.params?.headerRight;
    }
  }
}
