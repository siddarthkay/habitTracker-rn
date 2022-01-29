// noinspection TypeScriptCheckImport

import React, {useState, useEffect} from 'react';
import {
  Text,
  SafeAreaView,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from './types/RootStackParamList';

import {openDatabase} from 'react-native-sqlite-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function errorCB(err: string) {
  console.log('SQL Error: ' + err);
}

function openCB() {
  console.log('Database OPENED');
}

const Home = ({navigation}: Props) => {
  const [habitText, setHabitText] = useState('');
  const [habitList, setHabitList] = useState([]);

  const db = openDatabase(
    'habitTracker.db',
    '1.0',
    'Test Database',
    200000,
    openCB,
    errorCB,
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function fetchHabitsFromStore() {
      const savedHabits: string | null = await AsyncStorage.getItem(
        'savedHabits',
      );
      if (savedHabits?.length) {
        let habitsArray = savedHabits.split(',');
        // @ts-ignore
        setHabitList(habitsArray);
      }
    }
    fetchHabitsFromStore();
  }, []);

  useEffect(() => {

  }, []);

  function addHabitToList() {
    let existingHabitList = [...habitList];
    // @ts-ignore
    existingHabitList.push(habitText);
    setHabitText('');
    setHabitList(existingHabitList);
    AsyncStorage.setItem('savedHabits', existingHabitList.toString());
    let createdDate = Date.now();
    let insertQuery = `INSERT INTO habits VALUES (1,'${habitText}',${createdDate},${createdDate})`;
    console.log('executing query ' + insertQuery);
    db.transaction(function (txn: any) {
      txn.executeSql(insertQuery, [], function (tx: any, res: any) {
        console.log('item:', res.rows.length);
      });
    });
  }

  function clearAllHabits() {
    setHabitList([]);
    AsyncStorage.removeItem('savedHabits');
  }

  function removeHabit(index: number) {
    let existingHabitList = [...habitList];
    existingHabitList.splice(index, 1);
    setHabitList(existingHabitList);
    AsyncStorage.setItem('savedHabits', existingHabitList.toString());
  }

  function LogActivity(index: number) {
    console.log(index);
    navigation.push('Activity', {id: index});
  }

  const titleStyle = tw`text-[40px]`;
  const inputContainerStyle = tw`my-5`;
  const buttonContainerStyle = tw`flex flex-row justify-around mb-4`;
  const habitInputStyle = tw`text-[20px] p-3 rounded-3xl border-gray-700 border m-4`;
  const buttonTextColorStyle = tw`text-white`;
  const saveButtonStyle = tw`bg-green-500 h-10 w-16 items-center rounded-3xl justify-center mt-3`;
  const clearButtonStyle = tw`bg-red-500 h-10 w-20 items-center rounded-3xl justify-center mt-3`;
  const habitItemContainerStyle = tw`mt-2 ml-4 mr-4 mb-4 flex flex-row justify-between`;
  const removeHabitItemStyle = tw`bg-red-500 rounded-full flex items-center justify-center w-6 h-6`;
  const habitTitleStyle = tw`w-50`;
  const logButtonStyle = tw`bg-blue-500 h-8 w-16 items-center rounded-3xl justify-center`;

  return (
    <SafeAreaView>
      <View>
        <Text style={titleStyle}> Habit Dashboard </Text>
      </View>
      <View style={inputContainerStyle}>
        <TextInput
          placeholder={'enter habit to the list'}
          style={habitInputStyle}
          value={habitText}
          onChangeText={setHabitText}
        />
        <View style={buttonContainerStyle}>
          <TouchableOpacity onPress={addHabitToList} style={saveButtonStyle}>
            <Text style={buttonTextColorStyle}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAllHabits} style={clearButtonStyle}>
            <Text style={buttonTextColorStyle}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {habitList.length > 0 &&
        habitList.map((habit, index) => (
          <View style={habitItemContainerStyle} key={index}>
            <Text style={habitTitleStyle}>{habit}</Text>
            <TouchableOpacity
              style={logButtonStyle}
              onPress={() => LogActivity(index)}>
              <Text style={buttonTextColorStyle}>Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={removeHabitItemStyle}
              onPress={() => removeHabit(index)}>
              <Text style={buttonTextColorStyle}>x</Text>
            </TouchableOpacity>
          </View>
        ))}
    </SafeAreaView>
  );
};

export default Home;
