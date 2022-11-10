import React, { Component } from 'react';

export class Home extends Component {
    render() {
        return (
            <div>
                <aside id="colorlib-aside" role="complementary" className="border js-fullheight">
                    <div className="text-center">
                        <div className="author-img" style={{ backgroundImage: 'url(images/Thabiso.png)' }}></div>
                        <h1 id="colorlib-logo"><a href="index.html">Thabiso Ntoi</a></h1>
                        <span className="position"><a href="#">Software Engineer</a> in South Africa</span>
                    </div>
                    <nav id="colorlib-main-menu" role="Navigation"className="navbar">
                        <div id="navbar" className="collapse">
                            <ul></ul>
                            <li class="active">
                                <a href="#" data-nav-section="home">Home</a>
                                <a href="#" data-nav-section="home">About</a>
                                <a href="#" data-nav-section="home">Services</a>
                                <a href="#" data-nav-section="home">Skills</a>
                                <a href="#" data-nav-section="home">Education</a>
                                <a href="#" data-nav-section="home">Experience</a>
                                <a href="#" data-nav-section="home">Work</a>
                                <a href="#" data-nav-section="home">Blog</a>
                                <a href="#" data-nav-section="home">Contact</a>
                              </li>

                        </div>
                    </nav>

                    <div className="colorlib-footer">
                        <p><small>©
                            Copyright ©<script>document.write(new Date().getFullYear());</script>2022 All rights reserved | This template is made with <i class="icon-heart" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank">Colorlib</a>
                            <span>Demo Images: <a href="https://unsplash.com/" target="_blank">Unsplash.com</a></span></small></p>
                        <ul>
                            <li><a href="#"><i className="icon-facebook2"></i></a></li>
                            <li><a href="#"><i className="icon-twitter2"></i></a></li>
                            <li><a href="#"><i className="icon-instagram"></i></a></li>
                            <li><a href="#"><i className="icon-linkedin2"></i></a></li>
                        </ul>
                    </div>
                </aside>
                <div id="colorlib-main">
                    <section id="colorlib-hero" className="js-fullheight" data-section="home" >
                        <div className="flexslider js-fullheight">
                            <ul className="slides">
                                <li style={{ backgroundImage: 'url(images/Thabiso.png)' }}>
                                    <div className="overlay"></div>
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-md-6 col-md-offset-3 col-md-pull-3 col-sm-12 col-xs-12 js-fullheight slider-text">
                                                <div className="slider-text-inner js-fullheight" style={{ height: '274px' }}>
                                                    <div className="desc">
                                                        <h1>Hi! <br />I'm Thabiso</h1>
                                                        <h2>100% html5 bootstrap templates Made by <a href="https://colorlib.com/" target="_blank">colorlib.com</a></h2>
                                                        <p><a className="btn btn-primary btn-learn">Download CV <i className="icon-download4"></i></a></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li style={{ backgroundImage: "url(images/img_bg_2.jpg)", width: "100%", float: "left", position: "relative", opacity: 0,  display:"block" }} >
                                    <div className="overlay"></div>
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-md-6 col-md-offset-3 col-md-pull-3 col-sm-12 col-xs-12 js-fullheight slider-text animated fadeInUp" style={{ backgroundImage: 'url(images/img_bg_2.jpg)'}}>
                                                <div className="slider-text-inner">
                                                    <div className="desc">
                                                        <h1>I am <br />a Designer</h1>
                                                        <h2>100% html5 bootstrap templates Made by <a href="https://colorlib.com/" target="_blank">colorlib.com</a></h2>
                                                        <p><a className="btn btn-primary btn-learn">View Portfolio <i className="icon-briefcase3"></i></a></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                         </div>
                    </section>
                </div>
            </div>
        );
    }
}