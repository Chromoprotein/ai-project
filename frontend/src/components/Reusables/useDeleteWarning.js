import { useState } from "react";

export function useDeleteWarning(message, func) {

    const [deleteWarning, setDeleteWarning] = useState(false);

    const toggleDeleteWarning = () => {
        setDeleteWarning((prev) => !prev);
    };

    const confirmMessage = 
        <>
            {deleteWarning && <>
                <p>{message}</p>
                <div className="botButtons">
                    <button className="botButton" type="button" onClick={toggleDeleteWarning}>
                        Don't delete
                    </button>
                    <button className="botButton" type="button" onClick={func}>
                        Delete
                    </button>
                </div>
            </>}
        </>;

    return { deleteWarning, toggleDeleteWarning, confirmMessage };
}