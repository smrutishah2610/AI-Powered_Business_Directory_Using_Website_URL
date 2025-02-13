$(document).ready(function() {
    $('#scrapeForm').on('submit', function(e) {
        e.preventDefault();
        
        const url = $('#urlInput').val();
        const name = $('#nameInput').val();
        const messageDiv = $('#message');
        console.log('Listed By Script.js Line 8:',name);
        // Show loading state
        messageDiv.removeClass('alert-danger alert-success')
            .addClass('alert-info')
            .text('Scraping website...')
            .show();
        
        $.ajax({
            url: '/scrape',
            method: 'POST',
            data: { url: url, name: name },
            success: function(response) {
                messageDiv.removeClass('alert-danger alert-info')
                    .addClass('alert-success')
                    .text(response.message)
                    .show();
                    
                // Redirect to websites page after 2 seconds
                setTimeout(() => window.location.href = '/websites', 2000);
            },
            error: function(xhr) {
                const error = xhr.responseJSON ? xhr.responseJSON.error : 'An error occurred';
                messageDiv.removeClass('alert-success alert-info')
                    .addClass('alert-danger')
                    .text(error)
                    .show();
            }
        });
    });

    // Filter form handler
    $('#filterForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = $(this).serialize();
        
        // Show loading state
        $('#businessList').html('<div class="text-center mt-4"><div class="spinner-border text-primary"></div><p class="mt-2">Loading...</p></div>');
        
        // Fetch filtered results
        $.get('/websites?' + formData, function(response) {
            // Parse the HTML response and extract the business list
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = response;
            const newBusinessList = tempDiv.querySelector('#businessList').innerHTML;
            $('#businessList').html(newBusinessList);
        }).fail(function() {
            $('#businessList').html('<div class="alert alert-danger">Failed to load filtered results</div>');
        });
    });

    // Clear filters
    $('#clearFilters').click(function() {
        $('#categoryFilter').val('');
        $('#cityFilter').val('');
        $('#provinceFilter').val('');
        $('#countryFilter').val('');
        $('#filterForm').submit();
    });

    // Handle category change directly
    $('#categoryFilter').on('change', function() {
        $('#filterForm').submit();
    });

    // Optional: Highlight active filters
    function highlightActiveFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Highlight category if selected
        const category = urlParams.get('category');
        if (category) {
            $('#categoryFilter').val(category);
        }
        
        // Highlight location filters if set
        const city = urlParams.get('city');
        if (city) {
            $('#cityFilter').val(city);
        }
        
        const province = urlParams.get('province');
        if (province) {
            $('#provinceFilter').val(province);
        }
        
        const country = urlParams.get('country');
        if (country) {
            $('#countryFilter').val(country);
        }
    }

    // Call highlight function when page loads
    highlightActiveFilters();

    // Register business handler
    $('#registerButton').click(function() {
        const url = $('#businessUrl').val();
        const listed_by = $('#listed_by').val();
        const statusDiv = $('#registerStatus');
        
        statusDiv.removeClass('alert-danger alert-success')
            .addClass('alert-info')
            .text('Registering business...')
            .show();
        
        $.ajax({
            url: '/scrape',
            method: 'POST',
            data: { url: url, listed_by: listed_by },
            success: function(response) {
                statusDiv.removeClass('alert-info alert-danger')
                    .addClass('alert-success')
                    .text(response.message);
                    
                // Reload page after 2 seconds
                setTimeout(() => location.reload(), 2000);
            },
            error: function(xhr) {
                const error = xhr.responseJSON ? xhr.responseJSON.error : 'An error occurred';
                statusDiv.removeClass('alert-info alert-success')
                    .addClass('alert-danger')
                    .text(error);
            }
        });
    });

    // View details handler
    $('.view-details').click(function() {
        const businessId = $(this).data('business-id');
        const detailsDiv = $('#businessDetails');
        
        detailsDiv.html('<div class="text-center"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading...</div></div>');
        
        $.get(`/business/${businessId}`, function(response) {
            // Parse the response if it's a string
            const business = typeof response === 'string' ? JSON.parse(response) : response;
            
            detailsDiv.html(`
                <div class="container">
                    <div class="row mb-3">
                        <div class="col">
                            <h4>${business.website_name}</h4>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-3"><strong>Website:</strong></div>
                        <div class="col-md-9">
                            <a href="${business.url}" target="_blank">${business.url}</a>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3"><strong>Website Added By:</strong></div>
                        <div class="col-md-9">
                            ${business.listed_by}
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3"><strong>Category:</strong></div>
                        <div class="col-md-9">
                            <span class="badge bg-primary">${business.category}</span>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3"><strong>Contact:</strong></div>
                        <div class="col-md-9">${business.contact_number || 'Not available'}</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3"><strong>Location:</strong></div>
                        <div class="col-md-9">
                            ${business.location.city}, ${business.location.province}, ${business.location.country}
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3"><strong>Description:</strong></div>
                        <div class="col-md-9">${business.website_description || 'No description available'}</div>
                    </div>
                </div>
            `);
        }).fail(function(xhr) {
            detailsDiv.html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    Failed to load business details. Please try again later.
                </div>
            `);
        });
    });
}); 