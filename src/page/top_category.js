import React, { Component } from 'react';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../Store/modules/signup';
import * as configAction from '../Store/modules/config';
import '../css/home.css';

import cat_list from '../source/admin_page.json';
import img from '../source/img/icon.json';
import $ from 'jquery';

class Top_category extends Component {

    componentDidMount() {
        const { _moveScrollbar, location } = this.props;
        $('.slick-arrow').remove();

        const qry = queryString.parse(location.search); 
        if(qry['first_cat']) {
            const first_cat_list = cat_list.first_category.category;
            let target = '#first_cat_scroll_';

            first_cat_list.forEach( (el, key) => {
                if(el.value === qry['first_cat']) {
                    target += key;
                }
            })
            
            const width = $(target).offset().left;
            _moveScrollbar('#top_category_index_div', 'x', width)
        }


        // $('#category_slick_ul').slick({
        //     slidesToShow: 3,
        //     slidesToScroll: 1,
        //     autoplay: true,
        //     autoplaySpeed: 2000,
        // });
    }

    _categoryToggle = (bool) => {
        const { configAction } = this.props;

        if(bool) {
            configAction.select_cat_data({ 'bool' : true });
            $('#open_top_category_display').slideDown(500);

        } else if(bool === false) {
            $('.last_cat_list').removeClass('bold black');
            configAction.select_cat_data({ 'type' : null, 'bool' : false });

            $('#open_top_category_display').fadeOut(200);
        }
    }

    // 카테고리 상위 제목 클릭시
    _mouseToggle = (type, bool, value) => {
        const { configAction, select_last_cat } = this.props;
        $('.last_cat_list').removeClass('bold black');
        $('.each_last_cat').removeClass('select_last_cat')

        if(bool) {
            let last_cat = select_last_cat ? select_last_cat : null;
            $('#select_last_cat_' + type).addClass('bold black')

            const $target = $('#top_category_list_grid_div');
            const scrollX = $target.scrollLeft();
            $target.scrollLeft(scrollX + 100);

            // console.log($target, scrollX)

            if(value) {
                last_cat = value;
                // $('#each_last_cat_' + value).addClass('select_last_cat');
            }
            configAction.select_cat_data({ 'type' : type, 'last_cat' : last_cat });
        }
    }

