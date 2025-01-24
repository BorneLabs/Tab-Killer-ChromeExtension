// Initialize kill count in storage if not exists
chrome.storage.local.get(['killCount'], function(result) {
    if (typeof result.killCount === 'undefined') {
      chrome.storage.local.set({ killCount: 0 });
    }
  });
  
  // Function to update statistics display
  function updateStats() {
    chrome.tabs.query({}, (tabs) => {
      document.getElementById('aliveTabs').textContent = `Tabs Alive: ${tabs.length}`; // Changed here
    });
  
    chrome.storage.local.get(['killCount'], (result) => {
      document.getElementById('killCount').textContent = `Kill Count: ${result.killCount || 0}`;
    });
  }
  
  // Initial stats update when popup opens
  updateStats();
  
  // Kill All Tabs Button Handler
  document.getElementById('killAll').addEventListener('click', () => {
    chrome.tabs.create({ url: "chrome://newtab" }, (newTab) => {
      chrome.tabs.query({}, (tabs) => {
        const tabsToClose = tabs.filter(tab => tab.id !== newTab.id);
        const killedTabs = tabsToClose.length;
        
        chrome.tabs.remove(tabsToClose.map(tab => tab.id), () => {
          chrome.storage.local.get(['killCount'], (result) => {
            const newCount = (result.killCount || 0) + killedTabs;
            chrome.storage.local.set({ killCount: newCount }, updateStats);
          });
        });
      });
    });
  });
  
  // Spare Current Tab Button Handler
  document.getElementById('spareCurrent').addEventListener('click', () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const activeTab = tabs.find(tab => tab.active);
      const tabsToClose = tabs.filter(tab => 
        !tab.pinned && tab.id !== activeTab?.id
      );
      
      const killedTabs = tabsToClose.length;
      
      if (killedTabs > 0) {
        chrome.tabs.remove(tabsToClose.map(tab => tab.id), () => {
          chrome.storage.local.get(['killCount'], (result) => {
            const newCount = (result.killCount || 0) + killedTabs;
            chrome.storage.local.set({ killCount: newCount }, updateStats);
          });
        });
      }
    });
  });