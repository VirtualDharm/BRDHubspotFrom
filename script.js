document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const form = document.getElementById('configuratorForm');
    const slides = Array.from(form.querySelectorAll('.cf-slide'));
    const nextBtn = document.querySelector('.cf-next-btn');
    const backBtn = document.querySelector('.cf-back-btn');
    const progressBar = document.getElementById('progressBar');
    const validationMessage = document.getElementById('validation-message');
    const resultContainer = document.querySelector('.cf-result');
    const actionsContainer = document.querySelector('.cf-actions');
    
    // --- State Management ---
    let currentSlideId = slides[0].dataset.slideId;
    let slideHistory = [currentSlideId];
    const formData = {};
    const mainSteps = [1, 2, 3, 4, 5];

    // --- Initialization ---
    function initialize() {
        updateProgressBar();
        setupInputListeners();
        updateUI();
    }

    // --- Event Listeners ---
    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handleBack);

    function setupInputListeners() {
        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                updateFormData(e.target);
                updateVisualSelection();
                handleOtherInputs(e.target);
            });
             if (input.type === 'text' || input.type === 'email' || input.type === 'tel') {
                input.addEventListener('input', (e) => updateFormData(e.target));
            }
        });
    }

    // --- Core Logic ---
    function handleNext() {
        if (!validateCurrentSlide()) {
            validationMessage.textContent = "Please make a selection to continue.";
            return;
        }
        validationMessage.textContent = "";

        if (currentSlideId === '5') {
            handleSubmit();
            return;
        }

        const nextSlideId = findNextSlideId();
        
        if (nextSlideId) {
            slideHistory.push(nextSlideId);
            goToSlide(nextSlideId);
        }
    }

    function handleBack() {
        validationMessage.textContent = "";
        slideHistory.pop();
        const prevSlideId = slideHistory[slideHistory.length - 1];
        if (prevSlideId) {
            goToSlide(prevSlideId);
        }
    }

     function handleSubmit() {
        form.style.display = 'none';
        actionsContainer.style.display = 'none';
        validationMessage.style.display = 'none';
        // You can uncomment the line below to also hide the progress bar on the final screen
        // progressBar.style.display = 'none'; 
        // For now, we will create a thank you message in JS, but you can replace this with your result screen
        const finalMessage = document.createElement('div');
        finalMessage.className = 'cf-result';
        finalMessage.innerHTML = `<div class="cf-result-title">Thank you for your request!</div><p>We will analyze your case and get back to you within a business day.</p>`;
        form.insertAdjacentElement('afterend', finalMessage);

        console.log("Final Form Data:", formData);
    }
    
    function goToSlide(slideId) {
        currentSlideId = slideId;
        slides.forEach(slide => {
            slide.classList.toggle('active', slide.dataset.slideId === currentSlideId);
        });
        updateUI();
    }
    
    // --- Helper Functions ---
    function findNextSlideId() {
        // Clear future history if we go back and make a new choice
        const currentIndexInHistory = slideHistory.indexOf(currentSlideId);
        slideHistory = slideHistory.slice(0, currentIndexInHistory + 1);

        // Check for conditional slides that haven't been visited yet
        for (const slide of slides) {
            const conditionAttr = slide.dataset.condition;
            if (conditionAttr && !slideHistory.includes(slide.dataset.slideId)) {
                const condition = JSON.parse(conditionAttr);
                const [key, value] = Object.entries(condition)[0];

                if (formData[key] && (formData[key] === value || (Array.isArray(formData[key]) && formData[key].includes(value)))) {
                    return slide.dataset.slideId;
                }
            }
        }
        
        // If no conditional slide, find the next main step
        const currentMainStep = parseInt(currentSlideId.split('.')[0]);
        let nextMainStep = currentMainStep + 1;
        while(nextMainStep <= mainSteps[mainSteps.length -1]) {
             const nextSlide = slides.find(s => s.dataset.slideId === String(nextMainStep) && !s.dataset.condition);
             if (nextSlide) return nextSlide.dataset.slideId;
             nextMainStep++;
        }
        
        return null; // No next slide found
    }

    function updateFormData(input) {
        const name = input.name;
        const type = input.type;

        if (type === 'radio') {
            formData[name] = input.value;
        } else if (type === 'checkbox') {
            formData[name] = formData[name] || [];
            if (input.checked) {
                if (!formData[name].includes(input.value)) formData[name].push(input.value);
            } else {
                formData[name] = formData[name].filter(val => val !== input.value);
            }
        } else {
            formData[name] = input.value;
        }
    }
    
    function updateVisualSelection() {
        form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            const label = input.closest('label');
            if (label) label.classList.toggle('selected', input.checked);
        });
    }

    function handleOtherInputs(input) {
        const parentLabel = input.closest('.other-input-label');
        if (!parentLabel) return;

        const textInput = parentLabel.querySelector('.other-text-input');
        if (textInput) {
            textInput.disabled = !input.checked;
            if (input.checked) textInput.focus();
        }
    }
    
    function validateCurrentSlide() {
        const currentSlide = slides.find(s => s.dataset.slideId === currentSlideId);
        const requiredGroups = new Set(
            Array.from(currentSlide.querySelectorAll('input[required]')).map(i => i.name)
        );

        for (const name of requiredGroups) {
             const inputs = form.querySelectorAll(`input[name="${name}"]`);
             const isRadioOrCheckbox = inputs[0].type === 'radio' || inputs[0].type === 'checkbox';

             if (isRadioOrCheckbox) {
                 if (!Array.from(inputs).some(i => i.checked)) return false;
             } else {
                 if(inputs[0].value.trim() === '') return false;
             }
        }
        
        const activeOtherInputs = currentSlide.querySelectorAll('.other-text-input:not(:disabled)');
        for(const textInput of activeOtherInputs) {
            if(textInput.value.trim() === '') {
                 validationMessage.textContent = `Please specify a value.`;
                 return false;
            }
        }

        return true;
    }

    // --- UI Update Functions ---
    function renderProgressBar() {
        let path = [...new Set(slideHistory.map(id => id.split('.')[0]))]; // Get unique main steps
        let currentPath = slideHistory;
        
        let html = '';
        let lastMainStep = 0;

        mainSteps.forEach((stepNum, index) => {
            const stepId = String(stepNum);
            const subSteps = currentPath.filter(p => p.startsWith(stepId + '.') && p !== stepId);
            
            const isCompleted = parseInt(currentPath[currentPath.length-1]) > stepNum;
            const isActive = parseInt(currentPath[currentPath.length-1].split('.')[0]) === stepNum;

            if (index > 0) html += `<div class="cf-step-dash"></div>`;

            html += `<div class="cf-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}" data-step-id="${stepId}"><span class="step-label">${stepId}</span></div>`;

            if(isActive && subSteps.length > 0) {
                 subSteps.forEach(subStepId => {
                     const isSubStepActive = currentPath[currentPath.length - 1] === subStepId;
                     html += `<div class="cf-step-dash"></div>`;
                     html += `<div class="cf-step sub-step ${isSubStepActive ? 'active' : 'completed'}" data-step-id="${subStepId}"><span class="step-label">${subStepId}</span></div>`;
                 });
            }
        });
        
        progressBar.innerHTML = html;
    }


    function updateUI() {
        renderProgressBar();
        backBtn.classList.toggle('d-none', slideHistory.length <= 1);
        
        const isLastStep = currentSlideId === '5';
        const nextBtnText = isLastStep ? 'Finish' : 'Next';
        nextBtn.innerHTML = `${nextBtnText}&nbsp;<span class="arrow">→</span>`;
        nextBtn.classList.toggle('finish-btn', isLastStep);
    }
    
    initialize();
});