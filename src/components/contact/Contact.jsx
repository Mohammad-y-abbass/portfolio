import React, { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./Contact.css";
import "aos/dist/aos.css";
import Aos from "aos";
Aos.init();

const Contact = () => {
   const [modal, setModal] = useState(false);
   useEffect(() => {
     console.log(modal);
   }, [modal]);
   const toggleModal = () => {
     setModal(!modal);
   };
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_au4d1fh",
        "template_po1167m",
        form.current,
        "bph02u-Qt16AP0sXR"
      )
      .then(
        (result) => {
           result = "message sent successfully";
        },
        (error) => {
           error = "message not sent";
        }
      );
  };

  return (
    <section id="5" className="p-5" data-aos="fade-right">
      <h1 className="text-center">Interested!</h1>
      <h1 className="text-center">Leave A Message</h1>
      <div className="form-container mx-auto mt-5">
        <form className="form" ref={form} onSubmit={sendEmail}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required="" />
          </div>
          <div className="form-group">
            <label htmlFor="textarea">Message</label>
            <textarea
              name="message"
              id="textarea"
              rows="10"
              cols="50"
              required=""
            ></textarea>
          </div>
          <button
            className="submitBtn"
            type="submit"
            value="submit"
            onClick={toggleModal}
          >
            <div className="svg-wrapper-1">
              <div className="svg-wrapper">
                <svg
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 0h24v24H0z" fill="none"></path>
                  <path
                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </div>
            <span className="send">Send</span>
          </button>
        </form>
      </div>
      <div className={`modal ${modal ? "show" : "hide"} p-2`}>
        <div className="close" onClick={toggleModal}>
          X
        </div>
        <p className="modal-text mt-1">Thank you for your interest</p>
      </div>
    </section>
  );
};

export default Contact;
