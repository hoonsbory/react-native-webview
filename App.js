import React from 'react';
import {
  AdMobInterstitial,
  AdMobBanner
} from 'expo-ads-admob';
import { ToastAndroid, BackHandler, View } from 'react-native';
import { WebView } from 'react-native-webview';


export default class App extends React.Component {
  constructor(props) {

    super(props);
  }
  adFunction = async () => {
    await AdMobInterstitial.setAdUnitID('ca-app-pub-9106671749645972/2447756679');
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
    await AdMobInterstitial.showAdAsync();
  }
  webView = {
    canGoBack: false,
    canGoForward: false,
    ref: null,
  }




  componentDidMount() {
    // this.adFunction();
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
    if (this.webView.canGoBack && this.webView.ref) {
      this.webView.ref.goBack();
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

      BackHandler.exitApp();  // 앱 종료
    }
    return true;
  }




  render() {

    //특정 기기에서 폰트가 확대되어 나오기때문에 따로 클래스로 묶어서 폰트 사이즈 다운.
    const cssInjection = `function addStyle(){ 
      const style = document.createElement('style') 
      style.appendChild(document.createTextNode(\` .resultNum { line-height : 1.7; } .slideFooter{ font-size : 1.3em;} .slideFooterSmall{ font-size : .9em; } .HOFName{ font-size : .7em; } \`)) 
      document.body.appendChild(style)
      document.getElementById("root").style.fontSize = ".7em";
    }  
    addStyle();`
    return (

      <View style={{ flex: 1, overflow: 'hidden' }}>
        <AdMobBanner bannerSize="fullBanner"
          adUnitID="ca-app-pub-9106671749645972/6794674721"
          servePersonalizedAds
          onDidFailToReceiveAdWithError={this.bannerError} />
        <WebView
          source={{ uri: "https://lottozip.site" }} 
          textZoom={100}
          
        // injectedJavaScript={cssInjection}
        />
      </View>

    );
  }
}

