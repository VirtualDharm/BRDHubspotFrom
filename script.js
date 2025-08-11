document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('multiStepForm');
    const steps = Array.from(form.querySelectorAll('.form-step'));
    const progressBar = document.querySelector('.progress-bar');
    const progressBarSteps = Array.from(progressBar.querySelectorAll('.step'));
    let currentStep = 0;
    let maxReachedStep = 0;

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        progressBarSteps.forEach((pStep, index) => {
            pStep.classList.remove('active', 'completed');
            if (index < maxReachedStep) {
                pStep.classList.add('completed');
            }
            if (index === stepIndex) {
                pStep.classList.add('active');
            }
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

    function validateFinalStep() {
        let isStepValid = true;
        const finalStep = document.querySelector('.form-step[data-step="5"]');
        const requiredInputs = finalStep.querySelectorAll('input[required]');

        requiredInputs.forEach(input => {
            const errorDiv = input.parentElement.querySelector('.error-message');
            errorDiv.textContent = ''; 

            if (input.value.trim() === '') {
                errorDiv.textContent = 'This field is required.';
                isStepValid = false;
            }
        });

        return isStepValid;
    }

    form.addEventListener('click', function(e) {
        if (e.target.matches('.next-btn')) {
            if (validateStep(currentStep)) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
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

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');

        if (validateFinalStep()) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const formData = new FormData(form);
            const fullName = formData.get('full_name');
            const companyName = formData.get('company_name');
            const workEmail = formData.get('work_email');

            let messageBody = '';
            const excludedFields = ['full_name', 'company_name', 'work_email'];
            for (let [key, value] of formData.entries()) {
                if (value && !excludedFields.includes(key)) {
                    let formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    messageBody += `${formattedKey}: ${value}\n`;
                }
            }
            const commPref = document.querySelector('.comm-options button.active').textContent;
            messageBody += `Preferred Communication: ${commPref}\n`;
            
            const hubspotData = {
              fields: [
                { "name": "FirstName", "value": fullName },
                { "name": "Company", "value": companyName },
                { "name": "Email", "value": workEmail },
                { "name": "Message", "value": messageBody.trim() }
              ]
            };
            
            try {
                const response = await fetch('https://api.hsforms.com/submissions/v3/integration/submit/243234182/9a88fded-1756-4ecc-81a0-93c198503d41', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(hubspotData)
                });

                if (response.ok) {
                    // --- SUCCESS LOGIC ---
                    // Hide the form header, progress bar, and the form itself
                    document.querySelector('.form-header').style.display = 'none';
                    document.querySelector('.form-container').style.display = 'none';

                    // Show the thank you message
                    document.getElementById('thankYouMessage').style.display = 'flex';

                    // Scroll to top to ensure the message is visible
                    window.scrollTo(0, 0);

                } else {
                    const errorData = await response.json();
                    console.error('HubSpot submission failed:', errorData);
                    alert('There was an error submitting the form. Please try again.');
                }

            } catch (error) {
                console.error('Network or other error:', error);
                alert('An unexpected error occurred. Please check your connection and try again.');
            } finally {
                // Re-enable the button in case of failure
                submitBtn.disabled = false;
                submitBtn.textContent = 'Finish';
            }
        }
    });

    showStep(currentStep);
});