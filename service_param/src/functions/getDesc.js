module.exports = (parameters) => {
    return(Object.keys(parameters).reduce(function (acc, cur) {
        switch(cur) {
            case "sizeOne":
                if (!!parameters[cur].name) {
                    acc = parameters[cur].name;
                }
                break;
            case "sizeTwo": 
                if (!!parameters[cur].name) {
                    acc = `${acc} X ${parameters[cur].name}`;
                }
                break;
            case "sizeThree":
                if (!!parameters[cur].name) {
                    acc = `${acc} - ${parameters[cur].name}`;
                }
                break;
            case "wallTwo":
                if (!!parameters[cur].name) {
                    acc = `${acc} X ${parameters[cur].name}`;
                }
                break;
            default:
                if (!!parameters[cur].name) {
                    acc = `${acc} ${parameters[cur].name}`;
                }
        }
        return acc;
    },""));
}