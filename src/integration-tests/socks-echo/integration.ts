/// <reference path='../../arraybuffers/arraybuffers.d.ts' />
/// <reference path="../../networking-typings/communications.d.ts" />
/// <reference path="../../rtc-to-net/rtc-to-net.d.ts" />
/// <reference path="../../socks-common/socks-headers.d.ts" />
/// <reference path="../../socks-to-rtc/socks-to-rtc.d.ts" />
/// <reference path="../../tcp/tcp.d.ts" />
/// <reference path="../../webrtc/peerconnection.d.ts" />

class ProxyIntegrationTest {
  constructor(private dispatchEvent_:(name:string, args:any) => void) {}

  private socksToRtc_ :SocksToRtc.SocksToRtc;
  private rtcToNet_ :RtcToNet.RtcToNet;
  private echoServer_ :Tcp.Server;

  private startEchoServer_ = () : Promise<Net.Endpoint> => {
    this.echoServer_ = new Tcp.Server({
      address: '127.0.0.1',
      port: 0
    });

    this.echoServer_.connectionsQueue.setSyncHandler((tcpConnection:Tcp.Connection) => {
      tcpConnection.dataFromSocketQueue.setSyncHandler((buffer:ArrayBuffer) => {
        tcpConnection.send(buffer);
      });
    });

    return this.echoServer_.listen();
  }

  private startSocksPair_ = () : Promise<Net.Endpoint> => {
    var socksToRtcEndpoint :Net.Endpoint = {
      address: '127.0.0.1',
      port: 0
    };
    var socksToRtcPcConfig :WebRtc.PeerConnectionConfig = {
      webrtcPcConfig: {iceServers: []},
      initiateConnection: true
    };
    var rtcToNetPcConfig :WebRtc.PeerConnectionConfig = {
      webrtcPcConfig: {iceServers: []},
      initiateConnection: false
    };
    var rtcToNetProxyConfig :RtcToNet.ProxyConfig = {
      allowNonUnicast: true  // Allow RtcToNet to contact the localhost server.
    };

    this.socksToRtc_ = new SocksToRtc.SocksToRtc();
    this.rtcToNet_ = new RtcToNet.RtcToNet(rtcToNetPcConfig, rtcToNetProxyConfig);
    this.socksToRtc_.on('signalForPeer', this.rtcToNet_.handleSignalFromPeer);
    this.rtcToNet_.signalsForPeer.setSyncHandler(this.socksToRtc_.handleSignalFromPeer);
    return this.socksToRtc_.start(socksToRtcEndpoint, socksToRtcPcConfig)
  }

  // Assumes webEndpoint is IPv4.
  private connectThroughSocks_ = (socksEndpoint:Net.Endpoint, webEndpoint:Net.Endpoint) : Promise<Tcp.Connection> => {
    var connection = new Tcp.Connection({endpoint: socksEndpoint});
    var authRequest = Socks.composeAuthHandshake([Socks.Auth.NOAUTH]);
    connection.send(authRequest.buffer);
    return connection.receiveNext().then((buffer:ArrayBuffer) : Promise<ArrayBuffer> => {
      var auth = Socks.interpretAuthResponse(new Uint8Array(buffer));
      var request :Socks.Request = {
        version: Socks.VERSION5,
        command: Socks.Command.TCP_CONNECT,
        destination: {
          addressType: Socks.AddressType.IP_V4,
          endpoint: webEndpoint,
          addressByteLength: 7
        }
      };

      connection.send(Socks.composeRequest(request).buffer);
      return connection.receiveNext();
    }).then((buffer:ArrayBuffer) : Tcp.Connection => {
      var expectedBuffer = Socks.composeRequestResponse(webEndpoint);
      var byteArray = new Uint8Array(buffer);
      var expectedByteArray = new Uint8Array(expectedBuffer);
      if (byteArray.byteLength != expectedByteArray.byteLength) {
        throw new Error('Wrong length connection request response');
      }
      for (var i = 0; i < byteArray.byteLength; ++i) {
        if (byteArray[i] != expectedByteArray[i]) {
          throw new Error('Response does not equal expected');
        }
      }
      return connection;
    });
  }

  public run = () : Promise<void> => {
/*
    var arbitraryContents :string = 'Arbitrary contents string';
    var arbitraryArray = new Uint8Array(arbitraryContents.length);
    for (var i = 0; i < arbitraryContents.length; ++i) {
      arbitraryArray[i] = arbitraryContents.charCodeAt(i);
    }
    return Promise.all([this.startSocksPair_(), this.startEchoServer_()])
        .then((endpoints:Net.Endpoint[]) : Promise<Tcp.Connection> => {
          var socksEndpoint = endpoints[0];
          var echoEndpoint = endpoints[1];
          return this.connectThroughSocks_(socksEndpoint, echoEndpoint);
        }).then((connection:Tcp.Connection) => {
          connection.send(arbitraryArray.buffer);
          return connection.receiveNext();
        }).then((receivedBuffer:ArrayBuffer) => {
          var receivedArray = new Uint8Array(receivedBuffer);
          if (receivedArray.byteLength != arbitraryArray.byteLength) {
            throw new Error('Wrong echo length');
          }
          for (var i = 0; i < receivedArray.byteLength; ++i) {
            if (receivedArray[i] != arbitraryArray[i]) {
              throw new Error('Wrong echo contents');
            }
          }
        });
*/
    return Promise.resolve<void>();
  }
}

interface Freedom {
  ProxyIntegrationTest() : {providePromises: (a:new (f:any) => ProxyIntegrationTest) => void};
};

if (typeof freedom !== 'undefined') {
  freedom.ProxyIntegrationTest().providePromises(ProxyIntegrationTest);
}
