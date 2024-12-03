import React from "react";
import { Link } from "react-router-dom";

export default function Form({ title, fields, buttonText, onSubmit, error, linkText, linkInfo, linkTo }) {
  return (
    <form onSubmit={onSubmit} className="formContainer">
      <div className="formItem">
        <h2>{title}</h2>
      </div>
      {fields.map(({ label, type, name, value, onChange }) => (
        <div key={name} className="formItem">
          <label>{label}</label>
          <input type={type} name={name} value={value} onChange={onChange} />
        </div>
      ))}
      <div className="formItem">
        <button className="button" type="submit">
          {buttonText}
        </button>
      </div>
      {error && (
        <div className="formItem">
          {error}
        </div>
      )}
      {linkText && linkInfo && linkTo && (
        <div className="formItem">
          {linkInfo}
          <Link className="button" to={linkTo}>
            {linkText}
          </Link>
        </div>
      )}
    </form>
  );
};