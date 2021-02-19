const answer_list = (info, user_id) => {
    const moment = require('moment');
    const now_time = moment().format('YYYY년 MM월 DD일 HH시 mm분 ss초')

    const result = {}

    const list = {
        'hi' : [
            "안녕하세요, <b>" + user_id + "</b>님 반갑습니다! :)",
            "저는 SeBot 입니다. 제 도움이 필요하신가요?",
            "찾아주셔서 감사합니다. <br /><b>"+ user_id + "</b>님, 좋은 하루 되세요!"
        ],

        'time' : [
            "현재 시간은 <b class=custom_color_1>" + now_time + "</b> 입니다."
        ],

        'clean' : function() {
            const confirm = window.confirm('모든 채팅 내역을 삭제하시겠습니까?');

            result['bool'] = confirm;
            if(confirm) {
                result['ment'] = '삭제가 완료되었습니다.';

            } else {
                result['ment'] = '삭제가 취소되었습니다.';
            }

            return result;
        },

        "hey" : [
            "네? 부르셨나요?",
            "네, <b>" + user_id + "</b> 님 도움이 필요하신가요?",
            "듣고 있습니다, 말씀하세요." 
        ],

        "goods_select" : function() {
            let ment = '<div class=chat_goods_select_title_div> <b class=custom_color_1> [ ' + info.goods_name + ' ] </b> (으)로 상품을 조회한 결과입니다. </div>'

            if(info.goods_info.length === 0) {
                ment += `<div class=chat_goods_select_result_div> 검색 결과를 찾지 못했습니다. </div>`

            } else {
                ment += `<div class=chat_goods_select_result_div> ${info.goods_info.length} 개의 상품을 조회했습니다. </div>`

                ment += '<div class=chat_goods_select_list_div>'

                const limit = info.goods_info.length > 5 ? 5 : info.goods_info.length;
                for(let i = 0; i < limit; i++) {
                    const el = info.goods_info[i];

                    ment += `<div class="chat_goods_select_info_div pointer"
                                onclick={window.location.href="/goods/?goods_num=${el.id}"}
                    >`
                    ment += `<div class=chat_goods_select_thumbnail> 
                                <img src="${el.thumbnail}" />
                            </div>`

                    ment += `<div>
                                <div class=chat_goods_select_name cut_one_line> 
                                    ${el.name}
                                </div>

                                <div class=chat_goods_select_price_div>
                                    ${el.result_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 원
                                </div>
                             </div>`

                    ment += '</div>'
                }
                ment += `<div class=chat_goods_select_search_div 
                            onclick={window.location.href="/search/?search=${info.goods_name}"}> 
                                검색 페이지로 이동 
                        </div>`

                ment += '</div>';
            }

            result['bool'] = true;
            result['ment'] = ment

            return result;
        }
        
    }

    return list[info.result];
}

export default answer_list;