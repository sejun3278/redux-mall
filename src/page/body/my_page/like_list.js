import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// import * as signupAction from '../Store/modules/signup';
import * as myPageAction from '../../../Store/modules/my_page';

import '../../../css/myPage.css';
import URL from '../../../config/url';
import $ from 'jquery';

class LikeList extends Component {

    componentDidMount() {
        // 내 찜 정보 가져오기
        this._getLikeList();
    }

    _getLikeList = async () => {
        const { user_info, myPageAction } = this.props;

        const obj = { 'type' : "SELECT", 'table' : "goods", 'comment' : "내 찜 정보 가져오기", 'join' : true, 'join_table' : 'like' };
        if(obj['join'] === true) {
            obj['join_arr'] = [];
            obj['join_arr'][0] = { 'key1' : 'goods_id', 'key2' : 'id' }

            obj['join_where'] = [];
            obj['join_where'][0] = { 'columns' : 'id', 'as' : 'like_id' }
            obj['join_where'][1] = { 'columns' : 'modify_date', 'as' : 'like_date' }
        }

        obj['option'] = {};
        obj['option']['user_id'] = '=';
        obj['option']['state'] = '=';

        obj['where'] = [];
        obj['where'][0] = { 'table' : 'like', 'key' : 'user_id', 'value' : user_info.id };
        obj['where'][1] = { 'table' : 'like', 'key' : 'state', 'value' : 1 };

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        return myPageAction.get_my_like_list({ 'arr' : JSON.stringify(get_data.data[0]) })
    }

    // 찜 삭제하기
    _removeLike = async (goods_id, like_id) => {
        const { myPageAction, my_like_bool, user_info, _modalToggle } = this.props;

        if(!user_info) {
            alert('로그인이 필요합니다.');
            return _modalToggle(true);

        } else if(my_like_bool === true) {
            return;
        }

        myPageAction.set_my_like_loading({ 'bool' : true });
        const obj = { 'type' : "UPDATE", 'table' : "like", 'comment' : "찜 삭제하기" };
        obj['where_limit'] = 2;

        obj['columns'] = [];
        obj['columns'][0] = { 'key' : 'state', 'value' : 0 };
        obj['columns'][1] = { 'key' : 'modify_date', 'value' : null };

        obj['where'] = [];
        
        obj['where'][0] = { 'key' : 'user_id', 'value' : user_info.id };
        obj['where'][1] = { 'key' : 'goods_id', 'value' : goods_id };
        obj['where'][2] = { 'key' : 'id', 'value' : like_id };

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        this._getLikeList();

        alert('선택된 찜 리스트를 삭제했습니다.');
        return myPageAction.set_my_like_loading({ 'bool' : false });
    }

    _controllSelectLike = (like_id, all_check) => {
        let select_like_list = JSON.parse(this.props.select_like_list);
        const origin_like_list = JSON.parse(this.props.my_like_list);
        const { myPageAction } = this.props;

        if(all_check === null) {
            if(select_like_list.includes(like_id)) {
                // 이미 있는 경우
                select_like_list = select_like_list.filter(el => el !== like_id);
                $('#my_like_list_checkbox_' + like_id).prop("checked", false)

                $('#like_list_all_check').prop("checked", false);

            } else {
                // 없는 경우
                select_like_list.push(like_id);
                $('#my_like_list_checkbox_' + like_id).prop("checked", true);

                // 모두 체크하기
                if(select_like_list.length === origin_like_list.length) {
                    $('#like_list_all_check').prop("checked", true);
                }
            }

        } else if(all_check === true) {
            // 올체크
            const checked_list = $('input:checkbox[id="like_list_all_check"]').is(":checked");
            if(checked_list) {
                select_like_list = [];
                origin_like_list.forEach( (el) => {
                    select_like_list.push(el.like_id);
                })

            } else {
                select_like_list = [];
            }
        }

        return myPageAction.set_select_like({ 'arr' : JSON.stringify(select_like_list) })
    }

    // 선택한 찜 삭제
    _selectRemove = async () => {
        const { myPageAction, user_info, _modalToggle, my_like_bool } = this.props;
        const select_like_list = JSON.parse(this.props.select_like_list);

        if(!user_info) {
            alert('로그인이 필요합니다.');
            return _modalToggle(true);

        } else if(my_like_bool === true) {
            return;

        } else if(select_like_list.length === 0) {
            return alert('선택된 찜 리스트가 없습니다.');

        } else {
            myPageAction.set_my_like_loading({ 'bool' : true });

            let obj = { 'type' : "UPDATE", 'table' : "like", 'comment' : "찜 삭제하기" };
            obj['where_limit'] = 1;
    
            obj['columns'] = [];
            obj['columns'][0] = { 'key' : 'state', 'value' : 0 };
            obj['columns'][1] = { 'key' : 'modify_date', 'value' : null };
    
            obj['where'] = [];
            
            obj['where'][0] = { 'key' : 'user_id', 'value' : user_info.id };
            select_like_list.forEach( async (el) => {
                obj['where'][1] = { 'key' : 'id', 'value' : el };
                
                await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                })
            })

