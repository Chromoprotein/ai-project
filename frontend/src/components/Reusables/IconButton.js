export default function IconButton({
    func,
    icon,
    text,
    condition,
    trueIcon,
    trueText,
    falseIcon,
    falseText,
    disabled,
    changeClass = "button",
    type = "button"
}) {
    const renderIcon = condition !== undefined ? (condition ? trueIcon : falseIcon) : icon;
    const renderText = condition !== undefined ? (condition ? trueText : falseText) : text;

    return (
        <button type={type} className={changeClass} onClick={func} disabled={disabled}>
            <span className="buttonIcon">{renderIcon}</span>
            <span className="buttonText">{renderText}</span>
        </button>
    );
}
