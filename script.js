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

    // New: Dedicated validation function for the final step's required fields
    function validateFinalStep() {
        let isStepValid = true;
        const finalStep = document.querySelector('.form-step[data-step="6"]');
        
        // Find all required inputs in the final step
        const requiredInputs = finalStep.querySelectorAll('input[required]');

        requiredInputs.forEach(input => {
            const errorDiv = input.parentElement.querySelector('.error-message');
            // Clear previous error message
            errorDiv.textContent = ''; 

            // Check if the input is empty
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

    // Updated: Form submission logic
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Always prevent the default submission behavior

        // Validate the final step using our new function
        if (validateFinalStep()) {
            alert('Form submitted successfully!');
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            // Here you could add logic to actually send the data, reset the form, etc.
        }
        // If validation fails, the error messages are already displayed, and nothing else happens.
    });

    showStep(currentStep);
});