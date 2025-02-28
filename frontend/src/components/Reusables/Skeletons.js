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

function SkeletonWrapper({ children }) {
    return (
        <div className="formItem">
            {children}
        </div>
    );
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