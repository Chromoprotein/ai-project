// Layout for pages without the chat list sidebar

import Background from "./Backgrounds";

export default function Layout({children, theme, buttons}) {

    return (
        <>
            <Background theme={theme} />

            <div className="container"> {/*places the content above the Background component*/}

                <div className="mainContent"> {/*flexbox*/}
                    <div className="scrollContainer"> {/*scrollable element*/}
                        <div className="botButtons">
                            {buttons}
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}