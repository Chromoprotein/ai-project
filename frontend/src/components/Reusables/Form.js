import React from "react";
import { Link } from "react-router-dom";

export default function Form({ title, fields, buttonText, onSubmit, error, linkText, linkInfo, linkTo }) {
  return (
    <form onSubmit={onSubmit} className="formContainer">
      <div className="formItem">
        <h2>{title}</h2>
      </div>
      {fields.map(({ label, type, name, value, onChange, inputType }) => (
        <div key={name} className="formItem">
            <label className="smallLabel">{label}</label>
            {inputType === "textarea" ?
                <textarea type={type} name={name} value={value} onChange={onChange}></textarea> : 
                <input type={type} name={name} value={value} onChange={onChange} />
            }
        </div>
      ))}
      <div className="formItem">
        <button className="button" type="submit">
          {buttonText}
        </button>
      </div>
      {error && (
        <div className="formItem">
          <p className="formInfo">{error}</p>
        </div>
      )}
      {linkText && linkInfo && linkTo && (
        <div className="formItem">
          <p className="formInfo">{linkInfo}</p>
          <Link className="button" to={linkTo}>
            {linkText}
          </Link>
        </div>
      )}
    </form>
  );
};
