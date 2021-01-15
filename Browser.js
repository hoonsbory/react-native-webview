
import * as React from 'react';
import {
    Text,
    View,
    StyleSheet,
    BackHandler,
    Dimensions,
    Image,
    Animated
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

import {
    BarCodeScanner
} from 'expo-barcode-scanner';

const { width } = Dimensions.get('window');
const qrSize = width * 0.7;

export default class Browser extends React.Component {
    state = {
        hasCameraPermission: null,
        scanned: false,
        backHome : true,
        animation: new Animated.Value(.8),
        url: ''
    };

    webview = {
        canGoBack: false,
        canGoForward: false,
        ref: null,
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
            //홈으로 돌아가기
            if(this.state.backHome) this.props.stateChange()
            else{
                this.setState({
                    scanned : false,
                    backHome : true
                })
                Animated.loop(Animated.timing(this.state.animation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true
                })).start();
            }
            
        }
        return true;
    }
    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this.getPermissionsAsync(); 


        //애니메이션 무한반복
        Animated.loop(Animated.timing(this.state.animation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
        })).start();
    }

    //카메라 권한
    getPermissionsAsync = async () => {
        const {
            status
        } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermission: status === 'granted'
        });
    };

    render() {

        const styles = StyleSheet.create({
            container: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: Constants.statusBarHeight,
                backgroundColor: '#ecf0f1',
                padding: 8,
            },
            qr: {
                width: width * .6,
                height: width * .6,
                opacity: .6
            },
            description: {
                fontSize: width * 0.04,
                marginTop: '10%',
                textAlign: 'center',
                width: '70%',
                color: 'white',
            },


            notice : {
                flex: 1,
                justifyContent: 'center',
                fontSize : 100,
                fontWeight : "600",
                alignItems : "center"
            }
        })
        const animationStyles = {
            opacity: this.state.animation
        };
        const aniStyle = {
            width: qrSize,
            height: 3,
            backgroundColor: "red",
            position: "relative",
            top: (width * .6) / 2
        };

        const {
            hasCameraPermission,
            scanned,
            url
        } = this.state;
        
        //권한 차단했을시
        if (hasCameraPermission === null) {
            return <View style={styles.notice}><Text>스캐너를 불러오는 중 입니다.</Text></View>;
        }
        //권한 차단했을시
        if (hasCameraPermission === false) {
            return <View style={styles.notice}><Text> 카메라 권한을 차단하셨습니다. 뒤로갔다가 다시 시도해주세요. </Text></View>;
        }
        return (
            scanned ? <View style={
                {
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }
            } ><WebView source={{ uri: url }} textZoom={100}
                ref={(webView) => { this.webview.ref = webView; }}
                onNavigationStateChange={(navState) => { this.webview.canGoBack = navState.canGoBack; }}
                onError={()=> alert("잘못된 QR 코드입니다.")}
            ></WebView></View> :
                <View style={
                    {
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                    }
                } >
                    <BarCodeScanner onBarCodeScanned={
                        scanned ? undefined : this.handleBarCodeScanned
                    }
                        style={[
                            StyleSheet.absoluteFillObject, styles.container
                        ]}
                    >
                        <Animated.View style={[aniStyle, animationStyles]}></Animated.View>
                        <Image
                            style={styles.qr}
                            source={require('./assets/qrTarget.png')}
                        />
                        <Text style={styles.description}>로또 용지의 QR코드를 스캔해주세요</Text>

                    </BarCodeScanner>

                    {/* {
                        scanned && (<Button title={
                            'Tap to Scan Again'
                        }
                            onPress={
                                () => this.setState({
                                    scanned: false
                                })
                            }
                        />
                        )
                    } */}
                </View>
        );
    }

    //qr코드 인식 후 url 설정
    handleBarCodeScanned = ({
        data
    }) => {
        if(data.indexOf("http") < 0)
        alert("잘못된 QR코드입니다.")
        else
        data = data.replace("qr.nlotto.co.kr", "qr.645lotto.net")
        this.setState({
            scanned: true,
            url: data,
            backHome : false
        });
        // Linking.openURL(data)
        // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };
}