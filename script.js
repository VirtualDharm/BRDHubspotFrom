document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('multiStepForm');
    const steps = Array.from(form.querySelectorAll('.form-step'));
    const progressBarSteps = Array.from(document.querySelectorAll('.progress-bar .step'));
    let currentStep = 0;

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        const currentStepData = steps[stepIndex].dataset.step;

        progressBarSteps.forEach(pStep => {
            const pStepData = pStep.dataset.step;
            pStep.classList.remove('active', 'completed');
            
            if (parseFloat(pStepData) === parseFloat(currentStepData)) {
                pStep.classList.add('active');
            }
            if (parseFloat(pStepData) < parseFloat(currentStepData)) {
                pStep.classList.add('completed');
            }
        });
    }

    function validateStep(stepIndex) {
        let allValid = true;
        const currentStepDiv = steps[stepIndex];

        // Clear previous error messages within the current step
        currentStepDiv.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
        
        // Find all question blocks in the current step
        const questions = currentStepDiv.querySelectorAll('.question-block');

        questions.forEach(question => {
            const title = question.querySelector('.step-title');
            // Check only if the question is required (has an asterisk)
            if (title && title.textContent.startsWith('*')) {
                // Find the radio buttons within this question block
                const inputs = question.querySelectorAll('input[type="radio"]');
                if (inputs.length > 0) {
                    const inputName = inputs[0].name;
                    if (!form.querySelector(`input[name="${inputName}"]:checked`)) {
                        allValid = false;
                        // Display error message within this question's block
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
                    showStep(currentStep);
                }
            }
        } else if (e.target.matches('.prev-btn')) {
            if (currentStep > 0) {
                // Clear errors when going back
                const currentStepDiv = steps[currentStep];
                currentStepDiv.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
                currentStep--;
                showStep(currentStep);
            }
        }
    });
    
    // Communication preference buttons
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