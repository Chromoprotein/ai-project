import { Link } from "react-router-dom";
import { GoSidebarExpand } from "react-icons/go";
import { GoSidebarCollapse } from "react-icons/go";
import { GoPlus } from "react-icons/go";
import { useState } from "react";

export function Sidebar({ chatList, showBotList, setShowBotList }) {

    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
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

                <button className="roundButton" onClick={() => setShowBotList(!showBotList)}>
                    <GoPlus />
                </button>
                </div>
            </div>

            <div className={`navbar ${isNavbarCollapsed ? "collapsed" : "active"}`}>
                {Object.keys(chatList).map((category) => (
                    <div key={category} className="category">
                        <div
                            className={`categoryHeader ${!collapsedCategory[category] && "openCategoryHeader"}`}
                            onClick={() => toggleCategory(category)}
                        >
                            {category} {collapsedCategory[category] ? '+' : '-'}
                        </div>
                        {!collapsedCategory[category] && (
                            <ul>
                                {chatList[category].map((chat) => (
                                    <li key={chat._id}>
                                        <Link to={`?chatId=${chat._id}`}>{chat.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
    
}