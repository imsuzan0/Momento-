import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const index = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',gap: 100 }}>
      <Text>Home</Text>
    </View>
  )
}

export default index