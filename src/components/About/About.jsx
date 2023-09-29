import React from "react";
import "./About.css";
import img from "../../assets/ai.jpg";
import ResumeBtn from "../resumeBtn/ResumeBtn";
import Scroll from "../Scroll/Scroll";
import AOS from "aos";
import "aos/dist/aos.css"; 

AOS.init();
const About = () => {
  return (
    <section className="container py-5 mt-5" id="1">
      <div className="d-lg-flex justify-content-between align-items-center gap-5 aboutt">
        <div className="about-con" data-aos="fade-right">
          <h1 className="name">
            <div className="d-flex flex-column desc-con">
              <span className="me">Hi I am Mohammad Abbass</span>
              <div className="text-animation-container">
                <div className="label">I am a</div>
                <div className="text-animation">FULL-STACK WEB DEVELOPER</div>
              </div>
            </div>
          </h1>
          <p className="about-me pt-2">
            I am a motivated and versatile individual, always eager to take on
            new challenges. With a passion for learning I am dedicated to
            delivering high-quality results. With a positive attitude and a
            growth mindset, I am ready to make a meaningful contribution and
            achieve great things.
          </p>
          <ResumeBtn />
        </div>
        <div data-aos="fade-left">
          <img
            src={img}
            alt="Mohammad Abbass"
            className="about-img img-fluid p-3"
          />
        </div>
      </div>

      <div className="mt-5">
        <Scroll id="2" />
      </div>
    </section>
  );
};

export default About;
