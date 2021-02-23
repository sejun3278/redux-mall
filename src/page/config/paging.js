import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
import * as signupAction from '../../Store/modules/signup';

import '../../css/home.css';

// import img from '../../source/img/img.json';
import icon from '../../source/img/icon.json';

class Paging extends Component {

    _pageMove = (page) => {
        const { qry, _filterURL, page_name } = this.props;

        qry[page_name] = page;

        return _filterURL(qry, "")
    }

    render() {
        const { paging_cnt, paging_show, qry, page_name } = this.props;
        const { _pageMove} = this;
        // 페이징 구하기

        const paging_obj = {};

        // 총 페이지 수 구하기
        let all_page = paging_cnt / paging_show; // 22 / 1
        all_page = Number.isInteger(all_page) === true ? all_page : Math.trunc(all_page) + 1;

        paging_obj['all_page'] = all_page; // = 22

        // 총 블럭 수
        const all_block = Math.trunc(all_page / 10); // 22 / 10
        paging_obj['all_block'] = all_block; // 2

        const now_page = qry[page_name] ? Number(qry[page_name]) : 1;


        // 현재 블럭 위치 구하기
        let now_block = now_page / 10; // 1 / 10 = 0;
        now_block = Number.isInteger(now_block) === true ? now_block - 1 : Math.trunc(now_block);

        paging_obj['now_block'] = now_block

        // 노출될 페이지 수 구하기
        let page_length = 0;

        if(now_block !== all_block) {
            // 현재 블럭의 위치가 블럭 끝이 아니라면
            page_length = 10;

        } else if(now_block >= all_block) {
            page_length = all_page - (10 * all_block);
        }

        // 배열로 저장하기
        const page_arr = [];
        for(let i = 1; i <= page_length; i++) {
            var page = (now_block * 10) + i;
            page_arr.push(page);
        }

        // console.log('전체 페이지 수 : ' + all_page)
        // console.log('현재 페이지 : ' + now_page)

        // console.log('전체 블록 수 : ' + all_block)
        // console.log('현재 블록 : ' + now_block)

        // console.log('노출될 페이지 : ' + page_arr)
        return(
            <div className='paging_div aCenter'>
                
                <div className='page_move_prev_div'>
                    {now_block !== 0 ? 
                        <img src={icon.angel.prev_move} className='page_move_angel_icon' alt='' 
                             onClick={() => _pageMove(((now_block - 1) * 10) + 1)}
                             title='10 페이지 전으로 이동합니다.'
                        />
                    : null}
                </div>

                {/* <div className='page_list_contents'> */}
                    <div className='page_list_div aCenter'
                         style={{ 'gridTemplateColumns' : 'repeat(' + page_arr.length + ', ' + 100 / page_arr.length + '% )' }}
                    >
                        {page_arr.map( (el, key) => {
                            return(
                                <div key={key} className='page_list'>
                                    <u className='pointer remove_underLine'
                                        id={now_page === el ? "select_page" : null}
                                        onClick={() => now_page !== el ? _pageMove(el) : null} title={el + ' 페이지로 이동합니다.'}
                                    > 
                                        {el} 
                                    </u>
                                </div>
                            )
                        })}
                    </div>
                {/* </div> */}
                <div className='page_move_next_div'>
                    {now_block < all_block ? 
                        <img src={icon.angel.next_move} className='page_move_angel_icon' alt='' 
                             onClick={() => _pageMove(((now_block + 1) * 10) + 1)}
                             title='10 페이지 다음으로 이동합니다.'
                        />
                    : null}
                </div>
            </div>
        )
    }
}

Paging.defaultProps = {
}

export default connect(
  (state) => ({
  }), 

  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch),
    configAction : bindActionCreators(configAction, dispatch)
  })
)(Paging);