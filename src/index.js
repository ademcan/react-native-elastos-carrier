import {NativeModules, NativeEventEmitter} from 'react-native';
import _ from 'lodash';
import config from './config';

const NativeCarrier = NativeModules.CarrierPlugin;
const Listener = new NativeEventEmitter(NativeCarrier);

/*
 * This is Elastos Carrier plugin
 * 
 */


const exec = async (fnName, ...args)=>{
  return new Promise((resolve, reject)=>{
    NativeCarrier[fnName](...args, (err, rs)=>{
      console.log('exec ['+fnName+'] ===>', err, rs);
      if(err){
        reject(err);
      }
      else{
        resolve(rs);
      }
    });
  });
};

const Carrier = class {
  static config = config;

  /*
   * @brief: get current carrier version
   * @return: (string) current verison
   */
  static getVersion(){
    return exec('getVersion');
  }

  /*
   * @brief: check given address is a valid carrier address or not
   * @return: (boolean) true or false.
   */
  static isValidAddress(address){
    return exec('isValidAddress', address);
  }

  /*
   * @brief: check given nodeId is a valid carrier node id or not
   * @return: (boolean) true or false.
   */
  static isValidId(nodeId){
    return exec('isValidId', nodeId);
  }

  constructor(id, callbacks){
    this.id = id;

    this.config = {
      name : this.id,
      udp_enabled : true,
      bootstraps : config.bootstraps
    };

    this.buildCallbacks(callbacks);
  }

  buildCallbacks(callbacks){
    const def_fn = (name)=>{
      return (...args)=>{
        console.log(`callback [${name}] fired : `, args);
      }
    };
    _.each(_.concat(config.CARRIER_CB_NAMES, config.STREAM_CB_NAMES), (name)=>{
      const fn = callbacks[name] || def_fn(name);
      Listener.addListener(name, (data)=>{
        fn(...data);
      });
    });
  }

  /*
   * @brief: connect the local node to carrier network.
   * @return: ok
   * @error: if connect failure, throw an error here.
   */
  start(){
    return exec('createObject', this.config);
  }

  /*
   * @brief: get current node address
   * @return: (string) node address
   */
  getAddress(){
    return exec('getAddress', this.id);
  }

  /*
   * @brief: get current node id.
   * @return: (string) node id.
   */
  getNodeId(){
    return exec('getNodeId', this.id);
  }

  /*
   * @brief: get current node profile
   * @return: (json) node profile
   * @formatter: userId, gender, region, phone, email, description, name
   */
  getSelfInfo(){
    return exec('getSelfInfo', this.id);
  }

  /*
   * @brief: set value to node profile
   * @param: (json)info
   * @formatter: userId, gender, region, phone, email, description, name
   * @return: ok
   * @error: throw an error if failure
   */
  setSelfInfo(info){
    const user_info = _.extend({
      name : '',
      description : '',
      email : '',
      phone : '',
      gender : '',
      region : ''
    }, info);
    return exec('setSelfInfo', this.id, user_info);
  }

  /*
   * @brief: set current node presence status
   * @param: (number)presence, 0:online, 1:away, 2:busy
   * @return: ok
   * @error: throw an error if failure
   */
  setSelfPresence(presence){
    return exec('setSelfPresence', this.id, presence);
  }

  addFriend(address, msg){
    return exec('addFriend', this.id, address, msg);
  }
  acceptFriend(userId){
    return exec('acceptFriend', this.id, userId);
  }
  getFriendInfo(friendId){
    return exec('getFriendInfo', this.id, friendId);
  }
  sendMessage(friendId, msg){
    return exec('sendFriendMessageTo', this.id, friendId, msg);
  }
  removeFriend(friendId){
    return exec('removeFriend', this.id, friendId);
  }
  setLabel(friendId, label){
    return exec('setLabel', this.id, friendId, label);
  }
  getFriendList(){
    return exec('getFriendList', this.id);
  }
  
  close(){
    return exec('close', this.id);
  }
  clean(){
    return exec('clean', this.id);
  }

  createSession(friendId, streamType, streamMode){
    return exec('createSession', this.id, friendId, streamType, streamMode);
  }

  sessionRequest(friendId){
    return exec('sessionRequest', this.id, friendId);
  }

  sessionReplyRequest(friendId, status, reason){
    return exec('sessionReplyRequest', this.id, friendId, status, reason);
  }

  // addStreamWithType()

  writeStream(streamIdOrFriendId, data){
    return exec('writeStream', this.id, streamIdOrFriendId, data);
  }

  removeStream(friendId){
    return exec('removeStream', this.id, friendId);
  }

  closeSession(friendId){
    return exec('closeSession', this.id, friendId);
  }

  addService(friendId, serviceName, host, port){
    return exec('addService', this.id, friendId, serviceName, host, port);
  }

  removeService(friendId, serviceName){
    return exec('removeService', this.id, friendId, serviceName);
  }

  openPortFowarding(friendId, serviceName, host, port){
    return exec('openPortFowarding', this.id, friendId, serviceName, host, port);
  }
  closePortForwarding(friendId, portForwardingId){
    return exec('closePortForwarding', this.id, friendId, portForwardingId);
  }
  openChannel(friendId, cookie){
    return exec('openChannel', this.id, friendId, cookie);
  }
  closeChannel(friendId, channelId){
    return exec('closeChannel', this.id, friendId, channelId);
  }
  writeChannel(friendId, channelId, data){
    return exec('writeChannel', this.id, friendId, channelId, data)
  }
  pendChannel(friendId, channelId){
    return exec('pendChannel', this.id, friendId, channelId);
  }
  resumeChannel(friendId, channelId){
    return exec('resumeChannel', this.id, friendId, channelId);
  }

  test(){
    NativeCarrier.test();
  }
};


export default Carrier;