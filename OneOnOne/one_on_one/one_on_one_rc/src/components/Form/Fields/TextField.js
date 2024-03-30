function TextField({ type, label, value, onChange, errorMessage})
{
    return (
        <div className="txt_field">
            <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} />
            <span className="error_message">{errorMessage}</span>
            <label>{label}</label>
        </div>
    );
}

export default TextField;