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

  if (companySizeSelect && auditPackageSelect) {
    companySizeSelect.addEventListener('change', () => {
      const selectedSize = companySizeSelect.value;
      if (selectedSize === 'smb') {
        auditPackageSelect.value = 'smb-audit';
      } else if (selectedSize === 'enterprise') {
        auditPackageSelect.value = 'ent-audit';
      }
    });

    auditPackageSelect.addEventListener('change', () => {
      const selectedPackage = auditPackageSelect.value;
      if (selectedPackage === 'smb-audit') {
        companySizeSelect.value = 'smb';
      } else if (selectedPackage === 'ent-audit') {
        companySizeSelect.value = 'enterprise';
      }
    });
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
});
