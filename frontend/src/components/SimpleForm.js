    export default function Form({ title, fields, onSubmit, error }) {
        return (
            <form onSubmit={onSubmit} className="formContainer">
                <div className="formItem">
                <h2>{title}</h2>
                </div>
                {fields.map(({ label, type, name, value, onChange, inputType }) => (
                    <div key={name} className="formItem">
                        <label>{label}</label>
                        {inputType === "textarea" ?
                            <textarea type={type} name={name} value={value} onChange={onChange}></textarea> : 
                            <input type={type} name={name} value={value} onChange={onChange} />
                        }
                    </div>
                ))}
                <div className="formItem">
                <button className="button" type="submit">
                    Submit
                </button>
                </div>
                {error && (
                <div className="formItem">
                    {error}
                </div>
                )}
            </form>
        );
    };
