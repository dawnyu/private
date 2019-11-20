import Taro, { useContext, useDidShow,
  useState, useEffect, useShareAppMessage } from '@tarojs/taro'
import { View, Text, Image, Button, OpenData, Ad, Form } from '@tarojs/components'
import { AtModal } from 'taro-ui'
import { observer } from '@tarojs/mobx'
import store from '@/store/index'
import Good from '@/components/Good'
import { QuestionEnum } from '@/enum'
import { getUserinfo } from '@/utils'
import moment from 'moment'
import storage from '@/utils/storage'
import hongbao1 from '@/assets/images/hongbao1.png'
import hongbao2 from '@/assets/images/hongbao2.png'
import feidie from '@/assets/images/feidie-min.png'
import qiandao from '@/assets/images/qiandao.png'
import { systemTime, openRedEnvelope, typeinFormId } from '@/service/cloud'
import './index.scss'

let videoAd: any
function Index() {
  const {
    userInfo,
    getUser,
    qtype,
    goods,
    getGoods,
    login,
    getConfig,
    addAnswerSheet,
    config,
    check,
  } = useContext(store) as any
  useShareAppMessage(() => {
    return {
      title: '这个题好难啊，你能帮帮我吗？',
      path: `/pages/index/index?superior=${userInfo.openid}`,
      imageUrl: 'https://cdn.geekbuluo.com/20191101012651-min.jpg'
    }
  })

  const [showOpenRedEnvelopeModal, setShowOpenRedEnvelopeModal] = useState(false)
  const [showOpenSheetModal, setShowOpenSheetModal] = useState(false)
  const [showVideoAd, setShowVideoAd] = useState(false)
  const [sheet, setSheet] = useState()
  const [firstScreen, setFirstScreen] = useState(false)
  const [award, setAward] = useState(0)
  const [countDown, setCountDown] = useState(0)
  const [countDownText, setCountDownText] = useState('')
  const COUNTDOWN = 10 * 60

  useDidShow(async () => {
    getGoods()
    const config = await getConfig()
    const user = await getUser()
    const isAuth = Taro.getStorageSync('isAuth')
    if (!user.data) {
      //如果用户不存在
      login({ superior: Taro.getStorageSync('superior') }) //创建临时用户，只有openid
    }
    const isNewUser = config.open === 0 && !isAuth && !user.userid
    if (isNewUser) {
      const firsthb = await Taro.getStorageSync('firsthb')
      if (firsthb && !moment(firsthb).isSame(new Date(), 'day')) {
        setFirstScreen(true)
        Taro.setStorage({ key: 'firsthb', data: '' })
      } else if (!firsthb) {
        setFirstScreen(true)
      }
    }
    openRedEnvelopeHandle(false)
    const showVideoAd = storage.get('videoAd')
    if (wx.createRewardedVideoAd && !videoAd && !showVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-6ea9b38b4d7240a5'
      })
      videoAd.onLoad(() => { })
      videoAd.onError(() => { })
      videoAd.onClose(async(res) => {
        if (res && res.isEnded) {
          await addAnswerSheet({ num: 1 })
          setSheet(1)
          storage.set('videoAd', '', 60 * 6)
          setShowVideoAd(false)
        } else {
          Taro.showToast({
            title: '视频没有看完没有获取到答题卡哦:)',
            icon: 'none'
          })
        }
       })
       setShowVideoAd(true)
    }
  })

  const toShowVideo = () => {
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(() => {})
      })
    }
  }

  useEffect(() => {
    function full(val) {
      return val < 10 ? `0${val}` : val
    }
    if (countDown) {
      countDownHandle()
    }
    function countDownHandle() {
      // const h = Math.floor(countDown / 60 / 60)
      const m = Math.floor(countDown / 60) % 60
      const s = countDown % 60
      if (countDown <= 1) {
        setCountDownText('')
      } else {
        setCountDownText(`${full(m)}:${full(s)}`)
      }
    }
    let timer = setTimeout(() => {
      if (countDown > 0) {
        setCountDown((c: number) => c - 1)
        countDownHandle()
      }
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [countDown])

  const openRedEnvelopeHandle = async (click) => {
    const {data: current} = await systemTime()
    const lastTime = Taro.getStorageSync('countDownTime')
    if (click) {
      setCountDown(COUNTDOWN)
      Taro.setStorage({
        key: 'countDownTime',
        data: current
      })
      // const redPack = Math.floor(1 + Math.random() * 5)
      // setAward(+redPack)
      // setShowOpenRedEnvelopeModal(true)
      setShowOpenSheetModal(true)
      setSheet(1)
      await addAnswerSheet({num: 1})
      // trade({ id: userInfo._id, type: TradeEnum.定时红包, value: redPack })
    } else if (lastTime && current - lastTime < COUNTDOWN * 1000) {
      setCountDown(COUNTDOWN - Math.floor((current - lastTime) / 1000))
    }
  }
  const closeFirstScreen = () => {
    setFirstScreen(false)
    Taro.setStorageSync('firsthb', moment().format('YYYY-MM-DD HH:mm:ss'))
  }

  //关闭红包授权
  const closeOpenHandle = (userinfo) => {
    getUserinfo(userinfo, async () => {
      const { data, message, status } = await openRedEnvelope()
      if (status === 0) {
        setAward(data)
        setFirstScreen(false)
        setShowOpenRedEnvelopeModal(true)
        getUser()
      } else {
        Taro.showToast({
          title: message,
          icon: 'none'
        })
      }

    })
  }

  const formSubmit = (e) => {
    console.log(e)
    const { formId } = e.detail
    typeinFormId({ formId })
    Taro.navigateTo({ url: '/pages/answer/index' })
  }

  return (
    <View className='container'>
      <View className='header'>
        <View className='user-balance'>
          <View className='userAvatarUrl'><OpenData type='userAvatarUrl'/></View>
          <Text className='user-balance-value'>{userInfo.balance}答题币</Text>
        </View>
        <View>
          <Button
            openType='contact'
            className='contact'
            >投诉建议</Button>
        </View>
      </View>
      <View className='content'>
        <View className='red-packet'>
          <Image
            className='red-packet-front'
            mode='scaleToFill'
            src={hongbao1}
          />
          <View className='red-packet-body'>
            <View className='residue'>当前答题卡<Text>{userInfo.answersheet}</Text>张</View>
          </View>
          <Image
            className='red-packet-bg'
            mode='scaleToFill'
            src={hongbao2}
          />
          <View className='red-packet-btn'>
            <Form report-submit={true} onSubmit={formSubmit}>
              <Button
                className='answer-_btn'
                formType="submit"></Button>
              {/* <Image
                className='answer-_btn'
                src='https://cdn.geekbuluo.com/button-min.png' /> */}
            </Form>
            <View className='topic-info'>
              <Text className='topic-title'>{QuestionEnum[qtype]}</Text>
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/questionBank/index' })}
                className='topic-switch'
              >
                切换<Text className='iconfont icon-arrow-right' />
              </View>
            </View>
            
          </View>
         
         {
            check && <View className='floaticon'>
              {
                showVideoAd && <View>
                  <Image
                    className='sign'
                    onClick={toShowVideo}
                    src='https://cdn.geekbuluo.com/A218.png' />
                  <Text className='sign-text'>攒答题卡</Text>
                </View>
              }
             
              <Image
                className={countDown > 0 ? 'open-red' : 'open-red open-red-animate'}
                onClick={() => openRedEnvelopeHandle(countDown === 0)}
                src='https://cdn.geekbuluo.com/smallhongbao-min.png' />
              {!countDownText && <Text className='open-red-text'>拆我呀</Text>}
              {countDownText && <View className='red-packet-countdown'> {countDownText} </View>}

              <Image
                className='rank'
                onClick={() => Taro.navigateTo({ url: '/pages/rank/index' })}
                src='https://cdn.geekbuluo.com/paihangbang-min.png' />
              <Text className='rank-text'>排行榜</Text>

              <Button
                className='share'
                openType='share'>
                <Image
                  className='friend'
                  src='https://cdn.geekbuluo.com/1bf360a2147943ed1bb863e4f607979a-min.png' />
              </Button>
              <Text className='friend-text'>攒兑换卡</Text>
            </View>
         }
        </View>
        {
          <View className='banner-ad'>
            <Ad
              unitId="adunit-e77dadb2eafec124"
              unit-id="adunit-e77dadb2eafec124"
              ad-intervals={60}></Ad>
          </View>
        }
        {/* {check &&  <View className='header-line'>0元免费换</View>} */}
        {check &&  <View className='red-packet-convert'>
            {
              goods.map(item =>
              <Good key={item.id} data={item} />)
            }
          </View>
        }
        
      </View>
        <View className='nav'>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/mission/index' })}
            className='nav-item'
            hover-class='nav-item-hover'
          >
            <Image src={qiandao} />
            <View>签到</View>
          </View>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/friends/index' })}
            className='nav-item'
            hover-class='nav-item-hover'
          >
            <Image src='https://cdn.geekbuluo.com/1bf360a2147943ed1bb863e4f607979a-min.png' />
            <View>好友</View>
          </View>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/my/index' })}
            className='nav-item'
            hover-class='nav-item-hover'
          >
            <Image src={feidie} />
            <View>我的</View>
          </View>
        </View>
     {
        firstScreen && 
        <View
          className='first-screen'
        >
          <Text className='text'>幸运奖励</Text>
          <Text className='text1'>最高获得20{config.unit}</Text>
          <Button
            openType='getUserInfo'
            onGetUserInfo={closeOpenHandle}
            type='primary'
            lang='zh_CN'
          />
          <View
            className='close-first-screen'
            onClick={() => closeFirstScreen()}>点击关闭</View>
        </View>
     }
     {
      <AtModal
        isOpened={showOpenRedEnvelopeModal}
        closeOnClickOverlay
      >
        {
          <View className='atmodal-content'>
            <View className='atmodal-content-label'>
              <View className='atmodal-content-label-text'>
                  恭喜您获得<Text>{award}</Text>{config.unit}
              </View>
            </View>
            <View
              onClick={() => setShowOpenRedEnvelopeModal(false)}
              className='modal-close'>点击关闭</View>
          </View>}
      </AtModal>
     }
      {/**暂时没有封装modal，凑合用吧 */}
      {
        <AtModal
          isOpened={showOpenSheetModal}
          closeOnClickOverlay
        >
          {
            <View className='atmodal-content'>
              <View className='atmodal-content-label'>
                <View className='atmodal-content-label-text'>
                  恭喜您获得<Text>{sheet}</Text>答题卡
                </View>
              </View>
              <View
                onClick={() => setShowOpenSheetModal(false)}
                className='modal-close'>点击关闭</View>
            </View>}
        </AtModal>
      }
    </View>
  )
}
Index.config = {
  disableScroll: true,
  navigationBarBackgroundColor: '#feab01',
}

export default observer(Index)