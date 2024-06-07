export const  extractLinks =  (text) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    let links = text.match(urlRegex) || [];
    links = links.map(link => link.replace(/\).$/, '')); // Remove trailing ). from each link
    return links;
}
