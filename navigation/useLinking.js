import { useLinking } from '@react-navigation/native';
import * as Linking from 'expo-linking'

export default function (containerRef) {
  return useLinking(containerRef, {
    prefixes: [Linking.makeUrl('/')],
    config: {
      Root: {
        path: '',
        screens: {
          Home: 'home',
          Links: 'links',
          Settings: 'settings',
          ExpenseTracker: 'expense-tracker'
        }
      }
    }
  });
}
