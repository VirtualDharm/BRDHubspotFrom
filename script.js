document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('multiStepForm');
    const steps = Array.from(form.querySelectorAll('.form-step'));
    const progressBar = document.querySelector('.progress-bar');
    const progressBarSteps = Array.from(progressBar.querySelectorAll('.step'));
    let currentStep = 0;
    let maxReachedStep = 0; // New: variable to track the furthest step reached

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        // --- Updated Progress Bar Logic ---
        progressBarSteps.forEach((pStep, index) => {
            pStep.classList.remove('active', 'completed');

            // Add 'completed' class if the step has been passed or is part of the max progress
            if (index < maxReachedStep) {
                pStep.classList.add('completed');
            }
            
            // The currently displayed step is 'active'
            if (index === stepIndex) {
                pStep.classList.add('active');
            }
            
            // Also mark the furthest reached step as completed when navigating back
            if (maxReachedStep > stepIndex && index === maxReachedStep) {
                 pStep.classList.add('completed');
            }
        });
    }

    function validateStep(stepIndex) {
        let allValid = true;
        const currentStepDiv = steps[stepIndex];

        currentStepDiv.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
        
        const questions = currentStepDiv.querySelectorAll('.question-block');

        questions.forEach(question => {
            const title = question.querySelector('.step-title');
            if (title && title.textContent.startsWith('*')) {
                const inputs = question.querySelectorAll('input[type="radio"]');
                if (inputs.length > 0) {
                    const inputName = inputs[0].name;
                    if (!form.querySelector(`input[name="${inputName}"]:checked`)) {
                        allValid = false;
                        question.querySelector('.error-message').textContent = 'Please select an option.';
                    }
                }
            }
        });

        return allValid;
    }

    form.addEventListener('click', function(e) {
        if (e.target.matches('.next-btn')) {
            if (validateStep(currentStep)) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    // New: Update maxReachedStep if we are moving to a new furthest step
                    if (currentStep > maxReachedStep) {
                        maxReachedStep = currentStep;
                    }
                    showStep(currentStep);
                }
            }
        } else if (e.target.matches('.prev-btn')) {
            if (currentStep > 0) {
                const currentStepDiv = steps[currentStep];
                currentStepDiv.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
                currentStep--;
                showStep(currentStep);
            }
        }
    });
    
    progressBar.addEventListener('click', function(e) {
        if (e.target.matches('.step.completed')) {
            const stepToGo = parseInt(e.target.dataset.step) - 1;
            
            if (stepToGo <= maxReachedStep) {
                for (let i = currentStep; i > stepToGo; i--) {
                    steps[i].querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
                }
                currentStep = stepToGo;
                showStep(currentStep);
            }
        }
    });
    
    const commButtons = document.querySelectorAll('.comm-options button');
    commButtons.forEach(button => {
        button.addEventListener('click', function() {
            commButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!form.checkValidity()) {
             alert('Please fill out all required contact fields marked with an asterisk (*).');
        } else {
            alert('Form submitted successfully!');
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
        }
    });

    showStep(currentStep);
});