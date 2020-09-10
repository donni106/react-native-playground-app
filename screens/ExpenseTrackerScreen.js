import PropTypes from 'prop-types';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AsyncStorage,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  View
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Button, Icon, Input, ListItem, normalize, ThemeProvider } from 'react-native-elements';

import Colors from '../constants/Colors';
import theme from '../configs/theme';

export default function ExpenseTrackerScreen({ navigation, route }) {
  const [expenses, setExpenses] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const flatList = useRef();

  // read all expenses from local storage
  const rehydrate = async () => {
    const storedExpenses = JSON.parse(await AsyncStorage.getItem('expenses'));
    setExpenses(storedExpenses ? storedExpenses : []);
  };

  const addExpense = () => {
    if (inputValues.title && inputValues.amount) {
      // determine the latest expense to get the id from which we need to increment for the new one
      const latestExpense = expenses[expenses.length - 1];
      const newExpense = {
        id: latestExpense ? latestExpense.id + 1 : 1, // if there is no expense yet, start with 1
        title: inputValues.title,
        amount: inputValues.amount
      };

      // update expenses with the new expense
      const updatedExpenses = [...expenses, newExpense];

      setExpenses(updatedExpenses);
    }
  };

  const removeExpense = (id) => {
    // update expenses with removing an expense by id
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);

    setExpenses(updatedExpenses);
  };

  // run once (component did mount)
  useEffect(() => {
    rehydrate();
  }, []);

  // run always when expenses changed (component did update)
  useEffect(() => {
    // create async method to store data and scroll the list
    const storeAndScroll = async () => {
      // write all expenses to local storage
      if (expenses && expenses.length) {
        const storedExpenses = JSON.parse(await AsyncStorage.getItem('expenses'));
        await AsyncStorage.setItem('expenses', JSON.stringify(expenses));

        if ((storedExpenses || []).length < expenses.length) {
          // scroll the list to top/bottom after adding an expense
          flatList && flatList.current.scrollToEnd();
        }
      }
    };

    // call the async method
    storeAndScroll();
  }, [expenses]);

  useLayoutEffect(() => {
    const sumAmounts = (a, b) => ({ amount: parseInt(a.amount, 10) + parseInt(b.amount, 10) });
    const headerRight = () => (
      <Text style={styles.headerRight}>{expenses.reduce(sumAmounts, { amount: 0 }).amount}</Text>
    );

    // https://reactnavigation.org/docs/navigation-actions/#setparams
    navigation.dispatch({
      ...CommonActions.setParams({ headerRight }),
      source: route.params?.rootRouteKey
    });
  }, [expenses]);

  const { title, amount = 0 } = inputValues;
  const buttonIconName = amount < 0 ? 'ios-return-right' : 'ios-return-left';
  const buttonIconColor = amount < 0 ? Colors.successIcon : Colors.errorIcon;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' && 'padding'}
      keyboardVerticalOffset={Platform.OS == 'ios' && 62}
      style={styles.container}
    >
      <ThemeProvider theme={theme}>
        <FlatList
          data={expenses}
          renderItem={({ item }) => <Item {...item} removeExpense={removeExpense} />}
          inverted={Platform.OS != 'web'}
          keyExtractor={(item) => item.id.toString()}
          ref={flatList}
        />
      </ThemeProvider>
      <View style={styles.actionContainer}>
        <Input
          placeholder="Expense/Income"
          placeholderTextColor={Colors.tabIconDefault}
          containerStyle={styles.textInput}
          inputStyle={styles.textInputText}
          renderErrorMessage={false}
          onChangeText={(text) =>
            setInputValues({
              ...inputValues,
              title: text
            })
          }
        />
        <Input
          placeholder="100"
          placeholderTextColor={Colors.tabIconDefault}
          containerStyle={[styles.textInput, styles.amountInput]}
          inputStyle={styles.textInputText}
          renderErrorMessage={false}
          onChangeText={(text) =>
            setInputValues({
              ...inputValues,
              amount: text
            })
          }
          keyboardType={Platform.select({ ios: 'numbers-and-punctuation', default: 'numeric' })}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.buttonInput}
          titleStyle={styles.buttonInputTitle}
          icon={{
            type: 'ionicon',
            name: buttonIconName,
            color: buttonIconColor,
            size: normalize(16)
          }}
          iconContainerStyle={styles.buttonInputIcon}
          raised
          disabled={!title || !amount}
          onPress={addExpense}
          title="Add"
          color={Platform.OS === 'ios' ? Colors.light : Colors.tintColor}
          accessibilityLabel="Add an expense with the given title and amount"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

ExpenseTrackerScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};

const Item = ({ id, title, amount, removeExpense }) => {
  const [highlighted, setHighlighted] = useState(false);

  const highlightItem = () => {
    setHighlighted(true);
  };

  const notHighlightItem = () => {
    setHighlighted(false);
  };

  if (highlighted) {
    return (
      <ListItem
        bottomDivider
        containerStyle={[styles.item, styles.highlighted]}
      >
        <TouchableOpacity onPress={() => removeExpense(id)} style={styles.row}>
          <Icon
            {...{ type: 'ionicon', name: 'ios-close-circle-outline', color: Colors.light }}
            style={styles.highlightedIcon}
          />
          <Text style={[styles.big, styles.light]}>Remove</Text>
        </TouchableOpacity>
        <ListItem.Content />
        <TouchableOpacity onPress={notHighlightItem}>
          <Text style={[styles.small, styles.light]}>Cancel</Text>
        </TouchableOpacity>
      </ListItem>
    );
  }

  const leftIconName = parseInt(amount, 10) < 0 ? 'ios-return-right' : 'ios-return-left';
  const leftIconColor = parseInt(amount, 10) < 0 ? Colors.successIcon : Colors.errorIcon;

  return (
    <ListItem
      Component={Platform.select({
        ios: TouchableOpacity,
        android: TouchableNativeFeedback,
        default: TouchableHighlight
      })}
      onLongPress={highlightItem}
      bottomDivider
    >
      <Icon {...{ type: 'ionicon', name: leftIconName, color: leftIconColor }} />
      <ListItem.Content>
        <Text style={styles.small}>{title}</Text>
      </ListItem.Content>
      <Text style={styles.big}>{amount}</Text>
    </ListItem>
  );
};

Item.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  amount: PropTypes.string,
  removeExpense: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light,
    flex: 1
  },
  row: {
    flexDirection: 'row'
  },
  highlighted: {
    backgroundColor: Colors.errorBackground
  },
  highlightedIcon: {
    ...Platform.select({
      ios: {
        paddingRight: 14
      },
      default: {
        paddingRight: 16
      }
    })
  },
  actionContainer: {
    alignItems: 'center',
    backgroundColor: Colors.dark,
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        paddingHorizontal: 14
      },
      default: {
        paddingHorizontal: 16
      }
    }),
    justifyContent: 'space-between',
    paddingVertical: normalize(8)
  },
  textInput: {
    flex: 4,
    paddingHorizontal: 0
  },
  textInputText: {
    color: Colors.light,
    fontSize: normalize(12),
    minHeight: normalize(26)
  },
  amountInput: {
    flex: 2,
    marginHorizontal: normalize(8)
  },
  buttonContainer: {
    flex: 2
  },
  buttonInput: {
    backgroundColor: Colors.light
  },
  buttonInputTitle: {
    color: Colors.dark
  },
  buttonInputIcon: {
    marginLeft: 0
  },
  small: {
    color: Colors.tintColor,
    fontSize: normalize(12)
  },
  big: {
    color: Colors.tintColor,
    fontSize: normalize(16)
  },
  light: {
    color: Colors.light
  },
  headerRight: {
    color: Colors.tintColor,
    fontSize: normalize(16),
    ...Platform.select({
      ios: {
        paddingHorizontal: 14
      },
      default: {
        paddingHorizontal: 16
      }
    })
  }
});
