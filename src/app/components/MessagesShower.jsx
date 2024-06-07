import { extractLinks } from "@/lib/extractlink";

const MessagesShower = ({ item, setMessages }) => {
  const { sender, text } = item;
  let links = extractLinks(text);
    console.log('links', links);

  return (
    <div className={`flex my-2 ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col justify-start items-start space-y-2 shadow-md p-3 hover:shadow-lg ${sender === 'user' ? 'bg-gradient-to-br from-green-600 to-indigo-400 text-white rounded-t-3xl rounded-bl-3xl' : 'bg-white transition duration-300 ease-in-out transform hover:-translate-y-1 text-black rounded-t-3xl rounded-br-3xl'}`}>
        <code className="break-all" >{text}</code>
        {sender === 'bot' && (
          <button onClick={() => setMessages([])} className="text-green-900 px-4 py-2 border-green-700 rounded-2xl text-xs hover:border-green-400 hover:bg-green-600 border-2 hover:text-white">List Of Services</button>
        )}
        {links.length > 0 && sender === 'bot' && (
          links.map((link, index) => (
            <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {link.length > 30 ? `${link.slice(0, 30)}...` : link}
            </a>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesShower;