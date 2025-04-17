document.addEventListener("DOMContentLoaded", function () {
  // Get the button elements
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  const dragBtn = document.getElementById("dragBtn");
  const dragBtnGroup = document.getElementById("dragBtnGroup");
  const topBtnGroup = document.getElementById("topBtnGroup");
  const ResultSection = document.getElementById("resultWrapper");

  // Hide the drag button group by default
  dragBtnGroup.style.display = "none";

  // Show the scroll to top button when scrolling down
  window.onscroll = function () {
    if (
      document.body.scrollTop > 100 ||
      document.documentElement.scrollTop > 100
    ) {
      scrollToTopBtn.style.display = "block"; // Show the scroll to top button
    } else {
      scrollToTopBtn.style.display = "none"; // Hide the scroll to top button
    }
  };

  // Smooth scroll to the top
  scrollToTopBtn.onclick = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Toggle the visibility of the drag button group when clicking the drag button
  dragBtn.onclick = function () {
    const isVisible = dragBtnGroup.style.display === "flex";
    dragBtnGroup.style.display = isVisible ? "none" : "flex"; // Toggle drag button group
  };

  // Observer to detect if the top button group is in view
  let observer = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting) {
        dragBtn.style.display = "none"; // Hide the drag button when the top button group is in view
        dragBtnGroup.style.display = "none"; // Hide the drag button group if top button group is in view
      } else {
        dragBtn.style.display = "block"; // Show the drag button when top button group is out of view
      }
    },
    { threshold: 0 }
  );

  // MutationObserver to detect visibility changes of #resultWrapper
  const mutationObserver = new MutationObserver(function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "style"
      ) {
        // Check if resultWrapper is visible
        if (resultWrapper.style.display !== "none") {
          observer.observe(topBtnGroup); // Start observing the topBtnGroup when visible
        } else {
          observer.unobserve(topBtnGroup); // Stop observing when hidden
        }
      }
    });
  });

  // Observe changes to #resultWrapper's style attribute
  mutationObserver.observe(resultWrapper, {
    attributes: true,
    attributeFilter: ["style"], // Only observe style changes
  });

  // Layout toggle buttons
  $("#columnViewBtn").on("click", function () {
    $("#videoContainer").removeClass("grid-layout").addClass("column-layout");
    // Remove the max-width of #resultWrapper
    $("#resultWrapper").css("max-width", "28rem");
  });

  $("#gridViewBtn").on("click", function () {
    $("#videoContainer").removeClass("column-layout").addClass("grid-layout");

    // Remove the max-width of #resultWrapper
    $("#resultWrapper").css("max-width", "none");
  });

  // Default to column layout
  $("#videoContainer").addClass("column-layout");

  // Detect Fullscreen Mode and Adjust Styles
  $("#videoContainer").on(
    "fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange",
    function () {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        // When entering fullscreen
        $("#videoContainer video").css("object-fit", "contain"); // Remove zoom-in by using 'contain'
      } else {
        // When exiting fullscreen
        $("#videoContainer.video").css("object-fit", "cover"); // Restore grid view style
      }
    }
  );

  var videoContainer = document.getElementById("videoContainer");

  // sortable
  var sortable;

  // Initialize Sortable
  function initializeSortable() {
    sortable = Sortable.create(videoContainer, {
      animation: 150,
      handle: ".form_wrapper",
      ghostClass: "sortable-ghost",
      filter: ".copy-btn, .url-textarea, .close-btn",
      preventOnFilter: true,
      onEnd: function (evt) {
        console.log("Reordered");
      },
    });
  }

  // Destroy Sortable
  function destroySortable() {
    if (sortable) {
      sortable.destroy();
      console.log("Sortable destroyed");
    }
  }

  // Event listeners for the radio buttons in the top button group
  document.getElementById("btnradio1").addEventListener("change", function () {
    if (this.checked) {
      initializeSortable(); // Enable Sortable for top group
      document.getElementById("dragBtnradio1").checked = true; // Sync bottom group
    }
  });

  document.getElementById("btnradio2").addEventListener("change", function () {
    if (this.checked) {
      destroySortable(); // Disable Sortable for top group
      document.getElementById("dragBtnradio2").checked = true; // Sync bottom group
    }
  });

  // Event listeners for the radio buttons in the bottom button group
  document
    .getElementById("dragBtnradio1")
    .addEventListener("change", function () {
      if (this.checked) {
        initializeSortable(); // Enable Sortable for bottom group
        document.getElementById("btnradio1").checked = true; // Sync bottom group
      }
    });

  document
    .getElementById("dragBtnradio2")
    .addEventListener("change", function () {
      if (this.checked) {
        destroySortable(); // Disable Sortable for bottom group
        document.getElementById("btnradio2").checked = true; // Sync bottom group
      }
    });

  // Disable the Sortable by default (if enabled by the second radio button)
  if (document.getElementById("dragBtnradio2").checked) {
    destroySortable();
  }

  var hasShownPopup = false; // Initialize the flag
  var progressInterval = null; // Variable to hold the interval timer

  // Full-size image modal functionality
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("fullSizeImage");
  const modalImgContainer = document.querySelector(".modal-image-container");
  const span = document.getElementsByClassName("close")[0];
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  let currentScale = 1;
  const zoomIntensity = 0.1;
  const maxScale = 5;
  let dynamicMinScale = 0.1; // Initial small default min scale

  // Function to reset image transformations
  function resetImageTransform() {
      currentScale = 1;
      dynamicMinScale = 0.1; // Reset min scale too
      modalImg.style.transform = 'scale(1)';
      modalImg.style.transformOrigin = 'center center';
      $(modalImg).removeClass('zooming');
  }

  // When an image is clicked, open the modal
  $(document).on("click", "#videoContainer img", function () { 
    resetImageTransform(); // Reset zoom/pan when opening
    modal.style.display = "block";
    modalImg.src = this.src;
    
    // Calculate dynamic min scale once the image is loaded
    modalImg.onload = () => {
      const containerWidth = modalImgContainer.clientWidth;
      const containerHeight = modalImgContainer.clientHeight;
      const imgWidth = modalImg.naturalWidth;
      const imgHeight = modalImg.naturalHeight;

      if (imgWidth > 0 && imgHeight > 0 && containerWidth > 0 && containerHeight > 0) {
         // Calculate the scale factor applied by object-fit: contain
         dynamicMinScale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
         // Ensure min scale is not excessively large if image is tiny, or too small
         dynamicMinScale = Math.max(0.1, Math.min(1, dynamicMinScale)); 
         console.log("Dynamic min scale set to:", dynamicMinScale);
      } else {
          dynamicMinScale = 0.1; // Fallback
      }
      // Reset current scale to ensure it's not below the new min scale initially
      // Check if currentScale needs adjustment only if it was potentially set before onload
      if (currentScale < dynamicMinScale) {
          currentScale = dynamicMinScale;
          modalImg.style.transform = `scale(${currentScale})`; // Apply immediately if needed
      }

      modalImg.onload = null; // Remove listener after execution
    };
    // Handle cases where image might already be cached and onload doesn't fire reliably
     if (modalImg.complete && modalImg.naturalWidth > 0) {
        modalImg.onload();
     }
  });

  // When the close button is clicked, hide the modal
  span.onclick = function () {
    modal.style.display = "none";
    resetImageTransform(); // Reset on close
  };

  // Close the modal if clicked outside the image or buttons / Exit Fullscreen
  $(modal).on("click", function (e) {
    // Check if the click target is NOT the image AND NOT the fullscreen button
    if (e.target !== modalImg && e.target !== fullscreenBtn && !fullscreenBtn.contains(e.target)) { 
        if (document.fullscreenElement === modalImgContainer) {
            // If in fullscreen, clicking background exits fullscreen
            document.exitFullscreen();
        } else {
            // If not in fullscreen, clicking background closes modal
            modal.style.display = "none";
            resetImageTransform(); // Reset on close
        }
    }
  });

  // Fullscreen button logic
  fullscreenBtn.onclick = function() {
      if (!document.fullscreenElement) {
          modalImgContainer.requestFullscreen().catch(err => {
              alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
      } else {
          if (document.exitFullscreen) {
              document.exitFullscreen();
          }
      }
  }
  
  // Update fullscreen button icon based on state
  document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement === modalImgContainer) {
          fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>'; // Change to compress icon
      } else {
          fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>'; // Change back to expand icon
      }
  });

  // --- Move Wheel Listener to Modal --- 
  // Zooming logic - attached to the modal background now
  modal.addEventListener('wheel', function(event) {
      event.preventDefault(); // Prevent page scrolling when modal is open

      // Calculate scale delta
      let delta = event.deltaY > 0 ? -zoomIntensity : zoomIntensity;
      let newScale = currentScale + delta;

      // Clamp scale using dynamicMinScale
      newScale = Math.max(dynamicMinScale, Math.min(maxScale, newScale));

      if (newScale !== currentScale) {
          // Calculate mouse position relative to the image element still
          const rect = modalImg.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return; 
          
          let originXPercent = 50; 
          let originYPercent = 50; 

          // Check if cursor is inside the image bounds
          const isInside = event.clientX >= rect.left && event.clientX <= rect.right &&
                           event.clientY >= rect.top && event.clientY <= rect.bottom;

          if (isInside) {
              // Cursor is inside, calculate origin based on cursor position
              const offsetX = event.clientX - rect.left;
              const offsetY = event.clientY - rect.top;
              originXPercent = (offsetX / rect.width) * 100;
              originYPercent = (offsetY / rect.height) * 100;
          } else {
              // Cursor is outside, use the default center origin
          }

          // Apply transform origin and scale to the image
          modalImg.style.transformOrigin = `${originXPercent}% ${originYPercent}%`;
          modalImg.style.transform = `scale(${newScale})`;
          currentScale = newScale;
      }
      
      // Add/remove class for cursor style (optional) - Applied to image
      $(modalImg).addClass('zooming');
      // Consider removing the class after a short timeout if needed
      // setTimeout(() => { $(modalImg).removeClass('zooming'); }, 200);
  });

  // Reset zooming class on mouse up (optional) - Still attached to image
  modalImg.addEventListener('mouseup', () => {
      $(modalImg).removeClass('zooming');
  });
  // REMOVED wheel listener previously attached to modalImg
  // modalImg.addEventListener('mouseleave', ...)

  // Double-click zoom logic
  modalImg.addEventListener('dblclick', function(event) {
      const rect = modalImg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return; // Image not loaded

      const targetScale = 2; // Target scale for double-click zoom
      let newScale;

      // If current scale is already zoomed in (e.g., >= targetScale), zoom out to min
      if (currentScale >= targetScale * 0.99) { // Use a small tolerance
           newScale = dynamicMinScale;
      } else {
           newScale = targetScale;
      }
      
      // Clamp scale just in case target is outside bounds (shouldn't happen often here)
      newScale = Math.max(dynamicMinScale, Math.min(maxScale, newScale));

      // Calculate click position relative to the image element
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      // Calculate percentage-based origin
      const originXPercent = (offsetX / rect.width) * 100;
      const originYPercent = (offsetY / rect.height) * 100;

      // Apply transform origin and scale
      modalImg.style.transition = 'transform 0.2s ease-out'; // Add transition for dblclick
      modalImg.style.transformOrigin = `${originXPercent}% ${originYPercent}%`;
      modalImg.style.transform = `scale(${newScale})`;
      currentScale = newScale;

      // Remove transition after it completes to prevent affecting wheel zoom
      setTimeout(() => {
          modalImg.style.transition = 'transform 0.1s ease-out'; // Revert to wheel zoom transition
      }, 200);
  });

  // Result
  $("#imgurForm").on("submit", function (event) {
    event.preventDefault();
    // Clear previous results/errors
    $("#result").val("");
    $("#error_result").val("");
    $("#videoContainer").empty();
    $("#resultWrapper").hide();
    $("#errorWrapper").hide();

    const imgurUrls = $("#imgurUrls").val();
    const cacheTTL = 3600 * 1000; // Cache Time To Live: 1 hour in milliseconds

    // --- Client-Side Caching Logic ---
    let cachedResponse = null;
    let cacheKey = null;
    try {
        // Normalize input for a more robust cache key
        const normalizedUrls = imgurUrls.trim().split(/\s+/).filter(Boolean).sort().join('\n');
        cacheKey = 'imgurCache_' + normalizedUrls; // Use normalized key

        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
            const cache = JSON.parse(cachedItem);
            const cacheAge = Date.now() - cache.timestamp;
            if (cacheAge < cacheTTL) {
                console.log("Using cached results for key:", cacheKey);
                cachedResponse = cache.data; // Use the cached data
                toastr.info("Showing cached results.");
            } else {
                console.log("Cache expired for key:", cacheKey);
                localStorage.removeItem(cacheKey); // Remove expired item
            }
        }
    } catch (e) {
        console.error("Error accessing localStorage for cache:", e);
        // Proceed without cache if localStorage fails
    }

    if (cachedResponse) {
        // --- Process Cached Response --- 
        // Re-use the success logic, simulating an AJAX success
        // We need to wrap this to avoid code duplication, or call a shared function
        // For simplicity here, we'll duplicate the core processing part
        
        // Ensure loader is hidden if cache is hit immediately
        if (progressInterval) clearInterval(progressInterval);
        $("#loader").hide(); 
        
        processApiResponse(cachedResponse, cacheKey); // Use the cached response
        return; // Skip AJAX call
    }
    // --- End Caching Logic ---

    // Reset and Show loader (only if not cached)
    if (progressInterval) clearInterval(progressInterval);
    let progressPercent = 0;
    $('#loader-percentage').text('0%');
    $('.progress-bar').css('width', '0%');
    $("#loader").show();

    // Simulate progress
    progressInterval = setInterval(function() {
      progressPercent += 0.5; // Slower increment (aims for ~6 seconds)
      if (progressPercent >= 100) {
        // Don't exceed 99% until complete
         progressPercent = 99;
         // We could clear interval here, but doing it in 'complete' is safer
      }
      // Use Math.floor to avoid decimal percentages in display
      $('#loader-percentage').text(Math.floor(progressPercent) + '%');
      $('.progress-bar').css('width', progressPercent + '%');
    }, 30); // Update roughly every 30ms

    // AJAX call if not cached
    $.ajax({
      type: "POST",
      url: "controller.php",
      data: {
        imgurUrls: imgurUrls, // Send original URLs
      },
      dataType: "json",
      success: function (response) {
         // Use the *same* cache key determined earlier
         processApiResponse(response, cacheKey); 
         
         // Store successful response in cache
         if (cacheKey && response && (!response.errorUrls || response.errorUrls.length === 0)) { // Optionally cache only fully successful responses
            try {
                 const cacheData = {
                    data: response,
                    timestamp: Date.now()
                 };
                 localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                 console.log("Response stored in cache with key:", cacheKey);
            } catch (e) {
                 console.error("Error storing response in localStorage cache:", e);
                 // Handle potential storage full errors (e.g., clear old cache)
            }
         }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("AJAX Error:", textStatus, errorThrown);
        toastr.error(
          "An error occurred while processing the request. Please try again."
        );
        // Clear interval in case of error too
        if (progressInterval) clearInterval(progressInterval);
      },
      complete: function () {
        // Clear the interval
        if (progressInterval) clearInterval(progressInterval);
        // Ensure 100% is shown briefly (optional, might flash too fast)
        $('#loader-percentage').text('100%'); 
        $('.progress-bar').css('width', '100%');
        
        // Hide loader regardless of success or error
        // Add a small delay if you want 100% to be visible longer
        // setTimeout(function() { $("#loader").hide(); }, 100);
        $("#loader").hide(); 
      },
    });
  });
  
  // --- Function to process API response (from AJAX or Cache) ---
  function processApiResponse(response, cacheKeyForPotentialStorage) {
      // console.log("Processing response:", response);
      const transformedUrls = response.transformedUrls || [];
      const errorUrls = response.errorUrls || [];

      if (errorUrls.length > 0) {
          $("#error_result").val(errorUrls.join("\n"));
          $("#errorWrapper").show();
          toastr.error("Some URLs returned errors.");
      }

      if (transformedUrls.length > 0) {
          // Auto-select layout view
          const screenWidthThreshold = 1024;
          if (window.innerWidth >= screenWidthThreshold) {
              // console.log(`Screen width >= ${screenWidthThreshold}px, defaulting to Grid View.`);
              $("#gridViewBtn").trigger('click');
          } else {
              // console.log(`Screen width < ${screenWidthThreshold}px, defaulting to Column View.`);
              $("#columnViewBtn").trigger('click');
          }

          // Populate result textarea
          $("#result").val(
              transformedUrls
              .map((url) => { 
                  // Check if the URL is an Imgur URL
                  if (url.includes('imgur.com')) {
                      // Extract code specifically for Imgur
                      const imgurParts = url.split('/');
                      let lastImgurPart = imgurParts.pop() || ''; // Handle potential empty parts
                      let code = lastImgurPart.split('.')[0];
                      
                      // Adjust for different Imgur URL formats
                      if (url.match(/^https?:\/\/imgur\.com\/[a-zA-Z0-9]+$/)) {
                          // e.g., https://imgur.com/abc -> code = abc
                          code = lastImgurPart;
                      } else if (url.match(/^https?:\/\/i\.imgur\.com\/[a-zA-Z0-9]+/)) {
                         // e.g., https://i.imgur.com/abc.mp4 -> code = abc
                         code = lastImgurPart.split('.')[0]; 
                      }
                      // Construct the standardized display URL for Imgur
                      return "https://imgur.com/" + code;
                  } else {
                     // For non-Imgur URLs (Discord, Twitter media, etc.), return the original URL
                     return url;
                  }
              })
              .join("\n")
          );
          $("#resultWrapper").show();
          if (!cacheKeyForPotentialStorage) { // Show success only for non-cached results? Or always?
             toastr.success("Successfully processed " + transformedUrls.length + " items!");
          } // Info toastr for cache hit is handled before calling this function
          
          $("#videoContainer").empty();

          // Create media elements
          transformedUrls.forEach(function (url) {
             let isVideo = false;
             let srcUrl = url;
             let displayUrl = url;
             let mediaElement;
             let code = 'unknown';
             const videoExtensions = /\.(mp4|webm|mov|gifv)$/i;
             const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;

             // Determine type and code based on URL structure
             if (url.includes('imgur.com')) { 
                 // ... Imgur specific logic ... 
                 const imgurParts = url.split('/');
                 let lastImgurPart = imgurParts.pop() || '';
                 code = lastImgurPart.split('.')[0];
                 displayUrl = "https://imgur.com/" + code;
                 isVideo = url.endsWith(".mp4") || url.endsWith(".gifv");
                 if (!url.includes('.')) {
                     isVideo = true;
                     srcUrl = "https://i.imgur.com/" + code + ".mp4";
                 } else if (!isVideo && !imageExtensions.test(url)) {
                     isVideo = true;
                     srcUrl = "https://i.imgur.com/" + code + ".mp4"; 
                 }
             } else if (url.includes('cdn.discordapp.com/attachments/')) { 
                 // ... Discord specific logic ...
                 try {
                     const urlObject = new URL(url);
                     const pathname = urlObject.pathname;
                     code = pathname.split('/').pop().split('.')[0];
                     if (videoExtensions.test(pathname)) isVideo = true;
                     else if (imageExtensions.test(pathname)) isVideo = false;
                     else return; // Skip unknown
                     srcUrl = url;
                     displayUrl = url;
                 } catch (e) { return; } // Skip invalid
             } else {
                 // ... Fallback logic ...
                 const urlPath = url.split('?')[0];
                 if (videoExtensions.test(urlPath)) isVideo = true;
                 else if (imageExtensions.test(urlPath)) isVideo = false;
                 else return; // Skip unknown
                 srcUrl = url;
                 displayUrl = url;
                 code = urlPath.split('/').pop().split('.')[0];
             }

             // Create Media Element (Video or Image)
             if (isVideo) {
                 let videoClasses = [];
                 if (window.innerWidth >= 1920) videoClasses.push('video-autoplay-desktop');
                 mediaElement = $("<video>", {
                     controls: true, loop: true, muted: true,
                     "data-id": code, "data-src": srcUrl,
                     class: videoClasses.join(' '),
                     width: "100%", height: "auto", frameborder: 0,
                 });
                 mediaElement.prop("muted", true);
             } else {
                 mediaElement = $("<img>", { src: srcUrl, alt: code, width: "100%", height: "auto" });
             }
             
             // Create Wrapper and Controls
             var wrapperDiv = $("<div>", { class: "form_wrapper" });
             var innerDiv = $("<div>", { class: "inner_wrapper" });
             var textareaElement = $("<textarea>", { class: "url-textarea", readonly: true, text: displayUrl });
             var copyButton = $("<button>", { type: "button", class: "copy-btn btn btn-primary", title: "Copy link", html: "Copy" });
             var downloadButton = $("<button>", { type: "button", class: "download-btn btn btn-secondary", title: "Download", html: "<i class='fa-solid fa-download'></i>" });
             var closeButton = $("<button>", { type: "button", class: "close-btn btn btn-danger", title: "Close", html: "&times;" });
             innerDiv.append(textareaElement, copyButton, downloadButton, closeButton);
             wrapperDiv.append(innerDiv, mediaElement);
             $("#videoContainer").append(wrapperDiv);
          });

          // Setup Intersection Observer
          const videoObserverOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
          const videoObserverCallback = (entries, observer) => {
              entries.forEach(entry => {
                  const video = entry.target;
                  if (entry.isIntersecting) {
                      if (video.dataset.src) {
                          video.src = video.dataset.src;
                          delete video.dataset.src;
                          if (video.classList.contains('video-autoplay-desktop')) {
                              video.play().catch(error => {});
                          }
                      } else if (video.classList.contains('video-autoplay-desktop') && video.paused && video.src) {
                          video.play().catch(error => {});
                      }
                  } else {
                      if (video.classList.contains('video-autoplay-desktop') && video.src && !video.paused) {
                          video.pause();
                      }
                  }
              });
          };
          const videoObserver = new IntersectionObserver(videoObserverCallback, videoObserverOptions);
          $("#videoContainer video").each(function() { videoObserver.observe(this); });

          // Show info modal (if applicable)
          if (!hasShownPopup && transformedUrls.some(url => url.includes('imgur.com'))) {
              hasShownPopup = true;
          }
      } else if (errorUrls.length === 0) {
          toastr.info("Processing complete, but no media URLs were found or processed successfully.");
      } else {
          // Only errors
          // toastr message already shown above
      }
  }
  // --- End processApiResponse function ---

  // Close button functionality
  $(document).on("click", ".close-btn", function () {
    var formWrapper = $(this).closest(".form_wrapper");

    // Add fade-out animation class
    formWrapper.addClass("fade-out");

    // After the animation is done (0.5s), hide the element
    setTimeout(function () {
      formWrapper.addClass("hidden");
    }, 500);
  });

  // Download All Button
  $("#downloadBtn").on("click", function () {
    if (confirm("Are you sure you want to download all media items?")) {
      const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
      $("#videoContainer video, #videoContainer img").each(function () {
        var mediaSrc = $(this).attr("src");
        if (!mediaSrc) return; // Skip if no src

        var urlPath = mediaSrc.split('?')[0];
        var filename = urlPath.split("/").pop();
        if (!filename) filename = "downloaded_media";

        let useFetchMethod = true; // Default to fetch method

        if (mediaSrc.includes('cdn.discordapp.com')) {
            // Check if it's a video (if not an image, assume video for Discord download)
            if (!imageExtensions.test(filename)) { 
                 useFetchMethod = false; // Use direct link method for Discord videos
            }
            // If it IS a Discord image, useFetchMethod remains true
        }

        if (useFetchMethod) {
            // Use fetch method (for non-Discord, and Discord images)
            fetch(mediaSrc)
              .then((response) => {
                  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
                  return response.blob();
              })
              .then((blob) => {
                var link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(link.href);
              })
              .catch((error) => {
                console.error("Error downloading media (All - Fetch):", mediaSrc, error);
                toastr.error("Failed to download: " + filename + " (Fetch - See console)");
              });
        } else {
            // Use direct link method (only for Discord videos)
            console.log('Attempting direct download for Discord video:', mediaSrc);
            try {
                const link = document.createElement("a");
                link.href = mediaSrc;
                link.download = filename;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Error attempting direct download for Discord video:", mediaSrc, error);
                toastr.error("Failed to initiate download for: " + filename + " (Direct method)");
            }
         }
      });
    }
  });

  // Copy button functionality for result textarea
  $(document).on("click", ".result-btn", function () {
    // Get the closest form_wrapper div
    const formWrapper = $(this).closest(".form_wrapper");
    // Find the textarea within this form_wrapper
    const textarea = formWrapper.find("#result");

    // Copy the value of the textarea
    textarea.select();
    textarea[0].setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");

    // Change button text to "Copied"
    const copyButton = $(this);
    copyButton.text("Copied");

    // Change the button class to "btn btn-success"
    copyButton.removeClass("btn-primary").addClass("btn-success");

    // Set a timeout to revert button text and styles back
    setTimeout(() => {
      copyButton.text("Copy"); // Revert the text back
      copyButton.removeClass("btn-success").addClass("btn-primary"); // Revert the button style to primary
    }, 3000); // Change the text back and revert styles after 3 seconds
  });

  // Copy button functionality for individual link
  $(document).on("click", ".copy-btn", function () {
    // Get the closest form_wrapper div
    const formWrapper = $(this).closest(".form_wrapper");
    // Find the textarea within this form_wrapper
    const textarea = formWrapper.find(".url-textarea");

    // Copy the value of the textarea
    textarea.select();
    textarea[0].setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");

    // Change button text to "Copied"
    const copyButton = $(this);
    copyButton.text("Copied");

    // Change the button class to "btn btn-success"
    copyButton.removeClass("btn-primary").addClass("btn-success");

    // Apply CSS changes (add classes)
    copyButton.addClass("copied");
    textarea.addClass("shrunk");

    // Set a timeout to revert button text and styles back
    setTimeout(() => {
      copyButton.text("Copy"); // Revert the text back
      copyButton.removeClass("btn-success").addClass("btn-primary"); // Revert the button style to primary
      copyButton.removeClass("copied"); // Revert the additional copied style if needed
      textarea.removeClass("shrunk"); // Revert the textarea width
    }, 3000); // Change the text back and revert styles after 3 seconds
  });

  // Individual Download button functionality
  $(document).on("click", ".download-btn", function () {
    const formWrapper = $(this).closest(".form_wrapper");
    const videoElement = formWrapper.find("video");
    const imageElement = formWrapper.find("img");

    let mediaSrc = null;
    if (videoElement.length > 0) {
        mediaSrc = videoElement.attr("src");
    } else if (imageElement.length > 0) {
        mediaSrc = imageElement.attr("src");
    }

    if (mediaSrc) {
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
        var urlPath = mediaSrc.split('?')[0];
        var filename = urlPath.split("/").pop();
        if (!filename) filename = "downloaded_media";

        let useFetchMethod = true;

        if (mediaSrc.includes('cdn.discordapp.com')) {
           if (!imageExtensions.test(filename)) {
               useFetchMethod = false;
           }
        }

        if (useFetchMethod) {
            // Use fetch method
            fetch(mediaSrc)
                .then((response) => {
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
                    return response.blob();
                })
                .then((blob) => {
                    const link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(link.href);
                })
                .catch((error) => {
                    console.error("Error downloading media (Individual - Fetch):", mediaSrc, error);
                    toastr.error("Failed to download: " + filename + " (Fetch - See console)");
                });
        } else {
             // Use direct link method (Discord videos)
            console.log('Attempting direct download for Discord video:', mediaSrc);
             try {
                const link = document.createElement("a");
                link.href = mediaSrc;
                link.download = filename;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                 console.error("Error attempting direct download for Discord video:", mediaSrc, error);
                toastr.error("Failed to initiate download for: " + filename + " (Direct method)");
            }
        }
    } else {
        console.log("No video or image source found in this item.");
        toastr.warning("Could not find media source to download.");
    }
  });

  // Function to refresh the page
  function refreshPage() {
    // Get the current URL
    const currentUrl = new URL(window.location.href);
    
    // Remove the 'id' parameter
    currentUrl.searchParams.delete('id');
    
    // Redirect to the new URL without the 'id' parameter
    window.location.href = currentUrl.toString();
  }

  // Event listener for the refresh button
  $(document).on("click", ".refresh-btn", function () {
    refreshPage();
  });
});
