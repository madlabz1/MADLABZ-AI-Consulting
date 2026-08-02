document.addEventListener('DOMContentLoaded', () => {
  
  // --- 0. Currency Geo-Detection ---
  let currencySymbol = '$';
  
  function detectCurrency() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const locale = navigator.language || '';
      
      // Check if UK-based (London timezone or GB locale)
      if (tz === 'Europe/London' || locale.toLowerCase().includes('gb') || locale.toLowerCase().includes('uk')) {
        currencySymbol = '£';
      } 
      // Check if Eurozone
      else if (tz.startsWith('Europe/') && tz !== 'Europe/London') {
        currencySymbol = '€';
      }
    } catch (e) {
      console.warn('Currency detection failed, defaulting to USD:', e);
    }
  }

  detectCurrency();


  // --- 1. Interactive ROI Calculator Logic ---
  const employeesInput = document.getElementById('employees-input');
  const hoursInput = document.getElementById('hours-input');
  const rateInput = document.getElementById('rate-input');

  const employeesVal = document.getElementById('employees-val');
  const hoursVal = document.getElementById('hours-val');
  const rateVal = document.getElementById('rate-val');

  const resultHours = document.getElementById('result-hours');
  const resultCash = document.getElementById('result-cash');
  const resultRoi = document.getElementById('result-roi');

  function calculateROI() {
    const employees = parseInt(employeesInput.value, 10);
    const hoursWasted = parseInt(hoursInput.value, 10);
    const hourlyRate = parseInt(rateInput.value, 10);

    // Update Slider Value Texts
    employeesVal.textContent = employees;
    hoursVal.textContent = `${hoursWasted} hrs`;
    rateVal.textContent = `${currencySymbol}${hourlyRate}/hr`;

    // Calculations
    const weeklyHoursWasted = employees * hoursWasted;
    const annualHoursWasted = weeklyHoursWasted * 52;
    const annualCashLeakage = annualHoursWasted * hourlyRate;

    // Estimate conservative 40% AI efficiency improvement (hours saved / processes optimized)
    const efficiencyImprovement = 0.40;
    const annualSavings = annualCashLeakage * efficiencyImprovement;

    // Determine audit cost dynamically based on employee threshold
    // SMB (<= 50 employees) = $5,000, Enterprise (> 50 employees) = $20,000
    const auditCost = (employees <= 50) ? 5000 : 20000;

    // Year 1 Net ROI
    const netReturn = annualSavings - auditCost;
    const roiPercentage = (netReturn / auditCost) * 100;

    // Format and Render Outputs
    resultHours.textContent = `${Math.round(annualHoursWasted).toLocaleString()} hrs`;
    resultCash.textContent = `${currencySymbol}${Math.round(annualCashLeakage).toLocaleString()}`;
    
    if (roiPercentage > 0) {
      resultRoi.textContent = `${Math.round(roiPercentage).toLocaleString()}%`;
      resultRoi.style.color = 'var(--accent-cyan)';
    } else {
      resultRoi.textContent = 'N/A';
      resultRoi.style.color = 'var(--text-dim)';
    }
  }

  // Bind Events for Sliders
  if (employeesInput && hoursInput && rateInput) {
    employeesInput.addEventListener('input', calculateROI);
    hoursInput.addEventListener('input', calculateROI);
    rateInput.addEventListener('input', calculateROI);
    // Initial Run
    calculateROI();
  }

  // --- 2. Dynamic Form Select Syncing ---
  const companySizeSelect = document.getElementById('client-size');
  const auditPackageSelect = document.getElementById('client-package');

  const submitBookingBtn = document.getElementById('submit-booking-btn');

  function updateBookingBtnText() {
    if (!submitBookingBtn || !auditPackageSelect) return;
    if (auditPackageSelect.value === 'mini-audit') {
      submitBookingBtn.textContent = 'Claim Your Free 15-Min AI Audit';
      submitBookingBtn.style.background = 'var(--accent-gradient)';
    } else if (auditPackageSelect.value === 'smb-audit') {
      submitBookingBtn.textContent = 'Submit SMB Audit Request';
      submitBookingBtn.style.background = 'var(--accent-gradient)';
    } else {
      submitBookingBtn.textContent = 'Submit Enterprise Audit Request';
      submitBookingBtn.style.background = 'var(--accent-gradient)';
    }
  }

  window.selectPackage = function(pkgValue) {
    if (auditPackageSelect) {
      auditPackageSelect.value = pkgValue;
      updateBookingBtnText();
    }
  };

  if (auditPackageSelect) {
    auditPackageSelect.addEventListener('change', updateBookingBtnText);
    updateBookingBtnText();
  }

  // --- 3. Form Submission Integration ---
  const bookingForm = document.getElementById('audit-booking-form');
  const successMessage = document.getElementById('booking-success-message');
  const bookingTitle = document.getElementById('booking-title');
  const bookingSubtitle = document.getElementById('booking-subtitle');

  if (bookingForm && successMessage) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect data
      const data = {
        name: document.getElementById('client-name').value,
        email: document.getElementById('client-email').value,
        company: document.getElementById('client-company').value,
        size: companySizeSelect.value,
        industry: document.getElementById('client-industry').value,
        package: auditPackageSelect.value,
        message: document.getElementById('client-message').value
      };

      // Set button to loading state
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Submit Audit Request';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      // Format payload for Formsubmit.co
      const payload = {
        _subject: "Madlabz Consulting form submission",
        "Full Name": data.name,
        "Email Address": data.email,
        "Company Name": data.company,
        "Company Size": data.size === 'smb' ? 'Small-Medium (10-50 employees)' : 'Medium-Large (50-200+ employees)',
        "Industry": data.industry,
        "Selected Package": data.package === 'smb-audit' ? 'SMB AI Audit' : 'Enterprise AI Audit',
        "Message / Bottlenecks": data.message
      };

      fetch('https://formsubmit.co/ajax/madlabzuk.a@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(res => {
        console.log('Form submission successful:', res);

        // Animation: Fade out form and headers, Fade in success message
        bookingForm.style.transition = 'opacity 0.4s ease';
        bookingForm.style.opacity = '0';
        if (bookingTitle) {
          bookingTitle.style.transition = 'opacity 0.4s ease';
          bookingTitle.style.opacity = '0';
        }
        if (bookingSubtitle) {
          bookingSubtitle.style.transition = 'opacity 0.4s ease';
          bookingSubtitle.style.opacity = '0';
        }
        
        setTimeout(() => {
          bookingForm.style.display = 'none';
          if (bookingTitle) bookingTitle.style.display = 'none';
          if (bookingSubtitle) bookingSubtitle.style.display = 'none';
          
          successMessage.style.display = 'block';
          successMessage.style.opacity = '0';
          successMessage.style.transition = 'opacity 0.4s ease';
          
          // Trigger reflow to apply transitions
          successMessage.offsetHeight;
          successMessage.style.opacity = '1';
        }, 400);
      })
      .catch(error => {
        console.error('Form submission error:', error);
        alert('There was an error submitting your request. Please try again or email us at madlabzuk.a@gmail.com.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    });
  }

  // --- 4. Intersection Observer for Scroll Animations ---
  const reveals = document.querySelectorAll('.reveal');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once triggered to keep page lightweight
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    root: null, // viewport
    threshold: 0.15, // 15% visibility trigger
    rootMargin: '0px 0px -50px 0px' // offset bottom trigger slightly
  });

  reveals.forEach(element => {
    revealObserver.observe(element);
  });

  // --- 5. Navigation Bar Background on Scroll ---
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.top = '0';
        header.querySelector('.nav-bar').style.borderRadius = '0';
        header.querySelector('.nav-bar').style.borderLeft = 'none';
        header.querySelector('.nav-bar').style.borderRight = 'none';
        header.querySelector('.nav-bar').style.borderTop = 'none';
      } else {
        header.style.top = '1.5rem';
        header.querySelector('.nav-bar').style.borderRadius = '100px';
        header.querySelector('.nav-bar').style.border = '1px solid var(--glass-border)';
      }
    });
  }

  // --- 6. AI Services Resource Library Renderer ---
  const resourceGrid = document.getElementById('resource-grid-container');
  const searchInput = document.getElementById('resource-search-input');
  const filterBtns = document.querySelectorAll('.res-filter-btn');

  let allResources = [
    {
      "id": "mini-assessment-playbook",
      "category": "Assessment & Lead Gen",
      "title": "1. The Mini AI Assessment Playbook",
      "description": "A step-by-step playbook for running a free 15-minute mini assessment. Includes discovery questions, meeting templates, research workflow, and prep checklists.",
      "link": "https://app.notion.com/p/3754fd47b96f81359856c42ab166a60a",
      "tags": ["Discovery", "Meeting Templates", "Workflow"],
      "actionLabel": "Open Playbook"
    },
    {
      "id": "assessment-report-template",
      "category": "Templates & Deliverables",
      "title": "2. AI Tools Assessment Report Template",
      "description": "The blank six-part report template used to package paid AI assessments. Presents pain points, recommended tools, quick wins, and financial impact.",
      "usageInstruction": "Prompt: 'Import a clean copy of the Assessment template attached' into Claude Design.",
      "link": "https://drive.google.com/file/d/1FQGaxgVTHL22K7lKsiYjTFzvPqmWCE0j/view?usp=sharing",
      "tags": ["HTML Deliverable", "Claude Design", "Financial Impact"],
      "actionLabel": "Download Template"
    },
    {
      "id": "ai-concierge-playbook",
      "category": "Concierge & Retainers",
      "title": "3. The AI Concierge Playbook",
      "description": "Detailed blueprint for structuring and fulfilling the recurring AI Concierge offer. Covers onboarding, working sessions, and the Audit–Optimize–Automate process.",
      "link": "https://app.notion.com/p/38a4fd47b96f81979240d297a1e72ea2",
      "tags": ["Onboarding", "Audit-Optimize-Automate", "Retainer SLA"],
      "actionLabel": "Open Concierge Blueprint"
    },
    {
      "id": "sales-objections-guide",
      "category": "Sales & Objections",
      "title": "4. 8 Objections Every AI Prospect Raises",
      "description": "Eight word-for-word responses to common objections when selling AI services, including price, timing, and DIY assumptions.",
      "link": "https://app.notion.com/p/3754fd47b96f81749cf3f33d92c0d2d5",
      "tags": ["Sales Scripts", "Word-for-Word", "Closing"],
      "actionLabel": "View Objection Scripts"
    },
    {
      "id": "ai-operator-academy",
      "category": "Operating System & Training",
      "title": "5. AI Operator Academy (Full Business in a Box)",
      "description": "The complete AI Assessment and AI Concierge operating system including Claude skills, templates, client hub, and onboarding plugin.",
      "link": "https://aoa.community/video",
      "tags": ["Full OS", "Claude Skills", "Client Hub"],
      "actionLabel": "Explore Operating System"
    },
    {
      "id": "ai-services-course-video",
      "category": "Video Training",
      "title": "6. AI Services Business Full Course",
      "description": "Complete video breakdown walking through how to structure, sell, and execute AI assessments and concierge services for SMEs.",
      "link": "https://youtu.be/GP7ki1RdzJ4",
      "tags": ["Video Course", "Strategy", "Execution"],
      "actionLabel": "Watch Video Course"
    }
  ];

  function renderResources(items) {
    if (!resourceGrid) return;
    
    if (items.length === 0) {
      resourceGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--glass-border);">
          <p style="color: var(--text-muted); font-size: 1.1rem;">No resources found matching your filter.</p>
        </div>
      `;
      return;
    }

    resourceGrid.innerHTML = items.map(item => `
      <div class="card reveal active" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
            ${item.category}
          </div>
          <h3 style="font-size: 1.2rem; margin-bottom: 0.8rem; color: #fff;">${item.title}</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
            ${item.description}
          </p>
          ${item.usageInstruction ? `
            <div style="font-size: 0.8rem; background: rgba(133, 51, 255, 0.1); border-left: 3px solid var(--accent-purple); padding: 0.5rem 0.8rem; border-radius: 4px; margin-bottom: 1rem; color: var(--text-main);">
              💡 <strong>Tip:</strong> ${item.usageInstruction}
            </div>
          ` : ''}
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem;">
            ${item.tags ? item.tags.map(tag => `<span style="font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 50px; background: rgba(255,255,255,0.05); color: var(--text-dim); border: 1px solid var(--glass-border);">${tag}</span>`).join('') : ''}
          </div>
        </div>
        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.85rem; width: 100%; text-align: center; justify-content: center;">
          ${item.actionLabel || 'Access Resource'} ↗
        </a>
      </div>
    `).join('');
  }

  // Attempt to fetch fresh db from backend or API
  fetch('./resources_db.json')
    .then(r => r.json())
    .then(data => {
      if (data && data.resources) {
        allResources = data.resources;
        renderResources(allResources);
      }
    })
    .catch(() => {
      // Use fallback
      renderResources(allResources);
    });

  // Category Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255, 255, 255, 0.04)';
        b.style.borderColor = 'var(--glass-border)';
        b.style.color = 'var(--text-muted)';
      });
      btn.classList.add('active');
      btn.style.background = 'rgba(133, 51, 255, 0.2)';
      btn.style.borderColor = 'var(--accent-purple)';
      btn.style.color = '#fff';

      const cat = btn.getAttribute('data-category');
      if (cat === 'all') {
        renderResources(allResources);
      } else {
        const filtered = allResources.filter(r => 
          r.category.toLowerCase().includes(cat) || r.id.toLowerCase().includes(cat)
        );
        renderResources(filtered);
      }
    });
  });

  // Search Input Filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderResources(allResources);
        return;
      }
      const filtered = allResources.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
      );
      renderResources(filtered);
    });
  }

  // Initial render call
  renderResources(allResources);

  // --- Maddie Chatbot Controller ---
  const chatTrigger = document.getElementById('maddie-chat-trigger');
  const chatWindow = document.getElementById('maddie-chat-window');
  const chatClose = document.getElementById('maddie-chat-close');
  const chatMessages = document.getElementById('maddie-chat-messages');
  const chatInput = document.getElementById('maddie-chat-input');
  const chatSend = document.getElementById('maddie-chat-send');
  const suggestionChipsContainer = document.getElementById('maddie-suggestion-chips');

  const calendarLink = "https://calendar.app.google/L7eKNEGMkrrsW2Ti7";

  let botGreetingSent = false;

  function addBotMessage(text, isHTML = false) {
    const bubble = document.createElement('div');
    bubble.classList.add('maddie-message', 'bot');
    if (isHTML) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.classList.add('maddie-message', 'user');
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('maddie-typing-indicator');
    indicator.id = 'maddie-typing-temp';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTypingIndicator() {
    const temp = document.getElementById('maddie-typing-temp');
    if (temp) temp.remove();
  }

  function toggleChat() {
    chatWindow.classList.toggle('maddie-hidden');
    
    // Send bot greeting on first open
    if (!botGreetingSent && !chatWindow.classList.contains('maddie-hidden')) {
      botGreetingSent = true;
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        addBotMessage("Hi there! I'm Maddie, your AI operations assistant. 👋");
        showTypingIndicator();
        setTimeout(() => {
          hideTypingIndicator();
          addBotMessage("I help businesses identify operational bottlenecks and deploy custom automations (using platforms like n8n or LLMs).\n\nHow can I help you today? You can select a quick option below, or type a question!");
        }, 1000);
      }, 800);
    }
  }

  if (chatTrigger && chatWindow && chatClose) {
    chatTrigger.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);
  }

  // Predefined intents and responses
  const botIntents = {
    greeting: "Hi there! I'm Maddie. Ask me anything about MADLABZ AI Consulting, our readiness audits, or schedule a free assessment slot below!",
    audit: "Our AI Readiness Audit takes 2 weeks. We conduct interviews with your staff to map your workflows, identify processes draining employee hours, and co-create an Opportunity Canvas. The final roadmap outlines exactly what custom integrations to build, their costs, and your Year 1 projected ROI. Would you like to book a free assessment call to check your team's readiness?",
    systems: "We build custom pipelines using tools like n8n for integrations, custom LLM agents for cognitive tasks, and Vapi for automated voice interfaces. All solutions are backed by active MSP maintenance to prevent any API breakages. Let's schedule a free assessment to see what systems match your bottlenecks!",
    roi: "We calculate operational leakages based on employee headcount, wasted administrative hours, and average pay rates. By automating processes, we aim to cut back-office hours by up to 40%. Would you like to book a free call to run the math on your specific business?",
    book: `Perfect! I've loaded my booking calendar directly below. Please pick a convenient slot for your Free AI Readiness Assessment call:<br><br><iframe src="https://calendar.app.google/L7eKNEGMkrrsW2Ti7" class="maddie-calendar-embed" frameborder="0"></iframe><br><i>Having trouble viewing the calendar? <a href="https://calendar.app.google/L7eKNEGMkrrsW2Ti7" target="_blank" style="color: var(--accent-cyan); text-decoration: underline; font-weight: 500;">Click here to open it directly</a>.</i>`
  };

  function handleBotResponse(text) {
    showTypingIndicator();
    const query = text.toLowerCase().trim();
    
    setTimeout(() => {
      hideTypingIndicator();
      
      if (query.includes('book') || query.includes('calendar') || query.includes('schedule') || query.includes('assess') || query.includes('call') || query.includes('appoint') || query.includes('meet')) {
        addBotMessage(botIntents.book, true);
      } else if (query.includes('audit') || query.includes('diagnos') || query.includes('process') || query.includes('canvas')) {
        addBotMessage(botIntents.audit);
      } else if (query.includes('system') || query.includes('n8n') || query.includes('tool') || query.includes('software') || query.includes('vapi')) {
        addBotMessage(botIntents.systems);
      } else if (query.includes('roi') || query.includes('sav') || query.includes('leak') || query.includes('rate') || query.includes('cost') || query.includes('price')) {
        addBotMessage(botIntents.roi);
      } else if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('maddie')) {
        addBotMessage(botIntents.greeting);
      } else {
        addBotMessage(`That's a great question! We go deep into that during our Free 15-Minute AI Readiness Assessment. Let's get you booked in for a chat:<br><br><iframe src="https://calendar.app.google/L7eKNEGMkrrsW2Ti7" class="maddie-calendar-embed" frameborder="0"></iframe><br><i>Having trouble? <a href="https://calendar.app.google/L7eKNEGMkrrsW2Ti7" target="_blank" style="color: var(--accent-cyan); text-decoration: underline; font-weight: 500;">Open calendar in a new tab</a>.</i>`, true);
      }
    }, 1000);
  }

  // Suggestion Chips Click Handler
  if (suggestionChipsContainer) {
    suggestionChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.maddie-chip');
      if (!chip) return;
      
      const intent = chip.getAttribute('data-intent');
      const userText = chip.textContent;
      
      addUserMessage(userText);
      
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        if (intent && botIntents[intent]) {
          const isHTML = intent === 'book';
          addBotMessage(botIntents[intent], isHTML);
        } else {
          handleBotResponse(userText);
        }
      }, 800);
    });
  }

  // Input Send Message
  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addUserMessage(text);
    chatInput.value = '';
    
    handleBotResponse(text);
  }

  if (chatSend && chatInput) {
    chatSend.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }
});

