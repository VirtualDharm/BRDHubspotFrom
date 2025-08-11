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
            
            if (pStepData === currentStepData) {
                pStep.classList.add('active');
            }
            if (parseFloat(pStepData) < parseFloat(currentStepData)) {
                pStep.classList.add('completed');
            }
        });
    }

    form.addEventListener('click', function(e) {
        if (e.target.matches('.next-btn')) {
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
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
        e.preventDefault();
        // Handle form submission
        alert('Form submitted successfully!');
        // You can use FormData to collect all form data
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
    });

    showStep(currentStep);
});