import React, { Component } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import CryptoJS from 'crypto-js';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Route, Switch } from 'react-router-dom';

import * as signupAction from './Store/modules/signup';
import * as configAction from './Store/modules/config';
import * as adminAction from './Store/modules/admin';
import * as myPageAction from './Store/modules/my_page';

import { MyPageHome } from './page/body/my_page/index';
import { AdminHome, AdminCategory } from './page/body/admin/index';
import { Header, Login, Signup, SignupComplate, TopCategory, SearchIDPW, Search } from './page/index';

import ReviewList from './page/config/review_list';
import OrderCheck from './page/config/order_check';
import Bottom from './page/config/bottom';

import category_list from './source/admin_page.json';
import { Loading, Goods } from './page/index';

import URL from './config/url.js';
import $ from 'jquery';

import coupon_list from './source/coupon_code.json';

const customStyles = {
  content : {
    top                   : '300px',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '400px',
  }
};

Modal.setAppElement('body')

class App extends Component {

  async componentDidMount() {
    const { configAction } = this.props;
    // 로그인 체크하기
    this._checkLogin();

    const moment = require('moment');
    const now_date = moment().format("YYYY-MM-DD HH:MM:SS");

    configAction.set_init_date({ 'date' : now_date });
  }

  componentDidUpdate() {
    const { review_modal } = this.props;

    if(review_modal === true) {
      $('body').css({ 'overflow' : 'hidden' });
      $('#goods_main_other_div, #goods_fixed_toggle_div, #goods_fixed_price_div').css({ 'display' : 'none' });

    } else {
      $('body').css({ 'overflow' : 'auto' });
      $('#goods_main_other_div, #goods_fixed_toggle_div, #goods_fixed_price_div').css({ 'display' : 'block' });

    }
  }

  // 쿠키 출력하기
  // _getCookie = async (key, type, value, opt) => {
  //   const login_cookie = await axios(URL + '/get/cookie_data', {
  //     method : 'POST',
  //     headers: new Headers(),
  //     data : { 'key' : key, 'type' : type, 'value' : value, 'opt' : opt }
  //   })

  //   console.log(login_cookie)

  //   if(login_cookie.status === 500) {
  //     return window.location.reload();
  //   }

  //   if(login_cookie.data) {
  //     return login_cookie.data;

  //   } else {
  //     return false;
  //   }
  // }

  _getCookie = async (name, type, value, session) => {
    const { _hashString } = this;
    const hash_name = _hashString(name);

    let tool = localStorage;
    if(session) {
      tool = sessionStorage;
    }

    if(type === 'get') {
      return tool.getItem(hash_name);

    } else if(type === 'add') {
      return tool.setItem(hash_name, value);

    } else if(type === 'remove') {
      return tool.removeItem(hash_name);
    }
  }

  _checkAdmin = async (info) => {
    const { configAction } = this.props;

    const obj = { 'type' : 'SELECT', 'table' : 'userInfo', 'comment' : '관리자 정보 가져오기' };

    obj['option'] = {};
    obj['option']['user_id'] = '=';
    obj['option']['admin'] = '=';

    obj['where'] = [];
    obj['where'].push({ 'table' : 'userInfo', 'key' : 'user_id', 'value' : info.id });
    obj['where'].push({ 'table' : 'userInfo', 'key' : 'admin', 'value' : 'Y' });

    const get_admin_info = await axios(URL + '/get/query', {
      method : 'POST',
      headers: new Headers(),
      data : obj
    })

    if(get_admin_info.data[0][0]) {
      configAction.save_admin_info({ 'info' : true })

      return true;
    }
    return false;
  }

  _pageMove = (type, location) => {
    const { login_after } = this.props;
    // type
    // href = '뒤로가기 가능'
    // replace = '뒤로가기 불가'

    let move_url = location;
    if(login_after !== "") {
      move_url = login_after;
    }

    if(type === 'href') {
      return window.location.href = move_url;

    } else if(type === 'replace') {
      return window.location.replace(move_url);
    }
  }

  _modalToggle = (bool) => {
    const { signupAction, configAction } = this.props;

    if(bool === false) {
      signupAction.set_login_after({ 'url' : "" })
      configAction.searching({ 'bool' : false, 'result' : false, 'pw_result' : false, 'result_id' : "" })
      configAction.toggle_search_id_and_pw({ 'bool' : false, 'type' : 'id' })
    }

    return signupAction.modal_toggle({ 'bool' : bool })
  }

