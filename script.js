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
        let isValid = true;
        
        // Use a switch statement to check validation for each required step
        switch(stepIndex) {
            case 0: // Step 1: Industry
                if (!form.querySelector('input[name="industry"]:checked')) {
                    isValid = false;
                }
                break;
            case 1: // Step 2: Software Version & App Use
                if (!form.querySelector('input[name="software_version"]:checked') || !form.querySelector('input[name="app_use"]:checked')) {
                    isValid = false;
                }
                break;
            case 2: // Step 3: Number of Users
                if (!form.querySelector('input[name="users"]:checked')) {
                    isValid = false;
                }
                break;
            case 3: // Step 4: Environment
                if (!form.querySelector('input[name="environment"]:checked')) {
                    isValid = false;
                }
                // Other fields in this step (tech stack, integrations) are not marked as required.
                break;
            // Step 5 (index 4) and Step 6 (index 5) don't have required radio/checkbox groups to check before navigating.
            // Step 6's validation is handled by the browser's form submission process due to the 'required' attribute on text inputs.
        }

        if (!isValid) {
            alert('Please fill out all required fields marked with an asterisk (*) before proceeding.');
        }

        return isValid;
    }

    form.addEventListener('click', function(e) {
        if (e.target.matches('.next-btn')) {
            // Add validation check before proceeding
            if (validateStep(currentStep)) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            }
        } else if (e.target.matches('.prev-btn')) {
            if (currentStep > 0) {
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
        // The browser will automatically handle the 'required' fields on the last step
        if (!form.checkValidity()) {
             e.preventDefault();
             alert('Please fill out all required contact fields marked with an asterisk (*).');
        } else {
             e.preventDefault();
            // Handle successful form submission
            alert('Form submitted successfully!');
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
        }
    });

    showStep(currentStep);
});