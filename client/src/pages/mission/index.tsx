import Taro, {
  useContext,
  useDidShow,
  useState,
} from '@tarojs/taro'
import { View, Image, Text, Button, Ad } from '@tarojs/components'
import MyModal from '@/components/Modal'
import { AtModal } from 'taro-ui'
import { observer } from '@tarojs/mobx'
import store from '@/store/index'
import { getUserinfo } from '@/utils'
import { getSign, sign, getUserAvatar } from '@/service/cloud'
import './index.scss'
async function Index() {
  const { userInfo, config } = useContext(store) as any
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState()
  const [avtars, setAvtars] = useState()
  const [part, setPart] = useState(1532)
  const [modalOption, setModalOption] = useState()
  const [modal, setModal] = useState({
    show: false,
    title: '',
    text: ''
  })

  const setTotalHandle = (total) => {
    setTotal(String(total).padStart(3, '0').split(''))
  }

  useDidShow(async () => {
    const { data, status } = await getSign()
    if (status === 0) {
      setCurrent(data.sum || 0)
      setTotalHandle(data.total)
    }
    getUserAvatar().then(res => {
      setAvtars(res.data)
    })
    const part = (Taro.getStorageSync('part') || 8021) + Math.ceil(Math.random() * 10)
    setPart(part)
    // 缓存参与人数
    Taro.setStorage({ key: 'part', data: part > 10000 ? 8021 : part})
  })

  const signHandle = async (userinfo) => {
    getUserinfo(userinfo, async () => {
      const { data, status, message } = await sign({})
      if (status === 0) {
        setModal({
          show: true,
          title: '签到成功',
          text: `奖励${config.unit}x${data.value}   ` + (data.answersheet > 0 ? `答题卡x${data.answersheet}` : '')
        })
        const { status, data: sign } = await getSign()
        if (status === 0) {
          setCurrent(sign.sum || 0)
          setTotalHandle(sign.total)
        }
      } else {
        setModal({
          show: true,
          title: '签到失败',
          text: message
        })
      }
    })
  }
  const showSignRule = () => {
    setModalOption({
      visible: true,
      title: '签到规则',
      text: ['每天只能签到一次',
            '连续签到就有机会获得答题币和答题卡',
            '连续签到7天瓜分100000答题币',
            '如发现作弊，清空答题币和答题卡'],
      close: () => {
        setModalOption({ visible: false })
      }
    })
  }
  return (
    <View className='container'>
      <View className='header'>
        已坚持
        {total && total.map(item => <View className='rili' key={item}>{item}</View>)}
        天签到
      </View>
      <View className='tip'>
        <Text className='text'>连续签到七天 即可瓜分<Text className='em'>100000</Text>{config.unit}</Text>
      </View>
      <View className='box'>
        <View className='title'>已连续签到<Text className='em'>{current}</Text>天</View>
        <View className='subtitle'>连续签到7天可享受奖励翻倍的机会</View>
        <View className='loading'>
          <View className='bg'>
            <Text>0天</Text>
            <Text>1天</Text>
            <Text>2天
              <Text className='tip-pop'>20{config.unit}</Text>
            </Text>
            <Text>3天</Text>
            <Text>4天</Text>
            <Text>5天</Text>
            <Text>6天</Text>
            <Text>7天
              <Text className='tip-pop'>瓜分大奖</Text>
            </Text>
          </View>
          <View className='front' style={{ 'width': `${current * 14}%` }}>
            <View className='liwu'></View>
          </View>
        </View>
        <View
          className='box-bottom'>
          <View className='avatarBox'>
            {avtars && avtars.map(item => <Image className='avatar' key={item} src={item.avatarUrl} />)}
            <View className='text'>{'···  '}<Text className='em'>{part}</Text>人已参与</View>
          </View>
        </View>
      </View>
      <View className='banner-ad'>
        <Ad
          unitId="adunit-b023d9053cccbda2"
          unit-id="adunit-b023d9053cccbda2"
          ad-intervals={60}></Ad>
      </View>
      <View className='bottom'>
        <Button
          openType='getUserInfo'
          className='sign-btn'
          onGetUserInfo={signHandle}
          type='primary'
          lang='zh_CN'
        >马上签到</Button>
        <View
          className='sign-rule'
          onClick={showSignRule}
          >签到规则<Text className='iconfont icon-arrow-right'/></View>
      </View>
      <AtModal
        isOpened={modal.show}
        closeOnClickOverlay
      >
        {
          <View className='atmodal-content'>
            <View className='atmodal-content-label'>
              <View className='atmodal-content-label-title'>
                {modal.title}
              </View>
              <View className='atmodal-content-label-text'>
                {modal.text}
              </View>
            </View>
            <View>
              <Ad
                unitId="adunit-effb4b2965cc8895"
                unit-id="adunit-effb4b2965cc8895"
                ad-intervals={60}></Ad>
            </View>
            <View
              onClick={() => setModal({ show: false, text: '', title: '' })}
              className='modal-close' >点击关闭</View>
          </View>}
      </AtModal>
      <MyModal options={modalOption}/>
    </View>
  )
}

Index.config = {
  navigationBarTitleText: '签到',
  navigationBarBackgroundColor: '#feab01'
}

export default observer(Index)