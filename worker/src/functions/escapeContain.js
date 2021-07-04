module.exports = (string) => {
    return !!string ? `${string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` : "";
}