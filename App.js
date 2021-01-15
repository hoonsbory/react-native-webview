import React from 'react';
import {
  AdMobInterstitial,
  AdMobBanner
} from 'expo-ads-admob';
import { ToastAndroid, BackHandler, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Permissions from 'expo-permissions';
import { WebView } from 'react-native-webview';
import Browser from './Browser'

//시스템 폰트 무시
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling=false; 

export default class App extends React.Component {
  
  adFunction = async () => {
    await AdMobInterstitial.setAdUnitID('ca-app-pub-9106671749645972/2447756679');
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
    await AdMobInterstitial.showAdAsync();
  }
  state = {
    qrBtn: false,
  }
  webview = {
    canGoBack: false,
    canGoForward: false,
    ref: null,
  }

  getPermissionsAsync = async () => {
    const {
      status
    } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted'
    });
  };


  componentDidMount() {
    this.adFunction();
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  // 이벤트 해제
  componentWillUnmount() {
    this.exitApp = false;
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  // 이벤트 동작
  handleBackButton = () => {
    // 2000(2초) 안에 back 버튼을 한번 더 클릭 할 경우 앱 종료
    if (this.webview.canGoBack && this.webview.ref) {
      this.webview.ref.goBack();
      return true;
    }
    else if (this.exitApp == undefined || !this.exitApp) {
      ToastAndroid.show('한번 더 누르시면 종료됩니다.', ToastAndroid.SHORT);
      this.exitApp = true;

      this.timeout = setTimeout(
        () => {
          this.exitApp = false;
        },
        2000    // 2초
      );
    } else {
      clearTimeout(this.timeout);
      this.exitApp = false
      BackHandler.exitApp();  // 앱 종료
    }
    return true;
  }

  //qr카메라 종료
  qrScanExit = () => {
    this.setState({
      qrBtn: false
    })
  }



  render() {
    const styles = StyleSheet.create({
      buttonFacebookStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgb(86, 115, 235)',
        borderWidth: 0.5,
        borderColor: '#fff',
        height: 40,
        borderRadius: 5,
        marginTop : 30,
        justifyContent : "center",
        zIndex : 999
      },
      buttonImageIconStyle: {
        padding: 10,
        margin: 5,
        height: 25,
        width: 25,
        resizeMode: 'stretch',
      },
      buttonTextStyle: {
        color: '#FFF',
        marginBottom: 4,
      }
    });
    //특정 기기에서 폰트가 확대되어 나오기때문에 따로 클래스로 묶어서 폰트 사이즈 다운.
    // const cssInjection = `function addStyle(){ 
    //   const style = document.createElement('style') 
    //   style.appendChild(document.createTextNode(\` .resultNum { line-height : 1.7; } .slideFooter{ font-size : 1.3em;} .slideFooterSmall{ font-size : .9em; } .HOFName{ font-size : .7em; } \`)) 
    //   document.body.appendChild(style)
    //   document.getElementById("root").style.fontSize = ".7em";
    // }  
    // addStyle();`

    return (

      <View style={{ flex: 1, overflow: 'hidden' }}>
        
          {this.state.qrBtn ? 
          //뒤로가기 버튼
          <TouchableOpacity onPress={() => this.setState({ qrBtn: false })} style={styles.buttonFacebookStyle} activeOpacity={0.5}>
            <Image source={require('./assets/icon.png')} style={styles.buttonImageIconStyle}/>
            <View style={styles.SeparatorLine} />
            <Text style={styles.buttonTextStyle}> 뒤로가기 </Text>
          </TouchableOpacity> : 
          
          //qr카메라 버튼
          <TouchableOpacity onPress={() => this.setState({ qrBtn: true })} style={styles.buttonFacebookStyle} activeOpacity={0.5}>
              <Image source={require('./assets/qrIcon.png')} style={styles.buttonImageIconStyle}/>
              <View style={styles.SeparatorLine} />
              <Text style={styles.buttonTextStyle}> 당첨결과확인 </Text>
            </TouchableOpacity>}
        {this.state.qrBtn ? <Browser stateChange={this.qrScanExit}></Browser> :
          <WebView
            source={{ uri: "https://lottozip.site" }}
            textZoom={100}
            ref={(webView) => { this.webview.ref = webView; }}
            onNavigationStateChange={(navState) => { this.webview.canGoBack = navState.canGoBack; }}
          // injectedJavaScript={cssInjection}
          />
        }
        <AdMobBanner bannerSize="fullBanner"
          adUnitID="ca-app-pub-9106671749645972/6794674721"
          servePersonalizedAds
          onDidFailToReceiveAdWithError={this.bannerError} />
      </View>

    );
  }

}

