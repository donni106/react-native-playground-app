import React, { useEffect, useRef, useState } from 'react';
import { AsyncStorage, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '../constants/Colors';

export default function ExpenseTrackerScreen() {
  const [expenses, setExpenses] = useState([]);
  const [inputValues, setInputValues] = useState({ title: 'Expense', amount: '100' });
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

  // run once (component did mount)
  useEffect(() => {
    rehydrate();
  }, []);

  // run always when expenses changed (component did update)
  useEffect(() => {
    // write all expenses to local storage
    if (expenses && expenses.length) {
      AsyncStorage.setItem('expenses', JSON.stringify(expenses));
    }

    // scroll the list to top after adding an expense
    setTimeout(() => {
      flatList && flatList.current.scrollToEnd();
    }, 200);
  }, [expenses]);

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        renderItem={({ item }) => <Item {...item} />}
        inverted
        keyExtractor={(item) => item.id.toString()}
        ref={flatList}
      />
      <View style={styles.actionContainer}>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) =>
            setInputValues({
              ...inputValues,
              title: text
            })
          }
          value={inputValues.title}
        />
        <TextInput
          style={[styles.textInput, styles.amountInput]}
          onChangeText={(text) =>
            setInputValues({
              ...inputValues,
              amount: text
            })
          }
          value={inputValues.amount}
          keyboardType="number-pad"
        />
        <View style={styles.buttonInput}>
          <Button
            onPress={addExpense}
            title="Add"
            color="#013A6D"
            accessibilityLabel="Add an expense with the given title and amount"
          />
        </View>
      </View>
    </View>
  );
}

// eslint-disable-next-line react/prop-types
function Item({ title, amount }) {
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light,
    flex: 1
  },
  item: {
    alignItems: 'center',
    backgroundColor: Colors.tintColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 10
  },
  actionContainer: {
    backgroundColor: Colors.dark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  textInput: {
    backgroundColor: Colors.light,
    flex: 4,
    marginHorizontal: 8,
    marginVertical: 8,
    paddingHorizontal: 8
  },
  amountInput: {
    flex: 2
  },
  buttonInput: {
    flex: 2,
    marginHorizontal: 8,
    marginVertical: 8
  },
  title: {
    color: Colors.light,
    fontSize: 14
  },
  amount: {
    color: Colors.light,
    fontSize: 18
  }
});
