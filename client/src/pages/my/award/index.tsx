import Taro, { useState, useContext, useDidShow } from '@tarojs/taro'
import { View, Text, Ad } from '@tarojs/components'
import moment from 'moment'
import { geTexchangeList } from '@/service/cloud'
import { TradeEnum } from '@/enum'
import store from '@/store/index'
import './index.scss'

function Index() {
  const { userInfo } = useContext(store) as any
  const [records, setRecords] = useState()
  useDidShow(async() => {
    try {
      Taro.showLoading()
      const { data = {} }: any = await geTexchangeList({ openid: userInfo.openid })
      const records: any = []
      const recordData = data.dataList || []
      const days = data.dayList || []
      days.forEach(item => {
        records.push({
          day: item,
          data: recordData
            .filter(item1 => item === moment(item1.tradeTime).format('YYYY-MM-DD'))
            .map(item2 => {
              item2.time = moment(item2.tradeTime).format('HH:mm')
              return item2
            })
        })
      })
      Taro.hideLoading()
      setRecords(records)
    } catch (error) {
      Taro.hideLoading()
    }
  })



  return (
    <View className='container'>
      <View className='banner-ad'>
        <Ad
          unitId="adunit-e77dadb2eafec124"
          unit-id="adunit-e77dadb2eafec124"
          ad-intervals={60}></Ad>
      </View>
      <View className='body'>
        {
          records && records.map(item =>
          <View key={item.day}>
            <View className='day-title'>{item.day}</View>
            {item.data.map(data => 
              <View
                className='record-item'
                key={data.id}>
                <View className='left'>
                  <View>{TradeEnum[data.type * 1]}</View>
                </View>
                <View className='center'>{data.time}</View>
                <View className='right'>
                  {[3, 4, 5, 6, 9].indexOf(data.type * 1) > -1 && <Text className='in'>-{data.value}</Text>}
                  {[0, 1, 2, 7, 8, 10, 11, 12].indexOf(data.type * 1) > -1 && <Text className='out'>+{data.value}</Text>}
                </View>
              </View>)}
          </View>
          )
        }
        {
          records && records.length > 1 && <View className='bottom'>——只展示最近30天记录——</View>
        }

        {
          (!records || records && records.length === 0) && <View className='bottom'>暂无记录</View>
        }
        
      </View>
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '收支记录',
  navigationBarBackgroundColor: '#feab01'
}

export default Index