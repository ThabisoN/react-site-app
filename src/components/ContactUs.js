import React, { Component } from 'react';

export class ContactUs extends Component {
    render() {
        return (
            <div>
                <section className="colorlib-contact" data-section="contact">
                    <div className="colorlib-narrow-content">
                        <div className="row">
                            <div className="col-md-6 col-md-offset-3 col-md-pull-3 animate-box" data-animate-effect="fadeInLeft">
                                <span className="heading-meta">Get in Touch</span>
                                <h2 className="colorlib-heading">Contact</h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-5">
                                <div className="colorlib-feature colorlib-feature-sm animate-box" data-animate-effect="fadeInLeft">
                                    <div className="colorlib-icon">
                                        <i className="icon-globe-outline"></i>
                                    </div>
                                    <div className="colorlib-text">
                                        <p><a href="#">info@domain.com</a></p>
                                    </div>
                                </div>
                                <div className="colorlib-feature colorlib-feature-sm animate-box" data-animate-effect="fadeInLeft">
                                    <div className="colorlib-icon">
                                        <i className="icon-map"></i>
                                    </div>
                                    <div className="colorlib-text">
                                        <p>198 West 21th Street, Suite 721 New York NY 10016</p>
                                    </div>
                                </div>
                                <div className="colorlib-feature colorlib-feature-sm animate-box" data-animate-effect="fadeInLeft">
                                    <div className="colorlib-icon">
                                        <i className="icon-phone"></i>
                                    </div>
                                    <div className="colorlib-text">
                                        <p><a href="tel://">+123 456 7890</a></p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-7 col-md-push-1">
                                <div className="row">
                                    <div className="col-md-10 col-md-offset-1 col-md-pull-1 animate-box" data-animate-effect="fadeInRight">
                                        <form action="">
                                            <div className="form-group">
                                                <input type="text" class="form-control" placeholder="Name" pwa2-uuid="EDITOR/input-BDD-910-A324C-42F" pwa-fake-editor="" />
                                            </div>
                                            <div className="form-group">
                                                <input type="text" class="form-control" placeholder="Email" pwa2-uuid="EDITOR/input-FD0-C4C-45E0F-965" pwa-fake-editor="" />
                                            </div>
                                            <div className="form-group">
                                                <input type="text" class="form-control" placeholder="Subject" pwa2-uuid="EDITOR/input-3F3-866-5A6B1-6B3" pwa-fake-editor="" />
                                            </div>
                                            <div class="form-group">

                                            </div>
                                            <div className="form-group">
                                                <input type="submit" className="btn btn-primary btn-send-message" value="Send Message" />
                                            </div>
                                        </form>
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