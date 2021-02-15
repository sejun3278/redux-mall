import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/admin/admin_goods.css';

import $ from 'jquery';
import category_list from '../../../source/admin_page.json';
import URL from '../../../config/url';

import { CKEditor } from '../../../config/index';

class AdminGoodsWrite extends Component {

    componentDidMount() {
        // const modify_id = ;
        const modify_id = queryString.parse(this.props.location.search).modify_id 
            ? queryString.parse(this.props.location.search).modify_id
            : null;
        
        if(modify_id !== null) {
            this._getGoodsData(modify_id);
        }
        
        $('#admin_page_titles').css({
            'padding' : '0px'
        })

        $('#mobile_admin_category_div, #admin_page_titles').remove();

        this._setScrollSize();
        window.addEventListener("scroll", this._setScrollSize);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this._setScrollSize);
    }

    // 수정하려는 상품 데이터 가져오기
    _getGoodsData = async (id) => {
        const { adminAction } = this.props;

        const goods_data = await axios(URL + '/get/write_goods_data', {
            method : 'POST',
            headers: new Headers(),
            data : {
                'id' : id
            }
        })

        $('input[name=goods_name').val(goods_data.data.name)
        $('input[name=origin_price]').val(Number(goods_data.data.origin_price));
        $('input[name=discount_price]').val(Number(goods_data.data.discount_price));
        $('input[name=goods_stock]').val(Number(goods_data.data.stock));
        $('select[name=goods_first_category]').val(goods_data.data.first_cat).prop("selected", true);

        $('#admin_goods_write_img_top_div').prop('checked', false);
        $('#admin_goods_write_img_' + goods_data.data.img_where + '_div').prop('checked', true);

        const img_obj = { }
        img_obj['thumb'] = goods_data.data.thumbnail;
        img_obj['bonus'] = JSON.parse(goods_data.data.bonus_img);
        // const img_obj = { 'thumb' :  , "bonus" :  }
        // write_img_collect : JSON.stringify({ "thumb" : '', "bonus" : ['', '', ''] }),

        const data = {
            "goods_data" : JSON.stringify(goods_data.data),
            "origin_price" : goods_data.data.origin_price,
            "discount_price" : goods_data.data.discount_price,
            "result_price" : goods_data.data.result_price,
            "first_cat" : goods_data.data.first_cat,
            "last_cat" : goods_data.data.last_cat,
            "where" : goods_data.data.img_where,
            "contents" : goods_data.data.contents,
            "img_obj" : JSON.stringify(img_obj)
        }

        adminAction.modify_check({ 'bool' : true })
        return adminAction.save_write_goods({ 'data' : data })
    }

    _setScrollSize = () => {
        // 화면 스크롤 구하기
        const height_size = window.scrollY;

        // if(height_size >= 84) {
        //     $('#admin_goods_write_other_div').css({ 
        //         'position' : 'fixed',
        //         'width' : 'auto'
        //     })
        // }
    }

    _setCategory = (type) => {
        const { write_first_cat, write_last_cat, adminAction } = this.props;
        let obj = { 'first' : write_first_cat, 'last' : write_last_cat };

        this._setModifyState();
        
        const category = $('select[name=goods_' + type + '_category]').val();
        obj[type] = category

        let last_cat = write_last_cat;
        if(type === 'first') {
            last_cat = category_list['last_category'][category][0].value;

            obj['last'] = last_cat;
        }

        adminAction.set_write_cat(obj);
    }

    _selectRadioToggle = (type, target, num) => {
        const { adminAction, write_select_img_where, write_img_type } = this.props;
        let op, $target;

        let cover_write_img_type = JSON.parse(write_img_type);

        let obj = { 'img' : cover_write_img_type, 'where' : write_select_img_where }
        this._setModifyState();

        // 해당 checkbox 체크 여부 확인
        if(type === 'thumbnail') {
            op = target === 'direct' ? 'url' : 'direct';
            obj['img'].thumb = target;
            $target = $('#admin_goods_write_image_' + op);

            $target.prop('checked', false);

        } else if(type === 'where') {
            op = target === 'top' ? 'bottom' : 'top';
            obj['where'] = target;
            $target = $('#admin_goods_write_img_' + op + '_div');

            $target.prop('checked', false);
            obj['img'] = JSON.stringify(cover_write_img_type);

            return adminAction.select_write_img(obj);

        } else if(type === 'bonus') {
            target = $('#admin_goods_select_bonus_img_' + num).val();
            obj['img']['bonus'][num] = target;
        }

        obj['img'] = JSON.stringify(obj['img']);

        adminAction.select_write_img(obj);
    }

    _setPrice = (type) => {
        const { adminAction, write_origin_price, write_discount_price, write_result_price } = this.props;
        let obj = { 'origin' : write_origin_price, 'discount' : write_discount_price, 'result' : write_result_price  };

        this._setModifyState();

        const target = type + '_price';
        let num = Number($('input[name='+ target +']').val());

        let origin_price = Number($('input[name=origin_price]').val());
        let discount_num = Number($('input[name=discount_price]').val());
        let result_price = write_result_price;

        if(type === 'discount') {
            if(num < 0) {
                num = 0;

            } else if(num > 100) {
                num = 100;
            }
            $('input[name='+ target +']').val(num);
            discount_num = num;

        } else {
            origin_price = num;
        }

        if(discount_num === 100) {
            result_price = 0;

        } else if(discount_num === 0) {
            result_price = origin_price;

        } else {
            const dis_cnt = origin_price * (discount_num / 100);
            result_price = origin_price - dis_cnt;
        }

        obj['origin'] = origin_price;
        obj['discount'] = discount_num;
        obj['result'] = Math.trunc(result_price);

        return adminAction.set_price(obj);
    }

    _setModifyState = () => {
        const { adminAction, write_modify } = this.props;

        if(!write_modify) { 
            return adminAction.set_write_modify({ 'bool' : true })
        }
    }

    _cancelPageMove = () => {
        const { write_modify } = this.props;
        
        if(write_modify) {
            if(window.confirm('수정된 내용이 있습니다 \n등록을 취소하시겠습니까?')) {
                this.props._pageMove('href', '/admin/goods')
                
            } else {
                return;
            }
        }

        return this.props._pageMove('href', '/admin/goods')
    }

    _addThumbNail = async (target, type, num, thumb) => {
        const { adminAction, write_img_collect } = this.props;

        this._setModifyState();
        
        let cover_write_img_collect = JSON.parse(write_img_collect);
        const form = document.forms.namedItem('goods_write_form');
        let result_img = '';

        let num_str = num;
        if(num_str === null) {
            num_str = '';

        } else {
            num_str = '_' + num_str;
        }

        if(type === 'remove') {
            $('input[name=admin_goods_write_' + target + '_img' + num_str + ']').val('');
            result_img = '';
        }

        if(target === 'url') {
            result_img = form['admin_goods_write_url_img' + num_str].value;

        } else if(target === 'direct') {
            const file_target = form['admin_goods_write_direct_img' + num_str];
            const formData = new FormData(form);

            const direct_file = file_target.files[0];
            const type_check = ['image/png', 'image/jpg', 'image/gif', 'image/jpeg'];

            if(direct_file !== undefined) {
                if(!type_check.includes(direct_file.type)) {
                    alert('확장자는 이미지 파일만 가능합니다.');

                    return file_target.focus();

                } 
                // else if(direct_file.size > 500000) {
                //     alert('용량은 5 MB 이하만 가능합니다.');

                //     return file_target.focus();
                // }
                
                formData.append('files', direct_file);

                // 로컬에 파일 업로드
                const img_file_upload = await axios(URL + '/api/save_file', {
                    method : 'POST',
                    enctype: 'multipart/form-data',
                    contentType: 'application/json',
                    headers: new Headers(),
                    processData: false,
                    contentType: false,
                    cache: false,
                    data : formData
                  })

                if(img_file_upload.data.result === false) {
                    console.log(img_file_upload.data.ment)
                    return alert('이미지를 업로드 할 수 없습니다.');
                }

                const thumb_able = thumb ? true : false

                // S3에 업로드하기
                const upload_image = await axios(URL + '/api/upload_file', {
                    method : 'POST',
                    headers: new Headers(),
                    data : { 
                        'filename' : img_file_upload.data.ment,
                        'origin_path' : 'goods/origin',
                        'thumb_path' : 'goods/thumbnail',
                        'thumb' : thumb_able
                    }
                })
    
                if(upload_image.data.result === false) {
                    console.log(upload_image.data.ment)
                    return alert('이미지를 업로드 할 수 없습니다.');
                }

                result_img = upload_image.data.ment;
            }
        }

        if(thumb) {
            cover_write_img_collect['thumb'] = result_img;

        } else {
            cover_write_img_collect['bonus'][num] = result_img
        }

        return adminAction.set_image_obj({ 'img' : JSON.stringify(cover_write_img_collect) });
    };

    _saveContents = (contents) => {
        const { adminAction } = this.props;

        return adminAction.write_contents({ 'contents' : contents });
    }

    // 상품 등록
    _addGoods = async (event) => {
        event.preventDefault();

        const { 
            write_first_cat, write_last_cat, write_img_collect, write_origin_price,
            write_discount_price, write_result_price, write_select_img_where, write_contents, modify_check
        } = this.props; 

        const formData = event.target;
        
        // 상품명
        const goods_name = formData.goods_name.value;

        // 이미지 Obj
        const image_obj = JSON.parse(write_img_collect);

        // 상품 재고
        const goods_stock = formData.goods_stock.value;

        if(goods_name.length === 0) {
            alert('상품명을 필수로 입력해주세요.');

            return $('input[name=goods_name]').focus();

        } else if(write_first_cat === '') {
            alert('첫번째 카테고리를 선택해주세요.');

            return $('input[name=goods_first_category]').focus();

        } else if(image_obj['thumb'] === '') {
            alert('썸네일을 필수로 등록해주세요.');

            return $('#admin_goods_write_select_image_div').focus();

        } else if(write_origin_price < 0) {
            alert('상품 가격을 필수로 입력해주세요.');

            return $('input[name=origin_price]').focus();
        
        } else if(goods_stock < 0) {
            alert('상품 재고를 필수로 입력해주세요.');

            return $('input[name=goods_stock]').focus();
        }

        const data = {
            'name' : goods_name,
            'first_cat' : write_first_cat,
            'last_cat' : write_last_cat,
            'thumbnail' : image_obj['thumb'],
            'origin_price' : write_origin_price,
            'discount_price' : write_discount_price,
            'result_price' : write_result_price,
            'stock' : Number(goods_stock),
            'bonus_img' : JSON.stringify(image_obj['bonus']),
            'img_where' : write_select_img_where,
            'contents' : write_contents,
            'sales' : 0,
            'star' : 0,
            'acc_star' : 0,
        }

        if(modify_check) {
            // 상품 수정
            if(!window.confirm('해당 상품을 수정하시겠습니까?')) {
                return;
            }

            data['id'] = queryString.parse(this.props.location.search).modify_id;
            const update_goods = await axios(URL + '/update/goods', {
                method : 'POST',
                headers: new Headers(),
                data : data
            })

            if(update_goods.data) {
                alert('상품 수정이 완료되었습니다.');

                return window.location.replace('/admin/goods');
            }

        } else {
            // 상품 등록
            const add_goods = await axios(URL + '/add/goods', {
                method : 'POST',
                headers: new Headers(),
                data : data
            })

            if(add_goods.data) {
                alert('상품 등록이 완료되었습니다.');

                return window.location.replace('/admin/goods');
            }
        }
    }

    render() {
        const { write_first_cat, write_origin_price, write_discount_price, write_contents, modify_check,
            write_result_price, write_modify, write_img_type, write_img_collect, write_goods_data } = this.props;
        const { _setCategory, _selectRadioToggle, _setPrice, _setModifyState, _cancelPageMove, _addGoods, _saveContents } = this;

        const first_category_list = category_list.first_category.category;
        let last_category_list = null;

        if(write_first_cat !== 'none') {
            last_category_list = category_list.last_category[write_first_cat];
        }

        const result_price = write_result_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        let cover_write_img_type = JSON.parse(write_img_type);
        let cover_write_img_collect = JSON.parse(write_img_collect);

        // const cover_write_goods_data = JSON.parse(write_goods_data);

        return(
            <div id='admin_goods_write_div'>
                <form name='goods_write_form' id='goods_write_form' onSubmit={_addGoods}
                      encType='multipart/form-data'
                >

                <div id='admin_goods_write_title_div' className='border_bottom'>
                    <div className='border_right pointer aCenter display_none'
                        id='admin_goods_write_title_cancel_div'
                        onClick={() => _cancelPageMove()}
                        style={write_modify ? { 'fontWeight' : 'bold', 'color' : '#ababab' } : null}
                    > 
                        취소 
                    </div>

                    <div className='aCenter'> 
                        <h3> {!modify_check ? "상품 등록" : "상품 수정"}  </h3> 
                    </div>
                </div>

                <div id='admin_goods_write_other_div' className='border_bottom border_size_2'>
                    <div id='admin_goods_other_cancel_div' className='border_right pointer'
                        onClick={() => _cancelPageMove()}
                        style={write_modify ? { 'color' : '#ababab' } : null}
                    > 
                        취소
                    </div>

                    <div className='pointer'> 
                        <input type='submit' value={!modify_check ? "등록" : "수정"} className='admin_goods_submit_button pointer'/>
                    </div>
                </div>

                <div id='admin_goods_write_contents_div'>
                    <div> </div>

                    <div>
                            <ul className='list_none' id='admin_goods_write_first_ul'>
                                <li className='marginTop_80'> 
                                    <b> 상품명 * </b>
                                    <div>
                                        <p>
                                            <input type='text' maxLength='30' name='goods_name'
                                                  onChange={_setModifyState}
                                                  title='노출되는 상품의 이름을 입력합니다.'
                                            />
                                        </p>
                                    </div>
                                </li>

                                <li> 
                                    <b> 카테고리 * </b>
                                    <div className='list_none admin_goods_write_inline' id='admin_goods_write_category_div'>
                                        <div className='font_13'>
                                            1차 카테고리
                                                <select name='goods_first_category' 
                                                        onChange={()=> _setCategory('first')}
                                                        className='pointer admin_goods_write_category_select'
                                                        title='상품의 상위 카테고리를 지정합니다.'
                                                >
                                                    <option value=''> - 선택 </option>-
                                                    {first_category_list.map( (el, key) => {
                                                        return(
                                                            <option value={el.value} key={key}
                                                            > {el.name} </option>
                                                        )
                                                    })}
                                                </select>
                                        </div>

                                        <div className='font_13'> 
                                            2차 카테고리
                                                <select name='goods_last_category'
                                                        onChange={() => _setCategory('last')}
                                                        className='pointer admin_goods_write_category_select'
                                                        title='지정된 상위 카테고리의 하위 카테고리를 지정합니다.'
                                                        // defaultValue={goods_data.last_cat}
                                                >
                                                    {write_first_cat === '' 
                                                        ? <option value=''> --------- </option>
                                                        : null
                                                    }
                                                    {last_category_list !== null 
                                                        ? last_category_list.map( (el, key) => {
                                                            return(
                                                                <option key={key} value={el.value}> {el.name} </option>
                                                            )
                                                        })
                                                        : null
                                                    }
                                                </select>
                                        </div>
                                    </div>
                                </li>

                                <li>
                                    <b> 썸네일 등록 * </b>
                                    <div id='admin_goods_write_select_image_div'>
                                        <div className='font_13'>
                                            <input type='radio' id='admin_goods_write_image_direct' className='check_custom_1'
                                                    defaultChecked={true} onClick={() => _selectRadioToggle('thumbnail', 'direct')}
                                            />
                                            <span className='check_toggle_1' onClick={() => _selectRadioToggle('thumbnail', 'direct')} />
                                            <label htmlFor='admin_goods_write_image_direct' className='pointer goods_write_image' id='admin_goods_write_image_direct_label'
                                                title='이미지 파일을 직접 업로드해 썸네일을 등록합니다.'
                                            > 
                                            파일 등록 
                                            </label>
                                        </div>

                                        <div className='font_13'>
                                            <input type='radio' id='admin_goods_write_image_url' className='check_custom_1' 
                                                   onClick={() => _selectRadioToggle('thumbnail', 'url')}
                                            />
                                            <span className='check_toggle_1' onClick={() => _selectRadioToggle('thumbnail', 'url')} />
                                            <label htmlFor='admin_goods_write_image_url' className='pointer goods_write_image' id='admin_goods_write_image_url_label'
                                                title='이미지 URL 을 통해 썸네일을 등록합니다.'
                                            > 
                                            이미지 URL 등록 
                                            </label>
                                        </div>
                                    </div>

                                    <div id='admin_goods_write_thumb_example'>
                                            {cover_write_img_collect.thumb
                                            
                                            ? 
                                            
                                            <div> 
                                                <img className='border'
                                                    id='admin_goods_write_thumb_img'
                                                    src={cover_write_img_collect.thumb}/>
                                                    <input type='button' value='삭제' id='delete_thumbnail_button' className='pointer'
                                                        onClick={() => this._addThumbNail(cover_write_img_type.thumb, 'remove', null, true)}
                                                    />
                                            </div>
                                            
                                            : null}
                                    </div>

                                    <div id='admin_goods_write_input_divs' className='marginTop_20'
                                        style={{ 'marginLeft' : '30px' }}
                                    >
                                        {cover_write_img_type.thumb === 'direct'
                                            
                                            ? <input type='file' name='admin_goods_write_direct_img' accept=".git, .jpg, .png, .jpeg"
                                                     className='pointer' onChange={() => this._addThumbNail('direct', null, null, true)}  />

                                            : <span id='admin_goods_write_img_url_div'> 
                                                    URL 입력 <input type='text' name='admin_goods_write_url_img'
                                                                    onBlur={() => this._addThumbNail('url', null, null, true)} defaultValue={cover_write_img_collect.thumb} /> 
                                              </span>
                                            }
                                    </div>
                                </li>

                                <li id='admin_goods_write_price_div'> 
                                    <b> 상품 가격 * </b>
                                    <div id='admin_goods_write_price_grid_div' className='font_13'>
                                        <div>
                                            원가 : * 
                                            <br />
                                            할인율 : 
                                            <p className='border_top marginTop_20'>
                                                할인 적용가 : 
                                            </p>
                                        </div>

                                        <div>
                                            <input type='number' min={0} max={1000000000} required defaultValue={write_origin_price}
                                                   name="origin_price" onChange={() => _setPrice('origin')}
                                            /> 원
                                            <br />
                                            <input type='number' min={0} max={100} defaultValue={write_discount_price} 
                                                   name="discount_price" onChange={() => _setPrice('discount')}
                                            /> %
                                            <p className='border_top marginTop_20'>
                                                <b> {result_price} 원 </b>
                                            </p>
                                        </div>
                                    </div>

                                </li>

                                <li> 
                                    <b> 상품 재고 * </b>
                                    <div id='admin_goods_write_stock_div' className='marginTop_20'>
                                        <div className='font_13'>
                                            판매 가능 재고 : 
                                        </div>

                                        <div>
                                            <input type='number' name='goods_stock' min={0} max={1000000000} defaultValue={0} /> 개
                                        </div>
                                    </div>
                                </li>

                                <li id='admin_goods_write_bonus_img_li'>
                                    <b> 추가 이미지 </b>

                                    <div>
                                        <p className='gray font_13'> - 이미지 배치 위치 </p>
                                        <div className='grid_half font_13' id='admin_goods_write_img_where_div'>
                                            <div> 
                                                <input type='radio' id='admin_goods_write_img_top_div' className='check_custom_1'
                                                        defaultChecked={true} onClick={() => _selectRadioToggle('where', 'top')}
                                                />
                                                <span className='check_toggle_1' onClick={() => _selectRadioToggle('where', 'top')} />
                                                <label htmlFor='admin_goods_write_img_top_div' className='pointer goods_write_image' id='admin_goods_write_image_top_label'
                                                    title='본문에서 사진을 맨 위에 배치합니다.'
                                                > 
                                                위에 배치
                                                </label>
                                            </div>

                                            <div>
                                                <input type='radio' id='admin_goods_write_img_bottom_div' className='check_custom_1'
                                                        onClick={() => _selectRadioToggle('where', 'bottom')}
                                                />
                                                <span className='check_toggle_1'onClick={() => _selectRadioToggle('where', 'bottom')} />
                                                <label htmlFor='admin_goods_write_img_bottom_div' className='pointer goods_write_image' id='admin_goods_write_image_bottom_label'
                                                    title='본문에서 사진을 맨 아래에 배치합니다.'
                                                > 
                                                아래에 배치 
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div id='admin_goods_write_add_bonus_img_div'>
                                        <p className='gray'> - 이미지 추가 </p>
                                        
                                        <ul id='admin_goods_write_add_img_ul' className='list_none'>
                                            {cover_write_img_type['bonus'].map( (el, key) => {
                                                return(
                                                    <li key={key}>
                                                        <p> - {(key + 1)}. 이미지 사진 </p>

                                                        <select id={'admin_goods_select_bonus_img_' + key}
                                                                className='padding_3' onChange={() => _selectRadioToggle('bonus', null, key)}
                                                        >
                                                            <option value='direct'> 파일 등록</option>
                                                            <option value='url'> 이미지 URL 입력 </option>
                                                        </select>

                                                        <div id={'admin_goods_write_bonus_example_' + key}>
                                                            {cover_write_img_collect['bonus'][key]
                                                            
                                                            ? 
                                                            <div className='write_img_divs'> 
                                                                <img className='border' alt=''
                                                                    id={'admin_goods_write_thumb_img_' + key}
                                                                    src={cover_write_img_collect['bonus'][key]}/>
                                                                    <input type='button' value='삭제' id='delete_thumbnail_button' className='pointer'
                                                                        onClick={() => this._addThumbNail(cover_write_img_type['bonus'][key], 'remove', key, false)}
                                                                    />
                                                            </div>
                                                            
                                                            : null}
                                                    </div>

                                                        <div id={'admin_goods_write_input_divs_' + key} className='marginTop_20'>
                                                            {el === 'direct'
                                                                
                                                                ? <input type='file' name={'admin_goods_write_direct_img_' + key} accept=".git, .jpg, .png, .jpeg"
                                                                        className='pointer' onChange={() => this._addThumbNail('direct', null, key, false)}  />

                                                                : <span id='admin_goods_write_img_url_div'> 
                                                                        URL 입력 <input type='text' name={'admin_goods_write_url_img_' + key}
                                                                                        onBlur={() => this._addThumbNail('url', null, key, false)} defaultValue={cover_write_img_collect['bonus'][key]} /> 
                                                                </span>
                                                            }
                                                        </div>
                                                    </li>
                                                )
                                            })}

                                            

                                        </ul>
                                    </div>
                                </li>

                                <li>
                                    <b> 내용 입력 </b>

                                    <div id='admin_write_ckeditor_div'>
                                        <CKEditor 
                                            _saveContents={_saveContents}
                                            default_contents={write_contents}
                                        />
                                    </div>
                                </li>
                            </ul>

                            <div id='admin_write_bottom_div'>
                                <input type='submit' value={!modify_check ? "등록" : "수정"} className='pointer'

                                />
                            </div>
                        </div>

                        <div> </div>
                    </div>
                </form>
            </div>
        )
    }
}
  
  export default connect(
    (state) => ({
        admin_code : state.admin.admin_code,
        write_first_cat : state.admin.write_first_cat,
        write_last_cat : state.admin.write_last_cat,
        write_select_img : state.admin.write_select_img,
        write_origin_price : state.admin.write_origin_price,
        write_discount_price : state.admin.write_discount_price,
        write_result_price : state.admin.write_result_price,
        write_modify : state.admin.write_modify,
        write_thumbnail : state.admin.write_thumbnail,
        write_select_img_where : state.admin.write_select_img_where,
        write_img_type : state.admin.write_img_type,
        write_img_collect : state.admin.write_img_collect,
        write_contents : state.admin.write_contents,
        write_goods_data : state.admin.write_goods_data,
        modify_check : state.admin.modify_check
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminGoodsWrite);