function showLoading() {
    document.getElementById("result").innerHTML = "Loading...";
}

function showError(message) {
    document.getElementById("result").innerHTML = `
        <div style="color: #d32f2f; padding: 10px; background-color: #ffebee; border-left: 4px solid #d32f2f;">
            Error: ${message}
        </div>`;
}

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

function getPrice() {
    const location = document.getElementById("location").value;
    const crop = document.getElementById("crop").value;

    showLoading();

    fetch(`/api/prices?location=${encodeURIComponent(location)}&crop=${encodeURIComponent(crop)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data => {
            document.getElementById("result").innerHTML = `
                <h3>${data.crop} Prices in ${data.location}</h3>
                <p>Min Price: <span class="price-highlight">${formatCurrency(data.minPrice)}</span></p>
                <p>Max Price: <span class="price-highlight">${formatCurrency(data.maxPrice)}</span></p>
                <p><small>Last updated: ${data.time}</small></p>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Failed to fetch price data. Please try again.');
        });
}

// Initial load
getPrice();

// Auto refresh every 10 seconds
setInterval(getPrice, 10000);
