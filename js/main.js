$(document).ready(function () {
  $("#imgurForm").on("submit", function (event) {
    event.preventDefault();

    var imgurUrls = $("#imgurUrls").val();

    $.ajax({
      type: "POST",
      url: "controller.php",
      data: {
        imgurUrls: imgurUrls,
      },
      dataType: "json",
      success: function (response) {
        $("#result").val(response.transformedUrls); // Set the value of the textarea
        $("#resultWrapper").show(); // Show the result section

        // Clear the video container
        $("#videoContainer").empty();

        // Split the transformed URLs into an array
        var urls = response.transformedUrls.split("\n");

        // Loop through each URL and create a video element
        urls.forEach(function (url) {
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

          // videoElement.attr("__idm_id__", code); // Add __idm_id__ attribute

          // Append the video element to the container
          $("#videoContainer").append(videoElement);
        });
      },
      error: function (xhr, status, error) {
        console.error("AJAX Error:", error);
        $("#result").val("Error occurred while transforming the URLs.");
        $("#resultWrapper").show(); // Show the result section
      },
    });

    $("#downloadBtn").on("click", function () {
      if (confirm("Are you sure you want to download all videos?")) {
        $("#videoContainer video").each(function () {
          var videoSrc = $(this).attr("src");
          var filename = videoSrc.split("/").pop();

          fetch(videoSrc)
            .then((response) => response.blob())
            .then((blob) => {
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

    // $("#downloadWithIdmBtn").on("click", function () {
    //   if (confirm("Are you sure you want to download all videos with IDM?")) {
    //     $("#videoContainer video").each(function (index) {
    //       var videoSrc = $(this).attr("src");

    //       setTimeout(() => {
    //         var link = document.createElement("a");
    //         link.href = videoSrc;
    //         link.download = ""; // This is necessary to trigger the download
    //         link.style.display = "none";
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //       }, index * 1000); // Delay of 1 second between each download
    //     });
    //   }
    // });
  });
});