  // 로그인 체크
  _checkLogin = async () => {
    const { configAction } = this.props;

    const storage = await this._getCookie('login', 'get');

    let login_info = false;
    if(storage) {
      login_info = JSON.parse(this._stringCrypt(storage, 'sejun_mall_login', false));
    }

    let result_data;
    if(login_info) {
      configAction.login_and_logout({ 'bool' : true });

      // 유저 정보 담기
      const obj = { 'type' : 'SELECT', 'table' : 'userInfo', 'comment' : '유저 정보 가져오기' };
      
      obj['option'] = {};
      obj['option']['id'] = '=';

      obj['where'] = [];
      obj['where'].push({ 'table' : 'userInfo', 'key' : 'id', 'value' : login_info });

      const user_info = await axios(URL + '/api/query', {
        method : 'POST',
        headers: new Headers(),
        data : obj
      })

      configAction.save_user_info({ 'info' : JSON.stringify(user_info.data[0][0]) })
      result_data = user_info.data[0][0];

      // 관리자 확인
      this._checkAdmin(login_info)

    } else {
      configAction.save_user_info({ 'info' : false })
    }

    configAction.set_loading();
    return result_data;
  }

  // category 이름 찾기
  _searchCategoryName = (val, type, first) => {
    //category_list
    let result = '';
    let foreach_target = '';
    if(type === 'first') {
      foreach_target = category_list.first_category.category;

    } else if(type === 'last') {
      foreach_target = category_list.last_category[first];
    }
    
    foreach_target.forEach( (el) => {
      if(val === el.value) {
        result = el.name;
      }
    })

    return result;
  };

  _toggleSearchIdAndPw = (bool, type) => {
    const { configAction } = this.props;
    const obj = { 'bool' : bool, 'type' : type };

    if(bool === false) {
      const data_obj = { 'name' : "", "email_id" : "", "email_host" : "" }
      configAction.set_search_data(data_obj);
      configAction.searching({ 'bool' : false, 'result' : false, 'pw_result' : false, 'result_id' : "" })
    }

    return configAction.toggle_search_id_and_pw(obj);
  }

  // 검색
  _search = (event) => {
    event.preventDefault();

    const form_data = event.target;
    const search = form_data.search.value.trim();

    return window.location.href='/search/?search=' + search;
  }

  // 숫자에 컴마 입력
  price_comma = (price) => {
    const change = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return change;
  }

  // url 필터
  _filterURL = (qry, route) => {
    let url = route === null ? "" : route;
    let start_str = '?';

    for(let key2 in qry) {
      if(qry[key2] !== null) {
        url += start_str + key2 + '=' + qry[key2];
        start_str = '&';
      }
    }
    return window.location.href = url;
  }

  // 카테고리 클릭시 url 설정
  _clickCategory = (qry, first, last) => {
    qry['first_cat'] = first;

    if(last) {
        qry['last_cat'] = last;
    } else {
        qry['last_cat'] = null;
    }

    return this._filterURL(qry, '/search');
  }

  // 스크롤 이동
  _moveScrollbar = (target, type, val) => {
    if(type === 'x') {
      return $(target).scrollLeft(val);

    } else if(type === 'y') {
      return $(target).stop().animate({ scrollTop : val });
    }
  }

  // 모달 style 지정
    _setModalStyle = (top, width) => {
      const customStyles = {
          content : {
            top                   : top,
            left                  : '50%',
            right                 : 'auto',
            bottom                : 'auto',
            marginRight           : '-50%',
            transform             : 'translate(-50%, -50%)',
            width                 : width,
          }
      };

      return customStyles;
  }

  _loginCookieCheck = async (after) => {
    const user_info = JSON.parse(this.props.user_info);
    const user_cookie = await this._getCookie('login', 'get');

    if(!user_info.id || !user_cookie) {
      alert('로그인이 필요합니다.');

      if(after) {
        if(after === 'login') {
          this._modalToggle(true);
          return false;
        }
      }

      window.location.replace('/');
      return false;
    }
  }

      // 쿠폰 조회하기
      _getCouponList = async () => {
        const { myPageAction } = this.props;
        const user_info = JSON.parse(this.props.user_info);

        const obj = { 'type' : 'SELECT', 'table' : 'coupon', 'comment' : '쿠폰 조회하기' };

        obj['option'] = {};

        obj['option']['user_id'] = '=';
        obj['option']['state'] = '=';
        obj['option']['limit_date'] = '>=';
        // obj['option']['use_order_id'] = 'IS NULL';

        obj['where'] = [];
        obj['where'][0] = { 'table' : 'coupon', 'key' : 'user_id', 'value' : user_info.user_id };
        obj['where'][1] = { 'table' : 'coupon', 'key' : 'state', 'value' : 0 };
        obj['where'][2] = { 'table' : 'coupon', 'key' : 'limit_date', 'value' : null };
        // obj['where'][3] = { 'table' : 'coupon', 'key' : 'use_order_id', 'value' : null };

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        const cover_data = [];
        get_data.data[0].forEach( (el) => {
            if(coupon_list.coupon_code[el.code]) {
                if(coupon_list.coupon_code[el.code].able === true) {
                    cover_data.push(el);
                }
            }
        })

        myPageAction.save_coupon_data({ 'list' : JSON.stringify(cover_data) })
    }

