<!DOCTYPE html>
<html lang="en">

<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-YF2KE9HRM0"></script>
  <script>
    window.dataLayer = window.dataLayer || [];

    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());

    gtag('config', 'G-YF2KE9HRM0');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Imgur URL Optimization</title>
  <link rel="shortcut icon" type="image/x-icon" href="../images/DALL·E-2024-08-13-02.50.37.ico" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <link rel="stylesheet" href="../css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <!-- Toastr CSS -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css" rel="stylesheet" />
  <!-- Toastr JS -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
  <script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

  <!-- sortable -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.14.0/Sortable.min.js"></script>

</head>

<body>
  <h1>Imgur URL Optimization</h1>
  <div class="top_bottom">
    <div class="wrapper">
      <h2>What does this do?</h2>
      <div class="description">
        <h3>Fix Imgur Link</h3>
        <h4>- Transform your links into a standard pattern.</h4>
        <h4>- Mass download.</h4>
        <h4>- Get all links from an album link.</h4>
        <h4>- Recover gifs that are hidden by Imgur.</h4>
      </div>
      <div class="form_wrapper">
        <form id="imgurForm">
          <label class="form-label">Input your Imgur links here:</label>
          <label class="form-label">For example: <i>https://i.imgur.com/FCwNSbY.mp4</i></label>
          <label class="form-label">Or album link: <i>https://imgur.com/a/y5g7V0g</i></label>
          <textarea id="imgurUrls" name="imgurUrls" required></textarea>
          <label class="form-label author">Made by <i> JN0106</i></label>
          <div class="button">
            <button type="submit" title="Execute" class="btn btn-info">Execute</button>
          </div>
        </form>
      </div>
      <br>
      <div id="errorWrapper" class="top_bottom" style="display: none;">
        <h3 class="output">Error links:</h3>
        <div class="form_wrapper">
          <label for="error" class="form-label">Unable to retrieve links below:</label>
          <textarea id="error_result" readonly></textarea>
        </div>
      </div>
      <br>
      <div id="resultWrapper" class="top_bottom" style="display: none;">
        <h3 class="output">Output links:</h3>
        <div class="flex">
          <div class="form_wrapper">
            <label class="form-label">Result:</label>
            <textarea id="result" readonly></textarea>
            <div class="button result-copy">
              <button type="submit" title="Copy" class="result-btn btn btn-primary">Copy</button>
            </div>
          </div>
        </div>
        <br>
        <div class="button">
          <button id="downloadBtn" class="btn btn-success">Download All Videos</button>
        </div>
        <br>
        <div class="button-container">
          <button id="columnViewBtn" class="btn btn-secondary">Single Column</button>
          <button id="gridViewBtn" class="btn btn-secondary">Grid View</button>
          <h4 class="drag-text">Drag and drop: </h4>
          <div id="topBtnGroup" class="btn-group" role="group" aria-label="Basic radio toggle button group">
            <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off">
            <label class="btn btn-outline-primary" for="btnradio1">Enabled</label>

            <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" checked>
            <label class="btn btn-outline-danger" for="btnradio2">Disabled</label>
          </div>
        </div>
        <div id="videoContainer"></div> <!-- Container for videos -->
      </div>
    </div>
  </div>

  <!-- Drag Button -->
  <button id="dragBtn" style="display: none;">Drag</button>

  <!-- Button Group (Initially Hidden) -->
  <div id="dragBtnGroup" class="btn-group" role="group" aria-label="Basic radio toggle button group" style="display: none;">
    <input type="radio" class="btn-check" name="dragBtnradio" id="dragBtnradio1" autocomplete="off">
    <label class="btn btn-outline-primary" for="dragBtnradio1">Enabled</label>

    <input type="radio" class="btn-check" name="dragBtnradio" id="dragBtnradio2" autocomplete="off" checked>
    <label class="btn btn-outline-danger" for="dragBtnradio2">Disabled</label>
  </div>


  <button id="scrollToTopBtn" style="display: none;"><i class="fa-solid fa-arrow-up"></i></button>

  <!-- Modal notification -->
  <div class="modal fade" id="infoModal" tabindex="-1" aria-labelledby="infoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="infoModalLabel">Notice</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          You can drag and drop the videos to change positions in view section.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal for Full-size Image -->
  <div id="imageModal" class="modal">
    <span class="close">&times;</span>
    <div class="modal-image">
      <img class="modal-content " id="fullSizeImage">
    </div>
  </div>

  <script src="https://kit.fontawesome.com/170a63e521.js" crossorigin="anonymous"></script>
  <script src="../js/main.js"></script>
</body>

</html>