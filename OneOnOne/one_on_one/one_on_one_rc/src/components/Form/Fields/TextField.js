export function TextField({ className, type, label, value, onChange, errorMessage})
{
    return (
        <div className={className}>
            <input type={type} id={label} required value={value} onChange={(e) => onChange(e.target.value)} />
            <span className="error_message">{errorMessage}</span>
            <label htmlFor={label}>{label}</label>
        </div>
    );
}

export function TextFieldProfile({ className, type, label, value, onChange, errorMessage})
{
    return (
        <div className={className}>
            <label htmlFor={label}>{label}:</label>
            <input type={type} id={label} required value={value} onChange={(e) => onChange(e.target.value)} />
            {errorMessage && <span className="error_message">{errorMessage}</span>}
        </div>
    );
}
