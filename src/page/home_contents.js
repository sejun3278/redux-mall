import React, { Component } from 'react';
import axios from 'axios';

import Slider from 'react-styled-carousel';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../Store/modules/signup';
import * as configAction from '../Store/modules/config';
import '../css/home.css';

import category_list from '../source/admin_page.json';

import img from '../source/img/img.json';
// import $ from 'jquery';
import URL from '../config/url';

const style = {
    'showArrows' : false,
    'autoSlide' : 4000,
    'autoplay' : true,
    'infinite' : true,
}

const responsive = [
    { breakPoint: 319, cardsToShow: 1 }
];

class HomeContents extends Component {

    async componentDidMount() {
        await this._getHotItemData();
    }

    _getHotItemData = async () => {
        const { configAction } = this.props;

        const obj = { 'type' : 'SELECT', 'table' : 'goods', 'comment' : '인기 아이템 가져오기' }

        obj['option'] = { 'state' : '=' }
        obj['where'] = [{ 'table' : 'goods', 'key' : 'state', 'value' : 1 }]

        obj['order'] = [];
        obj['order'].push({ 'table' : 'goods', 'key' : 'sales', 'value' : 'DESC' });
        obj['order'].push({ 'table' : 'goods', 'key' : 'limit', 'value' : [0, 10] });

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        configAction.save_hot_item_info({ 'info' : JSON.stringify(get_data.data[0]) })
    }

    render() {
        // const { price_comma } = this.props;
        // const hot_item_info = JSON.parse(this.props.hot_item_info)
        const first_cat_list = category_list.first_category.category;

        return(
            <div id='home_contents_div'>
                <div id='home_contents_slick_div'>
                    <div id='home_event_div'>
                        <Slider responsive={responsive} {...style} >
                            {/* <div className='home_contents_slick_divs'>
                                <h4> 인기 상품 TOP 10 </h4>

                                <div id='home_contents_hot_item_list_div'>
                                    <Slider responsive={hot_item_responsive} {...hot_itme_style} >
                                        {hot_item_info.map( (el, key) => {
                                            return(
                                                <div key={key} className='home_contents_hot_item_divs pointer aCenter font_12'
                                                    onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                                >
                                                    <div className='bold font_12 gray'> Top. {key + 1} </div>
                                                    <div className='home_contents_hot_item_thumb_div' style={{ 'backgroundImage' : `url(${el.thumbnail})` }} />

                                                    <div className='home_contents_hot_item_name_div cut_one_line recipe_korea'> {el.name} </div>
                                                    <div className='home_contents_hot_item_price_div gray'> {price_comma(el.result_price)} 원 </div>
                                                </div>
                                            )
                                        })}
                                    </Slider>

                                </div>
                            </div> */}

                            <div id='home_contents_sejun_mall_notice_div' className='home_contents_slick_divs'>
                                <img src={img.banner.open_event} alt='' className='pointer'
                                    onClick={() => window.location.href='/signup'}
                                />
                            </div>

                            <div className='home_contents_slick_divs'>
                                <img src={img.banner.sebot_banner} alt='' className='pointer'
                                    onClick={() => window.location.href='/se_bot'}
                                />
                            </div>
                        </Slider>
                    </div>

                </div>

                <div id='home_category_show_div'>
                    <h3 className='custom_color_1 recipe_korea'> 상품 카테고리 </h3>

                    <div id='home_category_list_div'
                        style={{ 'gridTemplateColumns' : 'repeat(7, ' + (100 / 7) + '%)' }}
                    >
                        {first_cat_list.map( (el, key) => {
                            return(
                                <div key={key} className='home_category_list_divs'>
                                    <div className='home_category_list_thumn_div pointer' style={{ 'backgroundImage' : `url(${el.img})` }}
                                        onClick={() => window.location.href='/search?first_cat=' + el.value}
                                    />
                                    <div className='font_12 pointer' 
                                        onClick={() => window.location.href='/search?first_cat=' + el.value}
                                    > {el.name} </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div>

                </div>

                
            </div>
        )
    }
}

HomeContents.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        hot_item_info : state.config.hot_item_info
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(HomeContents);