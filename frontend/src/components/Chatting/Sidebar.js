import { Link } from "react-router-dom";
import { GoSidebarExpand } from "react-icons/go";
import { GoSidebarCollapse } from "react-icons/go";
import { GoDependabot } from "react-icons/go";
import { useState, useEffect } from "react";
import { MiniSpinner } from "../Reusables/SmallUIElements";
import { FaRegUser } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import LinkButton from "../Reusables/LinkButton";
import { RiChatNewLine } from "react-icons/ri";
import IconButton from "../Reusables/IconButton";

export function Sidebar({ chatList, chatId, loadingChatList, resetAll, currentBotAvatar = "/placeholderAvatar.webp" }) {

    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);
    const [collapsedCategory, setCollapsedCategory] = useState({}); // Chat categories that are collapsed. Key is the category's name and value is boolean

    const [isUserMenuShown, setIsUserMenuShown] = useState(false); // Menu for user profile related things
    const [isChatMenuShown, setIsChatMenuShown] = useState(false); // Menu for starting a new chat

    const [isUserMessageShown, setIsUserMessageShown] = useState(false); // Message that is shown when the user has no chats yet

    const toggleNavbar = () => {
        setIsNavbarCollapsed(!isNavbarCollapsed);
    };

    const toggleUserMenu = () => {
        setIsNavbarCollapsed(false);
        setIsChatMenuShown(false);
        setIsUserMenuShown((prev) => !prev);
    }

    const toggleChatMenu = () => {
        setIsNavbarCollapsed(false);
        setIsUserMenuShown(false);
        setIsChatMenuShown((prev) => !prev);
    }

    // Collapse a chat category
    const toggleCategory = (category) => {
        setCollapsedCategory((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const userMessage = "You don't have any chats yet. Get started by filling in your profile and customizing a bot."

    // If the user doesn't have any chats, open the user menu so the user is encouraged to 
    useEffect(() => {
        if(Object.keys(chatList).length === 0 && !isChatMenuShown && !isNavbarCollapsed) {
            setIsUserMenuShown(true);
            setIsUserMessageShown(true);
        }
    }, [chatList, isChatMenuShown, isNavbarCollapsed])

    return (
        <>
            <div className="navbarControl">
                <div className="smallButtonContainer">
                    <button className="roundButton" onClick={toggleNavbar}>
                        {isNavbarCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
                    </button>

                    <button className="roundButton" onClick={toggleUserMenu}>
                        <FaRegUser />
                    </button>

                    <button className="roundButton" onClick={toggleChatMenu}>
                        <RiChatNewLine />
                    </button>
                </div>
            </div>

            <div className={`navbar ${isNavbarCollapsed ? "collapsed" : "active"}`}>

                {loadingChatList && <MiniSpinner />}

                {isUserMessageShown && <div className="userMessage">{userMessage}</div>}

                {isUserMenuShown &&
                    <>
                        <div className="popupMenu">
                            <LinkButton url="/profile" icon={<FaRegUser />} text="Edit profile" />
                            <LinkButton url="/bots" icon={<GoDependabot />} text="Customize bots" />
                            <LinkButton url="/logout" icon={<IoLogOut />} text="Log out" />
                        </div>
                    </>
                }

                {isChatMenuShown &&
                    <>
                        <div className="popupMenu">
                            <IconButton func={resetAll} changeClass="botButton" disabled={!chatId} icon={<img src={currentBotAvatar} alt="new chat icon" className="botIcon" />} text="New chat" />
                            <LinkButton url="/bots" icon={<GoDependabot />} text="Choose bot" />
                        </div>
                    </>
                }

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