$(document).ready(function () {
    // alert("ready...");



    function loadBusiness() {
        console.log("Start: Load Business");

        $.ajax({
            url: "http://127.0.0.1:5000/business",
            method: "GET",
            success: function (response) {
                console.log("Received Data");
                console.log(response);
                // alert('Update html')
                // LOAD HTML TABLE FORMAT VIEW AND USE response
                // If you want to use the businesses data directly
                if (response && response.length > 0) {
                    response.forEach(function (business) {
                        // Update your HTML with the business data
                        $("#businessList").append(`
                            <div class="card mb-3" data-business-id="${business._id}" data-url="${business.url}" data-contact-number="${business.contact_number}" data-location='${business.location}' data-category="${business.category}" data-description="${business.website_description}" data-listed-by="${business.listed_by}">
                                <div class="card-body">
                                    <h5 class="card-title">${business.website_name}</h5>
                                    <p class="card-text">${business.category}</p>
                                    <small class="text-muted">${business.location.city}, ${business.location.province}, ${business.location.country}</small>
                                    
                                </div>
                                <div class="card-footer">
                                    <button class="btn btn-sm btn-outline-primary view-details" data-business-id="${business._id}">
                                        View Details
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-details" data-business-id="${business._id}">
                                        Delete Details
                                    </button>
                                    <button class="btn btn-sm btn-outline-success" data-business-id="${business._id}" onclick="editButton('${business._id}')">
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    $("#businessList").html(
                        '<div class="alert alert-info">No businesses found.</div>'
                    );
                }
                // Redirect to websites page after 3 seconds
                // setTimeout(() => {
                //     fetch('http://127.0.0.1:5000/business')
                //         .then(response => response.json())
                //         .then(data => console.log(data))
                //         .catch(error => console.error("Error:", error));
                // }, 3000);
            },
            error: function (xhr) {
                const error = xhr.responseJSON
                    ? xhr.responseJSON.error
                    : "An error occurred";
            },
        });
    }

    loadBusiness();

    // Function to handle the edit button click
    window.editButton = function (businessId) {
        console.log("Edit button clicked for business ID:", businessId);

        // Find the business card using the business ID
        const businessCard = $(`[data-business-id='${businessId}']`);
        // Log the business card to see if it's found
        console.log("Business Card:", businessCard);
        console.log("website-added-by:", businessCard.data("listed-by")); // Log the location

        // Populate the modal fields with existing data
        $("#editBusinessId").val(businessId);

        $("#editUrl").val(businessCard.data('url')); // URL
        $("#editWebsiteName").val(businessCard.find('.card-title').text());
        $("#editListedBy").val(businessCard.data('listed-by')); // Listed By
        $("#editPhone").val(businessCard.data("contact-number")); // Phone Number
        $("#editLocation").val(businessCard.find(".text-muted").text()); // Location

        $("#editCategory").val(businessCard.data("category")); // Category
        $("#editDescription").val(businessCard.data("description")); 
        console.log( $("#editDescription").val(businessCard.data("description")));

        // Show the modal
        $('#editModal').modal('show');
    };
    $("#scrapeForm").on("submit", function (e) {
        e.preventDefault();
        console.log("Start: Scrape Form");
        const url = $("#urlInput").val();
        const name = $("#nameInput").val();
        console.log("Process: Scrape Form, url:", url, " and name: ", name);
        const messageDiv = $("#message");
        console.log("Process: Scrape Form, name: ", name);
        // Show loading state
        messageDiv
            .removeClass("alert-danger alert-success")
            .addClass("alert-info")
            .text("Scraping website...")
            .show();

        $.ajax({
            url: "http://127.0.0.1:5000/business",
            method: "POST",
            data: { url: url, name: name },
            success: function (response) {
                messageDiv
                    .removeClass("alert-danger alert-info")
                    .addClass("alert-success")
                    .text(response.message)
                    .show();

                // Redirect to websites page after 3 seconds
                alert("Start: Server");
                setTimeout(() => {
                    alert("Process: Server");
                    fetch("http://127.0.0.1:5000/business")
                        .then((response) => response.json())
                        .then((data) => console.log(data))
                        .catch((error) => console.error("Error:", error));
                }, 3000);
                alert("end: Server");
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
        e.preventDefault(); // Prevent the default form submission
        console.log("Start: filtering form");
        
        const formData = $(this).serialize(); // Serialize the form data

        // Show loading state
        $("#businessList").html(
            '<div class="text-center mt-4"><div class="spinner-border text-primary"></div><p class="mt-2">Loading...</p></div>'
        );

        // Fetch filtered results
        $.get("http://127.0.0.1:5000/business?" + formData, function (response) {
            console.log("Response from server:", response); // Log the response

            // Clear the current business list
            $("#businessList").html("");

            // Check if response is an array
            if (Array.isArray(response) && response.length > 0) {
                response.forEach(business => {
                    const businessHTML = `
                        <div class="card mb-3" data-business-id="${business._id}" 
                             data-phone-number="${business.contact_number}" 
                             data-url="${business.url}" 
                             data-listed-by="${business.listed_by}" 
                             data-category="${business.category}" 
                             data-description="${business.website_description}" 
                             data-location='${JSON.stringify(business.location)}'>
                            <div class="card-body">
                                <h5 class="card-title">${business.website_name}</h5>
                                <small class="text-muted">${business.location.city}, ${business.location.province}, ${business.location.country}</small>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-sm btn-outline-primary view-details" data-business-id="${business._id}">
                                    View Details
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-details" data-business-id="${business._id}">
                                    Delete Details
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="editButton('${business._id}')">
                                    Edit Details
                                </button>
                            </div>
                        </div>
                    `;
                    $("#businessList").append(businessHTML); // Append the new business card
                });
            } else {
                $("#businessList").html('<div class="alert alert-warning">No businesses found matching the criteria.</div>');
            }
        }).fail(function () {
            $("#businessList").html(
                '<div class="alert alert-danger">Failed to load filtered results</div>'
            );
        });
    });

    // Clear filters
    $("#clearFilters").click(function () {
        console.log("Start: Clearing filter");
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
    $("#registerBusiness").click(function () {
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

    console.log("Start: Perform Click event function");
    // Attach click event handler for view-details buttons
    $(document).on("click", ".view-details", function () {
        const businessId = $(this).data("business-id"); // Get the business ID from the button
        console.log("Business ID:", businessId); // Log the business ID for debugging
        viewDeatils(businessId); // Pass the businessId to the viewDeatils function
    });

    // View details handler
    function viewDeatils(businessId) {
        console.log("Start: viewDeatils function");
        const detailsDiv = $("#businessDetails");

        detailsDiv.html(
            '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading...</div></div>'
        );
        console.log("process: viewDeatils function");
        console.log("Business_id: ", businessId);
        // Update the URL to match the Flask route for business details
        $.get(
            `http://127.0.0.1:5000/business/details/${businessId}`,
            function (response) {
                console.log("Response:", response); // Log the response for debugging
                if (typeof response === "string") {
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
                                <a href="${response.url}" target="_blank">${response.url
                        }</a>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Website Added By:</strong></div>
                            <div class="col-md-9">${response.listed_by}</div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Category:</strong></div>
                            <div class="col-md-9">
                                <span class="badge bg-primary">${response.category
                        }</span>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Contact:</strong></div>
                            <div class="col-md-9">${response.contact_number || "Not available"
                        }</div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Location:</strong></div>
                            <div class="col-md-9">${response.location.city}, ${response.location.province
                        }, ${response.location.country}</div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-3"><strong>Description:</strong></div>
                            <div class="col-md-9">${response.website_description ||
                        "No description available"
                        }</div>
                        </div>
                    </div>
                `);
                    $("#detailsModal").modal("show"); // Show the modal
                } else {
                    detailsDiv.html(`
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        Business details not found.
                    </div>
                `);
                }
            }
        ).fail(function (xhr) {
            console.error("Error fetching business details:", xhr); // Log the error for debugging
            detailsDiv.html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    Failed to load business details. Please try again later.
                </div>
            `);
        });
    }

    // Delete Business - Button
    $(document).on("click", ".delete-details", function () {
        const businessId = $(this).data("business-id"); // Get the business ID from the button
        console.log("Business ID:", businessId); // Log the business ID for debugging
        deleteDetails(businessId); // Pass the businessId to the viewDeatils function
    });

    function deleteDetails(businessId) {
        console.log(`Start: deleting details of ${businessId}`);

        $("#businessDetails").html(
            '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading...</div></div>'
        );
        console.log(`Process: deleting details of ${businessId}`);

        // Show confirmation dialog
        if (confirm("Are you sure you want to delete this business?")) {
            $.ajax({
                url: `http://127.0.0.1:5000/business/delete/${businessId}`,
                method: "DELETE", // Use DELETE method for deletion
                success: function (response) {
                    console.log("Response:", response);
                    // Handle successful deletion
                    alert("Business deleted successfully!");
                    $("#businessList").html("");
                    loadBusiness();
                },
                error: function (xhr) {
                    console.error("Error deleting business:", xhr);
                    alert("Failed to delete business. Please try again later.");
                },
            });
        } else {
            console.log("Delete cancelled by user.");
            alert("Deletion cancelled!");
        }
    }

    $(document).on("submit", "#editForm", function (e) {
        e.preventDefault(); // Prevent the default form submission

        const businessId = $("#editBusinessId").val();
        const url = $("#editUrl").val();
        const listedBy = $("#editListedBy").val();
        const phoneNumber = $("#editPhone").val();
        // Create location object
        const location = {
            city: $("#editLocation").val().split(", ")[0], // Assuming the format is "City, Province"
            province: $("#editLocation").val().split(", ")[1], // Extract province
            country: "Canada" // Adjust as necessary
        };
        const category = $("#editCategory").val();
        const description = $("#editDescription").val();

        // Prepare the data to be sent
        const data = {
            url: url,
            listed_by: listedBy,
            phone_number: phoneNumber,
            location: location,
            category: category,
            description: description
        };

        // Send the AJAX request to update the business
        $.ajax({
            url: `http://127.0.0.1:5000/business/edit/${businessId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                alert(response.success); // Show success message
                $("#businessList").empty();
                $('#editModal').modal('hide'); // Hide the modal
                loadBusiness(); // Reload the business list to reflect changes
            },
            error: function (xhr) {
                const error = xhr.responseJSON ? xhr.responseJSON.error : "An error occurred";
                alert(error); // Show error message
            }
        });
    });

    function loadLocationFilters() {
        $.get("http://127.0.0.1:5000/business", function (response) {
            const cities = new Set();
            const provinces = new Set();
            const countries = new Set();

            // for(response = business; response < 0; response++){

            // }
            response.forEach(business => {
                cities.add(business.location.city);
                provinces.add(business.location.province);
                countries.add(business.location.country);
            });

            // Populate dropdowns
            populateDropdown("#cityFilter", Array.from(cities));
            populateDropdown("#provinceFilter", Array.from(provinces));
            populateDropdown("#countryFilter", Array.from(countries));
        });
    }

    function populateDropdown(selector, options) {
        const dropdown = $(selector);
        dropdown.empty(); // Clear existing options
        dropdown.append('<option value="">Select</option>'); // Default option
        options.forEach(option => {
            dropdown.append(`<option value="${option}">${option}</option>`);
        });
    }

    loadLocationFilters();
});
