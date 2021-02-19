import React, { Component } from 'react';
import Slider from "react-slick";

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../Store/modules/signup';
import * as configAction from '../Store/modules/config';
import '../css/home.css';

import img from '../source/img/icon.json';
import $ from 'jquery';

// import "slick-carousel/slick/slick.css"; 
// import "slick-carousel/slick/slick-theme.css";

const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    // autoplay: true
};

class HomeContents extends Component {

    componentDidMount() {
    }

    render() {
        return(
            <div id='home_contents_div'>
                <div id='home_contents_slick_div'>
                    <Slider {...settings} >
                        <div style={{ 'backgroundColor' : 'black' }}> 1 </div>
                        <div> 1 </div>
                        <div> 1 </div>
                        <div> 1 </div>
                    </Slider>
                </div>

                
            </div>
        )
    }
}

HomeContents.defaultProps = {
  }
  
  export default connect(
    (state) => ({
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(HomeContents);