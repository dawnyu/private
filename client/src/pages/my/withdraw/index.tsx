import Taro, { useState, useDidShow } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getWithdraw } from '@/service/cloud'
import { TradeEnum } from '@/enum'
import './index.scss'

function Index() {
  const [records, setRecords] = useState()

  useDidShow(async () => {
    const res: any = await getWithdraw()
    const list = [...res.data, ...res.data, ...res.data, ...res.data]
    setRecords([...list, ...list, ...list, ...list, ...list])
  })
  const setClipboardData = () => {
    Taro.showModal({
      title: '温馨提示',
      content: '微信号复制成功，请添加客服微信，审核您的兑换订单',
      confirmText: '我知道了',
      confirmColor: 'red',
    })
    Taro.setClipboardData({
      data: 'dawning_yu',
    }).then(() => {
      Taro.hideToast()
    })
  }
  
   return (
    <View className='container'>
      <View className='header'>
        <Text>商品名称</Text>
        <Text>兑换时间</Text>
        <Text>审核状态</Text>
      </View>
      <View className='body'>
        {
          records && records.map(item =>
          <View
            className='record-item'
            key={item.id}>
            <View className='left'>
              <View>{TradeEnum[item.type * 1]}</View>
            </View>
            <View className='center'>{item.tradeTime}</View>
            <View className='right'>
                <Text className={item.check === 0 ? 'check' : 'over'}>{['待审核', '已到账'][item.check]}</Text>
            </View>
          </View>)
        }
        <View className='bottom'>——我是有底线的——</View>
      </View>
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '兑换记录',
  navigationBarBackgroundColor: '#feab01'
}

export default Index