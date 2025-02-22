import { Link } from "react-router-dom";

export default function LinkButton({classChange = "botButton", url, icon, text}) {
    return (
        <Link className={classChange} to={url}>
            <span className="buttonIcon">{icon}</span>
            <span className="buttonText">{text}</span>
        </Link>
    );
}