export default function getPageSize(clientHeight) {
    return Math.floor(((clientHeight - 53) / 33));
}