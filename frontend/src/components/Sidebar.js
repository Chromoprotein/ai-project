import { Link } from "react-router-dom";

export default function Sidebar({ chatList, collapsedCategory, toggleCategory, isNavbarCollapsed }) {

    return (
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
    );
    
}