  // 쿠폰 등록하기
  _addCoupon = async (code_str, get, alerts, check, users_id, event) => {
    const code = code_str ? code_str : $('input[name=coupon_add_code]').val().trim(); 
    const { coupon_add_loading, myPageAction } = this.props;

    if(coupon_add_loading === true) {
        return;
    }

    if(code === "" || code.length === 0) {
        $('input[name=coupon_add_code]').focus();
        return alert('추가할 쿠폰 코드 번호를 입력해주세요.');

    } else {
        const { admin_info } = this.props;
        const user_info = JSON.parse(this.props.user_info);

        if(check === null || check === true) {
          this._loginCookieCheck();
        }

        if(coupon_list.coupon_code[code] === undefined || (coupon_list.coupon_code[code].search === false && event === null)) {
            return alert('해당 코드의 쿠폰을 찾을 수 없습니다.');

        } else {
            const coupon = coupon_list.coupon_code[code];
            if(coupon.able === false) {
                return alert('사용할 수 없는 쿠폰입니다.');
            
            } else {
                if(coupon.admin === true) {
                    if(admin_info !== true) {
                        return alert('권한이 없습니다.');
                    }
                }
            }

            myPageAction.toggle_coupon_add({ 'bool' : true });

            // 쿠폰 중복 체크
            const obj = { 'type' : 'SELECT', 'table' : 'coupon', 'comment' : '쿠폰 중복 체크' };

            obj['option'] = {};

            obj['option']['user_id'] = '=';
            obj['option']['code'] = '=';
            obj['option']['state'] = '=';

            const user_id = users_id ? users_id : user_info.user_id;

            obj['where'] = [];
            obj['where'][0] = { 'table' : 'coupon', 'key' : 'user_id', 'value' : user_id };
            obj['where'][1] = { 'table' : 'coupon', 'key' : 'code', 'value' : code };
            obj['where'][2] = { 'table' : 'coupon', 'key' : 'state', 'value' : 0 };

            const query_result = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            if(query_result.data[0][0]) {
                myPageAction.toggle_coupon_add({ 'bool' : false });

                return alert('이미 추가된 쿠폰입니다.');
            }
            
            // 쿠폰 추가
            obj['type'] = 'INSERT';
            obj['comment'] = '쿠폰 추가';

            obj['columns'] = [];

            const percent = coupon.percent === true ? 1 : 0;

            obj['columns'].push({ "key" : "user_id", "value" : user_id })
            obj['columns'].push({ "key" : "code", "value" : code })
            obj['columns'].push({ "key" : "discount", "value" : coupon.discount })
            obj['columns'].push({ "key" : "limit_price", "value" : coupon.limit_price })
            obj['columns'].push({ "key" : "state", "value" : 0 })
            obj['columns'].push({ "key" : "create_date", "value" : null })
            obj['columns'].push({ "key" : "limit_date", "value" : coupon.limit_date })
            obj['columns'].push({ "key" : "name", "value" : coupon.name })
            obj['columns'].push({ "key" : "max_discount", "value" : coupon.max_discount })
            obj['columns'].push({ "key" : "percent", "value" : percent })

            await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            myPageAction.toggle_coupon_add({ 'bool' : false });

            $('input[name=coupon_add_code]').val("");

            if(get) {
              // 쿠폰 리스트 가져오기
              get();
            }

            if(alerts === null || alerts === true) {
              alert('쿠폰이 등록되었습니다.');
              this._getCouponList();
            }
        }
    }
}

