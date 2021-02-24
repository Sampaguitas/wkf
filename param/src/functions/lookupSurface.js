module.exports = function lookupSurface(surface) {
    const found = require('../constants/surfaces.json').find(element => element.name === surface);
    if (found === undefined) {
        return {
            'lunar': 'FF',
            'name': surface,
            'tags': surface ? [surface] : []
        };
    } else {
        return {
            'lunar': found.lunar,
            'name': surface,
            'tags': found.tags
        };
    }
}