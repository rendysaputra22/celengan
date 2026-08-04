document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navItems = document.querySelectorAll('.nav-item, #fab-add');
  const views = document.querySelectorAll('.view');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = item.getAttribute('data-target');
      if(!targetId) return;
      
      // Update Active View
      views.forEach(view => view.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
      
      // Update Active Nav Icon (except FAB)
      if(!item.classList.contains('fab')) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('change', (e) => {
    if(e.target.checked) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  });

  // Dynamic Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good Evening!';
  if(hour < 12) greeting = 'Good Morning!';
  else if(hour < 18) greeting = 'Good Afternoon!';
  document.getElementById('greeting').innerText = greeting;

  // State Management
  let state = {
    transactions: [],
    balance: 0,
    income: 0,
    expense: 0
  };

  // Fetch API Data
  async function loadData() {
    try {
      const res = await fetch('/api/transactions');
      if(res.ok) {
        state.transactions = await res.json();
        updateDashboard();
      }
    } catch(err) {
      console.error('Error fetching data', err);
    }
  }

  function updateDashboard() {
    let income = 0;
    let expense = 0;
    
    const txList = document.getElementById('transaction-list');
    txList.innerHTML = '';
    
    state.transactions.slice(0, 5).forEach(tx => {
      if(tx.type === 'income') income += parseFloat(tx.amount);
      if(tx.type === 'expense') expense += parseFloat(tx.amount);
      
      const div = document.createElement('div');
      div.className = `tx-item ${tx.type}`;
      div.innerHTML = `
        <div class="tx-info">
          <h4>${tx.title}</h4>
          <p>${tx.category} • ${new Date(tx.date).toLocaleDateString()}</p>
        </div>
        <div class="tx-amount">${tx.type === 'income' ? '+' : '-'}$${parseFloat(tx.amount).toFixed(2)}</div>
      `;
      txList.appendChild(div);
    });

    state.balance = income - expense;
    
    document.getElementById('display-balance').innerText = `$${state.balance.toFixed(2)}`;
    document.getElementById('display-income').innerText = `$${income.toFixed(2)}`;
    document.getElementById('display-expense').innerText = `$${expense.toFixed(2)}`;

    updateBorosAI(state.balance, expense, income);
  }

  function updateBorosAI(balance, expense, income) {
    const aiMsg = document.getElementById('ai-message');
    if (expense > income && income > 0) {
      aiMsg.innerText = "Careful! You're spending more than you earn! Time to budget!";
    } else if (balance > 100) {
      aiMsg.innerText = "Looking good! You still have enough money. Treat yourself to a small snack! 🍪";
    } else if (balance < 50 && balance > 0) {
      aiMsg.innerText = "Whoa there, partner! Funds are running low. Let's save today.";
    } else if (balance <= 0) {
      aiMsg.innerText = "Yikes! We're in the red! 🚨 Halt all spending!";
    } else {
      aiMsg.innerText = "Tracking your finances like a superhero! 🦸‍♂️";
    }
  }

  // Add Transaction
  const addForm = document.getElementById('add-tx-form');
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="txType"]:checked').value;
    const amount = document.getElementById('txAmount').value;
    const title = document.getElementById('txTitle').value;
    const category = document.getElementById('txCategory').value;

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount, title, category })
      });
      if(res.ok) {
        addForm.reset();
        loadData();
        // Go back to home
        document.querySelector('[data-target="view-dashboard"]').click();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add transaction');
    }
  });

  // Init
  loadData();
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
