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
                                        <div>
                                            1차 카테고리
                                                <select name='goods_first_category' 
                                                        onChange={()=> _setCategory('first')}
                                                        className='pointer'
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

                                        <div> 
                                            2차 카테고리
                                                <select name='goods_last_category'
                                                        onChange={() => _setCategory('last')}
                                                        className='pointer'
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
                                        <div>
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

                                        <div>
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
                                                    URL 입력 <input type='text' name='admin_goods_write_url_img' maxLength='120' 
                                                                    onBlur={() => this._addThumbNail('url', null, null, true)} defaultValue={cover_write_img_collect.thumb} /> 
                                              </span>
                                            }
                                    </div>
                                </li>

                                <li id='admin_goods_write_price_div'> 
                                    <b> 상품 가격 * </b>
                                    <div id='admin_goods_write_price_grid_div'>
                                        <div>
                                            원 가격 : * 
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
                                        <div>
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
                                        <p className='gray'> - 이미지 배치 위치 </p>
                                        <div className='grid_half' id='admin_goods_write_img_where_div'>
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
                                                                        URL 입력 <input type='text' name={'admin_goods_write_url_img_' + key} maxLength='120' 
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