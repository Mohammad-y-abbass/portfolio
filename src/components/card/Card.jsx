import React from "react";
import "./Card.css";

const Card = (props) => {
  return (
    <div className="card-body" key={props.id} onClick={props.event}>
      <img
        src={props.image}
        alt={props.name}
        className="card-img img-fluid mb-3"
      />
      <h3 className="card-title">{props.name}</h3>
      <p className="card-text">{props.description}</p>
      <div className="d-flex justify-content-between align-items-center btns">
        <a href={props.demo} target="_blank">
          <button className="Button">Demo</button>
        </a>
        <a href={props.code} target="_blank">
          <button className="Button">Code</button>
        </a>
      </div>
    </div>
  );
};

export default Card;