  // 포인트 적립 & 삭감
  _setPoint = async (point, type, comment, user_id) => {
    // const { _checkLogin } = this;
    
    const get_user_info_qry = { 'type' : 'SELECT', 'table' : 'userInfo', 'comment' : '유저 정보 가져오기' };

    get_user_info_qry['option'] = { 'id' : '=' };
    get_user_info_qry['where'] = [ { 'table' : 'userInfo', 'key' : 'id', 'value' : user_id } ];

    const get_user_info = await axios(URL + '/api/query', {
      method : 'POST',
      headers: new Headers(),
      data : get_user_info_qry
    });
    const user_info = get_user_info.data[0][0];

    if(user_info.id) {
      let user_point = user_info.point

      const obj = { 'type' : 'UPDATE', 'table' : 'userInfo' };

      obj['columns'] = [];

      obj['where'] = [];
      obj['where'].push({ 'key' : 'id', 'value' : user_info.id });
      obj['where'].push({ 'key' : 'user_id', 'value' : user_info.user_id });

      obj['where_limit'] = 1;

      if(type === 'add') {
        // 적립
        user_point += point;

        obj['comment'] = '포인트 적립하기';

        const acc_point = user_info.acc_point + point;
        obj['columns'].push({ 'key' : 'acc_point', 'value' : acc_point });

      } else if(type === 'remove') {
        // 삭감
        user_point -= point;

        // const get_info = await _checkLogin();
        if(user_info.point < point) {
          alert('결제 실패 : 포인트가 부족합니다. \n ( 보유 포인트 : ' + user_info.point + ' )');
          return false;
        }

        obj['comment'] = '포인트 삭감하기';

        const use_point = user_info.use_point + point;
        obj['columns'].push({ 'key' : 'use_point', 'value' : use_point });
      }

      obj['columns'].push({ 'key' : 'point', 'value' : user_point })

      await axios(URL + '/api/query', {
        method : 'POST',
        headers: new Headers(),
        data : obj
      });

      this._addPointLog(type, comment, point);
      return user_point;
    }
  }

  // 포인트 내역 추가하기
  _addPointLog = async (type, comment, point) => {
    const user_info = JSON.parse(this.props.user_info);
    const obj = { 'type' : 'INSERT', 'table' : 'point_log', 'comment' : '포인트 내역 추가하기' };
    
    obj['columns'] = [];
    
    obj['columns'].push({ "key" : "user_id", "value" : user_info.id });
    const log_type = type === 'add' ? 0 : 1;
    obj['columns'].push({ "key" : "type", "value" : log_type });
    const log_point = type === 'remove' ? '-' + point : point;
    obj['columns'].push({ "key" : "point", "value" : log_point });
    obj['columns'].push({ "key" : "comment", "value" : comment });
    obj['columns'].push({ "key" : "date", "value" : null });

    await axios(URL + '/api/query', {
      method : 'POST',
      headers: new Headers(),
      data : obj
    });
  }

