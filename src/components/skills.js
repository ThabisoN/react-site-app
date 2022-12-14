import React, { Component } from 'react';
import  image  from '../images/cover_bg_1.jpg';

export class Skills extends Component {
    render() {
        return (
            <div>
                <div id="colorlib-counter" className="colorlib-counters" style={{ backgroundImage: `url(${image})` }} data-stellar-background-ratio="0.5">
                    <div className="overlay"></div>
                    <div className="colorlib-narrow-content">
                        <div className="row">
                        </div>
                        <div className="row">
                            <div className="col-md-3 text-center animate-box">
                                <span className="colorlib-counter js-counter" data-from="0" data-to="309" data-speed="5000" data-refresh-interval="50">309</span>
                                <span className="colorlib-counter-label">Cups of coffee</span>
                            </div>
                            <div className="col-md-3 text-center animate-box">
                                <span className="colorlib-counter js-counter" data-from="0" data-to="356" data-speed="5000" data-refresh-interval="50">356</span>
                                <span className="colorlib-counter-label">Projects</span>
                            </div>
                            <div className="col-md-3 text-center animate-box">
                                <span className="colorlib-counter js-counter" data-from="0" data-to="30" data-speed="5000" data-refresh-interval="50">30</span>
                                <span className="colorlib-counter-label">Clients</span>
                            </div>
                            <div className="col-md-3 text-center animate-box">
                                <span className="colorlib-counter js-counter" data-from="0" data-to="10" data-speed="5000" data-refresh-interval="50">10</span>
                                <span className="colorlib-counter-label">Partners</span>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="colorlib-skills" data-section="skills">
                    <div className="colorlib-narrow-content">
                        <div className="row">
                            <div className="col-md-6 col-md-offset-3 col-md-pull-3 animate-box" data-animate-effect="fadeInLeft">
                                <span className="heading-meta">My Specialty</span>
                                <h2 className="colorlib-heading animate-box">My Skills</h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 animate-box" data-animate-effect="fadeInLeft">
                                <p>The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn???t listen. She packed her seven versalia, put her initial into the belt and made herself on the way.</p>
                            </div>
                            <div className="col-md-6 animate-box" data-animate-effect="fadeInLeft">
                                <div className="progress-wrap">
                                    <h3>Photoshop</h3>
                                    <div className="progress">
                                        <div className="progress-bar color-1" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                                            <span>75%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 animate-box" data-animate-effect="fadeInRight">
                                <div className="progress-wrap">
                                    <h3>jQuery</h3>
                                    <div className="progress">
                                        <div className="progress-bar color-2" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" >
                                            <span>60%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 animate-box" data-animate-effect="fadeInLeft">
                                <div className="progress-wrap">
                                    <h3>HTML5</h3>
                                    <div className="progress">
                                        <div className="progress-bar color-3" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" >
                                            <span>85%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 animate-box" data-animate-effect="fadeInRight">
                                <div className="progress-wrap">
                                    <h3>CSS3</h3>
                                    <div className="progress">
                                        <div className="progress-bar color-4" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" >
                                            <span>90%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 animate-box" data-animate-effect="fadeInLeft">
                                <div className="progress-wrap">
                                    <h3>WordPress</h3>
                                    <div className="progress">
                                        <div className="progress-bar color-5" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" >
                                            <span>70%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 animate-box" data-animate-effect="fadeInRight">
                                <div className="progress-wrap">
                                    <h3>SEO</h3>
                                    <div className="progress">
                                        <div className="progress-bar color-6" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" >
                                            <span>80%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        );
    }
}
