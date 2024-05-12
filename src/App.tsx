import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const getBookmarks = async () => {
      const bookmarks = await new Promise<string[]>((resolve) => {
        chrome.storage.sync.get(['bookmarks'], (data) => {
          resolve(data.bookmarks || []);
        });
      });
      setItems(bookmarks);
    };
    getBookmarks();
  }, []);

  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.bookmarks && changes.bookmarks.newValue) {
        setItems(changes.bookmarks.newValue);
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const addItem = async () => {
    if (input.trim()) {
      const newBookmarks = [...items, input.trim()];
      setItems(newBookmarks);
      await chrome.storage.sync.set({ bookmarks: newBookmarks });
      setInput('');
    }
  };

  const deleteItem = async (index: number) => {
    const newBookmarks = items.filter((_, i) => i !== index);
    setItems(newBookmarks);
    await chrome.storage.sync.set({ bookmarks: newBookmarks });
  };

  return (
    <>
      <h3>Add bookmarks for this page.</h3>
      <input
        value={input}
        placeholder="Add bookmarks"
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={addItem}>Add Bookmark</button>
      <div className="card">
        {items.map((item, index) => (
          <p key={index}>
            {item}{' '}
            <button onClick={() => deleteItem(index)}>Delete this bookmark</button>
          </p>
        ))}
      </div>
    </>
  );
}

export default App;