export const  removeLinksFromText =  (text) => {
   
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
    
    return text.replace(urlRegex, '');
  }
  
