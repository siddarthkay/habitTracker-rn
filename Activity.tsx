import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from './types/RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Activity = ({route, navigation}: Props) => {
  const habitIndex = route?.params?.id;
  const [habitTitle, setHabitTitle] = useState('');
  const [habitLog, setHabitLog] = useState([]);

  useEffect(() => {
    async function getHabitByIndex() {
      const savedHabits = await AsyncStorage.getItem('savedHabits');
      const existinghabitsArray = savedHabits.split(',');
      setHabitTitle(existinghabitsArray[habitIndex]);

      // AsyncStorage.removeItem('habitLogs');

      function showOnlyLogsForCurrentHabit(log) {
        console.log('checking for ' + log.title + 'with ' + habitTitle);
        return log.title == habitTitle;
      }

      const existingLogs = await AsyncStorage.getItem('habitLogs');
      let existingLogsArray = JSON.parse(existingLogs);
      if (existingLogsArray?.length > 0) {
        let currentHabitLog = existingLogsArray.filter(
          showOnlyLogsForCurrentHabit,
        );
        console.log(currentHabitLog);

        setHabitLog(currentHabitLog);
      }
    }
    getHabitByIndex();
  }, [habitIndex]);

  async function logHabitForTheDay() {
    let log = {title: habitTitle, when: new Date().toString()};
    const existingLog = [...habitLog];
    existingLog.push(log);

    let existingLogsString = JSON.stringify(existingLog);
    // console.log('setting the async storage to = ' + existingLogsString);
    await AsyncStorage.setItem('habitLogs', existingLogsString);

    setHabitLog(existingLog);
  }

  return (
    <SafeAreaView>
      <View style={styles.habitTitleView}>
        <Text style={styles.habitTitle}>Title : </Text>
        <Text style={styles.habitTitle}>
          {habitTitle.length > 0 && habitTitle}
        </Text>

        <TouchableOpacity style={styles.doneButton} onPress={logHabitForTheDay}>
          <Text style={{color: 'white'}}>Mark as Done</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logContainer}>
        {habitLog.length > 0 &&
          habitLog.map((log, index) => (
            <Text key={index}> Performed at : {log?.when}</Text>
          ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  habitTitleView: {
    margin: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  habitTitle: {
    fontSize: 20,
  },
  doneButton: {
    backgroundColor: 'blue',
    borderRadius: 25,
    width: 110,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logContainer: {
    marginTop: 40,
  },
});

export default Activity;
