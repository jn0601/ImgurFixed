$(document).ready(function () {
  // Get the button
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  // Show the button when scrolling down
  window.onscroll = function () {
    if (
      document.body.scrollTop > 100 ||
      document.documentElement.scrollTop > 100
    ) {
      scrollToTopBtn.style.display = "block";
    } else {
      scrollToTopBtn.style.display = "none";
    }
  };

  // Smooth scroll to the top
  scrollToTopBtn.onclick = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This enables the smooth scrolling
    });
  };

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
          $("#result").val(transformedUrls.join("\n")); // Join array into a string
          $("#resultWrapper").show(); // Show the result section
          toastr.success("Successfully!");
          // Clear the video container
          $("#videoContainer").empty();

          // Loop through each URL and create a video element
          transformedUrls.forEach(function (url) {
            if (url.trim()) {
              // Check if URL is not empty
              var code = url.split("/").pop(); // Get the code after imgur.com/
              var videoUrl = "https://i.imgur.com/" + code + ".mp4";

              var videoElement = $("<video>", {
                autoplay: true,
                controls: true,
                loop: true,
                muted: true,
                "data-id": code,
                width: "100%",
                height: "auto",
                src: videoUrl,
                frameborder: 0,
              });

              $("#videoContainer").append(videoElement);
              
              // Explicitly set the muted property
              videoElement.prop("muted", true);
            }
          });
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX Error:", error);
        // $("#result").val("Error occurred while transforming the URLs.");
        // $("#resultWrapper").show(); // Show the result section
        toastr.error("An error occurred while processing the request.");
      },
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
});
