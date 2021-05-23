module.exports = (items, size) => {
    let chunks = [];
    items = [].concat(...items);
    while (items.length) {
        chunks.push(items.splice(0, size));
    }
    return chunks
}