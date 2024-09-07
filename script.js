let costChart;

document.addEventListener('DOMContentLoaded', function () {
    const elements = {
        incomeInput: document.getElementById('income'),
        savingsInput: document.getElementById('savings'),
        yearsInput: document.getElementById('years'),
        homePriceSlider: document.getElementById('home-price-slider'),
        homePriceInput: document.getElementById('home-price-input'),
        downPaymentSlider: document.getElementById('down-payment-slider'),
        downPaymentInput: document.getElementById('down-payment-input'),
        interestRateSlider: document.getElementById('interest-rate-slider'),
        interestRateInput: document.getElementById('interest-rate-input'),
        propertyTaxSlider: document.getElementById('property-tax-slider'),
        propertyTaxInput: document.getElementById('property-tax-input'),
        insuranceRateSlider: document.getElementById('insurance-rate-slider'),
        insuranceRateInput: document.getElementById('insurance-rate-input'),
        maintenanceRateSlider: document.getElementById('maintenance-rate-slider'),
        maintenanceRateInput: document.getElementById('maintenance-rate-input'),
        appreciationRateSlider: document.getElementById('appreciation-rate-slider'),
        appreciationRateInput: document.getElementById('appreciation-rate-input'),
        monthlyRentSlider: document.getElementById('monthly-rent-slider'),
        monthlyRentInput: document.getElementById('monthly-rent-input')
    };

    // Add event listeners to all inputs and sliders
    Object.values(elements).forEach(element => {
        if (element) {
            element.addEventListener('input', updateCalculations);
        } else {
            console.warn('Element not found:', element);
        }
    });

    // Sync all inputs with their corresponding sliders
    syncInputSlider(elements.homePriceInput, elements.homePriceSlider);
    syncInputSlider(elements.downPaymentInput, elements.downPaymentSlider);
    syncInputSlider(elements.interestRateInput, elements.interestRateSlider);
    syncInputSlider(elements.propertyTaxInput, elements.propertyTaxSlider);
    syncInputSlider(elements.insuranceRateInput, elements.insuranceRateSlider);
    syncInputSlider(elements.maintenanceRateInput, elements.maintenanceRateSlider);
    syncInputSlider(elements.appreciationRateInput, elements.appreciationRateSlider);
    syncInputSlider(elements.monthlyRentInput, elements.monthlyRentSlider);

    // Initial calculation
    updateCalculations();

    // Check for required elements
    checkRequiredElements();

    function updateCalculations() {
        try {
            const values = {
                income: parseFloat(elements.incomeInput?.value || 0),
                savings: parseFloat(elements.savingsInput?.value || 0),
                years: parseInt(elements.yearsInput?.value || 0),
                homePrice: parseFloat(elements.homePriceSlider?.value || 0),
                downPaymentPercent: parseFloat(elements.downPaymentSlider?.value || 0),
                interestRate: parseFloat(elements.interestRateSlider?.value || 0),
                propertyTaxRate: parseFloat(elements.propertyTaxSlider?.value || 0) / 100,
                insuranceRate: parseFloat(elements.insuranceRateSlider?.value || 0) / 100,
                maintenanceRate: parseFloat(elements.maintenanceRateSlider?.value || 0) / 100,
                appreciationRate: parseFloat(elements.appreciationRateSlider?.value || 0) / 100,
                monthlyRent: parseFloat(elements.monthlyRentSlider?.value || 0)
            };

            // Sync slider and input values
            updateElementValue(elements.homePriceInput, values.homePrice);
            updateElementValue(elements.downPaymentInput, values.downPaymentPercent);
            updateElementValue(elements.interestRateInput, values.interestRate);
            updateElementValue(elements.propertyTaxInput, values.propertyTaxRate * 100);
            updateElementValue(elements.insuranceRateInput, values.insuranceRate * 100);
            updateElementValue(elements.maintenanceRateInput, values.maintenanceRate * 100);
            updateElementValue(elements.appreciationRateInput, values.appreciationRate * 100);
            updateElementValue(elements.monthlyRentInput, values.monthlyRent);

            // Update displayed values
            updateTextContent('home-price-display', values.homePrice.toLocaleString());
            updateTextContent('down-payment-percent', values.downPaymentPercent);
            updateTextContent('interest-rate-display', values.interestRate.toFixed(1));
            updateTextContent('property-tax-display', (values.propertyTaxRate * 100).toFixed(1));
            updateTextContent('insurance-rate-display', (values.insuranceRate * 100).toFixed(1));
            updateTextContent('maintenance-rate-display', (values.maintenanceRate * 100).toFixed(1));
            updateTextContent('appreciation-rate-display', (values.appreciationRate * 100).toFixed(1));
            updateTextContent('years-display', values.years);
            updateTextContent('years-display2', values.years);
            updateTextContent('monthly-rent-display', values.monthlyRent.toFixed(2));

            // Calculate costs
            const totalRentCost = values.monthlyRent * 12 * values.years;
            const downPayment = values.homePrice * (values.downPaymentPercent / 100);
            const loanAmount = values.homePrice - downPayment;
            const monthlyInterestRate = values.interestRate / 100 / 12;
            const numberOfPayments = values.years * 12;

            const monthlyMortgage = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
            const totalBuyCost = (monthlyMortgage * numberOfPayments) + downPayment;

            // Update displayed costs
            updateTextContent('monthly-rent', values.monthlyRent.toFixed(2));
            updateTextContent('total-rent-cost', totalRentCost.toLocaleString(undefined, { maximumFractionDigits: 0 }));
            updateTextContent('home-price', values.homePrice.toLocaleString());
            updateTextContent('down-payment', downPayment.toLocaleString(undefined, { maximumFractionDigits: 0 }));
            updateTextContent('monthly-mortgage', monthlyMortgage.toFixed(2));
            updateTextContent('total-buy-cost', totalBuyCost.toLocaleString(undefined, { maximumFractionDigits: 0 }));

            // Update the recommendation
            const recommendation = document.getElementById('recommendation');
            if (recommendation) {
                const icon = recommendation.querySelector('.recommendation-icon');
                const content = recommendation.querySelector('.recommendation-content');
                if (totalRentCost < totalBuyCost) {
                    icon.innerHTML = '🏠';
                    content.textContent = "Renting might be more economical for you!";
                    recommendation.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
                } else {
                    icon.innerHTML = '🏡';
                    content.textContent = "Buying might be more economical for you!";
                    recommendation.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                }
            }

            const annualInsurance = values.homePrice * values.insuranceRate;
            const annualMaintenance = values.homePrice * values.maintenanceRate;

            let rentCosts = [];
            let buyCosts = [];
            let homeValues = [];

            for (let year = 1; year <= values.years; year++) {
                const yearlyRent = values.monthlyRent * 12;
                rentCosts.push(yearlyRent * year);

                const yearlyMortgage = monthlyMortgage * 12;
                const yearlyPropertyTax = values.homePrice * values.propertyTaxRate;
                const yearlyTotalCost = yearlyMortgage + yearlyPropertyTax + annualInsurance + annualMaintenance;
                buyCosts.push(downPayment + yearlyTotalCost * year);

                homeValues.push(values.homePrice * Math.pow(1 + values.appreciationRate, year));
            }

            updateVisualization(rentCosts, buyCosts, homeValues, values.years);
        } catch (error) {
            console.error("Error in updateCalculations:", error);
        }
    }

    function updateVisualization(rentCosts, buyCosts, homeValues, years) {
        const ctx = document.getElementById('costChart');
        if (!ctx) {
            console.error("Canvas element 'costChart' not found");
            return;
        }

        if (costChart) {
            costChart.destroy();
        }

        try {
            costChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({ length: years }, (_, i) => i + 1),
                    datasets: [
                        {
                            label: 'Rent Cost',
                            data: rentCosts,
                            borderColor: '#f39c12',
                            backgroundColor: 'rgba(243, 156, 18, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Buy Cost',
                            data: buyCosts,
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Home Value',
                            data: homeValues,
                            borderColor: '#2ecc71',
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Years'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Cost ($)'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        title: {
                            display: true,
                            text: 'Cost Comparison Over Time',
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            position: 'bottom'
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        } catch (error) {
            console.error("Error creating chart:", error);
        }
    }
});

function syncInputSlider(input, slider) {
    if (input && slider) {
        input.addEventListener('input', () => {
            slider.value = input.value;
            updateCalculations();
        });
        slider.addEventListener('input', () => {
            input.value = slider.value;
            updateCalculations();
        });
    } else {
        console.warn('Input or slider not found:', input, slider);
    }
}

function checkRequiredElements() {
    const requiredIds = ['recommendation', 'costChart', 'monthly-rent', 'total-rent-cost', 'home-price', 'down-payment', 'monthly-mortgage', 'total-buy-cost'];
    requiredIds.forEach(id => {
        if (!document.getElementById(id)) {
            console.warn(`Required element with id '${id}' not found`);
        }
    });
}

function updateElementValue(element, value) {
    if (element) {
        element.value = value;
    }
}

function updateTextContent(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}