    render() {
        const { select_cat, select_last_cat, select_cat_open, _pageMove, _clickCategory } = this.props;
        const { _categoryToggle, _mouseToggle } = this;

        const list_length = cat_list.first_category.category.length + 1;
        const list_width = 100 / list_length;

        const repeat_str = 'repeat(' + list_length + ',' + list_width + '%)';

        let last_cat_list = [];
        if(select_cat !== null) {
            last_cat_list = cat_list.last_category[select_cat];
        }

        const qry = queryString.parse(this.props.location.search);
        
        return(
            <div id='top_category_div'>
                <div id='top_category_index_div' className='top_category_grid_div list_none'
                    //  onClick={!select_cat_open ? () => _categoryToggle(true) : null}
                    onClick={() => _categoryToggle(true)}
                >
                    <div id='top_category_left'> </div>
                    <div id='top_category_center'>
                        <div id='top_category_list_grid_div'
                            className='aCenter top_category_list'
                            style={{ 'gridTemplateColumns' : repeat_str }}
                            // style={{ 'gridTemplateColumns' : '20% auto'}}
                        >
                            <div className='pointer'
                                 onClick={() => _pageMove('href', '/search')}
                            >
                                <img alt='' src={img.icon.window_icon} /> 
                                전체 보기 
                            </div>
                    
                            {/* <div id='top_category_slick_div'> */}
                                {/* <Slider {...settings}> */}
                                {cat_list.first_category.category.map( (el, key) => {
                                    return(
                                        <div key={key} className={qry.first_cat === el.value ? 'bold orange pointer' : 'pointer'} id={"cat_list_num_" + key}
                                            id={"first_cat_scroll_" + key}
                                            style={select_cat === el.value ? { 'fontWeight' : 'bold', 'color' : '#16a596' } : null}
                                            onClick={select_cat_open === false ? () => _mouseToggle(el.value, true, null, select_last_cat) : () => _clickCategory(qry, el.value)}
                                            onMouseOver={select_cat_open ? () => _mouseToggle(el.value, true, null, null) : null}
                                            
                                        >
                                            <img alt='' src={el.img}/>
                                            {el.name}
                                        </div>
                                    )
                                })} 
                                {/* </Slider> */}
                            {/* </div> */}
                        </div>
                    </div>
                    <div id='top_category_right'> </div>
                </div>

                {select_cat_open ? 
                <div id='open_top_category_display'>
                    <div id='open_top_category_div' className='border_bottom gray'>
                        <div />
                        <div id='top_category_contents_div' className='aCenter top_category_list'
                            style={{ 'gridTemplateColumns' : repeat_str}}
                        >
                            <div className='border_right'>
                                <ul id='category_slick_ul' className='list_none gray'>
                                    {cat_list.first_category.category.map( (el, key) => {
                                        return(
                                            <div key={key}>
                                                <li
                                                    onMouseOver={() => _mouseToggle(el.value, true, null, key)}
                                                    onClick={() => _clickCategory(qry, el.value)}
                                                    className={select_cat === el.value ? 'select_cat pointer' : 'pointer'}
                                                    style={qry.first_cat === el.value ? { 'color' : 'orange', 'fontWeight' : 'bold', 'borderBottom' : 'solid 1px orange', 'fontSize' : '14px' } : null}
                                                >
                                                    {el.name}
                                                </li>
                                            </div>
                                        )
                                    })}
                                </ul>
                            </div>

                            {cat_list.first_category.category.map( (el, key) => {
                                let second_cat_list = cat_list.last_category[el.value];

                                return(
                                    <ul key={key} className='list_none last_cat_list' id={'select_last_cat_' + el.value}>
                                        {second_cat_list.map( (cu, key2) => {
                                            return(
                                                <li key={key2} id={'each_last_cat_' + cu.value} 
                                                    className={select_last_cat === cu.value ? 'select_cat pointer each_last_cat' : 'pointer each_last_cat'} 
                                                    onMouseOver={() => _mouseToggle(el.value, true, cu.value)}
                                                    onClick={() => _clickCategory(qry, el.value, cu.value)}    
                                                    style={qry.last_cat === cu.value ? { 'color' : 'orange', 'fontWeight' : 'bold', 'borderBottom' : 'solid 1px orange', 'fontSize' : '14px' } : null}
                                                >
                                                    {cu.name}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )
                            })}
                        </div>

                        <div id='category_responsive_div' className='display_none'>
                            <div id='category_responsive_grid_div'>
                                <div id='category_responsive_first_cat_div' className='aCenter border_right'>
                                    {cat_list.first_category.category.map( (el, key) => {
                                            return(
                                                <div key={key}
                                                    onMouseOver={() => _mouseToggle(el.value, true, null)}
                                                    className={select_cat === el.value ? 'select_cat_responsive pointer' : 'pointer'}
                                                    style={qry.first_cat === el.value ? { 'backgroundColor' : 'orange', 'color' : 'white', 'fontSize' : '15px', 'fontWeight' : 'bold' } : null}
                                                >
                                                    {el.name}
                                                </div>
                                            )
                                        })}
                                </div>

                                <div id='category_responsive_last_cat_div'>
                                    {last_cat_list.map( (el, key) => {
                                        // const class_N = select_last_cat === cu.value
                                        //     ? 
                                        //     :

                                        return(
                                            <div key={key} className='border_bottom black'
                                                className={select_last_cat === el.value ? 'select_each_last_cat pointer ' : 'pointer'} 
                                                onClick={() => _clickCategory(qry, select_cat, el.value)}    
                                            >
                                                {el.name}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <input id='category_responsive_close_button' type='button' value='닫기'
                                onClick={() => this.props.configAction.select_cat_data({ 'bool' : false, 'type' : null })}
                            />
                            <div id='category_responsive_bottom_div' />
                        </div>
                        <div />

                        <input type='button' id='close_category_button' value='닫기' className='white aCenter bold pointer'
                               onMouseOver={() => this.props.configAction.select_cat_data({ 'bool' : false, 'type' : null })}
                        />
                        <div id='close_category_border_div' 
                             onMouseOver={() => this.props.configAction.select_cat_data({ 'bool' : false, 'type' : null })}
                        />
                    </div>
                </div>

                : null}
            </div>
        )
    }
}

Top_category.defaultProps = {
    id : "",
    nick : "",
    pw : "",
    pw_check : "",
  }
  
  export default connect(
    (state) => ({
      id : state.signup.id,
      nick : state.signup.nick,
      pw : state.signup.pw,
      pw_check : state.signup.pw_check,
      agree : state.signup.agree,
      alert_obj : state.signup.alert_obj,
      select_cat : state.config.select_cat,
      select_cat_open : state.config.select_cat_open,
      select_last_cat : state.config.select_last_cat
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(Top_category);