module.exports = (parameters) => {
    return(Object.keys(parameters).reduce(function (acc, cur) {
        switch(cur) {
            case "length": return `${acc}FF${parameters[cur].lunar}`;
            case "surface": return `${acc}${parameters[cur].lunar}FFFFFF1`;
            default: return `${acc}${parameters[cur].lunar}`;
        }
    }, ""));
}