  // 문자열 해싱하기
  _hashString = (s) => {

    if(typeof s !== 'string') {
      s = String(s);
    }

    function SHA256(s){
        
        var chrsz   = 8;
        var hexcase = 0;
      
        function safe_add (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }
      
        function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
        function R (X, n) { return ( X >>> n ); }
        function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
        function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
        function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
        function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
        function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
        function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
      
        function core_sha256 (m, l) {
            
            var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1,
                0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
                0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786,
                0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
                0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147,
                0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
                0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B,
                0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
                0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A,
                0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
                0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);

            var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);

            var W = new Array(64);
            var a, b, c, d, e, f, g, h, i, j;
            var T1, T2;
      
            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >> 9) << 4) + 15] = l;
      
            for ( var i = 0; i<m.length; i+=16 ) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];
      
                for ( var j = 0; j<64; j++) {
                    if (j < 16) W[j] = m[j + i];
                    else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
      
                    T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                    T2 = safe_add(Sigma0256(a), Maj(a, b, c));
      
                    h = g;
                    g = f;
                    f = e;
                    e = safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = safe_add(T1, T2);
                }
      
                HASH[0] = safe_add(a, HASH[0]);
                HASH[1] = safe_add(b, HASH[1]);
                HASH[2] = safe_add(c, HASH[2]);
                HASH[3] = safe_add(d, HASH[3]);
                HASH[4] = safe_add(e, HASH[4]);
                HASH[5] = safe_add(f, HASH[5]);
                HASH[6] = safe_add(g, HASH[6]);
                HASH[7] = safe_add(h, HASH[7]);
            }
            return HASH;
        }
      
        function str2binb (str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for(var i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
            }
            return bin;
        }
      
        function Utf8Encode(string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
      
            for (var n = 0; n < string.length; n++) {
      
                var c = string.charCodeAt(n);
      
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
      
            }
      
            return utftext;
        }
      
        function binb2hex (binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for(var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
                hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
            }
            return str;
        }
      
        s = Utf8Encode(s);
        return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
      
    }
    const hash_str = SHA256(s);

    return hash_str;
  };

  // 상품 재고 최신화하기
  _setGoodsStock = async (order_info, type) => {
    const obj = { 'type' : 'UPDATE', 'table' : 'goods', 'comment' : '상품 재고 최신화' };

    obj['columns'] = [];
    obj['where'] = [];
    obj['where_limit'] = 0;

    const _setCartData = async () => {
      let cart_data = JSON.parse(order_info.cart_list);
      // const user_info = JSON.parse(this.props.user_info);

      const cart_each_type = typeof cart_data === 'number' ? true : false;

      const get_cart_obj = { 'type' : 'SELECT', 'comment' : 'cart data 구하기' };
      get_cart_obj['option'] = {};
      get_cart_obj['where'] = [];

      if(typeof cart_data === 'number') {
          // goods id 일 경우
          get_cart_obj['table'] = 'goods';

          get_cart_obj['option']['id'] = '=';

          cart_data = [cart_data];

      } else if(typeof cart_data === 'object') {
          // cart id 일 경우
          get_cart_obj['table'] = 'cart';
          get_cart_obj['join'] = true;
          get_cart_obj['join_table'] = 'goods';

          get_cart_obj['join_arr'] = [];
          get_cart_obj['join_arr'][0] = { 'key1' : 'id', 'key2' : 'goods_id' }

          get_cart_obj['join_where'] = [];
          get_cart_obj['join_where'].push({ 'columns' : 'stock', 'as' : 'stock' });
          get_cart_obj['join_where'].push({ 'columns' : 'sales', 'as' : 'sales' });

          get_cart_obj['option']['user_id'] = '=';
          get_cart_obj['option']['id'] = '=';

          get_cart_obj['where'][0] = { 'table' : 'cart', 'key' : 'user_id', 'value' : order_info.user_id };
      }

      const result_data = [];
      const get_cart_data = async (length) => {
          if(result_data.length === cart_data.length) {
              return result_data;
          }

          if(cart_each_type === true) {
              // el 이 goods 테이블의 id
              get_cart_obj['where'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : cart_data[length] };
  
          } else {
              // el 이 cart 테이블의 id
              get_cart_obj['where'][1] = { 'table' : 'cart', 'key' : 'id', 'value' : cart_data[length] };
          }
  
          const get_data = await axios(URL + '/api/query', {
              method : 'POST',
              headers: new Headers(),
              data : get_cart_obj
          });
  
          result_data.push(get_data.data[0][0]);

          return get_cart_data(length + 1);
      }

      const cover_cart_data = await get_cart_data(0);
      return cover_cart_data;
  }
  const cart_data = await _setCartData();

    const set_goods_stock = async () => {
        return await cart_data.forEach( async (el) => {
            const num = order_info.goods_num ? order_info.goods_num : el.num;
            const cover_stock = el.stock ? el.stock : el.goods_stock;
            const goods_id = el.goods_id ? el.goods_id : el.id;

            let stock = 0;
            let sales = 0;

            if(type === 'remove') {
              // 재고 삭제 및 판매량 증가
              stock = (cover_stock - num) < 0 ? 0 : cover_stock - num;
              sales = el.sales + num;

            } else if(type === 'add') {
              // 재고 증가 및 판매량 감소
              stock = el.stock + num;
              sales = (el.sales - num) < 0 ? 0 : el.sales - num;
            }

            obj['columns'][0] = { 'key' : 'stock', 'value' : stock };
            obj['columns'][1] = { 'key' : 'sales', 'value' : sales };

            obj['where'][0] = { 'key' : 'id', 'value' : goods_id }

            await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            });
        });
    }

    return await set_goods_stock();
  }

  // 로그인 후 url 이동하기
  _loginAfter = async (url, check) => {
    const { signupAction } = this.props;
    const { _modalToggle, _getCookie, _hashString } = this;

    const user_info = JSON.parse(this.props.user_info);
    const user_cookie = await this._getCookie('login', 'get');

    if(user_info === false || user_cookie === false) {
      alert('로그인이 필요합니다.');

      signupAction.set_login_after({ 'url' : url })
      _modalToggle(true);

      return false;
    
    } else {
      if(check === true) {
        return true;
      }
    }

    if(url === '/myPage/order_list') {
      await _getCookie(_hashString('detail_order_id'), 'remove');
    }

  return window.location.href = url;
  }

  // 리뷰 삭제하기
  _removeReview = async (review_id, goods_id, score, user_id, confirm) => {
    if(confirm === true) {
      if(!window.confirm('리뷰를 삭제하시면 해당 주문에서는 리뷰를 재작성 할 수 없습니다. \n정말 리뷰를 삭제하시겠습니까?')) {
        return;
      }
    }

    const location = document.location;
    const url = location.pathname + location.search;

    const login_check = await this._loginAfter(url, true);
    if(login_check !== true) {
      return;
    }

    const user_info = JSON.parse(this.props.user_info);

    const obj = { 'type' : 'SELECT', 'table' : 'goods', 'comment' : '상품 평점 정보 가져오기', 'join' : true, 'join_table' : 'review' };

    obj['columns'] = [];
    obj['columns'].push({ "table" : "goods", "columns" : "star" })
    obj['columns'].push({ "table" : "goods", "columns" : "acc_star" })

    obj['join_arr'] = [];
    obj['join_arr'][0] = { 'key1' : 'goods_id', 'key2' : 'id' }

    obj['join_where'] = [];
    obj['join_where'].push({ 'opt' : 'count' });

    obj['option'] = {};
    obj['where'] = [];

    obj['option']['id'] = '=';
    obj['option']['state'] = '=';

    obj['where'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : goods_id };
    obj['where'][0] = { 'table' : 'review', 'key' : 'state', 'value' : 0 };

    const get_data = await axios(URL + '/api/query', {
        method : 'POST',
        headers: new Headers(),
        data : obj
    })

    const count = get_data.data[0][0].count - 1;
    const acc_star = get_data.data[0][0].acc_star - score;

    const star = Math.floor(acc_star / count);
    // // 별점 업데이트
    const update_obj = { 'type' : 'UPDATE', 'table' : 'goods', 'comment' : '별점 취소하기' };
    
    update_obj['columns'] = [];
    update_obj['columns'].push({ 'key' : 'star', 'value' : star });
    update_obj['columns'].push({ 'key' : 'acc_star', 'value' : acc_star });
    
    update_obj['where'] = [];
    update_obj['where'].push({ 'key' : 'id', 'value' : goods_id });

    update_obj['where_limit'] = 0;

    await axios(URL + '/api/query', {
      method : 'POST',
      headers: new Headers(),
      data : update_obj
    })

    const remove_obj = { 'type' : 'UPDATE', 'table' : 'review', 'comment' : '리뷰 삭제하기' };

    remove_obj['columns'] = [];
    remove_obj['columns'].push({ 'key' : 'state', 'value' : 1 });
    remove_obj['columns'].push({ 'key' : 'remove_date', 'value' : null });

    remove_obj['where'] = [];        
    remove_obj['where'].push({ 'key' : 'user_id', 'value' : user_id ? user_id : user_info.id });
    remove_obj['where'].push({ 'key' : 'id', 'value' : review_id });

    remove_obj['where_limit'] = 1;

    const remove_review = await axios(URL + '/api/query', {
      method : 'POST',
      headers: new Headers(),
      data : remove_obj
    });

    if(remove_review.data[0]) {
      return true;

    } else {
      alert('문제 발생으로 리뷰를 삭제하지 못했습니다. \n관리자에게 문의해주세요.');
      
      return false;
    }
  }
  
  // Infinite 스크롤링에서 최하단에 도달했는지를 감지
  _checkScrolling = (event) => {

    const scroll_top = $(event).scrollTop();
    // 현재 스크롤바의 위치

    const inner_height = $(event).innerHeight();
    // 해당 div 의 총 높이

    const scroll_height = $(event).prop('scrollHeight');

    if( Math.round(scroll_top + inner_height) >= scroll_height) {
      return true;
    }

    return false;
  }

  _searchStringColor = (goods_name, search) => {
    const first_idx = goods_name.indexOf(search);
    const slice_str = goods_name.slice(0, first_idx);
    const last_str = goods_name.slice((first_idx + search.length), goods_name.length);

    goods_name = slice_str + `<b class='bold search_line'> ${search} </b>` + last_str;

    return goods_name;
  }

  // 메일 전송하기
  _sendMailer = async (sand_mail) => {
  
    const sand_result = await axios(URL + '/api/send_mail', {
      method : 'POST',
      headers: new Headers(),
      data : sand_mail
    })

    if(sand_result.data === true) {
      return true;

    } else {
      return false;
    }
  }

  // alert 내역 추가하기
  _addAlert = async (info) => {
    const add_qry = { 'type' : 'INSERT', 'table' : 'alert', 'comment' : "내역 추가하기" };

    add_qry['columns'] = [];
    add_qry['columns'].push({ "key" : "user_id", "value" : info.user_id });
    add_qry['columns'].push({ "key" : "reason", "value" : info.reason });
    add_qry['columns'].push({ "key" : "move_url", "value" : info.move_url });
    add_qry['columns'].push({ "key" : "create_date", "value" : null });
    add_qry['columns'].push({ "key" : "confirm", "value" : 0 });

    const set_alert = await axios(URL + '/api/query', {
        method : 'POST',
        headers: new Headers(),
        data : add_qry
    })

    console.log(set_alert);

  }

  // 문자 해시 및 복호화
  _stringCrypt = (string, salt, bool) => {
    let result = '';

    if(typeof string !== 'string') {
      string = String(string);
    }

    if(typeof salt !== 'string') {
      salt = String(salt)
    }

    if(bool === true) {
      // 문자 해싱하기
      result = CryptoJS.AES.encrypt(JSON.stringify(string), salt).toString();
      
    } else if(bool === false) {
      // 문자 복호화하기
      const bytes = CryptoJS.AES.decrypt(string, salt);
      result = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }


    return result;
  }

  render() {
    const { login_modal, admin_info, login, admin_state, search_id_pw_modal, loading, review_modal } = this.props;
    const { 
          _pageMove, _modalToggle, _checkAdmin, _checkLogin, _searchCategoryName, _toggleSearchIdAndPw, _search, price_comma, _setPoint, _loginAfter,
          _filterURL, _clickCategory, _moveScrollbar, _getCookie, _setModalStyle, _loginCookieCheck, _addCoupon, _getCouponList, _hashString, _setGoodsStock,
          _removeReview, _checkScrolling, _searchStringColor, _sendMailer, _addAlert, _stringCrypt
    } = this;
    const user_info = JSON.parse(this.props.user_info);

      const now_url = document.location.href.split('/');
      let cat_name = '';

      let detail_url = '';

      if(now_url[4] !== undefined) {
        detail_url = now_url[4].split('?')[0];
      }

      if(now_url[3] === 'admin') {
        if(now_url[4] === undefined || detail_url === 'goods') {
          cat_name = '상품 관리';

        } else if(now_url[5] === 'goods_write') {
          cat_name = '상품 등록';
        
        } else if(now_url[4] === 'order' || detail_url === 'order') {
          cat_name = '주문 관리';
        
        } else if(now_url[4] === 'delivery') {
          cat_name = '배송 관리';

        } else if(now_url[4] === 'user') {
          cat_name = '회원 관리';
        }
    }
    
    // 5 초간 로딩 확인하기
    setTimeout(() => {
      const { loading } = this.props;

        if(loading === false) {
          // return window.location.reload();
        }
    }, 3000);

    return(
      <div className='App'>
          {loading === false && user_info === null
          
          ? <Loading />
          
          :
          <div>
            {/* {JSON.stringify(user_info)} */}
            <Route path='/'
                render={(props) => <Header
                  user_info={user_info}
                  _pageMove={_pageMove}
                  _modalToggle={_modalToggle}
                  admin_info={admin_info}
                  _search={_search}
                  _getCookie={_getCookie}
                  _hashString={_hashString}
                  _loginAfter={_loginAfter}
                  {...props}  />}
              />

          <div>
            <Route path='/'
                render={(props) => <TopCategory
                    cat_name={cat_name}
                    _pageMove={_pageMove}
                    _filterURL={_filterURL}
                    _clickCategory={_clickCategory}
                    _moveScrollbar={_moveScrollbar}
                  {...props}  />}
            />
          </div>

          <div id='body_div'>

            <div id='body_div_left'>
              {user_info && login && admin_state ?
              <div>
                <Route path='/admin' 
                      render={(props) => <AdminCategory
                        cat_name={cat_name}
                        _pageMove={_pageMove}
                      {...props} 
                />}
                />
              </div>
              : null}

            </div>
            {/* */}

            <div id='body_div_center'>
              <Modal
                isOpen={login_modal}
                // onAfterOpen={afterOpenModal}
                onRequestClose={!search_id_pw_modal ? () => _modalToggle(false) : null}
                style={customStyles}
                // contentLabel="Example Modal"
              >
                {!search_id_pw_modal
                ?
                  <Login 
                    _pageMove={_pageMove}
                    _modalToggle={_modalToggle}
                    _toggleSearchIdAndPw={_toggleSearchIdAndPw}
                    _hashString={_hashString}
                    _stringCrypt={_stringCrypt}
                    _getCookie={_getCookie}
                  />

                : <SearchIDPW
                    _modalToggle={_modalToggle}
                    _toggleSearchIdAndPw={_toggleSearchIdAndPw}
                    _sendMailer={_sendMailer}
                />
                }

              </Modal>
              
              <Switch>
                {user_info !== null ? 
                  <Route path='/admin'
                        render={(props) => <AdminHome 
                          cat_name={cat_name}
                          login={login}
                          user_info={user_info}
                          _checkAdmin={_checkAdmin}
                          admin_info={admin_info}
                          _checkLogin={_checkLogin}
                          _pageMove={_pageMove}
                          _searchCategoryName={_searchCategoryName}
                          price_comma={price_comma}
                          _addCoupon={_addCoupon}
                          _getCouponList={_getCouponList}
                          _getCookie={_getCookie}
                          _filterURL={_filterURL}
                          _hashString={_hashString}
                          _searchStringColor={_searchStringColor}
                          _setModalStyle={_setModalStyle}
                          _setGoodsStock={_setGoodsStock}
                          _setPoint={_setPoint}
                          _sendMailer={_sendMailer}
                          _addAlert={_addAlert}
                        {...props} 
                  />}
                />
              : null}

                <Route path='/search' 
                      render={(props) => <Search
                        _search={_search}
                        _searchCategoryName={_searchCategoryName}
                        price_comma={price_comma}
                        _filterURL={_filterURL}
                        _clickCategory={_clickCategory}
                        _moveScrollbar={_moveScrollbar}
                        _modalToggle={_modalToggle}
                        user_info={user_info}
                        _checkLogin={_checkLogin}
                        // cat_name={cat_name}
                        // _pageMove={_pageMove}
                      {...props} 
                  />}
                />

                <Route path='/goods'
                      render={(props) => <Goods
                        admin_info={admin_info}
                        _searchCategoryName={_searchCategoryName}
                        _pageMove={_pageMove}
                        price_comma={price_comma}
                        _modalToggle={_modalToggle}
                        _getCookie={_getCookie}
                        _moveScrollbar={_moveScrollbar}
                        _loginCookieCheck={_loginCookieCheck}
                        _loginAfter={_loginAfter}
                        _filterURL={_filterURL}
                        loading={loading}
                        _checkLogin={_checkLogin}
                        _setModalStyle={_setModalStyle}
                        _removeReview={_removeReview}
                        _stringCrypt={_stringCrypt}
                      {...props} 
                  />}
                />
              
                <Route exact path='/signup' 
                      render={(props) => <Signup 
                        login={login}
                        user_info={user_info}
                        _getCookie={_getCookie}
                        _addCoupon={_addCoupon}
                        _stringCrypt={_stringCrypt}
                        _hashString={_hashString}
                          {...props} 
                  />}
                />
                <Route path='/signup/complate/:id' 
                      render={(props) => <SignupComplate 
                          _pageMove={_pageMove} 
                          _modalToggle={_modalToggle}
                          login={login}
                          user_info={user_info}
                          _getCookie={_getCookie}
                          _stringCrypt={_stringCrypt}
                          _checkLogin={_checkLogin}
                          {...props} 
                  />}
                />

                <Route path='/myPage'
                      render={(props) => <MyPageHome
                      login={login}
                      user_info={user_info}
                      _getCookie={_getCookie}
                      _pageMove={_pageMove}
                      price_comma={price_comma}
                      _modalToggle={_modalToggle}
                      _setModalStyle={_setModalStyle}
                      admin_info={admin_info}
                      _loginCookieCheck={_loginCookieCheck}
                      _addCoupon={_addCoupon}
                      _getCouponList={_getCouponList}
                      _setPoint={_setPoint}
                      _checkLogin={_checkLogin}
                      _filterURL={_filterURL}
                      _hashString={_hashString}
                      _moveScrollbar={_moveScrollbar}
                      _setGoodsStock={_setGoodsStock}
                      _removeReview={_removeReview}
                      _checkScrolling={_checkScrolling}
                      _searchStringColor={_searchStringColor}
                      {...props} 
                  />}
                />
              </Switch>

                <Route path='/orderCheck'
                        render={(props) => <OrderCheck 
                          user_info={user_info}
                          _checkLogin={_checkLogin}
                          _getCookie={_getCookie}
                          _hashString={_hashString}
                          _setPoint={_setPoint}
                          _filterURL={_filterURL}
                          _setGoodsStock={_setGoodsStock}
                        {...props} 
                  />}
                />

                <Modal
                  isOpen={review_modal}
                  // onRequestClose={review_modal ? () => configAction.toggle_review_modal({ 'bool' : false }) : null}
                  style={_setModalStyle('50%', '450px')}
                >
                  <ReviewList 
                    user_info={user_info}
                    price_comma={price_comma}
                    _moveScrollbar={_moveScrollbar}
                    _checkLogin={_checkLogin}
                    _checkScrolling={_checkScrolling}
                  />
                </Modal>
            </div>

            <div id='body_div_right'></div>
            </div>

          <Bottom />

          </div>
        }
        {/* </div>  */}
      {/* // : null } */}
      </div>
    )
  }
}

App.defaultProps = {
}

export default connect(
  (state) => ({
    login_modal : state.signup.login_modal,
    login : state.config.login,
    admin_info : state.config.admin_info,
    admin_state : state.admin.admin_state,
    user_info : state.config.user_info,
    login_after : state.signup.login_after,
    search_id_pw_modal : state.config.search_id_pw_modal,
    search_id_pw_type : state.config.search_id_pw_type,
    select_cat_open : state.config.select_cat_open,
    loading : state.config.loading,
    review_modal : state.config.review_modal
  }), 
  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch),
    configAction : bindActionCreators(configAction, dispatch),
    adminAction : bindActionCreators(adminAction, dispatch),
    myPageAction : bindActionCreators(myPageAction, dispatch)
  })
)(App);