            this._getLikeList();
        
            alert('선택된 찜 리스트를 삭제했습니다.');
            return myPageAction.set_my_like_loading({ 'bool' : false });
        }
    }


    render() {
        const my_like_list = JSON.parse(this.props.my_like_list);
        const select_like_list = JSON.parse(this.props.select_like_list);

        const { price_comma } = this.props;
        const { _removeLike, _controllSelectLike, _selectRemove } = this;

        return(
            <div id='like_list_div'>
                {my_like_list.length > 0 ? 
                <div>
                    <div id='like_list_other_div'>
                        <input type='checkbox' id='like_list_all_check' className='pointer' onClick={() => _controllSelectLike(null, true)} />
                        <label htmlFor='like_list_all_check' className='pointer'> <b> 전체 선택　[ {select_like_list.length} / {my_like_list.length} ] </b> </label>
                        
                        <div id='like_list_select_remove_div'> 
                            <b className='pointer' onClick={_selectRemove}> 선택 삭제 </b> 
                        </div>
                    </div>

                    <div id='like_list_index_div'>
                        <ul className='list_none'>
                        {my_like_list.map( (el, key) => {
                            const disable = el.state === 0 || el.stock === 0;

                            let _class = 'my_like_list_check_and_number_div font_12 border_bottom pointer';
                            if(select_like_list.includes(el.like_id)) {
                                _class += ' select_like_list';
                            }

                            return(
                                <li key={key}>
                                    <div className='my_like_list_divs' id={'my_list_index_' + key}>
                                        {disable 
                                        ? <div className='my_like_list_disable_div aCenter'>
                                            <h2 className='red recipe_korea'> 구매 불가 </h2>
                                            <div className='recipe_korea'> 
                                                품절된 상품입니다.
                                                <p> 
                                                    <input className='my_like_list_disable_button pointer' type='button' value='삭제'
                                                        onClick={() => _removeLike(el.id, el.like_id)}
                                                    /> 
                                                </p>
                                            </div>
                                        </div>
                                        : null}

                                        <div className={_class}
                                            onClick={() => _controllSelectLike(el.like_id, null)}
                                        >
                                            <p>
                                                <input type='checkbox' className='pointer' id={'my_like_list_checkbox_' + el.like_id} 
                                                    onChange={() => _controllSelectLike(el.like_id, null)}
                                                    checked={select_like_list.includes(el.like_id)}
                                                />
                                                <label htmlFor={'my_like_list_checkbox_' + el.like_id} className='my_like_checkbox pointer'> 
                                                    선택 
                                                </label>
                                            </p>

                                            <p className='my_like_list_date_div gray'> 등록일　|　{el.like_date} </p>
                                            <p className='my_like_list_each_remove_button'> 
                                                <input type='button' value='삭제' className='pointer' 
                                                    onClick={() => _removeLike(el.id, el.like_id)}
                                                />
                                            </p>
                                        </div>

                                        <div className='my_like_list_detail_contents_div'>
                                            <div className='my_like_list_grid_contents_div border_right'>
                                                <div className='my_like_list_thumbnail pointer' style={{ 'backgroundImage' : `url(${el.thumbnail})` }} 
                                                    onClick={() => window.location.href='/goods?goods_num=' + el.id}
                                                />
                                            </div>

                                            <div className='my_like_list_info_div'>
                                                <div className='my_like_list_name_div t_money_font'>
                                                    <b onClick={() => window.location.href='/goods?goods_num=' + el.id} className='pointer'>  {el.name} </b> 
                                                </div>

                                                <div className='my_like_price_and_state'> 
                                                    <div className='my_like_price_div'> <h4> {price_comma(el.result_price)} 원 </h4> </div>
                                                    <div className='my_like_stock_div font_12'> 구매 가능 수량　|　{price_comma(el.stock)} 개 </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                        </ul>
                    </div>
                </div>

                :  <div className='aCenter empty_cart_div'>
                        <h3 className='t_money_font'> 찜 리스트가 비어있습니다. </h3>    

                        <div className='empty_select_div'> 
                            <u className='pointer remove_underLine'
                            onClick={() => window.location.href='/search'}> 
                                ◁　상품 보러 가기 
                            </u>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

LikeList.defaultProps = {
    select_like_list : JSON.stringify([])
  }
  
  export default connect(
    (state) => ({
        my_like_list : state.my_page.my_like_list,
        my_like_bool : state.my_page.my_like_bool,
        select_like_list : state.my_page.select_like_list
    }), 
  
    (dispatch) => ({
        myPageAction : bindActionCreators(myPageAction, dispatch)
    })
  )(LikeList);