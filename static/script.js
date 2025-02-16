$(document).ready(function () {
    alert("ready...");

    function loadBusiness() {
        console.log("Start: Load Business");

        $.ajax({
            url: "http://127.0.0.1:5000/business",
            method: "GET",
            success: function (response) {
                console.log("Received Data");
                console.log(response);
                alert('Update html')
                // LOAD HTML TABLE FORMAT VIEW AND USE response
                // If you want to use the businesses data directly
                if (response && response.length > 0) {
                    response.forEach(function (business) {
                        // Update your HTML with the business data
                        $("#businessList").append(`
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">${business.website_name}</h5>
                                    <p class="card-text">${business.category}</p>
                                    <small class="text-muted">${business.location.city}, ${business.location.province}, ${business.location.country}</small>
                                    
                                </div>
                                <div class="card-footer">
                                    <button class="btn btn-sm btn-outline-primary view-details" data-business-id="${business._id}">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    $("#businessList").html('<div class="alert alert-info">No businesses found.</div>');
                }
            },
            error: function (xhr) {
                const error = xhr.responseJSON
                    ? xhr.responseJSON.error
                    : "An error occurred";
            },
        });
    }

    loadBusiness();

    $("#scrapeForm").on("submit", function (e) {
        e.preventDefault();
        console.log('Start: Scrape Form');
        const url = $("#urlInput").val();
        const name = $("#nameInput").val();
        console.log('Process: Scrape Form, url:',url,' and name: ', name);
        const messageDiv = $("#message");
        console.log("Process: Scrape Form, name: ", name);
        // Show loading state
        messageDiv
            .removeClass("alert-danger alert-success")
            .addClass("alert-info")
            .text("Scraping website...")
            .show();

        $.ajax({
            url: "/business",
            method: "POST",
            data: { url: url, name: name },
            success: function (response) {
                messageDiv
                    .removeClass("alert-danger alert-info")
                    .addClass("alert-success")
                    .text(response.message)
                    .show();

                // Redirect to websites page after 2 seconds
                setTimeout(() => (window.location.href = "/business"), 2000);
            },
            error: function (xhr) {
                const error = xhr.responseJSON
                    ? xhr.responseJSON.error
                    : "An error occurred";
                messageDiv
                    .removeClass("alert-success alert-info")
                    .addClass("alert-danger")
                    .text(error)
                    .show();
            },
        });
    });

    // Filter form handler
    $("#filterForm").on("submit", function (e) {
        e.preventDefault();

        const formData = $(this).serialize();

        // Show loading state
        $("#businessList").html(
            '<div class="text-center mt-4"><div class="spinner-border text-primary"></div><p class="mt-2">Loading...</p></div>'
        );

        // Fetch filtered results
        $.get("/business?" + formData, function (response) {
            // Parse the HTML response and extract the business list
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = response;
            const newBusinessList = tempDiv.querySelector("#businessList").innerHTML;
            $("#businessList").html(newBusinessList);
        }).fail(function () {
            $("#businessList").html(
                '<div class="alert alert-danger">Failed to load filtered results</div>'
            );
        });
    });

    // Clear filters
    $("#clearFilters").click(function () {
        $("#categoryFilter").val("");
        $("#cityFilter").val("");
        $("#provinceFilter").val("");
        $("#countryFilter").val("");
        $("#filterForm").submit();
    });

    // Handle category change directly
    $("#categoryFilter").on("change", function () {
        $("#filterForm").submit();
    });

    // Optional: Highlight active filters
    function highlightActiveFilters() {
        console.log("Start: Highlight Active Filter");
        const urlParams = new URLSearchParams(window.location.search);

        // Highlight category if selected
        const category = urlParams.get("category");
        if (category) {
            $("#categoryFilter").val(category);
        }

        // Highlight location filters if set
        const city = urlParams.get("city");
        if (city) {
            $("#cityFilter").val(city);
        }

        const province = urlParams.get("province");
        if (province) {
            $("#provinceFilter").val(province);
        }

        const country = urlParams.get("country");
        if (country) {
            $("#countryFilter").val(country);
        }
    }

    // Call highlight function when page loads
    highlightActiveFilters();

    // Register business handler
    $("#registerButton").click(function () {
        const url = $("#businessUrl").val();
        const listed_by = $("#listed_by").val();
        const statusDiv = $("#registerStatus");

        statusDiv
            .removeClass("alert-danger alert-success")
            .addClass("alert-info")
            .text("Registering business...")
            .show();

        $.ajax({
            url: "http://127.0.0.1:5000/business",
            method: "POST",
            data: { url: url, listed_by: listed_by },
            success: function (response) {
                statusDiv
                    .removeClass("alert-info alert-danger")
                    .addClass("alert-success")
                    .text(response.message);

                // Reload page after 2 seconds
                setTimeout(() => location.reload(), 2000);
            },
            error: function (xhr) {
                const error = xhr.responseJSON
                    ? xhr.responseJSON.error
                    : "An error occurred";
                statusDiv
                    .removeClass("alert-info alert-success")
                    .addClass("alert-danger")
                    .text(error);
            },
        });
    });
    
    console.log('Start: Perform Click event function');
    // Attach click event handler for view-details buttons
    $(document).on("click", ".view-details", function() {
        const businessId = $(this).data("business-id"); // Get the business ID from the button
        console.log("Business ID:", businessId); // Log the business ID for debugging
        viewDeatils(businessId); // Pass the businessId to the viewDeatils function
    });
    
    // View details handler
    function viewDeatils(businessId) {
        console.log('Start: viewDeatils function');
        const detailsDiv = $("#businessDetails");

        detailsDiv.html(
            '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading...</div></div>'
        );
        console.log('process: viewDeatils function');
        // Update the URL to match the Flask route for business details
        $.get(`http://127.0.0.1:5000/business/details/${businessId}`, function (response) {
            
            console.log("Response:", response); // Log the response for debugging
            if (typeof response === 'string') {
                response = JSON.parse(response); // Ensure it's an object
            }
            if (response) {
                // Parse the response if it's a string
                // const business = typeof response === 'string' ? JSON.parse(response) : response;
                console.log("Response keys:", Object.keys(response));
                console.log("Full Response:", response);

                detailsDiv.html(`
                    <div class="container">
                        <div class="row mb-3">
                            <div class="col">
                                <h4>${response.website_name}</h4>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Website:</strong></div>
                            <div class="col-md-9">
                                <a href="${response.url}" target="_blank">${response.url}</a>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Website Added By:</strong></div>
                            <div class="col-md-9">${response.listed_by}</div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Category:</strong></div>
                            <div class="col-md-9">
                                <span class="badge bg-primary">${response.category}</span>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Contact:</strong></div>
                            <div class="col-md-9">${response.contact_number || "Not available"}</div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Location:</strong></div>
                            <div class="col-md-9">${response.location.city}, ${response.location.province}, ${response.location.country}</div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Description:</strong></div>
                            <div class="col-md-9">${response.website_description || "No description available"}</div>
                        </div>
                    </div>
                `);
                $('#detailsModal').modal('show'); // Show the modal
            } else {
                detailsDiv.html(`
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        Business details not found.
                    </div>
                `);
            }
        }).fail(function (xhr) {
            console.error("Error fetching business details:", xhr); // Log the error for debugging
            detailsDiv.html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    Failed to load business details. Please try again later.
                </div>
            `);
        });
    }
    
});
/* 
{% if businesses %}
                {% for business in businesses %}
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-4">
                                <h5 class="card-title mb-0">{{ business.website_name }}</h5>
                            </div>
                            <div class="col-md-3">
                                <span class="badge bg-primary">{{ business.category }}</span>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted">
                                    <!-- {{ business.location.city }}, {{ business.location.province }}, {{ business.location.country }} -->
                                    {{ business.location.city if business.location and 'city' in business.location else 'Unknown City' }},
                                    {{ business.location.province if business.location and 'province' in business.location else 'Unknown Province' }},
                                    {{ business.location.country if business.location and 'country' in business.location else 'Unknown Country' }}
                                </small>
                            </div>
                            <div class="col-md-2 text-end">
                                <a href="/business/details/{{ business._id }}" class="btn btn-sm btn-outline-primary">
                                    View Details
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                {% endfor %}
            {% else %}
                <div class="alert alert-info">No businesses found matching your criteria.</div>
            {% endif %}
*/