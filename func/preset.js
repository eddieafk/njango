function partial(fn, ...presetArgs) {
    return function (...laterArgs) {
        return fn(...presetArgs, ...laterArgs);
    };
}

export default partial