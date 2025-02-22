import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton() {
    return (
        <Link to="/" className="botButton">
            <span className="buttonIcon"><FaArrowLeft/></span> 
            <span className="buttonText">Back</span>
        </Link>
    );
}