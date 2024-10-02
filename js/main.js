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

  // Full-size image modal functionality
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("fullSizeImage");
  const span = document.getElementsByClassName("close")[0];

  // When an image is clicked, open the modal and display the full-size image
  $(document).on("click", "img", function () {
    modal.style.display = "block";
    modalImg.src = this.src;
  });

  // When the close button is clicked, hide the modal
  span.onclick = function () {
    modal.style.display = "none";
  };

  // Close the modal if clicked outside the image
  $(modal).on("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Result
  $("#imgurForm").on("submit", function (event) {
    event.preventDefault();
    // Clear textareas before making the request
    $("#result").val("");
    $("#error_result").val("");
    $("#videoContainer").empty();
    $("#resultWrapper").hide();
    $("#errorWrapper").hide();

    var imgurUrls = $("#imgurUrls").val();

    $.ajax({
      type: "POST",
      url: "controller.php",
      data: {
        imgurUrls: imgurUrls,
      },
      dataType: "json",
      success: function (response) {
        console.log(response);
        const transformedUrls = response.transformedUrls;
        const errorUrls = response.errorUrls;

        if (errorUrls.length > 0) {
          $("#error_result").val(errorUrls.join("\n")); // Join array into a string
          $("#errorWrapper").show(); // Show the result section
          toastr.error("Some URLs returned errors.");
        }
        if (transformedUrls.length === 0) {
          toastr.error("An error occurred while processing the request.");
        } else {
          // $("#result").val(transformedUrls.join("\n")); // Join array into a string
          $("#result").val(
            transformedUrls
              .map((url) => {
                // Extract the code from the URL
                // Split the URL to get the code correctly
                var parts = url.split("/");
                var lastPart = parts.pop();
                var code = lastPart.split(".")[0]; // Extract code before '.'

                // Construct the formatted URL
                return "https://imgur.com/" + code;
              })
              .join("\n") // Join the URLs with newline
          ); // Replace base URL in the result
          $("#resultWrapper").show(); // Show the result section
          toastr.success("Successfully!");
          // Clear the video container
          $("#videoContainer").empty();

          // Loop through each URL and create a video element
          transformedUrls.forEach(function (url) {
            if (url.trim()) {
              var code = url.split("/").pop(); // Get the code after imgur.com/
              var videoUrl = "https://i.imgur.com/" + code;
              var imgURL = "https://i.imgur.com/" + code; // Image fallback URL

              // Determine if URL is video or image
              var isVideo = url.endsWith(".mp4") || url.endsWith(".gifv");

              // Check if there's no extension and assume video, or add fallback logic
              if (!url.includes(".")) {
                isVideo = true; // Assume it's a video if no extension is present
              }

              // var srcUrl = isVideo ? videoUrl : imgURL; // Use imgURL for images
              if (isVideo) {
                var srcUrl = videoUrl;
              }

              // Split the URL to get the code correctly
              var parts = url.split("/");
              var lastPart = parts.pop();
              var newCode = lastPart.split(".")[0]; // Extract code before '.'

              var mediaElement;
              if (isVideo) {
                mediaElement = $("<video>", {
                  autoplay: true,
                  controls: true,
                  loop: true,
                  muted: true,
                  "data-id": newCode,
                  width: "100%",
                  height: "auto",
                  src: srcUrl, // Use .mp4 video URL
                  frameborder: 0,
                });

                // Explicitly set the muted property
                mediaElement.prop("muted", true);
              } else {
                // Regular expression to check for a file extension at the end of the URL
                var hasExtension = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);

                if (!hasExtension) {
                  var videoUrl = "https://i.imgur.com/" + code + ".mp4";
                  mediaElement = $("<video>", {
                    autoplay: true,
                    controls: true,
                    loop: true,
                    muted: true,
                    "data-id": newCode,
                    width: "100%",
                    height: "auto",
                    src: videoUrl, // Use .mp4 video URL
                    frameborder: 0,
                  });

                  // Explicitly set the muted property
                  mediaElement.prop("muted", true);
                } else {
                  mediaElement = $("<img>", {
                    src: imgURL,
                    alt: newCode,
                    width: "100%",
                    height: "auto",
                  });
                }
              }

              // Create the wrapper div and label
              var wrapperDiv = $("<div>", {
                class: "form_wrapper",
              });

              // Create the inner div to contain the textarea and buttons
              var innerDiv = $("<div>", {
                class: "inner_wrapper", // You can name it whatever you like
              });

              // Split the URL to get the code correctly
              var parts = url.split("/");
              var lastPart = parts.pop();
              var code = lastPart.split(".")[0]; // Extract code before '.'
              var imgurUrl = "https://imgur.com/" + code;
              var textareaElement = $("<textarea>", {
                class: "url-textarea",
                id: "",
                readonly: true,
                text: imgurUrl, // Set the text to show the imgur URL
              });

              var copyButton = $("<button>", {
                type: "button",
                class: "copy-btn btn btn-primary",
                title: "Copy link",
                html: "Copy",
              });

              var downloadButton = $("<button>", {
                type: "button",
                class: "download-btn btn btn-secondary",
                title: "Download",
                html: "<i class='fa-solid fa-download'></i>",
              });

              // Create the close button
              var closeButton = $("<button>", {
                type: "button",
                class: "close-btn btn btn-danger",
                title: "Close",
                html: "&times;",
              });

              // Append the textarea and buttons to the inner div
              innerDiv.append(textareaElement);
              innerDiv.append(copyButton);
              innerDiv.append(downloadButton);
              innerDiv.append(closeButton);

              // Append the inner div to the wrapper div
              wrapperDiv.append(innerDiv);

              // Append the media element to the wrapper div (if you have one)
              wrapperDiv.append(mediaElement);

              // Append the wrapper div to the video container
              $("#videoContainer").append(wrapperDiv);
            }
          });

          // Show the popup only if it hasn't been shown yet
          if (!hasShownPopup) {
            $("#infoModal").modal("show");
            hasShownPopup = true; // Set the flag to true after showing the popup
          }
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX Error:", error);
        toastr.error("An error occurred while processing the request.");
      },
    });

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

    // Download
    $("#downloadBtn").on("click", function () {
      if (confirm("Are you sure you want to download all videos?")) {
        $("#videoContainer video").each(function () {
          var videoSrc = $(this).attr("src");
          // videoSrc.split("/").pop() splits the src URL by slashes (/) and returns the last part of the URL, which is the filename (e.g., "ECPM4F6.mp4").
          var filename = videoSrc.split("/").pop();
          // fetch(videoSrc) sends a network request to download the video file at the URL stored in videoSrc.
          // The fetch function returns a Promise that resolves to the response object once the request completes.
          // .then((response) => response.blob()) converts the response to a blob (a binary large object), which represents the video file as raw data.
          fetch(videoSrc)
            .then((response) => response.blob())
            .then((blob) => {
              // The blob is passed to the next .then() function, which creates an invisible <a> (anchor) element to simulate a file download.
              // document.createElement("a") creates the anchor element.
              // link.href = window.URL.createObjectURL(blob); creates a temporary URL pointing to the blob (the video file) and sets it as the href of the anchor element.
              // link.download = filename; sets the download attribute of the anchor element to the filename (e.g., "ECPM4F6.mp4"), so the browser knows what to name the downloaded file.
              // document.body.appendChild(link); adds the anchor element to the document body (though it won't be visible).
              // link.click(); simulates a click on the anchor element, which triggers the download.
              // document.body.removeChild(link); removes the anchor element from the document after the download starts, cleaning up.
              var link = document.createElement("a");
              link.href = window.URL.createObjectURL(blob);
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            })
            .catch((error) =>
              console.error("Error downloading the video:", error)
            );
        });
      }
    });
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

  // Download button functionality
  $(document).on("click", ".download-btn", function () {
    // Get the closest form_wrapper div
    const formWrapper = $(this).closest(".form_wrapper");

    // Find the video or image element within this form_wrapper
    const videoElement = formWrapper.find("video");
    const imageElement = formWrapper.find("img");

    // Check if a video element exists within the form_wrapper
    if (videoElement.length > 0) {
      // Get the source URL of the video
      const videoSrc = videoElement.attr("src");

      // Get the filename from the video source URL
      const filename = videoSrc.split("/").pop(); // e.g., "ECPM4F6.mp4"

      // Fetch the video file from the URL
      fetch(videoSrc)
        .then((response) => response.blob()) // Convert the response to a blob (binary large object)
        .then((blob) => {
          // Create an invisible anchor element to trigger the download
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // Create a temporary URL pointing to the blob
          link.download = filename; // Set the download filename
          document.body.appendChild(link); // Append the link to the body
          link.click(); // Trigger the download
          document.body.removeChild(link); // Remove the link after downloading
        })
        .catch((error) => {
          console.error("Error downloading the video:", error);
        });
    }
    // If an image element exists, download the image
    else if (imageElement.length > 0) {
      const imgSrc = imageElement.attr("src");
      const filename = imgSrc.split("/").pop(); // e.g., "image.jpg"

      // Fetch and download the image
      fetch(imgSrc)
        .then((response) => response.blob())
        .then((blob) => {
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error("Error downloading the image:", error);
        });
    } else {
      console.log("No video or image found in the form_wrapper");
    }
  });
});
