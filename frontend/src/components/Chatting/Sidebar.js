import { Link } from "react-router-dom";
import { GoSidebarExpand } from "react-icons/go";
import { GoSidebarCollapse } from "react-icons/go";
import { GoDependabot } from "react-icons/go";
import { useState } from "react";
import { GoPlus } from "react-icons/go";
import { MiniSpinner } from "../Reusables/SmallUIElements";
import { FaRegUser } from "react-icons/fa";

export function Sidebar({ chatList, chatId, loadingChatList, resetAll }) {

    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);
    const [collapsedCategory, setCollapsedCategory] = useState({}); // Chat categories that are collapsed. Key is the category's name and value is boolean

    const toggleNavbar = () => {
        setIsNavbarCollapsed(!isNavbarCollapsed);
    };

    // Collapse a chat category
    const toggleCategory = (category) => {
        setCollapsedCategory((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    return (
        <>
            <div className="navbarControl">
                <div className="smallButtonContainer">
                    <button className="roundButton" onClick={toggleNavbar}>
                        {isNavbarCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
                    </button>

                    <Link className="roundButton" to="/profile">
                        <FaRegUser />
                    </Link>

                    <Link className="roundButton" to="/bots">
                        <GoDependabot />
                    </Link>

                    <button className="roundButton" onClick={resetAll}>
                        <GoPlus />
                    </button>
                </div>
            </div>

            <div className={`navbar ${isNavbarCollapsed ? "collapsed" : "active"}`}>

                {loadingChatList && <MiniSpinner />}

                {Object.keys(chatList).map((category) => (
                    <div key={category}>
                        <div
                            className={`categoryHeader ${!collapsedCategory[category] && "openCategoryHeader"}`}
                            onClick={() => toggleCategory(category)}
                        >
                            {category} {collapsedCategory[category] ? '+' : '-'}
                        </div>
                        {!collapsedCategory[category] && (
                            <div className="category">
                                {chatList[category].map((chat) => (
                                    <Link 
                                        to={`?chatId=${chat._id}`} 
                                        key={chat._id} 
                                        className={`navbarItem ${chatId === chat._id ? "active" : "inactive"}`}>
                                        {chat.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
    
}