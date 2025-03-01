export function SkeletonProfile() {
  return (
    <div className="formContainer">
        {/* Profile Picture */}
        <SkeletonCircle />

        {/* Bio - Simulate different text lengths */}
        <SkeletonItemShort />
        <SkeletonItemLong />
        <SkeletonItemLong />
        <SkeletonItem />
        <SkeletonItemShort />
        <SkeletonItem />
    </div>
  );
};

export function SkeletonCircle() {
    return (
        <div className="botImageWrapper">
            <div className="skeleton botImage"></div>
        </div>
    );
}

export function SkeletonCircleSmall() {
    return (
        <div className="skeleton profileButton"></div>
    );
}

function SkeletonItem() {
    return (
        <SkeletonWrapper>
            <SkeletonLabel />
            <SkeletonLine />
        </SkeletonWrapper>
    );
}

function SkeletonItemShort() {
    return (
        <SkeletonWrapper>
            <SkeletonLabel />
            <SkeletonShortLine />
        </SkeletonWrapper>
    );
}

function SkeletonItemLong() {
    return (
        <SkeletonWrapper>
            <SkeletonLabel />
            <SkeletonLine />
            <SkeletonShortLine />
            <SkeletonLine />
        </SkeletonWrapper>
    );
}

export function SkeletonBotProfile() {
    return (
        <>
            <SkeletonBot />
            <SkeletonBot />
            <SkeletonBot />
        </>
    );
}

function SkeletonBot() {
    return (
        <div className="botWrapper collapsed">
            <SkeletonCircle />
            <SkeletonTitleLine />
            <SkeletonButtonWrapper>
                <SkeletonButton />
                <SkeletonButton />
                <SkeletonButton />
            </SkeletonButtonWrapper>
        </div>
    );
}

function SkeletonWrapper({ children }) {
    return (
        <div className="formItem">
            {children}
        </div>
    );
}

function SkeletonButtonWrapper({ children }) {
    return (
        <div className="botButtons">
            {children}
        </div>
    );
}

function SkeletonButton() {
    return (
        <div className="skeleton skeleton-button botButton"></div>
    );
}

function SkeletonTitleLine() {
    return (
        <div className="skeleton skeleton-title botTitle"></div>
    )
}

function SkeletonLabel() {
    return (
        <div className="skeleton skeleton-text skeleton-label"></div>
    );
}

function SkeletonShortLine() {
    return (
        <div className="skeleton skeleton-text skeleton-short"></div>
    );
}

function SkeletonLine() {
    return (
        <div className="skeleton skeleton-text"></div>
    );
}